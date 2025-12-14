import { NextResponse } from 'next/server';
import { getCampaignById, getCampaignParticipants } from '@/lib/database';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        
        // Fetch campaign details and participants in parallel
        const [campaign, participants] = await Promise.all([
            getCampaignById(id),
            getCampaignParticipants(id)
        ]);

        if (!campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        return NextResponse.json({
            campaign,
            participants
        });
    } catch (error) {
        console.error('Error fetching campaign details:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
