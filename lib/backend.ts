import { PrivyClient } from '@privy-io/server-auth';

// In Next.js, environment variables are automatically loaded
const PRIVY_APP_ID = process.env.PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;

if (!PRIVY_APP_ID || !PRIVY_APP_SECRET) {
    console.error('PRIVY_APP_ID or PRIVY_APP_SECRET is missing in .env file');
    throw new Error('Missing Privy configuration');
}

const privy = new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET);

// Storage for connected users (FIDs) - in production, this should be in a database
export const connectedUserFids = new Set<number>();

export async function syncUsers() {
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

// Initialize sync
syncUsers();

// Sync every 5 minutes
setInterval(syncUsers, 5 * 60 * 1000);
