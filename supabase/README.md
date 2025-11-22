# Supabase Database Setup

## Quick Start

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to be provisioned

### 2. Run the Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `schema.sql`
3. Paste and run it in the SQL Editor

### 3. Get Your Credentials

1. Go to Project Settings > API
2. Copy your:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - `anon` public key (for client-side)
   - `service_role` secret key (for server-side)

### 4. Add to Environment Variables

Add these to your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Database Schema

### Tables

#### `users`
Stores Farcaster user information linked to Privy accounts.

**Key Fields:**
- `fid`: Farcaster ID (unique)
- `username`: Farcaster username
- `privy_user_id`: Link to Privy authentication
- `power_badge`: Whether user has Farcaster power badge

#### `casts`
Stores all engagement casts with scoring data.

**Key Fields:**
- `cast_hash`: Unique identifier for the cast
- `user_id`: Reference to users table
- `text`: Cast content
- `total_score`: Overall engagement score (0-100)
- Individual score breakdowns (communication, impact, consistency, campaign)
- Engagement metrics (likes, recasts, replies)

#### `user_stats`
Aggregated statistics for each user.

**Key Fields:**
- `total_casts`: Number of casts processed
- `average_score`: Average engagement score
- `total_rewards_earned`: Cumulative rewards
- Time-based activity patterns

#### `campaigns`
Different engagement campaigns (e.g., "Talk to Shreyas").

**Key Fields:**
- `target_fid`: The FID being engaged with
- `is_active`: Whether campaign is currently running
- Customizable scoring weights per campaign
- Reward settings

#### `campaign_participants`
Tracks user participation in campaigns.

**Key Fields:**
- Links users to campaigns
- Participation statistics
- Rankings

## Automatic Features

### Triggers

1. **Auto-update User Stats**: When a new cast is inserted, user statistics are automatically updated
2. **Updated Timestamps**: `updated_at` fields are automatically maintained

### Indexes

Optimized indexes for:
- Fast user lookups by FID
- Efficient score-based queries
- Time-based filtering
- Leaderboard queries

### Row Level Security (RLS)

- Public read access to active campaigns
- Users can view all data (for now)
- Service role has full access for backend operations

## Queries

### Get User Dashboard Data

```sql
SELECT 
    u.username,
    u.display_name,
    u.pfp_url,
    us.total_casts,
    us.average_score,
    us.total_rewards_earned,
    us.last_cast_at
FROM users u
JOIN user_stats us ON u.id = us.user_id
WHERE u.fid = $1;
```

### Get Recent Casts with Scores

```sql
SELECT 
    c.cast_hash,
    c.text,
    c.timestamp,
    c.total_score,
    c.communication_quality_score,
    c.community_impact_score,
    c.consistency_score,
    c.active_campaign_score,
    c.likes_count,
    c.recasts_count,
    c.replies_count
FROM casts c
WHERE c.fid = $1
ORDER BY c.timestamp DESC
LIMIT 20;
```

### Get Leaderboard

```sql
SELECT 
    u.username,
    u.display_name,
    u.pfp_url,
    us.total_casts,
    us.average_score,
    us.total_score,
    RANK() OVER (ORDER BY us.average_score DESC) as rank
FROM users u
JOIN user_stats us ON u.id = us.user_id
WHERE us.total_casts >= 5
ORDER BY us.average_score DESC
LIMIT 100;
```

## Maintenance

### Reset User Stats

```sql
TRUNCATE user_stats CASCADE;
```

### Delete Old Casts

```sql
DELETE FROM casts 
WHERE timestamp < NOW() - INTERVAL '90 days';
```

### Update Campaign Settings

```sql
UPDATE campaigns 
SET 
    communication_quality_weight = 0.5,
    community_impact_weight = 0.3,
    consistency_weight = 0.15,
    active_campaign_weight = 0.05
WHERE name = 'Talk to Shreyas';
```

## Backup

Supabase automatically backs up your database. You can also:

1. Use the Supabase CLI to create backups
2. Export data via the dashboard
3. Use `pg_dump` for manual backups

## Scaling Considerations

- Indexes are optimized for read-heavy workloads
- Consider partitioning `casts` table by date if volume grows
- Use materialized views for complex leaderboard queries
- Monitor query performance in Supabase dashboard

