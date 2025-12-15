import { NextRequest, NextResponse } from "next/server";
import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";

// Initialize Neynar client
const config = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY || "",
});
const neynarClient = new NeynarAPIClient(config);

export async function GET(req: NextRequest) {
  try {
    // For Neynar SIWN, we don't need to generate nonces server-side
    // The client handles this directly with Neynar
    return NextResponse.json({
      status: "ok"
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
