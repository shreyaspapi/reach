-- Supabase Database Schema for Reach Platform
-- This schema stores user engagement data, cast scores, and campaign information

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Privy user data)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fid BIGINT UNIQUE NOT NULL, -- Farcaster ID
    username TEXT NOT NULL,
    display_name TEXT,
    pfp_url TEXT,
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    power_badge BOOLEAN DEFAULT FALSE,
    privy_user_id TEXT, -- Link to Privy user
    wallet_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Casts table (stores all engagement casts)
CREATE TABLE IF NOT EXISTS casts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cast_hash TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    fid BIGINT NOT NULL,
    text TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    parent_hash TEXT, -- If this is a reply
    parent_author_fid BIGINT, -- FID of the parent cast author
    channel TEXT,
    embeds JSONB DEFAULT '[]'::jsonb,
    mentions JSONB DEFAULT '[]'::jsonb,
    
    -- Engagement metrics
    likes_count INTEGER DEFAULT 0,
    recasts_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    
    -- Scoring data
    total_score DECIMAL(5,2) NOT NULL,
    communication_quality_score DECIMAL(5,2) NOT NULL,
    community_impact_score DECIMAL(5,2) NOT NULL,
    consistency_score DECIMAL(5,2) NOT NULL,
    active_campaign_score DECIMAL(5,2) NOT NULL,
    
    -- Metadata
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User statistics table (aggregated data)
CREATE TABLE IF NOT EXISTS user_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    fid BIGINT UNIQUE NOT NULL,
    
    -- Cast statistics
    total_casts INTEGER DEFAULT 0,
    total_score DECIMAL(10,2) DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    highest_score DECIMAL(5,2) DEFAULT 0,
    lowest_score DECIMAL(5,2) DEFAULT 0,
    
    -- Engagement statistics
    total_likes_received INTEGER DEFAULT 0,
    total_recasts_received INTEGER DEFAULT 0,
    total_replies_received INTEGER DEFAULT 0,
    
    -- Time-based statistics
    first_cast_at TIMESTAMP WITH TIME ZONE,
    last_cast_at TIMESTAMP WITH TIME ZONE,
    most_active_day TEXT, -- Day of week
    most_active_hour INTEGER, -- Hour of day (0-23)
    
    -- Rewards (placeholder for future use)
    total_rewards_earned DECIMAL(18,8) DEFAULT 0,
    current_stream_rate DECIMAL(18,8) DEFAULT 0,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns table (for tracking different engagement campaigns)
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    target_fid BIGINT NOT NULL, -- The FID being engaged with (e.g., shreyaspapi)
    target_username TEXT NOT NULL,
    
    -- Campaign settings
    is_active BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    
    -- Scoring weights (can be customized per campaign)
    communication_quality_weight DECIMAL(3,2) DEFAULT 0.40,
    community_impact_weight DECIMAL(3,2) DEFAULT 0.30,
    consistency_weight DECIMAL(3,2) DEFAULT 0.20,
    active_campaign_weight DECIMAL(3,2) DEFAULT 0.10,
    
    -- Reward settings
    min_score_for_reward DECIMAL(5,2) DEFAULT 40.0,
    reward_multiplier DECIMAL(5,2) DEFAULT 1.0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign participation (tracks which users are in which campaigns)
CREATE TABLE IF NOT EXISTS campaign_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    fid BIGINT NOT NULL,
    
    -- Participation stats
    casts_count INTEGER DEFAULT 0,
    total_score DECIMAL(10,2) DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    rank INTEGER,
    
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(campaign_id, user_id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_casts_user_id ON casts(user_id);
CREATE INDEX IF NOT EXISTS idx_casts_fid ON casts(fid);
CREATE INDEX IF NOT EXISTS idx_casts_timestamp ON casts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_casts_total_score ON casts(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_casts_parent_hash ON casts(parent_hash);
CREATE INDEX IF NOT EXISTS idx_users_fid ON users(fid);
CREATE INDEX IF NOT EXISTS idx_user_stats_fid ON user_stats(fid);
CREATE INDEX IF NOT EXISTS idx_user_stats_average_score ON user_stats(average_score DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_participants_campaign_id ON campaign_participants(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_participants_user_id ON campaign_participants(user_id);

-- Function to update user stats after a new cast
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_stats (user_id, fid, total_casts, total_score, average_score, highest_score, lowest_score, first_cast_at, last_cast_at)
    VALUES (
        NEW.user_id,
        NEW.fid,
        1,
        NEW.total_score,
        NEW.total_score,
        NEW.total_score,
        NEW.total_score,
        NEW.timestamp,
        NEW.timestamp
    )
    ON CONFLICT (user_id) DO UPDATE SET
        total_casts = user_stats.total_casts + 1,
        total_score = user_stats.total_score + NEW.total_score,
        average_score = (user_stats.total_score + NEW.total_score) / (user_stats.total_casts + 1),
        highest_score = GREATEST(user_stats.highest_score, NEW.total_score),
        lowest_score = LEAST(user_stats.lowest_score, NEW.total_score),
        last_cast_at = NEW.timestamp,
        total_likes_received = user_stats.total_likes_received + NEW.likes_count,
        total_recasts_received = user_stats.total_recasts_received + NEW.recasts_count,
        total_replies_received = user_stats.total_replies_received + NEW.replies_count,
        gda_units = user_stats.gda_units + NEW.total_score, -- Add new score to GDA units
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update user stats
CREATE TRIGGER trigger_update_user_stats
    AFTER INSERT ON casts
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default campaign for Shreyas
INSERT INTO campaigns (name, description, target_fid, target_username)
VALUES (
    'Talk to Shreyas',
    'Engage with @shreyaspapi through meaningful conversations and quality content',
    (SELECT fid FROM users WHERE username = 'shreyaspapi' LIMIT 1),
    'shreyaspapi'
)
ON CONFLICT DO NOTHING;

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE casts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_participants ENABLE ROW LEVEL SECURITY;

-- Public read access to campaigns
CREATE POLICY "Public campaigns are viewable by everyone"
    ON campaigns FOR SELECT
    USING (is_active = true);

-- Users can view their own data
CREATE POLICY "Users can view their own data"
    ON users FOR SELECT
    USING (true);

CREATE POLICY "Users can view their own casts"
    ON casts FOR SELECT
    USING (true);

CREATE POLICY "Users can view their own stats"
    ON user_stats FOR SELECT
    USING (true);

-- Service role can do everything (for backend operations)
-- Note: These policies allow full access when using the service role key
CREATE POLICY "Service role can do everything on users"
    ON users FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role can do everything on casts"
    ON casts FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role can do everything on user_stats"
    ON user_stats FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role can do everything on campaign_participants"
    ON campaign_participants FOR ALL
    USING (true)
    WITH CHECK (true);

