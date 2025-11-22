# 🚀 Supabase Setup - Do This Now!

## Step 1: Create Supabase Project (5 minutes)

### 1.1 Go to Supabase
1. Open https://supabase.com in your browser
2. Sign in or create account
3. Click **"New Project"**

### 1.2 Create Project
Fill in:
- **Name**: `reach-platform` (or any name you like)
- **Database Password**: Create a strong password (SAVE THIS!)
- **Region**: Choose closest to you (e.g., US East, EU West)
- **Pricing Plan**: Free tier is fine for testing

Click **"Create new project"** and wait ~2 minutes for it to provision.

---

## Step 2: Run Database Schema (2 minutes)

### 2.1 Open SQL Editor
1. In your Supabase project dashboard
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New Query"**

### 2.2 Copy and Paste This SQL

**IMPORTANT**: Copy the ENTIRE contents of the file `supabase/schema.sql` and paste it into the SQL Editor.

Or copy this complete schema:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fid BIGINT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    display_name TEXT,
    pfp_url TEXT,
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    power_badge BOOLEAN DEFAULT FALSE,
    privy_user_id TEXT,
    wallet_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Casts table
CREATE TABLE IF NOT EXISTS casts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cast_hash TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    fid BIGINT NOT NULL,
    text TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    parent_hash TEXT,
    parent_author_fid BIGINT,
    channel TEXT,
    embeds JSONB DEFAULT '[]'::jsonb,
    mentions JSONB DEFAULT '[]'::jsonb,
    likes_count INTEGER DEFAULT 0,
    recasts_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    total_score DECIMAL(5,2) NOT NULL,
    communication_quality_score DECIMAL(5,2) NOT NULL,
    community_impact_score DECIMAL(5,2) NOT NULL,
    consistency_score DECIMAL(5,2) NOT NULL,
    active_campaign_score DECIMAL(5,2) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User statistics table
CREATE TABLE IF NOT EXISTS user_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    fid BIGINT UNIQUE NOT NULL,
    total_casts INTEGER DEFAULT 0,
    total_score DECIMAL(10,2) DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    highest_score DECIMAL(5,2) DEFAULT 0,
    lowest_score DECIMAL(5,2) DEFAULT 0,
    total_likes_received INTEGER DEFAULT 0,
    total_recasts_received INTEGER DEFAULT 0,
    total_replies_received INTEGER DEFAULT 0,
    first_cast_at TIMESTAMP WITH TIME ZONE,
    last_cast_at TIMESTAMP WITH TIME ZONE,
    most_active_day TEXT,
    most_active_hour INTEGER,
    total_rewards_earned DECIMAL(18,8) DEFAULT 0,
    current_stream_rate DECIMAL(18,8) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    target_fid BIGINT NOT NULL,
    target_username TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    communication_quality_weight DECIMAL(3,2) DEFAULT 0.40,
    community_impact_weight DECIMAL(3,2) DEFAULT 0.30,
    consistency_weight DECIMAL(3,2) DEFAULT 0.20,
    active_campaign_weight DECIMAL(3,2) DEFAULT 0.10,
    min_score_for_reward DECIMAL(5,2) DEFAULT 40.0,
    reward_multiplier DECIMAL(5,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign participation table
CREATE TABLE IF NOT EXISTS campaign_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    fid BIGINT NOT NULL,
    casts_count INTEGER DEFAULT 0,
    total_score DECIMAL(10,2) DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    rank INTEGER,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(campaign_id, user_id)
);

-- Indexes
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

-- Trigger function to update user stats
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
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER trigger_update_user_stats
    AFTER INSERT ON casts
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2.3 Run the SQL
1. Click **"Run"** button (or press Cmd/Ctrl + Enter)
2. You should see: **"Success. No rows returned"**
3. If you see any errors, let me know!

---

## Step 3: Get Your API Keys (1 minute)

### 3.1 Navigate to Settings
1. Click the **Settings** icon (gear) in the left sidebar
2. Click **"API"** in the settings menu

### 3.2 Copy These Values

You'll see:
- **Project URL**: `https://xxxxx.supabase.co`
- **Project API keys**:
  - `anon` `public` - Copy this
  - `service_role` `secret` - Copy this (click "Reveal" first)

---

## Step 4: Add to .env.local (2 minutes)

### 4.1 Open/Create .env.local

In your project root, open or create `.env.local` file.

