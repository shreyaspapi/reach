import WebSocket from 'ws';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
// Neynar WebSocket URL - check docs for latest endpoint
// Often it is wss://api.neynar.com/v2/farcaster/cast or similar for specific streams
const WS_URL = 'wss://api.neynar.com/v2/farcaster/cast'; 

if (!NEYNAR_API_KEY) {
    console.error('NEYNAR_API_KEY is missing in .env file');
    process.exit(1);
}

// Mock storage for connected users (FIDs)
// In a real application, this would be a database query or shared Redis store
const connectedUserFids = new Set<number>();

// Add some mock FIDs for testing
connectedUserFids.add(1); // warpcast
connectedUserFids.add(2); // vitalik.eth
connectedUserFids.add(3); // dwr.eth
connectedUserFids.add(6833); // Example FID

console.log(`Tracking ${connectedUserFids.size} connected users...`);

function connect() {
    console.log(`Connecting to ${WS_URL}...`);
    const ws = new WebSocket(WS_URL, {
        headers: {
            'x-api-key': NEYNAR_API_KEY
        }
    });

    ws.on('open', () => {
        console.log('✅ Connected to Neynar WebSocket');
        // Some endpoints require a subscription message. 
        // If this is a firehose, it might just start streaming.
        // If it's a filter, we might need to send a JSON payload here.
    });

    ws.on('message', (data: WebSocket.Data) => {
        try {
            const messageString = data.toString();
            const message = JSON.parse(messageString);
            
            // Filter for 'cast.created' events
            // The structure depends on the specific Neynar stream
            if (message.type === 'cast.created' && message.data) {
                const cast = message.data;
                const authorFid = cast.author?.fid;
                
                // Check if the cast is from a connected user
                if (authorFid && connectedUserFids.has(authorFid)) {
                    console.log('\n---------------------------------------------------');
                    console.log(`🔔 CAST DETECTED from Connected User (FID: ${authorFid})`);
                    console.log(`User: @${cast.author.username}`);
                    console.log(`Text: ${cast.text}`);
                    console.log(`Hash: ${cast.hash}`);
                    console.log('---------------------------------------------------');
                    
                    // TODO: Implement reward logic here
                    // e.g., await addPoints(authorFid, 10);
                }
            } else if (message.type === 'heartbeat') {
                // Ignore heartbeats
            } else {
                 // Log other messages for debugging (optional)
                 // console.log('Received:', message.type);
            }

        } catch (err) {
            console.error('Error processing message:', err);
        }
    });

    ws.on('error', (err) => {
        console.error('❌ WebSocket error:', err);
    });

    ws.on('close', (code, reason) => {
        console.log(`WebSocket connection closed (Code: ${code}, Reason: ${reason}). Reconnecting in 5s...`);
        setTimeout(connect, 5000);
    });
}

connect();
