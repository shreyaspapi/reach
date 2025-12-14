import { NextResponse } from 'next/server';
import { getCampaignById, getCampaignAllocations } from '@/lib/database';
import { getPoolData, getPoolMembersFromGraph } from '@/lib/pool-service';

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
        const poolData = campaign.pool_address ? await getPoolData(campaign.pool_address) : null;
        const allocations = await getCampaignAllocations(id);

        // If on-chain pool fetch failed, try The Graph as a secondary source
        let graphData = null;
        if (!poolData && campaign.pool_address) {
            graphData = await getPoolMembersFromGraph(campaign.pool_address);
        }

        return NextResponse.json({
            poolAddress: campaign.pool_address,
            poolData,
            allocations,
            graphData,
            error: !poolData && !graphData ? 'chain_call_failed' : undefined,
            message: !poolData && !graphData ? 'Unable to fetch on-chain pool data right now' : undefined
        });
    } catch (error) {
        console.error('Error fetching pool data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
