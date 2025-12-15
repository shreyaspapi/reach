-- SQL script to create the wrapped_leaderboard table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS wrapped_leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    address TEXT UNIQUE NOT NULL,
    basename TEXT,
    score INTEGER NOT NULL,
    skill_level TEXT NOT NULL,
    total_transactions INTEGER NOT NULL,
    total_volume NUMERIC NOT NULL,
    active_days INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_wrapped_leaderboard_score ON wrapped_leaderboard(score DESC);
CREATE INDEX IF NOT EXISTS idx_wrapped_leaderboard_address ON wrapped_leaderboard(address);
CREATE INDEX IF NOT EXISTS idx_wrapped_leaderboard_skill_level ON wrapped_leaderboard(skill_level);

-- Add comments for documentation
COMMENT ON TABLE wrapped_leaderboard IS 'Leaderboard for onchain wrapped data - stores user activity metrics';
COMMENT ON COLUMN wrapped_leaderboard.address IS 'Ethereum wallet address (unique)';
COMMENT ON COLUMN wrapped_leaderboard.basename IS 'Base name if available (e.g., username.base.eth)';
COMMENT ON COLUMN wrapped_leaderboard.score IS 'Chain engagement score (0-100)';
COMMENT ON COLUMN wrapped_leaderboard.skill_level IS 'Skill level based on score (NPC, Beginner, Skilled, Expert, Elite, Legendary)';
COMMENT ON COLUMN wrapped_leaderboard.total_transactions IS 'Total number of transactions in 2025';
COMMENT ON COLUMN wrapped_leaderboard.total_volume IS 'Total transaction volume in USD';
COMMENT ON COLUMN wrapped_leaderboard.active_days IS 'Number of active days in 2025';
