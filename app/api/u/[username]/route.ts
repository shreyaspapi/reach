import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, getUserDashboardData, getUserActiveCampaigns } from '@/lib/database';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const { username } = await params;
        
        // 1. Find the user by username
        const user = await getUserByUsername(username);
        
        if (!user) {
            return NextResponse.json({ 
                status: 'error', 
                message: 'User not found' 
            }, { status: 404 });
        }

        // 2. Get their dashboard data (same structure as private dashboard)
        const dashboardData = await getUserDashboardData(user.fid);
        const campaigns = await getUserActiveCampaigns(user.fid);

        if (!dashboardData) {
            return NextResponse.json({ 
                status: 'error', 
                message: 'Failed to fetch user data' 
            }, { status: 500 });
        }

        return NextResponse.json({ 
            status: 'ok',
            data: {
                ...dashboardData,
                campaigns
            }
        });

    } catch (error) {
        console.error('Error in public profile API:', error);
        return NextResponse.json({ 
            status: 'error', 
            message: 'Internal server error' 
        }, { status: 500 });
    }
}

