import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { PrivyClient } from '@privy-io/server-auth';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const PRIVY_APP_ID = process.env.PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
const PORT = process.env.PORT || 8080; // Azure uses PORT 8080 by default

if (!PRIVY_APP_ID || !PRIVY_APP_SECRET) {
    console.error('PRIVY_APP_ID or PRIVY_APP_SECRET is missing in .env file');
    process.exit(1);
}

const privy = new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET);
const app = express();

// Middleware
app.use(express.json());

// Storage for connected users (FIDs)
const connectedUserFids = new Set<number>();

async function syncUsers() {
    try {
        console.log('Syncing users from Privy...');
        const users = await privy.getUsers();
        
        const newFids = new Set<number>();

        for (const user of users) {
            const farcasterAccount = user.linkedAccounts.find(
                (account): account is any => account.type === 'farcaster'
            );

            if (farcasterAccount && farcasterAccount.fid) {
                newFids.add(farcasterAccount.fid);
            }
        }

        // Update the global set
        connectedUserFids.clear();
        newFids.forEach(fid => connectedUserFids.add(fid));
        
        console.log(`✅ Synced ${connectedUserFids.size} connected Farcaster users.`);
        console.log(`   Tracking FIDs: ${Array.from(connectedUserFids).join(', ')}`);
        
    } catch (error) {
        console.error('Error syncing users from Privy:', error);
    }
}

// Webhook endpoint for Neynar events
app.post('/webhooks/neynar', async (req: Request, res: Response) => {
    try {
        const event = req.body;
        
        // Acknowledge receipt immediately
        res.status(200).send('OK');

        // Process the event
        if (event.type === 'cast.created' && event.data) {
            const cast = event.data;
            const authorFid = cast.author?.fid;
            
            if (authorFid && connectedUserFids.has(authorFid)) {
                console.log('\n---------------------------------------------------');
                console.log(`🔔 CAST DETECTED from Connected User (FID: ${authorFid})`);
                console.log(`User: @${cast.author.username}`);
                console.log(`Text: ${cast.text}`);
                console.log(`Hash: ${cast.hash}`);
                console.log(`Timestamp: ${cast.timestamp}`);
                console.log('---------------------------------------------------');
                
                // TODO: Implement reward logic here
                // e.g., calculate score, update database, trigger Superfluid stream
            }
        }
    } catch (error) {
        console.error('Error processing webhook:', error);
    }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({ 
        status: 'ok', 
        connectedUsers: connectedUserFids.size,
        fids: Array.from(connectedUserFids)
    });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
    res.json({
        service: 'Reach Backend',
        status: 'running',
        endpoints: {
            health: '/health',
            webhook: '/webhooks/neynar'
        }
    });
});

// Initial sync
syncUsers();

// Sync every 5 minutes
setInterval(syncUsers, 5 * 60 * 1000);

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Reach Backend Server running on port ${PORT}`);
    console.log(`📡 Webhook endpoint: http://localhost:${PORT}/webhooks/neynar`);
    console.log(`💚 Health check: http://localhost:${PORT}/health\n`);
});
