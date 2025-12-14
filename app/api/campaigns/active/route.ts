import { NextResponse } from 'next/server';
import { getActiveCampaigns } from '@/lib/database';

export async function GET() {
    try {
        const campaigns = await getActiveCampaigns();
        return NextResponse.json(campaigns);
    } catch (error) {
        console.error('Error fetching active campaigns:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
