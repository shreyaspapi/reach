import { supabaseAdmin, User, Cast, UserStats, Campaign } from './supabase';

/**
 * Database service functions for interacting with Supabase
 */

// ============================================================================
// USER OPERATIONS
// ============================================================================

/**
 * Get or create a user by FID
 */
export async function getOrCreateUser(userData: {
    fid: number;
    username: string;
    display_name?: string;
    pfp_url?: string;
    follower_count?: number;
    following_count?: number;
    power_badge?: boolean;
    privy_user_id?: string;
    wallet_address?: string;
}): Promise<User | null> {
    if (!supabaseAdmin) {
        console.error('Supabase admin client not initialized');
        return null;
    }

    try {
        // Check if user exists
        const { data: existingUser, error: fetchError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('fid', userData.fid)
            .single();

        if (existingUser && !fetchError) {
            // Update existing user
            const { data: updatedUser, error: updateError } = await supabaseAdmin
                .from('users')
                .update({
                    username: userData.username,
                    display_name: userData.display_name,
                    pfp_url: userData.pfp_url,
                    follower_count: userData.follower_count,
                    following_count: userData.following_count,
                    power_badge: userData.power_badge,
                    wallet_address: userData.wallet_address,
                    updated_at: new Date().toISOString()
                })
                .eq('fid', userData.fid)
                .select()
                .single();

            if (updateError) {
                console.error('Error updating user:', updateError);
                return existingUser;
            }

            return updatedUser;
        }

        // Create new user
        const { data: newUser, error: createError } = await supabaseAdmin
            .from('users')
            .insert([userData])
            .select()
            .single();

        if (createError) {
            console.error('Error creating user:', createError);
            return null;
        }

        return newUser;
    } catch (error) {
        console.error('Error in getOrCreateUser:', error);
        return null;
    }
}

/**
 * Get user by FID
 */
export async function getUserByFid(fid: number): Promise<User | null> {
    if (!supabaseAdmin) {
        console.error('Supabase admin client not initialized');
        return null;
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('fid', fid)
            .single();

        if (error) {
            console.error('Error fetching user:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error in getUserByFid:', error);
        return null;
    }
}

/**
 * Get user by Username
 */
export async function getUserByUsername(username: string): Promise<User | null> {
    if (!supabaseAdmin) {
        console.error('Supabase admin client not initialized');
        return null;
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .ilike('username', username) // Case-insensitive match
            .single();

        if (error) {
            console.error('Error fetching user by username:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error in getUserByUsername:', error);
        return null;
    }
}

// ============================================================================
// CAST OPERATIONS
// ============================================================================

/**
 * Save a cast with its engagement score
 */
export async function saveCast(castData: {
    cast_hash: string;
    user_id: string;
    fid: number;
    text: string;
    timestamp: string;
    parent_hash?: string;
    parent_author_fid?: number;
    channel?: string;
    embeds?: any[];
    mentions?: any[];
    likes_count?: number;
    recasts_count?: number;
    replies_count?: number;
    total_score: number;
    communication_quality_score: number;
    community_impact_score: number;
    consistency_score: number;
    active_campaign_score: number;
}): Promise<Cast | null> {
    if (!supabaseAdmin) {
        console.error('Supabase admin client not initialized');
        return null;
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('casts')
            .insert([{
                ...castData,
                likes_count: castData.likes_count || 0,
                recasts_count: castData.recasts_count || 0,
                replies_count: castData.replies_count || 0,
                embeds: castData.embeds || [],
                mentions: castData.mentions || []
            }])
            .select()
            .single();

        if (error) {
            // Check if it's a duplicate cast
            if (error.code === '23505') {
                console.log('Cast already exists:', castData.cast_hash);
                return null;
            }
            console.error('Error saving cast:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error in saveCast:', error);
        return null;
    }
}

/**
 * Get casts for a user
 */
export async function getUserCasts(fid: number, limit: number = 20): Promise<Cast[]> {
    if (!supabaseAdmin) {
        console.error('Supabase admin client not initialized');
        return [];
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('casts')
            .select('*')
            .eq('fid', fid)
            .order('timestamp', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching user casts:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in getUserCasts:', error);
        return [];
    }
}

/**
 * Get recent casts across all users
 */
export async function getRecentCasts(limit: number = 50): Promise<Cast[]> {
    if (!supabaseAdmin) {
        console.error('Supabase admin client not initialized');
        return [];
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('casts')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching recent casts:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in getRecentCasts:', error);
        return [];
    }
}

// ============================================================================
// USER STATS OPERATIONS
// ============================================================================

/**
 * Get user statistics
 */
export async function getUserStats(fid: number): Promise<UserStats | null> {
    if (!supabaseAdmin) {
        console.error('Supabase admin client not initialized');
        return null;
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('user_stats')
            .select('*')
            .eq('fid', fid)
            .single();

        if (error) {
            console.error('Error fetching user stats:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error in getUserStats:', error);
        return null;
    }
}

/**
 * Get leaderboard (top users by average score)
 */
export async function getLeaderboard(limit: number = 100, minCasts: number = 5): Promise<any[]> {
    if (!supabaseAdmin) {
        console.error('Supabase admin client not initialized');
        return [];
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('user_stats')
            .select(`
                *,
                users:user_id (
                    username,
                    display_name,
                    pfp_url,
                    power_badge
                )
            `)
            .gte('total_casts', minCasts)
            .order('average_score', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching leaderboard:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in getLeaderboard:', error);
        return [];
    }
}

// ============================================================================
// CAMPAIGN OPERATIONS
// ============================================================================

/**
 * Get campaign by ID
 */
export async function getCampaignById(id: string): Promise<Campaign | null> {
    if (!supabaseAdmin) {
        console.error('Supabase admin client not initialized');
        return null;
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('campaigns')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching campaign:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error in getCampaignById:', error);
        return null;
    }
}

/**
 * Get campaign participants (leaderboard)
 * Falls back to user_stats if no campaign participants exist
 */
export async function getCampaignParticipants(campaignId: string, limit: number = 50): Promise<any[]> {
    if (!supabaseAdmin) {
        console.error('Supabase admin client not initialized');
        return [];
    }

    try {
        // First try to get campaign-specific participants
        const { data: participants, error: participantsError } = await supabaseAdmin
            .from('campaign_participants')
            .select(`
                *,
                users:user_id (
                    username,
                    display_name,
                    pfp_url,
                    wallet_address
                )
            `)
            .eq('campaign_id', campaignId)
            .order('total_score', { ascending: false })
            .limit(limit);

        if (participantsError) {
            console.error('Error fetching campaign participants:', participantsError);
        }

        // If we have campaign participants, return them
        if (participants && participants.length > 0) {
            return participants;
        }

        // Fallback: Get top users from user_stats as general leaderboard
        console.log('No campaign participants found, falling back to user_stats');
        const { data: topUsers, error: statsError } = await supabaseAdmin
            .from('user_stats')
            .select(`
                id,
                total_score,
                average_score,
                total_casts as casts_count,
                gda_units,
                users:user_id (
                    username,
                    display_name,
                    pfp_url,
                    wallet_address
                )
            `)
            .gte('total_casts', 1)
            .order('total_score', { ascending: false })
            .limit(limit);

        if (statsError) {
            console.error('Error fetching user stats:', statsError);
            return [];
        }

        return topUsers || [];
    } catch (error) {
        console.error('Error in getCampaignParticipants:', error);
        return [];
    }
}

/**
 * Get active campaigns
 */
export async function getActiveCampaigns(): Promise<Campaign[]> {
    if (!supabaseAdmin) {
        console.error('Supabase admin client not initialized');
        return [];
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('campaigns')
            .select('*')
            .eq('is_active', true);

        if (error) {
            console.error('Error fetching campaigns:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in getActiveCampaigns:', error);
        return [];
    }
}

/**
 * Get campaign by target FID
 */
export async function getCampaignByTargetFid(targetFid: number): Promise<Campaign | null> {
    if (!supabaseAdmin) {
        console.error('Supabase admin client not initialized');
        return null;
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('campaigns')
            .select('*')
            .eq('target_fid', targetFid)
            .eq('is_active', true)
            .single();

        if (error) {
            console.error('Error fetching campaign:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error in getCampaignByTargetFid:', error);
        return null;
    }
}

/**
 * Add or update campaign participant
 */
export async function upsertCampaignParticipant(
    campaignId: string,
    userId: string,
    fid: number
): Promise<boolean> {
    if (!supabaseAdmin) {
        console.error('Supabase admin client not initialized');
        return false;
    }

    try {
        const { error } = await supabaseAdmin
            .from('campaign_participants')
            .upsert([
                {
                    campaign_id: campaignId,
                    user_id: userId,
                    fid: fid,
                    last_activity_at: new Date().toISOString()
                }
            ], {
                onConflict: 'campaign_id,user_id'
            });

        if (error) {
            console.error('Error upserting campaign participant:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error in upsertCampaignParticipant:', error);
        return false;
    }
}

// ============================================================================
// DASHBOARD DATA
// ============================================================================

/**
 * Get comprehensive dashboard data for a user
 */
export async function getUserDashboardData(fid: number) {
    if (!supabaseAdmin) {
        console.error('Supabase admin client not initialized');
        return null;
    }

    try {
        // Fetch user, stats, and recent casts in parallel
        const [user, stats, recentCasts] = await Promise.all([
            getUserByFid(fid),
            getUserStats(fid),
            getUserCasts(fid, 10)
        ]);

        return {
            user,
            stats,
            recentCasts
        };
    } catch (error) {
        console.error('Error in getUserDashboardData:', error);
        return null;
    }
}

/**
 * Get platform-wide statistics
 */
export async function getPlatformStats() {
    if (!supabaseAdmin) {
        console.error('Supabase admin client not initialized');
        return null;
    }

    try {
        // Get total users
        const { count: totalUsers } = await supabaseAdmin
            .from('users')
            .select('*', { count: 'exact', head: true });

        // Get total casts
        const { count: totalCasts } = await supabaseAdmin
            .from('casts')
            .select('*', { count: 'exact', head: true });

        // Get average score
        const { data: avgScoreData } = await supabaseAdmin
            .from('user_stats')
            .select('average_score');

        const avgScore = avgScoreData && avgScoreData.length > 0
            ? avgScoreData.reduce((sum, stat) => sum + stat.average_score, 0) / avgScoreData.length
            : 0;

        // Get recent activity (casts in last 24 hours)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count: recentActivity } = await supabaseAdmin
            .from('casts')
            .select('*', { count: 'exact', head: true })
            .gte('timestamp', oneDayAgo);

        return {
            totalUsers: totalUsers || 0,
            totalCasts: totalCasts || 0,
            averageScore: Math.round(avgScore * 100) / 100,
            recentActivity: recentActivity || 0
        };
    } catch (error) {
        console.error('Error in getPlatformStats:', error);
        return null;
    }
}