### 4.2 Add These Lines

```bash
# Privy (you should already have these)
PRIVY_APP_ID=your_existing_privy_app_id
PRIVY_APP_SECRET=your_existing_privy_app_secret
NEXT_PUBLIC_PRIVY_APP_ID=your_existing_privy_app_id

# Supabase (ADD THESE NOW)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Azure OpenAI (ADD YOUR API KEY)
AZURE_OPENAI_ENDPOINT=https://spapi-m6bybx3p-eastus2.cognitiveservices.azure.com/
AZURE_OPENAI_API_KEY=your_azure_api_key_here
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_MODEL_NAME=gpt-4o
AZURE_OPENAI_API_VERSION=2024-04-01-preview
```

**Replace**:
- `xxxxx` with your actual Supabase project ID
- The `ANON_KEY` with your actual anon key
- The `SERVICE_ROLE_KEY` with your actual service role key
- `your_azure_api_key_here` with your Azure OpenAI API key

---

## Step 5: Test Connection (1 minute)

### 5.1 Run Test Script

```bash
node test-supabase.js
```

You should see:
```
✅ Connected to database successfully!
✅ users: 0 rows
✅ casts: 0 rows
✅ user_stats: 0 rows
✅ campaigns: 0 rows
✅ campaign_participants: 0 rows
✅ Write permissions OK
```

### 5.2 If You See Errors

**"Missing Supabase environment variables"**
→ Check your `.env.local` file has all the Supabase variables

**"Database Error: relation 'users' does not exist"**
→ Go back to Step 2 and run the SQL schema again

**"Invalid API key"**
→ Double-check you copied the correct keys from Supabase

---

## Step 6: Restart Your Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

---

## Step 7: Test the Full Flow

### 7.1 Send Test Webhook

```bash
./test-webhook.sh
```

### 7.2 Check Console Output

You should see:
```
🔔 CAST DETECTED from Registered User
🤖 Calculating engagement score with AI...
🎯 TOTAL SCORE: 75.5/100
💾 Saving to database...
✅ User synced: testuser (ID: xxx)
✅ Cast saved to database (ID: xxx)
```

### 7.3 Verify in Supabase

1. Go to your Supabase dashboard
2. Click **"Table Editor"** in left sidebar
3. Click **"users"** table - you should see your test user
4. Click **"casts"** table - you should see the test cast with scores
5. Click **"user_stats"** table - you should see aggregated stats

---

## Troubleshooting

### Problem: "Supabase admin client not initialized"

**Solution**: 
1. Check `.env.local` has `SUPABASE_SERVICE_ROLE_KEY`
2. Restart server: `npm run dev`

### Problem: "Failed to get/create user in database"

**Solution**:
1. Run `node test-supabase.js` to check connection
2. Verify schema was created (check Table Editor in Supabase)
3. Check console for specific error messages

### Problem: Cast is ignored "not registered user"

**Solution**: 
I've updated the webhook to score ALL casts that mention/reply to @shreyaspapi, even if the user isn't registered yet. This way you can track engagement from everyone.

### Problem: "Error calling Azure OpenAI"

**Solution**:
1. Check `AZURE_OPENAI_API_KEY` in `.env.local`
2. Verify the key is correct in Azure Portal
3. System will fall back to rule-based scoring if LLM fails

---

## Quick Checklist

- [ ] Created Supabase project
- [ ] Ran SQL schema in SQL Editor
- [ ] Copied API keys (URL, anon key, service role key)
- [ ] Added all keys to `.env.local`
- [ ] Ran `node test-supabase.js` successfully
- [ ] Restarted dev server
- [ ] Tested webhook with `./test-webhook.sh`
- [ ] Verified data in Supabase Table Editor

---

## What Happens Now?

Once set up:

1. **Webhook receives cast** → Someone mentions/replies to @shreyaspapi
2. **LLM scores it** → Azure OpenAI evaluates quality (0-100)
3. **Saves to database** → User + cast + scores stored in Supabase
4. **Stats update** → User statistics automatically aggregated
5. **Dashboard ready** → API endpoints return data for your UI

---

## Need Help?

If you're stuck:

1. Run `node test-supabase.js` and share the output
2. Check the console logs when testing webhook
3. Look in Supabase dashboard → Logs for any errors
4. Share any error messages you see

---

**Ready? Let's do this! Start with Step 1 above. 🚀**

