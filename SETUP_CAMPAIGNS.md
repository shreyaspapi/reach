# Campaign Setup Guide

This guide will help you set up campaigns in your Supabase database.

## Step 1: Apply Database Migration

You need to add new columns to the `campaigns` table in Supabase:

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file `supabase/migrations/add_campaign_fields.sql`
4. Copy and paste the SQL content into the editor
5. Click **Run** to execute the migration

### Option B: Using Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Seed Campaigns

Run the seeding script to populate your database with initial campaigns:

```bash
npm run seed:campaigns
```

This will create three campaigns:
- **Talk to Shreyas** - 1M LUNO pool
- **Talk to Alex Chen** - 2M LUNO pool  
- **Talk to Example User** - 500K LUNO pool

## Step 4: Verify Setup

1. Go to your Supabase dashboard
2. Navigate to **Table Editor** > **campaigns**
3. You should see the three campaigns listed

## Customizing Campaigns

To customize the campaigns, edit `scripts/seed-campaigns.ts`:

- Update `target_fid` with actual Farcaster IDs
- Modify pool amounts
- Change scoring weights
- Add/edit FAQ items

Then re-run:
```bash
npm run seed:campaigns
```

## Troubleshooting

### "Column does not exist" error
- Make sure you ran the migration in Step 1

### "Duplicate key value" error
- The campaigns already exist in your database
- Delete existing campaigns from Supabase dashboard or modify the seed script to update instead of insert

### Campaign not showing on frontend
- Check that `is_active` is `true`
- Verify the campaign ID matches what's in the database
- Check browser console for errors
