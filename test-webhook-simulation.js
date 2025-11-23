// test-webhook-simulation.js
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function runTest() {
    const WEBHOOK_URL = 'http://localhost:3000/api/webhooks/neynar';
    
    // Replace with your actual FID and Username
    // You can find your FID on Warpcast profile or by checking logs
    const TEST_FID = 1024384; // Defaulting to Shreyas's FID based on code context, CHANGE THIS if needed
    const TEST_USERNAME = 'humblefool06'; 
    
    // A mock cast event structure matching Neynar's webhook format
    const mockEvent = {
        created_at: Date.now(),
        type: "cast.created",
        data: {
            hash: "0x" + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2), // Random hash
            thread_hash: "0x...",
            parent_hash: null,
            parent_url: null,
            root_parent_url: null,
            parent_author: {
                fid: null
            },
            author: {
                object: "user",
                fid: TEST_FID,
                custody_address: "0x...",
                username: TEST_USERNAME,
                display_name: "Abhishek Ekaanth", // FIXED: Was "Test User"
                pfp_url: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/34c5df39-5dac-439e-6f1f-940ef6136400/rectcrop3", // You can add your real PFP URL here if you want
                profile: {
                    bio: {
                        text: "Building cool stuff"
                    }
                },
                follower_count: 100,
                following_count: 50,
                verifications: [],
                active_status: "active",
                power_badge: true
            },
            text: "This is a simulated cast to test the Reach scoring and streaming system! @shreyaspapi #build",
            timestamp: new Date().toISOString(),
            embeds: [],
            mentioned_profiles: [
                {
                    fid: 830020,
                    username: "shreyaspapi",
                    display_name: "Shreyas Papinwar",
                    pfp_url: "..."
                }
            ],
            reactions: {
                likes_count: 0,
                recasts_count: 0,
                likes: [],
                recasts: []
            },
            replies: {
                count: 0
            }
        }
    };

    console.log('🚀 Sending simulated webhook event...');
    console.log(`   User: @${TEST_USERNAME} (FID: ${TEST_FID})`);
    console.log(`   Text: "${mockEvent.data.text}"`);

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mockEvent)
        });

        const result = await response.json();
        
        console.log('\n✅ Response received:', response.status);
        console.log('   Result:', result);
        
        if (response.ok) {
            console.log('\n🎉 Success! Check your server logs for:');
            console.log('   1. LLM Scoring breakdown');
            console.log('   2. Database save confirmation');
            console.log('   3. Privy embedded wallet lookup');
            console.log('   4. On-chain transaction hash');
        } else {
            console.error('❌ Server returned error:', result);
        }

    } catch (error) {
        console.error('\n❌ Failed to send request:', error.message);
        console.log('   Make sure your Next.js server is running on http://localhost:3000');
    }
}

runTest();

