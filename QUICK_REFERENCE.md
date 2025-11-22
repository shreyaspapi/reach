# Quick Reference - Reach Platform

## 🚀 Quick Start

```bash
# 1. Set up Supabase (supabase.com)
# 2. Run supabase/schema.sql in SQL Editor
# 3. Add credentials to .env.local
# 4. Start server
npm run dev
```

## 📊 Scoring Weights

| Metric | Weight | Focus |
|--------|--------|-------|
| Communication Quality | 40% | Content quality, anti-spam |
| Community Impact | 30% | Engagement, reach |
| Consistency | 20% | Regular participation |
| Active Campaign | 10% | Direct engagement |

## 🎯 Score Ranges

- **80-100**: Excellent - High quality engagement
- **60-79**: Good - Solid contribution
- **40-59**: Fair - Acceptable engagement
- **0-39**: Low - Needs improvement

## 🔌 API Endpoints

```bash
# User dashboard data
GET /api/dashboard/user/[fid]

# Leaderboard
GET /api/dashboard/leaderboard?limit=10&minCasts=5

# Platform stats
GET /api/dashboard/stats

# Recent casts
GET /api/dashboard/casts?fid=123456&limit=20

# Health check
GET /api/health

# Webhook (POST only)
POST /api/webhooks/neynar
```

## 🗄️ Database Tables

- **users** - Farcaster user profiles
- **casts** - Engagement casts with scores
- **user_stats** - Aggregated statistics (auto-updated)
- **campaigns** - Engagement campaigns
- **campaign_participants** - User participation

## 🔑 Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Privy
PRIVY_APP_ID=xxx
PRIVY_APP_SECRET=xxx
NEXT_PUBLIC_PRIVY_APP_ID=xxx
```

## 🛡️ Anti-Sybil Features

✅ Spam detection (repeated chars, excessive emojis)  
✅ Farming keyword detection (gm, gn, ser, etc.)  
✅ Frequency limits (penalize rapid posting)  
✅ Generic reply detection (thanks, nice, cool)  
✅ Content substance requirements  

## 📈 Key Metrics Tracked

**Per Cast:**
- Total score (0-100)
- Score breakdown (4 components)
- Engagement (likes, recasts, replies)

**Per User:**
- Total casts
- Average score
- Highest/lowest scores
- Activity patterns
- Total rewards

## 🧪 Testing

```bash
# Test webhook
./test-webhook.sh

# Or manually
curl -X POST http://localhost:3000/api/webhooks/neynar \
  -H "Content-Type: application/json" \
  -d @test-payload.json
```

## 📝 Common Queries

### Get User Stats
```typescript
const res = await fetch(`/api/dashboard/user/${fid}`);
const { user, stats, recentCasts } = await res.json();
```

### Get Leaderboard
```typescript
const res = await fetch('/api/dashboard/leaderboard?limit=10');
const { leaderboard } = await res.json();
```

### Get Platform Stats
```typescript
const res = await fetch('/api/dashboard/stats');
const stats = await res.json();
// { totalUsers, totalCasts, averageScore, recentActivity }
```

## 🔧 Customization

### Adjust Scoring Weights
Edit `lib/scoring.ts`:
```typescript
const weights = {
    communicationQuality: 0.4,
    communityImpact: 0.3,
    consistency: 0.2,
    activeCampaign: 0.1
};
```

### Adjust Thresholds
Modify individual scoring functions:
- `calculateCommunicationQuality()`
- `calculateCommunityImpact()`
- `calculateConsistency()`
- `calculateActiveCampaignScore()`

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Supabase admin client not initialized" | Check SUPABASE_SERVICE_ROLE_KEY in .env.local |
| "Failed to save cast" | Check Supabase connection, verify user exists |
| "User not found" | Ensure user registered with Privy |
| Slow queries | Check indexes, review execution plans |

## 📚 Documentation

- `SETUP_GUIDE.md` - Complete setup instructions
- `SCORING_SYSTEM.md` - Detailed scoring breakdown
- `DATABASE_INTEGRATION.md` - Database overview
- `supabase/README.md` - Database schema & queries
- `WEBHOOK_TESTING.md` - Webhook testing guide

## 🎨 Example Scores

**High Score (85/100):**
```
"I think this is a really interesting perspective on 
decentralized social networks. How do you see this 
evolving over the next year? Would love to understand 
your thoughts on the technical challenges."
```
- Good length ✓
- Thoughtful language ✓
- Question ✓
- No spam ✓

**Low Score (20/100):**
```
"gm ser"
```
- Too short ✗
- Farming keywords ✗
- No substance ✗

## 🚦 Webhook Flow

1. Receive cast event
2. Validate user (Privy registration)
3. Calculate engagement score
4. Get/create user in database
5. Save cast with scores
6. Auto-update user stats (trigger)
7. Log detailed breakdown

## 💡 Tips

- **Quality over Quantity**: System rewards thoughtful engagement
- **Consistency Matters**: Regular posting (6-48 hours) scores best
- **Avoid Farming**: Generic replies and spam are penalized
- **Engage Meaningfully**: Questions and insights score higher
- **Monitor Scores**: Use dashboard to track performance

## 🔗 Quick Links

- Supabase Dashboard: https://supabase.com/dashboard
- Privy Dashboard: https://dashboard.privy.io
- Neynar Dashboard: https://neynar.com

---

**Need Help?** Check the full documentation in the files listed above.

