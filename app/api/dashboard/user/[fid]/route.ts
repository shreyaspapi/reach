import { NextRequest, NextResponse } from 'next/server';
import { getUserDashboardData } from '@/lib/database';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ fid: string }> }
) {
    try {
        const { fid: fidString } = await params;
        const fid = parseInt(fidString);

        if (isNaN(fid)) {
            return NextResponse.json(
                { error: 'Invalid FID' },
                { status: 400 }
            );
        }

        const data = await getUserDashboardData(fid);

        if (!data) {
            return NextResponse.json(
                { error: 'User not found or no data available' },
                { status: 404 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching user dashboard data:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

