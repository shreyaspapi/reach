import { Trophy, Zap, Star, MessageCircle, LucideIcon } from "lucide-react"

export interface Campaign {
    id: number
    name: string
    points: number
    icon: LucideIcon
    label: string
    creator?: string
    description?: string
    handles?: {
        x?: string
        farcaster?: string
    }
}

export const CAMPAIGNS: Campaign[] = [
    {
        id: 1,
        name: "Talk to Shreyas",
        points: 150,
        icon: MessageCircle,
        label: "Active Campaign",
        creator: "Shreyas Papinwar",
        description: "Shreyas LOVES attention. Tweet at him, cast at him, meme him, roast him—anything you do to @spapinwar on X or @shreyaspapi on Farcaster earns you $REACH.",
        handles: {
            x: "@spapinwar",
            farcaster: "@shreyaspapi"
        }
    },
    { id: 2, name: "Genesis Pool", points: 450, icon: Star, label: "Early Adopter" },
    { id: 3, name: "Creator Fund", points: 1250, icon: Zap, label: "Active Stream" },
    { id: 4, name: "Referral Rewards", points: 85, icon: Trophy, label: "3 Invites" },
]
