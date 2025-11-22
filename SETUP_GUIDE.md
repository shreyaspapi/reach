# Reach Platform - Complete Setup Guide

This guide will walk you through setting up the Reach platform with Supabase database integration and the engagement scoring system.

## Prerequisites

- Node.js 18+ installed
- A Privy account and app configured
- A Supabase account
- A Neynar webhook configured for @shreyaspapi

## Step 1: Install Dependencies

The Supabase client has already been installed. If you need to reinstall:

```bash
npm install @supabase/supabase-js
```

## Step 2: Set Up Supabase

### 2.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `reach-platform` (or your choice)
   - Database Password: (save this securely)
   - Region: Choose closest to your users
5. Click "Create new project"
6. Wait for the database to be provisioned (~2 minutes)

### 2.2 Run the Database Schema

1. In your Supabase dashboard, navigate to the **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase/schema.sql`
4. Paste into the SQL Editor
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. Verify success - you should see "Success. No rows returned"

### 2.3 Get Your API Keys

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")
   - **service_role** secret key (under "Project API keys")

⚠️ **Important**: The `service_role` key bypasses Row Level Security. Keep it secret!

## Step 3: Configure Environment Variables

### 3.1 Create .env.local File

Copy the example file:

```bash
cp .env.example .env.local
```

### 3.2 Fill in Your Values

Edit `.env.local` and add your credentials:

```bash
# Privy Configuration (you should already have these)
PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id

# Supabase Configuration (NEW - add these)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_secret_key

# Neynar Webhook (optional, for validation)
NEYNAR_WEBHOOK_SECRET=your_webhook_secret
```

## Step 4: Verify Database Connection

### 4.1 Start the Development Server

```bash
npm run dev
```

### 4.2 Check Health Endpoint

Visit: http://localhost:3000/api/health

You should see:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "services": {
    "privy": "connected",
    "supabase": "connected"
  }
}
```

## Step 5: Test the Webhook

### 5.1 Send a Test Webhook

Use the provided test script:

```bash
./test-webhook.sh
```

Or manually with curl:

```bash
curl -X POST http://localhost:3000/api/webhooks/neynar \
  -H "Content-Type: application/json" \
  -d '{
    "type": "cast.created",
    "data": {
      "hash": "0xtest123",
      "author": {
        "fid": 123456,
        "username": "testuser",
        "display_name": "Test User",
        "pfp_url": "https://example.com/pfp.jpg",
        "follower_count": 100,
        "following_count": 50,
        "power_badge": false
      },
      "text": "This is a test cast replying to @shreyaspapi with a thoughtful question about decentralized social networks. How do you think this will evolve?",
      "timestamp": "2024-01-01T12:00:00Z",
      "parent_hash": "0xparent",
      "reactions": {
        "likes_count": 5,
        "recasts_count": 2,
        "replies_count": 1
      }
    }
  }'
```

### 5.2 Verify in Console

You should see detailed output including:
- ✅ User synced
- 📊 Score breakdown
- ✅ Cast saved to database

### 5.3 Verify in Supabase

1. Go to your Supabase dashboard
2. Click **Table Editor**
3. Check these tables:
   - `users` - Should have the test user
   - `casts` - Should have the test cast with scores
   - `user_stats` - Should have aggregated stats

## Step 6: Configure Neynar Webhook (Production)

### 6.1 Update Webhook URL

In your Neynar dashboard, update your webhook URL to point to your deployed app:

```
https://your-domain.com/api/webhooks/neynar
```

### 6.2 Webhook Filters

