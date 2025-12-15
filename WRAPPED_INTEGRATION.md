# Luno Wrapped Integration

## Overview

The v0-onchain-wrapped-dashboard has been successfully merged into the Reach (Luno) project. Users can now access their personalized "Wrapped" dashboard showing their onchain activity for 2025.

## What Was Added

### 1. New Components
- **Wrapped Dashboard** (`/app/wrapped/page.tsx`) - Main wrapped experience page
- **Wallet Connect** (`/components/wrapped/wallet-connect.tsx`) - Wallet connection UI
- **Dashboard Cards** - Chain score, summary, timeline, and footer cards
- **UI Components** - Button, Input, and Dropdown menu components

### 2. API Routes
- **`/api/wrapped/[address]/route.ts`** - Fetches blockchain data and computes analytics

### 3. Libraries & Services
- **Analytics Engine** (`/lib/wrapped/analytics/`) - Computes user activity metrics
- **Data Services** (`/lib/wrapped/api/`) - Alchemy and GoldRush blockchain data providers
- **Utilities** (`/lib/wrapped/utils/`) - Share and leaderboard functionality

### 4. Types
- **`/types/onchain-wrapped.ts`** - TypeScript types for wrapped data structures

## How to Access

### From the Landing Page
1. Users will see a **"🎁 Get Your Wrapped"** button on the main landing page
2. Clicking it takes them to `/wrapped`

### The Wrapped Experience
1. Users can connect their wallet or enter any Ethereum address/Base Name
2. The system fetches their 2025 onchain activity from Base chain
3. Displays comprehensive analytics including:
   - **Chain Score** (0-100) - Overall onchain engagement
   - **Transaction Statistics** - Total txs, success rate, volume
   - **Token Analytics** - Favorite tokens, trading activity
   - **NFT Activity** - Mints, trades, collections
   - **DeFi Interactions** - Protocols used, risk profile
   - **Social Metrics** - Wallets interacted with

### Sharing
Users can:
- Download their wrapped card as JPG/PNG
- Share to Twitter/X
- Share to Farcaster
- Copy shareable link

## Environment Variables

### Required for Base Name Resolution

```bash
# OnchainKit API Key (REQUIRED for Base Name resolution)
# Get your API key from: https://portal.cdp.coinbase.com/
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_api_key
```

**Without this key, Base Names (e.g., `username.base.eth`) will NOT resolve to addresses.**

### Optional for Enhanced Data

```bash
# Wrapped Dashboard API Keys (optional - uses demo data if not provided)
ALCHEMY_API_KEY=your_alchemy_api_key
GOLDRUSH_API_KEY=your_goldrush_api_key
```

**Note:** If Alchemy/GoldRush API keys are not provided, the system will use mock/demo data for testing.

## Dependencies Added

The following npm packages were added:
- `@coinbase/onchainkit` - Base chain utilities and identity
- `@radix-ui/react-dropdown-menu` - Dropdown menu component
- `@radix-ui/react-slot` - Slot component
- `@tanstack/react-query` - Data fetching and caching
- `alchemy-sdk` - Alchemy API client
- `html2canvas` - Card image generation
- `wagmi` - Ethereum React hooks
- `react@19.2.0` and `react-dom@19.2.0` - Updated to React 19

## Design System

The wrapped dashboard follows the same blueprint/technical drawing design aesthetic as the main Reach app:
- Uses Reach color scheme (reach-blue and reach-paper)
- Technical/blueprint inspired UI elements
- Cross-hatching patterns and construction markers
- Barlow Condensed and JetBrains Mono fonts

## Database Setup

The wrapped feature uses the same Supabase instance as Reach. You need to create the `wrapped_leaderboard` table:

### Option 1: Run the SQL Script (Recommended)

```bash
node scripts/create-wrapped-leaderboard.js
```

This will show you the SQL to run. Copy and paste it into your Supabase SQL Editor.

### Option 2: Manual SQL Execution

Go to your Supabase dashboard → SQL Editor and run:

```sql
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
```

## Testing

To test the wrapped feature:

1. Start the dev server: `npm run dev`
2. Navigate to `http://localhost:3000/wrapped`
3. Enter a wallet address or Base Name (e.g., `0x...` or `vitalik.base.eth`)
4. The dashboard will load with onchain data

## Future Enhancements

Potential improvements:
- Add more chains beyond Base
- Historical wrapped (2024, 2023, etc.)
- Advanced filtering and date range selection
- More social sharing integrations
- Animated card transitions
- Comparison between multiple addresses

## Troubleshooting

### API Rate Limits
If you encounter rate limiting:
- Add your own Alchemy or GoldRush API keys
- Consider caching results in Supabase

### Missing Data
If data doesn't load:
- Check API keys are valid
- Verify the address has transactions on Base
- Check browser console for error messages

### Leaderboard Errors
If you see errors like "Error saving to leaderboard: {}":
- The `wrapped_leaderboard` table doesn't exist in your Supabase database
- Run the database setup steps above to create the table
- Ensure your Supabase environment variables are properly configured
- Check the console for detailed error messages (they now include error codes and hints)

### Styling Issues
If styles don't match:
- Ensure all Tailwind classes are properly configured
- Check that globals.css includes blueprint theme styles

## Support

For issues or questions about the wrapped integration, check:
1. Console logs (look for `[Wrapped]` prefixed messages)
2. Network tab in browser dev tools
3. API route responses at `/api/wrapped/[address]`

