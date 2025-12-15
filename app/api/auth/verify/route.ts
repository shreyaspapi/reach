import { NextRequest, NextResponse } from "next/server";
import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
import { supabaseAdmin } from "@/lib/supabase";

// Initialize Neynar client
const config = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY || "",
});
const neynarClient = new NeynarAPIClient(config);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Handle mini app authentication (just FID, no signer_uuid)
    if (body.mini_app && body.fid) {
      const { fid } = body;

      try {
        // Fetch user data from Neynar
        const userResponse = await neynarClient.fetchBulkUsers({
          fids: [fid],
        });

        const user = userResponse.users?.[0];
        if (!user) {
          return NextResponse.json(
            { error: "User not found" },
            { status: 404, headers: corsHeaders }
          );
        }

        // Update or create the user in our database
        if (supabaseAdmin) {
          const { data: existingUser } = await supabaseAdmin
              .from('users')
              .select('id')
              .eq('fid', fid)
              .single();

          const userData = {
              fid: fid,
              username: user.username || `user_${fid}`,
              display_name: user.display_name || `User ${fid}`,
              pfp_url: user.pfp_url || null,
              updated_at: new Date().toISOString()
          };

          if (existingUser) {
              await supabaseAdmin.from('users').update(userData).eq('fid', fid);
          } else {
              await supabaseAdmin.from('users').insert({
                  ...userData,
                  created_at: new Date().toISOString()
              });

              await supabaseAdmin.from('user_stats').insert({
                  fid: fid,
                  total_casts: 0,
                  total_score: 0,
                  average_score: 0,
                  highest_score: 0,
                  lowest_score: 0,
                  total_likes_received: 0,
                  total_recasts_received: 0,
                  total_replies_received: 0,
                  total_rewards_earned: 0,
                  current_stream_rate: 0,
                  gda_units: 0,
                  updated_at: new Date().toISOString()
              }).select();
          }
        }

        return NextResponse.json({
          success: true,
          fid: fid,
          username: user.username,
          display_name: user.display_name,
          pfp_url: user.pfp_url,
          custody_address: user.custody_address,
          verifications: user.verifications || [],
          follower_count: user.follower_count,
          following_count: user.following_count,
        }, { headers: corsHeaders });
      } catch (error) {
        console.error("Neynar API error:", error);
        return NextResponse.json(
          { error: "Failed to fetch user data from Neynar" },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // Handle web browser authentication with Neynar SIWN
    if (body.signer_uuid && body.fid) {
      const { signer_uuid, fid } = body;

      if (!signer_uuid || !fid) {
        return NextResponse.json(
          { error: "Missing required parameters: signer_uuid and fid" },
          { status: 400, headers: corsHeaders }
        );
      }

      try {
        // Fetch user data from Neynar
        const userResponse = await neynarClient.fetchBulkUsers({
          fids: [fid],
        });

        const user = userResponse.users?.[0];
        if (!user) {
          return NextResponse.json(
            { error: "User not found" },
            { status: 404, headers: corsHeaders }
          );
        }

        // Update or create the user in our database
        if (supabaseAdmin) {
          const { data: existingUser } = await supabaseAdmin
              .from('users')
              .select('id')
              .eq('fid', fid)
              .single();

          const userData = {
              fid: fid,
              username: user.username || `user_${fid}`,
              display_name: user.display_name || `User ${fid}`,
              pfp_url: user.pfp_url || null,
              updated_at: new Date().toISOString()
          };

          if (existingUser) {
              await supabaseAdmin.from('users').update(userData).eq('fid', fid);
          } else {
              await supabaseAdmin.from('users').insert({
                  ...userData,
                  created_at: new Date().toISOString()
              });

              await supabaseAdmin.from('user_stats').insert({
                  fid: fid,
                  total_casts: 0,
                  total_score: 0,
                  average_score: 0,
                  highest_score: 0,
                  lowest_score: 0,
                  total_likes_received: 0,
                  total_recasts_received: 0,
                  total_replies_received: 0,
                  total_rewards_earned: 0,
                  current_stream_rate: 0,
                  gda_units: 0,
                  updated_at: new Date().toISOString()
              }).select();
          }
        }

        return NextResponse.json({
          success: true,
          fid: fid,
          username: user.username,
          display_name: user.display_name,
          pfp_url: user.pfp_url,
          custody_address: user.custody_address,
          verifications: user.verifications || [],
          follower_count: user.follower_count,
          following_count: user.following_count,
          signer_uuid: signer_uuid
        }, { headers: corsHeaders });
      } catch (error) {
        console.error("Neynar API error:", error);
        return NextResponse.json(
          { error: "Failed to fetch user data from Neynar" },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // If neither format matches
    return NextResponse.json(
      { error: "Invalid request format. Expected either {fid, mini_app: true} or {fid, signer_uuid}" },
      { status: 400, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Internal server error during verification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
