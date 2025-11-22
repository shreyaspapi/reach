# Webhook Processing Logic

## What Gets Processed

The webhook now processes casts in THREE scenarios:

### 1. ✅ Casts BY @shreyaspapi
- Any cast posted by @shreyaspapi (FID: 830020)
- Tracks his own engagement and content

### 2. ✅ Casts that MENTION @shreyaspapi
- Any cast that includes "@shreyaspapi" in the text
- Any cast where @shreyaspapi is in the mentioned_profiles

### 3. ✅ Casts that REPLY to @shreyaspapi
- Any cast where the parent author is @shreyaspapi (FID: 830020)
- Tracks conversations and replies

## Registration Check

For each cast, the system checks:

```typescript
const isRegistered = connectedUserFids.has(authorFid);
```

**If Registered with Privy:**
```
✅ User @username (FID: 123456) is registered with Privy
→ Continues to score and save
```

**If NOT Registered:**
```
ℹ️  User @username (FID: 123456) is not registered with Privy
   Scoring cast anyway for future reference...
→ Still scores and saves (can reward later when they register)
```

## Flow Diagram

```
Cast Received
    ↓
Is author FID valid?
    ↓ Yes
Is it BY @shreyaspapi OR mentions/replies to him?
    ↓ Yes
Check Privy registration
    ↓
Score with LLM (Azure OpenAI)
    ↓
Save to Supabase database
    ↓
Update user statistics
    ↓
Done! ✅
```

## Examples

### Example 1: @shreyaspapi posts
```
Cast: "Working on something cool today!"
Author: @shreyaspapi (FID: 830020)
Result: ✅ Processed (cast BY @shreyaspapi)
```

### Example 2: Someone replies to @shreyaspapi
```
Cast: "That sounds interesting! Tell me more"
Author: @alice (FID: 123456)
Parent: @shreyaspapi's cast
Result: ✅ Processed (reply TO @shreyaspapi)
```

### Example 3: Someone mentions @shreyaspapi
```
Cast: "Hey @shreyaspapi what do you think about this?"
Author: @bob (FID: 789012)
Result: ✅ Processed (mentions @shreyaspapi)
```

### Example 4: Unrelated cast
```
Cast: "Good morning everyone!"
Author: @charlie (FID: 345678)
Result: ⏭️  Ignored (not related to @shreyaspapi)
```

## Privy Sync

The system syncs registered users from Privy:

- **On server start**: Immediately syncs all users
- **Every 5 minutes**: Re-syncs to catch new registrations
- **Stores**: FIDs of all users who have linked Farcaster via Privy

```typescript
// From lib/backend.ts
syncUsers(); // Initial sync
setInterval(syncUsers, 5 * 60 * 1000); // Every 5 minutes
```

## Database Storage

All processed casts are saved to Supabase with:

- ✅ User information (FID, username, profile data)
- ✅ Cast content and metadata
- ✅ Full score breakdown (0-100)
- ✅ Engagement metrics (likes, recasts, replies)
- ✅ LLM reasoning and flags

**Note**: Currently saves ALL casts regardless of registration status. You can filter by registration later when distributing rewards.

## Configuration

To change @shreyaspapi's FID or add multiple target users, edit:

```typescript
// In app/api/webhooks/neynar/route.ts
const SHREYAS_FID = 830020; // Change this if needed
```

## Webhook Filtering (Neynar)

Your Neynar webhook should be configured to send:
- Casts BY @shreyaspapi
- Casts that mention @shreyaspapi
- Replies to @shreyaspapi's casts

This reduces unnecessary webhook calls and processing.

## Testing

Test the webhook with:

```bash
./test-webhook.sh
```

Check the console output to see:
- ✅ Which casts are processed
- ⏭️  Which casts are ignored
- 📊 Score breakdowns
- 💾 Database saves

## Monitoring

Watch the logs for:

```
✅ User @shreyaspapi (FID: 830020) is registered with Privy
🤖 Calculating engagement score with AI...
🎯 TOTAL SCORE: 75.5/100
✅ User synced: shreyaspapi (ID: xxx)
✅ Cast saved to database (ID: xxx)
```

---

**Updated**: November 22, 2025
**Status**: ✅ Ready - Now processes @shreyaspapi's casts too!

