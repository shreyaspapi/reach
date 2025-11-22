# Database Integration Summary

## What Was Built

A complete Supabase database integration for the Reach platform that:

1. ✅ Stores all user engagement casts with detailed scoring
2. ✅ Tracks user statistics and history
3. ✅ Provides API endpoints for dashboard data
4. ✅ Automatically updates aggregated stats via database triggers
5. ✅ Implements anti-sybil and anti-farming measures

## Files Created/Modified

### New Files

#### Database Schema & Config
- `supabase/schema.sql` - Complete database schema with tables, indexes, triggers
- `supabase/README.md` - Database documentation and queries
- `lib/supabase.ts` - Supabase client configuration and TypeScript types
- `lib/database.ts` - Database service functions (CRUD operations)

#### API Routes
- `app/api/dashboard/user/[fid]/route.ts` - Get user profile and stats
- `app/api/dashboard/leaderboard/route.ts` - Get top users by score
- `app/api/dashboard/stats/route.ts` - Get platform-wide statistics
- `app/api/dashboard/casts/route.ts` - Get recent casts

#### Documentation
- `SETUP_GUIDE.md` - Complete setup instructions
- `SCORING_SYSTEM.md` - Detailed scoring system documentation
- `DATABASE_INTEGRATION.md` - This file
- `env.example.txt` - Environment variables template

#### Scoring System
- `lib/scoring.ts` - Engagement scoring algorithm

### Modified Files
- `app/api/webhooks/neynar/route.ts` - Updated to save data to database
- `package.json` - Added @supabase/supabase-js dependency

## Database Tables

### 1. users
Stores Farcaster user information.

**Key Fields:**
- `fid` (unique) - Farcaster ID
- `username` - Farcaster username
- `privy_user_id` - Link to Privy
- `power_badge` - Power user status

### 2. casts
Stores all engagement casts with full scoring breakdown.

**Key Fields:**
- `cast_hash` (unique) - Cast identifier
- `user_id` - Reference to users table
- `text` - Cast content
- `total_score` - Overall score (0-100)
- Individual score components (communication, impact, consistency, campaign)
- Engagement metrics (likes, recasts, replies)

### 3. user_stats
Aggregated user statistics (auto-updated via triggers).

**Key Fields:**
- `total_casts` - Number of casts
- `average_score` - Average engagement score
- `total_rewards_earned` - Cumulative rewards
- Activity patterns (most active day/hour)

### 4. campaigns
Different engagement campaigns.

**Key Fields:**
- `target_fid` - Who to engage with
- `is_active` - Campaign status
- Customizable scoring weights
- Reward settings

### 5. campaign_participants
Tracks user participation in campaigns.

## API Endpoints

### GET /api/dashboard/user/[fid]
Get complete user dashboard data.

**Response:**
```json
{
  "user": {
    "fid": 123456,
    "username": "testuser",
    "display_name": "Test User",
    ...
  },
  "stats": {
    "total_casts": 25,
    "average_score": 72.5,
    "total_rewards_earned": 0,
    ...
  },
  "recentCasts": [...]
}
```

### GET /api/dashboard/leaderboard
Get top users by score.

**Query Params:**
- `limit` - Number of results (default: 100)
- `minCasts` - Minimum casts required (default: 5)

**Response:**
```json
{
  "leaderboard": [
    {
      "fid": 123456,
      "average_score": 85.2,
      "total_casts": 50,
      "users": {
        "username": "topuser",
        ...
      }
    },
    ...
  ],
  "count": 100
}
```

### GET /api/dashboard/stats
Get platform-wide statistics.

**Response:**
```json
{
  "totalUsers": 150,
  "totalCasts": 1250,
  "averageScore": 68.5,
  "recentActivity": 45
}
```

### GET /api/dashboard/casts
Get recent casts.

**Query Params:**
- `fid` - Filter by user (optional)
- `limit` - Number of results (default: 20)

**Response:**
```json
{
  "casts": [...],
  "count": 20
}
```

## Webhook Flow

When a cast is received:

1. **Validate User** - Check if registered with Privy
2. **Calculate Score** - Run through scoring algorithm
3. **Get/Create User** - Ensure user exists in database
4. **Save Cast** - Store cast with all scores
5. **Auto-Update Stats** - Database trigger updates user_stats
6. **Log Results** - Console output with detailed breakdown

## Scoring System

