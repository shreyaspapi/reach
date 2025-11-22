import { NextRequest, NextResponse } from 'next/server';
import { connectedUserFids } from '@/lib/backend';

export async function GET(request: NextRequest) {
    try {
        return NextResponse.json({
            status: 'ok',
            connectedUsers: connectedUserFids.size,
            fids: Array.from(connectedUserFids),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in health check:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
