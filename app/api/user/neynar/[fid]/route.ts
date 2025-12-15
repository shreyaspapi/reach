import { NextRequest, NextResponse } from 'next/server';
import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";

const config = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY || "",
});
const neynarClient = new NeynarAPIClient(config);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fid: string }> }
) {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const { fid: fidString } = await params;
    const fid = parseInt(fidString);

    if (isNaN(fid)) {
      return NextResponse.json(
        { error: 'Invalid FID' },
        { status: 400, headers }
      );
    }

    // Fetch user data from Neynar
    const userResponse = await neynarClient.fetchBulkUsers({
      fids: [fid],
    });

    const user = userResponse.users?.[0];
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers }
      );
    }

    return NextResponse.json({
      fid: user.fid,
      username: user.username,
      display_name: user.display_name,
      pfp_url: user.pfp_url,
      custody_address: user.custody_address,
      verifications: user.verifications || [],
      follower_count: user.follower_count,
      following_count: user.following_count,
    }, { headers });
  } catch (error) {
    console.error('Error fetching user from Neynar:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

