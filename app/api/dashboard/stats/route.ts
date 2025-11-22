import { NextRequest, NextResponse } from 'next/server';
import { getPlatformStats } from '@/lib/database';

export async function GET(request: NextRequest) {
    try {
        const stats = await getPlatformStats();

        if (!stats) {
            return NextResponse.json(
                { error: 'Failed to fetch platform stats' },
                { status: 500 }
            );
        }

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching platform stats:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

