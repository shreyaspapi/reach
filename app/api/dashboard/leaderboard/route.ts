import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/database';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get('limit') || '100');
        const minCasts = parseInt(searchParams.get('minCasts') || '5');

        const leaderboard = await getLeaderboard(limit, minCasts);

        return NextResponse.json({
            leaderboard,
            count: leaderboard.length
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

