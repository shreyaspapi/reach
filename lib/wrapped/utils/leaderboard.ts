import { supabase } from "@/lib/supabase"

export interface LeaderboardEntry {
  id?: string
  address: string
  basename?: string | null
  score: number
  skill_level: string
  total_transactions: number
  total_volume: number
  active_days: number
  created_at?: string
  updated_at?: string
}

export async function saveToLeaderboard(
  address: string,
  score: number,
  skillLevel: string,
  totalTransactions: number,
  totalVolume: number,
  activeDays: number,
  basename?: string,
): Promise<void> {
  try {
    // Use the imported supabase client

    // Check if entry already exists
    const { data: existing, error: fetchError } = await supabase
      .from("wrapped_leaderboard")
      .select("*")
      .eq("address", address)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking existing entry:", {
        message: fetchError.message,
        code: fetchError.code,
        details: fetchError.details,
        hint: fetchError.hint
      })
      throw fetchError
    }

    if (existing) {
      if (score > existing.score) {
        const { error } = await supabase
          .from("wrapped_leaderboard")
          .update({
            score,
            skill_level: skillLevel,
            total_transactions: totalTransactions,
            total_volume: totalVolume,
            active_days: activeDays,
            basename: basename || existing.basename,
            updated_at: new Date().toISOString(),
          })
          .eq("address", address)

        if (error) {
          console.error("Error updating leaderboard entry:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          })
          throw error
        }
      }
    } else {
      const { error } = await supabase.from("wrapped_leaderboard").insert({
        address,
        basename,
        score,
        skill_level: skillLevel,
        total_transactions: totalTransactions,
        total_volume: totalVolume,
        active_days: activeDays,
      })

      if (error) {
        console.error("Error inserting leaderboard entry:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        throw error
      }
    }
  } catch (error) {
    console.error("Error saving to leaderboard:", error)
    throw error
  }
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    // Use the imported supabase client

    const { data, error } = await supabase
      .from("wrapped_leaderboard")
      .select("*")
      .order("score", { ascending: false })
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error loading leaderboard:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error loading leaderboard:", error)
    return []
  }
}

export async function getUserRank(address: string): Promise<number | null> {
  try {
    const leaderboard = await getLeaderboard()
    const index = leaderboard.findIndex((entry) => entry.address.toLowerCase() === address.toLowerCase())
    return index !== -1 ? index + 1 : null
  } catch (error) {
    console.error("Error getting user rank:", error)
    return null
  }
}

