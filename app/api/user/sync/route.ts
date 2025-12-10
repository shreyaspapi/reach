import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/database';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { 
            fid, 
            username, 
            display_name, 
            pfp_url, 
            follower_count, 
            following_count, 
            power_badge,
            wallet_address
        } = body;

        if (!fid || !username) {
            return NextResponse.json(
                { error: 'Missing required fields: fid and username are required' },
                { status: 400 }
            );
        }

        const user = await getOrCreateUser({
            fid,
            username,
            display_name,
            pfp_url,
            follower_count,
            following_count,
            power_badge,
            wallet_address
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Failed to sync user' },
                { status: 500 }
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error syncing user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
