// Storage for connected users (FIDs) - in production, this should be in a database
export const connectedUserFids = new Set<number>();

export async function syncUsers() {
    // No-op: Privy sync removed.
    // In the future, we can sync from our own DB if needed.
    console.log('Syncing users... (No-op)');
}

// Initialize sync
syncUsers();

// Sync every 5 minutes
setInterval(syncUsers, 5 * 60 * 1000);
