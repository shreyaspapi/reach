import { NextRequest, NextResponse } from "next/server";
import { AppClient, verifySignInMessage } from "@farcaster/auth-client";

// Initialize the Farcaster Auth Client
// Note: NEXT_PUBLIC_APP_URL should be your deployed domain (e.g., https://farcaster.luno.social)
// or the domain you registered with Farcaster.
const appClient = new AppClient({
  relay: "https://relay.farcaster.xyz",
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
    const result = await verifySignInMessage({
      message,
      signature,
      domain: domain || "farcaster.luno.social",
      nonce,
    });

    if (!result.isError) {
      // Valid signature!
      const fid = result.fid;
      
      // Here you would typically:
      // 1. Check if the user exists in your DB
      // 2. Create a session (JWT/Cookie)
      // 3. Return the session token or success status
      
      // For now, we return the user's FID and success status
      return NextResponse.json({ 
        success: true, 
        fid: fid,
        pfpUrl: result.pfpUrl,
        username: result.username,
        displayName: result.displayName
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