### Weights
- **Communication Quality**: 40% - Content quality and substance
- **Community Impact**: 30% - Engagement and reach
- **Consistency**: 20% - Regular participation
- **Active Campaign**: 10% - Direct engagement with target

### Anti-Sybil Measures
- Spam detection (repeated characters, excessive emojis)
- Farming keyword detection (gm, gn, ser, etc.)
- Frequency limits (penalize too-frequent posting)
- Generic reply detection (thanks, nice, cool, etc.)
- Content substance requirements

See `SCORING_SYSTEM.md` for full details.

## Environment Variables Required

Add these to your `.env.local`:

```bash
# Supabase (NEW)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Privy (existing)
PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
```

## Quick Start

### 1. Set Up Supabase
```bash
# 1. Create project at supabase.com
# 2. Run supabase/schema.sql in SQL Editor
# 3. Get API keys from Project Settings > API
# 4. Add to .env.local
```

### 2. Install & Run
```bash
# Already installed
npm install @supabase/supabase-js

# Start dev server
npm run dev
```

### 3. Test
```bash
# Send test webhook
./test-webhook.sh

# Check API
curl http://localhost:3000/api/dashboard/stats
```

## Database Features

### Automatic Updates
- User stats update automatically when new casts are inserted
- Timestamps maintained automatically
- Aggregations handled by database triggers

### Performance
- Optimized indexes for fast queries
- Efficient leaderboard queries
- Time-based filtering support

### Security
- Row Level Security (RLS) enabled
- Service role for backend operations
- Public read access to appropriate data

## Next Steps

### 1. Update Dashboard UI
Fetch data from new API endpoints:

```typescript
// In your dashboard component
const { data } = await fetch(`/api/dashboard/user/${fid}`);
```

### 2. Add Superfluid Integration
Use scores to trigger payment streams:

```typescript
if (scoreResult.totalScore >= 70) {
  await adjustStreamRate(fid, highRate);
}
```

### 3. Create Leaderboard Component
Display top contributors:

```typescript
const { leaderboard } = await fetch('/api/dashboard/leaderboard?limit=10');
```

### 4. Add Analytics
Track engagement over time, score distributions, etc.

## Useful Queries

### Top Performers This Week
```sql
SELECT 
  u.username,
  COUNT(*) as casts_this_week,
  AVG(c.total_score) as avg_score
FROM casts c
JOIN users u ON c.user_id = u.id
WHERE c.timestamp > NOW() - INTERVAL '7 days'
GROUP BY u.username
ORDER BY avg_score DESC
LIMIT 10;
```

### User Activity Timeline
```sql
SELECT 
  DATE(timestamp) as date,
  COUNT(*) as casts,
  AVG(total_score) as avg_score
FROM casts
WHERE fid = 123456
GROUP BY DATE(timestamp)
ORDER BY date DESC;
```

### Score Distribution
```sql
SELECT 
  CASE 
    WHEN total_score >= 80 THEN 'Excellent (80+)'
    WHEN total_score >= 60 THEN 'Good (60-79)'
    WHEN total_score >= 40 THEN 'Fair (40-59)'
    ELSE 'Low (<40)'
  END as score_range,
  COUNT(*) as count
FROM casts
GROUP BY score_range
ORDER BY MIN(total_score) DESC;
```

## Monitoring

### Check Database Health
- Supabase Dashboard > Database > Health
- Monitor query performance
- Check storage usage

### Check API Performance
- Monitor response times
- Track error rates
- Watch for slow queries

### Check Webhook Processing
- Console logs show detailed breakdown
- Verify casts are being saved
- Check for duplicate cast errors

## Troubleshooting

### "Supabase admin client not initialized"
- Check `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
- Restart dev server

### "Failed to save cast"
- Verify Supabase connection
- Check for duplicate cast_hash
- Review database logs

### "User not found"
- Ensure user is registered with Privy
- Check `connectedUserFids` set
- Verify Privy sync is working

### Slow Queries
- Check indexes are created
- Review query execution plans
- Consider materialized views for complex queries

## Maintenance

### Regular Tasks
- Monitor database size
- Review slow queries
- Update indexes as needed
- Clean old data (optional)

### Backups
- Supabase provides automatic backups
- Can export data via dashboard
- Use `pg_dump` for manual backups

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Database Schema**: `supabase/README.md`
- **Scoring System**: `SCORING_SYSTEM.md`
- **Setup Guide**: `SETUP_GUIDE.md`

---

**Status**: ✅ Complete and ready for production

**Last Updated**: November 22, 2025

