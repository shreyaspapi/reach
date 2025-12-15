#!/usr/bin/env node

/**
 * Script to create the wrapped_leaderboard table in Supabase
 * Run with: node scripts/create-wrapped-leaderboard.js
 */

const fs = require('fs');
const path = require('path');

console.log('📊 Creating wrapped_leaderboard table...');

// Read the SQL file
const sqlPath = path.join(__dirname, 'create-wrapped-leaderboard.sql');
const sqlContent = fs.readFileSync(sqlPath, 'utf8');

console.log('📋 SQL to run in Supabase SQL Editor:');
console.log('==========================================');
console.log(sqlContent);
console.log('==========================================');

console.log('\n📝 Instructions:');
console.log('1. Go to your Supabase dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Copy and paste the SQL above');
console.log('4. Click "Run" to create the table');
console.log('');
console.log('✅ The wrapped_leaderboard table will be created with proper indexes and constraints.');
console.log('🔄 After creating the table, the wrapped feature will work properly!');
