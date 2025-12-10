import { NextRequest, NextResponse } from 'next/server';
import { connectedUserFids } from '@/lib/backend';
import { calculateEngagementScore, getUserHistory } from '@/lib/llm-scoring';
import { getOrCreateUser, saveCast } from '@/lib/database';
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

            // Check if this is relevant to the campaign:
            // 1. Cast BY @shreyaspapi (FID: 830020)
            // 2. Cast that mentions @shreyaspapi
            // 3. Cast that replies to @shreyaspapi
            const SHREYAS_FID = 830020;
            const isShreyasCast = authorFid === SHREYAS_FID;
            const isMentionOrReply =
                cast.text?.includes('@shreyaspapi') ||
                cast.mentioned_profiles?.some((p: any) => p.username === 'shreyaspapi') ||
                cast.parent_author?.fid === SHREYAS_FID;

            if (!isShreyasCast && !isMentionOrReply) {
                console.log(`⏭️  Ignoring cast - not related to @shreyaspapi`);
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

                    // TRIGGER ON-CHAIN UPDATE
                    const walletAddress = dbUser.wallet_address;
                    
                    // Validate that the wallet address is a valid Ethereum address
                    // (not Solana or other chain addresses)
                    const isValidAddress = walletAddress && isValidEthereumAddress(walletAddress);
                    
                    if (walletAddress && !isValidAddress) {
                        console.log(`⚠️ Wallet address in DB is not a valid Ethereum address: ${walletAddress}`);
                        console.log('   (This might be a Solana or other chain address - skipping on-chain update)');
                    } else if (walletAddress && isValidAddress) {
                        console.log(`✅ Found valid Ethereum wallet address in DB: ${walletAddress}`);
                    } else {
                        console.log('⚠️ User has no wallet address in DB - skipping on-chain update');
                    }

                    if (walletAddress && isValidAddress) {
                        console.log('⛓️ Triggering on-chain unit update...');

                        // Fetch current GDA units from DB (or contract, but DB is faster cache)
                        // For now, we'll just ADD the new score to the existing units
                        // In a real app, you might want to fetch the *current* on-chain units first to be safe

                        // Calculate new total units
                        // dbUser.gda_units should have been updated by the trigger, but let's be safe and assume we add score
                        // Note: The DB trigger `update_user_stats` runs AFTER insert.
                        // We can query the updated stats or just pass score.

                        // Let's fetch the latest stats to get the ACCUMULATED score
                        // (Since GDA units = total accumulated score)
                        // Alternatively, we can just pass the *new total* if we had it.

                        // Simple approach: Get the user's total accumulated score from the DB
                        // (which acts as the unit count)
                        // We need to fetch the user_stats table.

                        // For this MVP, let's assume we want to add the CURRENT CAST'S SCORE to their units.
                        // But `updateMemberUnits` sets the *absolute* value, not relative.
                        // So we need Total Score.

                        // We can't easily get the fresh stats here without another DB call.
                        // Let's rely on the return value of `saveCast`? No, that returns the cast.

                        // Let's query user_stats for this user.
                        // (Implementation detail: We need to import supabase client here or add a helper)
                        // For now, let's do a "blind" add if we can't query, OR add a helper.

                        // Better: Update `saveCast` or `getOrCreateUser` to return stats? 
                        // Let's just import the supabase client here for a quick read.
                        const { createClient } = require('@supabase/supabase-js');
                        const supabase = createClient(
                            process.env.NEXT_PUBLIC_SUPABASE_URL!,
                            process.env.SUPABASE_SERVICE_ROLE_KEY!
                        );

                        const { data: stats, error: statsError } = await supabase
                            .from('user_stats')
                            .select('gda_units')
                            .eq('user_id', dbUser.id)
                            .single();

                        console.log(`   Stats query result:`, { stats, statsError });

                        if (stats && stats.gda_units !== null && stats.gda_units !== undefined) {
                            const newTotalUnits = stats.gda_units; // This was updated by the trigger!
                            console.log(`   Current GDA Units (from DB): ${newTotalUnits}`);

                            // Call the contract
                            console.log(`   Calling updateMemberUnits(${walletAddress}, ${newTotalUnits})...`);
                            const txResult = await updateMemberUnits(walletAddress, newTotalUnits);

                            if (txResult.success) {
                                console.log(`✅ On-chain units updated! Tx: ${txResult.txHash}`);
                            } else {
                                console.error(`❌ Failed to update on-chain units: ${txResult.error}`);
                            }
                        } else {
                            console.error(`❌ Could not fetch user stats or gda_units is null. Error:`, statsError);
                        }
                    } else {
                        console.log('⚠️ User has no embedded wallet - skipping on-chain update');
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