Ensure your webhook is configured with:
- **Event Type**: `cast.created`
- **Filter**: Mentions or replies to @shreyaspapi (FID: [shreyaspapi's FID])

## Step 7: Verify Data Flow

### 7.1 Check API Endpoints

Once you have some data, test these endpoints:

**Get User Dashboard Data:**
```bash
curl http://localhost:3000/api/dashboard/user/123456
```

**Get Leaderboard:**
```bash
curl http://localhost:3000/api/dashboard/leaderboard?limit=10
```

**Get Platform Stats:**
```bash
curl http://localhost:3000/api/dashboard/stats
```

**Get Recent Casts:**
```bash
curl http://localhost:3000/api/dashboard/casts?limit=20
```

## Understanding the Scoring System

The system evaluates each cast using four metrics:

### 1. Communication Quality (40%)
- Content length and substance
- Anti-spam detection
- Thoughtful language
- Anti-farming measures

### 2. Community Impact (30%)
- Engagement metrics (likes, recasts, replies)
- Follower count
- Channel participation

### 3. Consistency (20%)
- Posting frequency
- Total engagement count
- Time between casts

### 4. Active Campaign (10%)
- Direct engagement with Shreyas
- Quality of replies
- Mentions and questions

**Total Score**: 0-100 (weighted average of all metrics)

See `SCORING_SYSTEM.md` for detailed breakdown.

## Database Schema Overview

### Tables Created

1. **users** - Farcaster user profiles
2. **casts** - All engagement casts with scores
3. **user_stats** - Aggregated user statistics
4. **campaigns** - Engagement campaigns
5. **campaign_participants** - User participation tracking

### Automatic Features

- **Auto-updating Stats**: User statistics update automatically via triggers
- **Timestamps**: `updated_at` fields maintained automatically
- **Indexes**: Optimized for fast queries
- **RLS**: Row Level Security policies configured

## API Routes Reference

### Dashboard APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dashboard/user/[fid]` | GET | Get user profile, stats, and recent casts |
| `/api/dashboard/leaderboard` | GET | Get top users by score |
| `/api/dashboard/stats` | GET | Get platform-wide statistics |
| `/api/dashboard/casts` | GET | Get recent casts (all or by user) |

### Query Parameters

**Leaderboard:**
- `limit` - Number of results (default: 100)
- `minCasts` - Minimum casts required (default: 5)

**Casts:**
- `fid` - Filter by user FID (optional)
- `limit` - Number of results (default: 20)

## Monitoring and Debugging

### Check Logs

**Development:**
```bash
npm run dev
# Watch console output
```

**Production (Vercel):**
- Go to Vercel dashboard
- Click on your project
- Navigate to "Logs"

### Supabase Logs

1. Go to Supabase dashboard
2. Click **Logs** in sidebar
3. View:
   - API logs
   - Database logs
   - Function logs

### Common Issues

**Issue: "Supabase admin client not initialized"**
- Check that `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`
- Restart your dev server after adding env vars

**Issue: "Failed to save cast"**
- Check Supabase connection
- Verify user exists in database
- Check for duplicate cast_hash

**Issue: "User not found"**
- Ensure user is registered with Privy
- Check that FID is in `connectedUserFids` set
- Verify Privy sync is working

## Next Steps

### Integrate with Dashboard

Update your dashboard components to fetch data from the new API routes:

```typescript
// Example: Fetch user data
const response = await fetch(`/api/dashboard/user/${fid}`);
const data = await response.json();
```

### Add Superfluid Integration

The scoring system is ready. Next, integrate Superfluid to:
1. Create payment streams based on scores
2. Adjust flow rates based on engagement
3. Distribute rewards automatically

### Customize Scoring Weights

Edit `lib/scoring.ts` to adjust weights:

```typescript
const weights = {
    communicationQuality: 0.4, // 40%
    communityImpact: 0.3,      // 30%
    consistency: 0.2,          // 20%
    activeCampaign: 0.1        // 10%
};
```

Or create campaign-specific weights in the database.

## Backup and Maintenance

### Regular Backups

Supabase provides automatic backups, but you can also:

```bash
# Export data
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres > backup.sql
```

### Clean Old Data

```sql
-- Delete casts older than 90 days
DELETE FROM casts WHERE timestamp < NOW() - INTERVAL '90 days';
```

### Monitor Performance

- Check Supabase dashboard for query performance
- Monitor API response times
- Track database size and growth

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Privy Docs**: https://docs.privy.io
- **Neynar Docs**: https://docs.neynar.com

## Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] Service role key is never exposed to client
- [ ] RLS policies are properly configured
- [ ] Webhook endpoints validate incoming data
- [ ] API routes have proper error handling
- [ ] Database backups are enabled
- [ ] Monitoring is set up for production

---

🎉 **Setup Complete!** Your engagement scoring system is now running with full database integration.

