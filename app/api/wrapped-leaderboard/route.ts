import { NextResponse } from "next/server"
import { getLeaderboard } from "@/lib/wrapped/utils/leaderboard"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    const leaderboard = await getLeaderboard()
    
    // Apply limit
    const limitedLeaderboard = leaderboard.slice(0, limit)

    return NextResponse.json({
      success: true,
      data: limitedLeaderboard,
      total: leaderboard.length,
    })
  } catch (error) {
    console.error("Error fetching wrapped leaderboard:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch wrapped leaderboard",
      },
      { status: 500 },
    )
  }
}
