import { NextRequest, NextResponse } from "next/server";
import { createAppClient, verifySignInMessage, viemConnector } from "@farcaster/auth-client";
import { supabaseAdmin } from "@/lib/supabase";

// Initialize the Farcaster Auth Client
// Note: NEXT_PUBLIC_APP_URL should be your deployed domain (e.g., https://farcaster.luno.social)
// or the domain you registered with Farcaster.
const appClient = createAppClient({
  relay: "https://relay.farcaster.xyz",
  ethereum: viemConnector(),
});

export async function POST(req: NextRequest) {
  try {
    const { message, signature, nonce, domain } = await req.json();

    if (!message || !signature || !nonce) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Verify the Farcaster signature
    // The verifySignInMessage function checks the signature against the message and domain
    const result = await verifySignInMessage(appClient, {
      message,
      signature,
      domain: domain || "farcaster.luno.social",
      nonce,
    });

    if (!result.isError) {
      // Valid signature!
      const fid = result.fid;

      // Update or create the user in our database
      if (supabaseAdmin) {
        // First check if user exists
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('fid', fid)
            .single();

        const userData = {
            fid: fid,
            username: result.data?.statement || `user_${fid}`,
            display_name: result.data?.statement || `User ${fid}`,
            pfp_url: null, // Will be updated by webhook/web3 API later
            updated_at: new Date().toISOString()
        };

        if (existingUser) {
            // Update
            await supabaseAdmin.from('users').update(userData).eq('fid', fid);
        } else {
            // Insert new user
            await supabaseAdmin.from('users').insert({
                ...userData,
                created_at: new Date().toISOString()
            });

            // Initialize user stats for new user
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
            }).select(); // select to ensure it completes before returning
        }
      } else {
          console.warn("Skipping DB update - Supabase Admin not initialized");
      }

      // For now, we return the user's FID and success status
      return NextResponse.json({
        success: true,
        fid: fid,
        statement: result.data?.statement,
        issuedAt: result.data?.issuedAt
      });
    } else {
      console.error("Farcaster verification failed:", result.error);
      return NextResponse.json(
        { error: "Invalid signature", details: result.error?.message },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Internal server error during verification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
