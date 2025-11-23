import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/database';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get('limit') || '100');
        const minCasts = parseInt(searchParams.get('minCasts') || '1');

        const leaderboard = await getLeaderboard(limit, minCasts);

        return NextResponse.json({ 
            status: 'ok',
            data: leaderboard 
        });
    } catch (error) {
        console.error('Error in leaderboard API:', error);
        return NextResponse.json({ 
            status: 'error', 
            message: 'Failed to fetch leaderboard' 
        }, { status: 500 });
    }
}

