import { NextRequest, NextResponse } from 'next/server';
import { connectedUserFids } from '@/lib/backend';

export async function POST(request: NextRequest) {
    try {
        const event = await request.json();

        // Acknowledge receipt immediately
        // Note: In Next.js API routes, we return the response at the end

        // Process the event asynchronously
        processEvent(event);

        // Return success response
        return NextResponse.json({ status: 'ok' });

    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

async function processEvent(event: any) {
    try {
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
        console.error('Error processing event:', error);
    }
}
