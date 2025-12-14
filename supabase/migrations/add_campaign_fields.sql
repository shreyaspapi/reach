-- Add new fields to campaigns table for enhanced campaign pages
-- Migration: add_campaign_fields.sql

ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS pool_total TEXT,
ADD COLUMN IF NOT EXISTS x_handle TEXT,
ADD COLUMN IF NOT EXISTS farcaster_handle TEXT,
ADD COLUMN IF NOT EXISTS faq JSONB DEFAULT '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN campaigns.pool_total IS 'Total token pool allocated for this campaign (display string)';
COMMENT ON COLUMN campaigns.x_handle IS 'X (Twitter) handle for the campaign target';
COMMENT ON COLUMN campaigns.farcaster_handle IS 'Farcaster handle for the campaign target';
COMMENT ON COLUMN campaigns.faq IS 'FAQ items as JSON array of {question, answer} objects';
