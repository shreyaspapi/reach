import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

// Client for frontend use (with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for backend use (bypasses RLS)
export const supabaseAdmin = supabaseServiceKey 
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        },
        // Increase fetch timeout to avoid UND_ERR_CONNECT_TIMEOUT
        global: {
            fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(30000) })
        }
    })
    : null;

if (!supabaseAdmin) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not found. Admin operations will not work.');
}

// Type definitions for database tables
export interface User {
    id: string;
    fid: number;
    username: string;
    display_name?: string;
    pfp_url?: string;
    follower_count?: number;
    following_count?: number;
    power_badge?: boolean;
    privy_user_id?: string;
    wallet_address?: string;
    created_at: string;
    updated_at: string;
}

export interface Cast {
    id: string;
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
    likes_count: number;
    recasts_count: number;
    replies_count: number;
    total_score: number;
    communication_quality_score: number;
    community_impact_score: number;
    consistency_score: number;
    active_campaign_score: number;
    processed_at: string;
    created_at: string;
}

export interface UserStats {
    id: string;
    user_id: string;
    fid: number;
    total_casts: number;
    total_score: number;
    average_score: number;
    highest_score: number;
    lowest_score: number;
    total_likes_received: number;
    total_recasts_received: number;
    total_replies_received: number;
    first_cast_at?: string;
    last_cast_at?: string;
    most_active_day?: string;
    most_active_hour?: number;
    total_rewards_earned: number;
    current_stream_rate: number;
    gda_units: number; // Superfluid GDA units
    updated_at: string;
}

export interface Campaign {
    id: string;
    name: string;
    description?: string;
    target_fid: number;
    target_username: string;
    is_active: boolean;
    start_date: string;
    end_date?: string;
    communication_quality_weight: number;
    community_impact_weight: number;
    consistency_weight: number;
    active_campaign_weight: number;
    min_score_for_reward: number;
    reward_multiplier: number;
    created_at: string;
    updated_at: string;
}

export interface CampaignParticipant {
    id: string;
    campaign_id: string;
    user_id: string;
    fid: number;
    casts_count: number;
    total_score: number;
    average_score: number;
    rank?: number;
    joined_at: string;
    last_activity_at?: string;
}

