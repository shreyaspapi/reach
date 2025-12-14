# Campaign Pool System

This document explains the campaign pool system and how streams are tracked from Superfluid pools.

## Overview

Each campaign can have a dedicated Superfluid pool where tokens are streamed to participants based on their engagement scores (GDA units).

## Architecture

### Database Schema

**Campaigns Table** includes:
- `pool_address` - Ethereum address of the Superfluid pool contract
- `pool_total` - Display string for total pool allocation (e.g., "1,000,000 LUNO")
- Other campaign configuration fields

### Pool Service (`lib/pool-service.ts`)

Fetches real-time data from Superfluid pools on Sepolia:

**Functions:**
- `getPoolData(poolAddress)` - Fetches pool statistics
  - Total units in the pool
  - Total members
  - Adjustment flow rate (tokens/second)
  - Token address
- `getMemberUnits(poolAddress, memberAddress)` - Get specific member's units
- `calculateMemberShare(memberUnits, totalUnits, poolTotal)` - Calculate percentage share

### API Endpoints

**GET `/api/campaigns/[id]/pool`**
- Fetches pool data for a specific campaign
- Returns real-time stream rates and member counts

**GET `/api/campaigns/[id]`**
- Returns campaign details and participants leaderboard
- Falls back to user_stats if no campaign_participants exist

## Campaign Page Features

When viewing a campaign (`/campaigns/[id]`), users see:

### Header Section
- **Total Pool Allocation** - Static display value
- **Current Stream Rate** - Real-time data from blockchain (e.g., "15.50 tokens/month")
- **Active Members** - Number of members in the pool
- **Pool Address** - Link to Etherscan for the pool contract

### Leaderboard
- Ranked participants with scores
- **Allocation column** shows:
  - Percentage share of the pool
  - GDA units owned
- Calculates based on: `(user's units / total pool units) * 100%`

### Campaign Rules
- Scoring weight breakdown
- Reward multiplier
- Minimum score requirements

### FAQs
- Expandable FAQ sections
- Campaign-specific information

## Current Pools

| Campaign | Pool Address | Status |
|----------|-------------|--------|
| Talk to Shreyas | `0x2cc199976B4ACBe4211E943c1E7F070d76570D4e` | ✓ Active |
| Talk to Alex Chen | Not configured | Pending |
| Talk to Example User | Not configured | Pending |

## Adding New Pool Addresses

### Via Supabase Dashboard

```sql
UPDATE campaigns 
SET pool_address = '0xYourPoolAddress'
WHERE id = 'campaign-uuid';
```

### Via Code

Update the campaigns in your database or seed script with pool addresses.

## How Streams Work

1. **User engages** with campaign target (e.g., tweets at @spapinwar)
2. **AI scores** the engagement quality
3. **Backend updates** user's GDA units in the pool via `updateMemberUnits()`
4. **Superfluid automatically streams** tokens proportional to units
5. **Dashboard displays** real-time allocation percentage

## GDA Units Calculation

From `lib/gda-contract.ts`:
- Each engagement adds to user's `total_score` in `user_stats`
- Backend calls `updateMemberUnits(memberAddress, newUnits)`
- Units = cumulative engagement score
- Higher units = higher % of pool = faster stream rate

## Viewing Stream Data

### On Campaign Page
Visit `/campaigns/[campaign-id]` to see:
- Live stream rate
- Your allocation %
- Leaderboard position

### On Etherscan
Click the pool address link to view:
- Contract details
- Member list
- Transaction history

## Technical Details

### RPC Configuration
- Network: Sepolia Testnet
- RPC: Alchemy (configured in env)
- GDA Forwarder: `0x6DA13Bde224A05a288748d857b9e7DDEffd1dE08`

### Pool Contract ABI
The pool service uses minimal ABI for:
- `getTotalUnits()` - Sum of all member units
- `getUnits(address)` - Specific member units
- `getTotalMembers()` - Count of connected members
- GDA Forwarder's `getPoolAdjustmentFlowRate()` - Stream rate

### Flow Rate Format
- Blockchain: int96 wei/second
- Display: tokens/month (converted with 18 decimals)
- Formula: `flowRate * 60 * 60 * 24 * 30 / 1e18`

## Troubleshooting

### "No pool address configured"
- Campaign needs `pool_address` field populated
- Update via Supabase or migration

### "Failed to fetch pool data"
- Check RPC connection
- Verify pool address is valid Sepolia address
- Check Alchemy API key in `.env`

### Empty Leaderboard
- Leaderboard falls back to `user_stats` when `campaign_participants` is empty
- This shows all active users on the platform
- Specific campaign participants tracked separately

### Allocation Shows 0%
- User may not be connected to the pool yet
- GDA units may not be updated
- Check `user_stats.gda_units` in database

## Next Steps

To fully integrate streams:

1. **Automated Scoring** - Set up webhook to score casts automatically
2. **Real-time Updates** - Update GDA units after each engagement
3. **Multi-Pool Support** - Create separate pools for each campaign
4. **Stream Monitoring** - Dashboard to track all active streams
5. **Claim Interface** - Allow users to claim/connect to pools

## Resources

- [Superfluid Docs](https://docs.superfluid.finance/)
- [GDA (General Distribution Agreement)](https://docs.superfluid.finance/docs/concepts/distributions/general-distribution-agreement)
- [Sepolia Etherscan](https://sepolia.etherscan.io/)
