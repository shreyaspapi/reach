import { NextResponse } from 'next/server';
import { getCampaignById } from '@/lib/database';
import { getPoolData } from '@/lib/pool-service';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        
        // Fetch campaign to get pool address
        const campaign = await getCampaignById(id);

        if (!campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        if (!campaign.pool_address) {
            return NextResponse.json({ error: 'No pool address configured for this campaign' }, { status: 404 });
        }

        // Fetch pool data from blockchain
        const poolData = await getPoolData(campaign.pool_address);

        if (!poolData) {
            return NextResponse.json({ error: 'Failed to fetch pool data' }, { status: 500 });
        }

        return NextResponse.json(poolData);
    } catch (error) {
        console.error('Error fetching pool data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
