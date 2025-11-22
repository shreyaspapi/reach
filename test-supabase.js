#!/usr/bin/env node

/**
 * Test Supabase Connection
 * Run: node test-supabase.js
 */

require('dotenv').config({ path: '.env.local' });

async function testSupabaseConnection() {
    console.log('🔍 Testing Supabase Configuration...\n');

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('📋 Environment Variables:');
    console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
    console.log(`   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Set' : '❌ Missing'}`);
    console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅ Set' : '❌ Missing'}`);
    console.log();

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
        console.error('❌ Missing Supabase environment variables!');
        console.log('\n📝 Add these to your .env.local file:');
        console.log('   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
        console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key');
        console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
        process.exit(1);
    }

    // Try to import and test Supabase
    try {
        const { createClient } = require('@supabase/supabase-js');

        console.log('🔌 Testing Supabase Connection...');
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Test connection by checking tables
        console.log('   Checking database tables...');
        const { data: tables, error: tablesError } = await supabase
            .from('users')
            .select('count')
            .limit(0);

        if (tablesError) {
            console.error('❌ Database Error:', tablesError.message);
            console.log('\n💡 Possible issues:');
            console.log('   1. Database schema not created - Run supabase/schema.sql in Supabase SQL Editor');
            console.log('   2. Invalid API keys - Check your Supabase project settings');
            console.log('   3. Wrong project URL - Verify NEXT_PUBLIC_SUPABASE_URL');
            process.exit(1);
        }

        console.log('   ✅ Connected to database successfully!');

        // Check each table
        const tablesToCheck = ['users', 'casts', 'user_stats', 'campaigns', 'campaign_participants'];
        console.log('\n📊 Checking Tables:');

        for (const table of tablesToCheck) {
            const { count, error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (error) {
                console.log(`   ❌ ${table}: Error - ${error.message}`);
            } else {
                console.log(`   ✅ ${table}: ${count} rows`);
            }
        }

        // Test insert (will rollback)
        console.log('\n🧪 Testing Write Permissions...');
        const testUser = {
            fid: 999999999,
            username: 'test_user_delete_me',
            display_name: 'Test User'
        };

        const { data: insertedUser, error: insertError } = await supabase
            .from('users')
            .insert([testUser])
            .select()
            .single();

        if (insertError) {
            console.log(`   ❌ Cannot insert: ${insertError.message}`);
        } else {
            console.log('   ✅ Write permissions OK');
            
            // Clean up test user
            await supabase
                .from('users')
                .delete()
                .eq('fid', 999999999);
            console.log('   🧹 Cleaned up test data');
        }

        console.log('\n✅ Supabase is configured correctly!');
        console.log('\n📝 Next Steps:');
        console.log('   1. Make sure your webhook is configured in Neynar');
        console.log('   2. Test with: ./test-webhook.sh');
        console.log('   3. Check the console output for database saves');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n💡 Make sure @supabase/supabase-js is installed:');
        console.log('   npm install @supabase/supabase-js');
        process.exit(1);
    }
}

testSupabaseConnection().catch(console.error);

