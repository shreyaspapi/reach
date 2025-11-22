import { NextRequest, NextResponse } from 'next/server';
import { getRecentCasts, getUserCasts } from '@/lib/database';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const fid = searchParams.get('fid');
        const limit = parseInt(searchParams.get('limit') || '20');

        let casts;
        
        if (fid) {
            // Get casts for specific user
            casts = await getUserCasts(parseInt(fid), limit);
        } else {
            // Get recent casts across all users
            casts = await getRecentCasts(limit);
        }

        return NextResponse.json({
            casts,
            count: casts.length
        });
    } catch (error) {
        console.error('Error fetching casts:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

