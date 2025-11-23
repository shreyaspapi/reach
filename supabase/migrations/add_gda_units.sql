-- Migration: Add gda_units column to user_stats table
-- This column tracks the Superfluid GDA units for each user

-- Add the gda_units column
ALTER TABLE user_stats 
ADD COLUMN IF NOT EXISTS gda_units DECIMAL(18,8) DEFAULT 0;

-- Update the trigger function to increment gda_units
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_stats (user_id, fid, total_casts, total_score, average_score, highest_score, lowest_score, first_cast_at, last_cast_at, gda_units)
    VALUES (
        NEW.user_id,
        NEW.fid,
        1,
        NEW.total_score,
        NEW.total_score,
        NEW.total_score,
        NEW.total_score,
        NEW.timestamp,
        NEW.timestamp,
        NEW.total_score -- Initialize gda_units with the first cast's score
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
        gda_units = user_stats.gda_units + NEW.total_score, -- Increment gda_units by new cast's score
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

