# Wrapped Leaderboard Feature

## Overview

The Wrapped feature now includes a fully functional leaderboard system that tracks and displays the top onchain performers based on their 2025 wrapped data.

## What Was Added

### 1. API Endpoint
- **`/app/api/wrapped-leaderboard/route.ts`** - Fetches leaderboard data from Supabase
  - Supports pagination with `limit` query parameter
  - Returns sorted leaderboard by chain score (descending)
  - Includes total count of entries

### 2. Leaderboard Page
- **`/app/wrapped/leaderboard/page.tsx`** - Public leaderboard display
  - Shows top 100 participants by default
  - Displays comprehensive stats:
    - Rank (with 🥇🥈🥉 medals for top 3)
    - Address/Base Name
    - Chain Score (0-100)
    - Skill Level badge (Elite, Expert, Skilled, Active, Beginner)
    - Total Transactions
    - Total Volume (USD)
    - Active Days
  - Overview stats:
    - Total Participants
    - Average Chain Score
    - Total Transactions across all users

### 3. Navigation Links
- **Footer Card** - Added "Leaderboard" button in the wrapped dashboard footer
- **Header** - Added "Leaderboard" button in the wrapped page header (when viewing wrapped data)

## How It Works

### Data Flow

1. **User Views Wrapped Data** → Wrapped dashboard automatically saves/updates their score to `wrapped_leaderboard` table
2. **Leaderboard Updates** → Only saves if new score is higher than existing score
3. **Public Access** → Anyone can view the leaderboard at `/wrapped/leaderboard`

### Automatic Saving

When a user views their wrapped data, the system automatically:
- Calculates their chain score (0-100)
- Determines their skill level based on score
- Saves/updates their entry in the leaderboard
- Only updates if the new score is higher (protects best scores)

### Skill Levels

Based on chain score:
- **Elite/Legendary**: 80-100
- **Expert**: 60-79
- **Skilled**: 40-59
- **Active**: 20-39
- **Beginner**: 0-19

## Database Schema

The leaderboard uses the `wrapped_leaderboard` table:

```sql
CREATE TABLE wrapped_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT UNIQUE NOT NULL,
  basename TEXT,
  score NUMERIC NOT NULL,
  skill_level TEXT NOT NULL,
  total_transactions INTEGER NOT NULL,
  total_volume NUMERIC NOT NULL,
  active_days INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Access Points

### For Users
1. **View Wrapped** → `/wrapped` → Enter address → See your wrapped data
2. **Click Leaderboard** → In header or footer → View global rankings
3. **Your Rank** → Automatically saved when you view your wrapped data

### Direct URL
- Public leaderboard: `https://your-domain.com/wrapped/leaderboard`

## Features

### Leaderboard Display
- ✅ Responsive table layout
- ✅ Medal icons for top 3 positions
- ✅ Color-coded skill level badges
- ✅ Address truncation with Base Name display
- ✅ Formatted numbers (volume, transactions)
- ✅ Hover effects on rows
- ✅ Loading states
- ✅ Error handling
- ✅ Empty state

### Stats Overview
- ✅ Total participants count
- ✅ Average chain score calculation
- ✅ Total transactions aggregation
- ✅ Icon-based stat cards

### Navigation
- ✅ Back button to wrapped page
- ✅ Leaderboard button in wrapped header
- ✅ Leaderboard button in wrapped footer

## API Usage

### Fetch Leaderboard

```typescript
// Get top 100 entries
GET /api/wrapped-leaderboard?limit=100

// Response
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "address": "0x...",
      "basename": "username.base.eth",
      "score": 85.5,
      "skill_level": "Elite",
      "total_transactions": 1234,
      "total_volume": 50000.00,
      "active_days": 180,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-12-16T00:00:00Z"
    }
  ],
  "total": 500
}
```

## Design

The leaderboard follows Reach's design system:
- **Colors**: reach-blue and reach-paper theme
- **Typography**: Font Display for headings, Font Mono for data
- **Styling**: Border-based design with hover effects
- **Icons**: Lucide React icons (Trophy, TrendingUp, Activity, DollarSign)
- **Layout**: Responsive grid and table layouts

## Future Enhancements

Potential improvements:
- [ ] Add search/filter by address or Base Name
- [ ] Add time period filters (weekly, monthly, all-time)
- [ ] Add user rank display on their wrapped page
- [ ] Add pagination for large leaderboards
- [ ] Add real-time updates via WebSockets
- [ ] Add social sharing for leaderboard positions
- [ ] Add achievement badges
- [ ] Add historical rank tracking

## Testing

To test the leaderboard:

1. **Generate Wrapped Data**:
   - Go to `/wrapped`
   - Enter a wallet address or Base Name
   - View the wrapped dashboard

2. **Check Leaderboard**:
   - Click "Leaderboard" button in header or footer
   - Verify your entry appears
   - Check that stats are calculated correctly

3. **Test Multiple Users**:
   - Generate wrapped data for multiple addresses
   - Verify leaderboard sorts by score correctly
   - Check that medals appear for top 3

## Troubleshooting

### Leaderboard Not Showing Data
- Verify `wrapped_leaderboard` table exists in Supabase
- Check Supabase environment variables are set
- Ensure RLS policies allow public read access
- Check browser console for API errors

### Scores Not Updating
- Verify the score is higher than existing score
- Check `saveToLeaderboard` function logs
- Ensure Supabase connection is working

### Base Names Not Resolving
- Verify `NEXT_PUBLIC_ONCHAINKIT_API_KEY` is set
- Check OnchainKit API quota/limits
- Test with direct addresses instead

## Related Files

- `/app/api/wrapped-leaderboard/route.ts` - API endpoint
- `/app/wrapped/leaderboard/page.tsx` - Leaderboard page
- `/lib/wrapped/utils/leaderboard.ts` - Leaderboard utilities
- `/components/wrapped/wrapped-dashboard.tsx` - Auto-save logic
- `/components/wrapped/dashboard/footer-card.tsx` - Footer button
- `/components/wrapped/wallet-connect.tsx` - Header button
