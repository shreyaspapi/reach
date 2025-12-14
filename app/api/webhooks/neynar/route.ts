import { NextRequest, NextResponse } from 'next/server';
import { connectedUserFids } from '@/lib/backend';
import { calculateEngagementScore, getUserHistory } from '@/lib/llm-scoring';
import { getOrCreateUser, saveCast, getActiveCampaigns, upsertCampaignParticipant, getUserStats } from '@/lib/database';
import { updateMemberUnits } from '@/lib/gda-contract';
import { isValidEthereumAddress } from '@/lib/utils';


export async function GET(request: NextRequest) {
    console.log('Received GET request');
    console.log('Headers:', request.headers);
    console.log('Body:', await request.text());
    console.log('---------------------------------------------------');
    return NextResponse.json({ status: 'ok' });
}

export async function POST(request: NextRequest) {
    try {
        const event = await request.json();

        console.log('Received event:', event);

        // MUST await this, otherwise the function terminates before async ops (DB/Blockchain) complete
        await processEvent(event);

        return NextResponse.json({ status: 'ok' });

    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

async function processEvent(event: any) {
    try {
        if (event.type === 'cast.created' && event.data) {
            const cast = event.data;
            const authorFid = cast.author?.fid;

            if (!authorFid) {
                console.log(`⏭️  Ignoring cast with no author FID`);
                return;
            }

            // Find matching campaigns:
            // A campaign is matched if:
            //   - cast author fid == campaign.target_fid (creator self-cast)
            //   - or cast mentions target_username
            //   - or reply to target_fid
            const activeCampaigns = await getActiveCampaigns();
            const matchingCampaigns = activeCampaigns.filter((c) => {
                const mentionsTarget = cast.text?.includes(`@${c.target_username}`) ||
                    cast.mentioned_profiles?.some((p: any) => p.username?.toLowerCase() === c.target_username.toLowerCase());
                const replyToTarget = cast.parent_author?.fid === c.target_fid;
                const byTarget = authorFid === c.target_fid;
                return mentionsTarget || replyToTarget || byTarget;
            });

            if (matchingCampaigns.length === 0) {
                console.log(`⏭️  Ignoring cast - no matching active campaigns`);
                return;
            }

            // Check if the user is registered with Privy
            const isRegistered = connectedUserFids.has(authorFid);

            if (!isRegistered) {
                console.log(`ℹ️  User @${cast.author.username} (FID: ${authorFid}) is not registered with Privy`);
                console.log(`   Scoring cast anyway for future reference...`);
            } else {
                console.log(`✅ User @${cast.author.username} (FID: ${authorFid}) is registered with Privy`);
            }

            console.log('\n═══════════════════════════════════════════════════');
            console.log(`🔔 CAST DETECTED from Registered User`);
            console.log(`   User: @${cast.author.username} (FID: ${authorFid})`);
            console.log(`   Text: ${cast.text}`);
            console.log(`   Hash: ${cast.hash}`);
            console.log(`   Timestamp: ${cast.timestamp}`);
            console.log('───────────────────────────────────────────────────');

            // Calculate engagement score using LLM
            console.log('🤖 Calculating engagement score with AI...');
            const scoreResult = await calculateEngagementScore(cast);
            const userHistory = getUserHistory(authorFid);

            console.log('📊 ENGAGEMENT SCORE BREAKDOWN:');
            console.log(`   ├─ Communication Quality (40%): ${scoreResult.breakdown.communicationQuality}/100`);
            console.log(`   ├─ Community Impact (30%):      ${scoreResult.breakdown.communityImpact}/100`);
            console.log(`   ├─ Consistency (20%):           ${scoreResult.breakdown.consistency}/100`);
            console.log(`   └─ Active Campaign (10%):       ${scoreResult.breakdown.activeCampaign}/100`);
            console.log('───────────────────────────────────────────────────');
            console.log(`🎯 TOTAL SCORE: ${scoreResult.totalScore}/100`);

            // Display LLM reasoning if available
            if (scoreResult.reasoning) {
                console.log('───────────────────────────────────────────────────');
                console.log('🤖 AI ANALYSIS:');
                console.log(`   Summary: ${scoreResult.reasoning.summary}`);
                if (scoreResult.flags) {
                    console.log(`   Flags: ${JSON.stringify(scoreResult.flags)}`);
                }
            }
            console.log('───────────────────────────────────────────────────');

            if (userHistory) {
                console.log('📈 USER STATISTICS:');
                console.log(`   ├─ Total Casts: ${userHistory.castCount}`);
                console.log(`   ├─ Average Score: ${userHistory.averageScore.toFixed(2)}/100`);
                console.log(`   └─ Total Points: ${userHistory.totalScore.toFixed(2)}`);
            }

            // Save to database
            console.log('💾 Saving to database...');

            // Get or create user in database
            const dbUser = await getOrCreateUser({
                fid: authorFid,
                username: cast.author.username,
                display_name: cast.author.display_name,
                pfp_url: cast.author.pfp_url,
                follower_count: cast.author.follower_count,
                following_count: cast.author.following_count,
                power_badge: cast.author.power_badge || false
            });

            if (!dbUser) {
                console.error('❌ Failed to get/create user in database');
            } else {
                console.log(`✅ User synced: ${dbUser.username} (ID: ${dbUser.id})`);

                // Save cast with scores
                const savedCast = await saveCast({
                    cast_hash: cast.hash,
                    user_id: dbUser.id,
                    fid: authorFid,
                    text: cast.text,
                    timestamp: cast.timestamp,
                    parent_hash: cast.parent_hash,
                    parent_author_fid: cast.parent_author?.fid,
                    channel: cast.channel?.id,
                    embeds: cast.embeds,
                    mentions: cast.mentions,
                    likes_count: cast.reactions?.likes_count || 0,
                    recasts_count: cast.reactions?.recasts_count || 0,
                    replies_count: cast.reactions?.replies_count || 0,
                    total_score: scoreResult.totalScore,
                    communication_quality_score: scoreResult.breakdown.communicationQuality,
                    community_impact_score: scoreResult.breakdown.communityImpact,
                    consistency_score: scoreResult.breakdown.consistency,
                    active_campaign_score: scoreResult.breakdown.activeCampaign
                });

                if (savedCast) {
                    console.log(`✅ Cast saved to database (ID: ${savedCast.id})`);

                    const walletAddress = dbUser.wallet_address;
                    const isValidAddress = walletAddress && isValidEthereumAddress(walletAddress);

                    if (walletAddress && !isValidAddress) {
                        console.log(`⚠️ Wallet address in DB is not a valid Ethereum address: ${walletAddress}`);
                    } else if (!walletAddress) {
                        console.log('⚠️ User has no wallet address in DB - skipping on-chain update');
                    }

                    // For each matching campaign, upsert participant and update on-chain units per pool
                    for (const campaign of matchingCampaigns) {
                        console.log(`📌 Processing campaign: ${campaign.name} (${campaign.id})`);

                        // Register participant
                        await upsertCampaignParticipant(campaign.id, dbUser.id, authorFid);

                        // On-chain update only if wallet valid and pool configured
                        if (walletAddress && isValidAddress && campaign.pool_address) {
                            console.log(`✅ Wallet + pool found, updating on-chain units for pool ${campaign.pool_address}`);

                            // Fetch latest stats (already updated by DB trigger)
                            const stats = await getUserStats(authorFid);
                            if (!stats || stats.gda_units === null || stats.gda_units === undefined) {
                                console.error(`❌ Could not fetch user stats or gda_units is null for fid ${authorFid}`);
                                continue;
                            }

                            const newTotalUnits = stats.gda_units;
                            console.log(`   Current GDA Units (from DB): ${newTotalUnits}`);

                            const txResult = await updateMemberUnits(campaign.pool_address, walletAddress, newTotalUnits);
                            if (txResult.success) {
                                console.log(`✅ On-chain units updated for pool ${campaign.pool_address}! Tx: ${txResult.txHash}`);
                            } else {
                                console.error(`❌ Failed to update on-chain units for pool ${campaign.pool_address}: ${txResult.error}`);
                            }
                        } else if (walletAddress && isValidAddress && !campaign.pool_address) {
                            console.log(`⚠️ Campaign ${campaign.name} has no pool_address configured - skipping on-chain update`);
                        } else {
                            console.log('⚠️ User has no valid Ethereum wallet - skipping on-chain update');
                        }
                    }

                } else {
                    console.log('ℹ️  Cast already exists or failed to save');
                }
            }

            console.log('═══════════════════════════════════════════════════\n');

            // TODO: Trigger Superfluid stream based on score
            // TODO: Update user rewards/points

            // Example: You can use the score to determine reward amount
            // const rewardAmount = calculateReward(scoreResult.totalScore);
            // await updateUserRewards(authorFid, rewardAmount);
        }
    } catch (error) {
        console.error('Error processing event:', error);
    }
}
