"use client"

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Trophy, Users, Calendar, TrendingUp, MessageSquare, Repeat, Heart, ExternalLink } from "lucide-react";
import { User, UserStats, Cast } from "@/lib/supabase";

// Reuse the StreamCounter but make it static for now as we don't have auth context here easily
// Or we could fetch the stream data if we wanted to be fancy.
// For now, let's just show the GDA units.

interface DashboardData {
    user: User;
    stats: UserStats;
    recentCasts: Cast[];
}

export default function PublicProfilePage() {
    const params = useParams();
    const username = params.username as string;
    
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/u/${username}`);
                const json = await res.json();
                
                if (json.status === 'ok') {
                    setData(json.data);
                } else {
                    setError(json.message || "User not found");
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
                setError("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        if (username) {
            fetchData();
        }
    }, [username]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-reach-paper text-reach-blue">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin" />
                    <p className="font-mono uppercase tracking-widest">Loading Profile...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-reach-paper text-reach-blue p-4">
                <h1 className="font-display text-4xl mb-4">Profile Not Found</h1>
                <p className="font-mono mb-8 text-center opacity-70">{error || "The user you are looking for does not exist."}</p>
                <Link href="/explore" className="bg-reach-blue text-reach-paper px-6 py-3 font-display uppercase hover:bg-reach-blue/90 transition-colors">
                    Back to Explore
                </Link>
            </div>
        );
    }

    const { user, stats, recentCasts } = data;

    return (
        <div className="min-h-screen flex flex-col max-w-6xl mx-auto w-full">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 p-4 md:p-8 flex justify-between items-start pointer-events-none">
                <div className="pointer-events-auto bg-reach-paper/80 backdrop-blur-sm p-2 border-sketchy relative">
                    <Link href="/explore" className="flex items-center gap-2 text-reach-blue hover:underline decoration-wavy">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-mono text-xs font-bold uppercase tracking-widest">Back to Explore</span>
                    </Link>
                </div>
            </header>

            <main className="flex-1 flex flex-col p-4 md:p-8 pt-24">
                
                {/* Profile Header */}
                <div className="mb-12 relative">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-reach-blue opacity-20"></div>
                    <div className="pl-6 flex flex-col md:flex-row md:items-end gap-6 justify-between">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                {user.pfp_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={user.pfp_url} alt={user.username} className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-reach-blue bg-reach-paper object-cover" />
                                ) : (
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-reach-blue bg-reach-blue/10 flex items-center justify-center">
                                        <span className="font-display text-4xl text-reach-blue">{user.username[0].toUpperCase()}</span>
                                    </div>
                                )}
                                {user.power_badge && (
                                    <div className="absolute -bottom-2 -right-2 bg-yellow-400 border-2 border-reach-paper rounded-full p-2" title="Power User">
                                        <Trophy className="w-5 h-5 text-yellow-800" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="font-display text-4xl md:text-6xl text-reach-blue uppercase leading-none font-extrabold tracking-tight">
                                        {user.display_name || user.username}
                                    </h1>
                                </div>
                                <a 
                                    href={`https://warpcast.com/${user.username}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono text-lg md:text-xl text-reach-blue/60 hover:text-reach-blue hover:underline flex items-center gap-2"
                                >
                                    @{user.username} <ExternalLink className="w-4 h-4 opacity-50" />
                                </a>
                            </div>
                        </div>

                        <div className="flex gap-6 font-mono text-sm opacity-80">
                            <div className="flex flex-col">
                                <span className="font-bold text-xl">{user.follower_count?.toLocaleString()}</span>
                                <span className="text-xs uppercase tracking-wider">Followers</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-xl">{user.following_count?.toLocaleString()}</span>
                                <span className="text-xs uppercase tracking-wider">Following</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Score Card */}
                    <div className="bg-reach-blue text-reach-paper p-6 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-crosshatch opacity-10 group-hover:opacity-20 transition-opacity"></div>
                        <h3 className="relative z-10 font-mono text-xs uppercase tracking-widest opacity-70 mb-2">Luno Score</h3>
                        <div className="relative z-10 flex items-baseline gap-2">
                            <span className="font-display text-6xl font-bold">{stats.average_score.toFixed(0)}</span>
                            <span className="font-mono text-lg opacity-50">/100</span>
                        </div>
                        <div className="relative z-10 mt-4 pt-4 border-t border-reach-paper/20 flex justify-between text-xs font-mono opacity-80">
                            <span>Highest: {stats.highest_score.toFixed(0)}</span>
                            <span>Lowest: {stats.lowest_score.toFixed(0)}</span>
                        </div>
                    </div>

                    {/* Stream Rate (GDA Units) */}
                    <div className="bg-white/40 backdrop-blur-sm border-2 border-reach-blue p-6 relative">
                        <h3 className="font-mono text-xs uppercase tracking-widest text-reach-blue opacity-70 mb-2">Stream Units</h3>
                        <div className="flex items-baseline gap-2 text-reach-blue">
                            <span className="font-display text-6xl font-bold">{Math.round(stats.gda_units || stats.total_score)}</span>
                            <span className="font-mono text-lg opacity-50">UNITS</span>
                        </div>
                        <p className="mt-2 font-mono text-xs text-reach-blue/60">
                            These units determine the real-time stream rate of $LUNO tokens.
                        </p>
                    </div>

                    {/* Engagement Stats */}
                    <div className="bg-white/40 backdrop-blur-sm border-sketchy p-6 relative">
                        <h3 className="font-mono text-xs uppercase tracking-widest text-reach-blue opacity-70 mb-4">Engagement</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-reach-blue opacity-50" />
                                <span className="font-mono text-sm font-bold text-reach-blue">{stats.total_casts} <span className="font-normal opacity-60 text-xs">Casts</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Heart className="w-4 h-4 text-reach-blue opacity-50" />
                                <span className="font-mono text-sm font-bold text-reach-blue">{stats.total_likes_received} <span className="font-normal opacity-60 text-xs">Likes</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Repeat className="w-4 h-4 text-reach-blue opacity-50" />
                                <span className="font-mono text-sm font-bold text-reach-blue">{stats.total_recasts_received} <span className="font-normal opacity-60 text-xs">Recasts</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-reach-blue opacity-50" />
                                <span className="font-mono text-sm font-bold text-reach-blue">{stats.total_replies_received} <span className="font-normal opacity-60 text-xs">Replies</span></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="max-w-3xl">
                    <div className="flex items-center gap-4 mb-8">
                        <h2 className="font-display text-2xl uppercase text-reach-blue font-extrabold bg-reach-paper pr-4 z-10 relative">Recent Activity</h2>
                        <div className="h-px bg-reach-blue flex-1 opacity-30"></div>
                    </div>

                    <div className="space-y-6">
                        {recentCasts.map((cast) => (
                            <div key={cast.cast_hash} className="bg-white/30 p-6 border-l-4 border-reach-blue/20 hover:border-reach-blue transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2 text-reach-blue/50 font-mono text-xs">
                                        <Calendar className="w-3 h-3" />
                                        <span>{new Date(cast.timestamp).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span>{new Date(cast.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="bg-reach-blue/10 px-3 py-1 rounded-full">
                                        <span className="font-mono font-bold text-reach-blue text-sm">
                                            Score: {cast.total_score.toFixed(0)}
                                        </span>
                                    </div>
                                </div>
                                
                                <p className="font-sans text-lg text-reach-blue leading-relaxed mb-4">
                                    {cast.text}
                                </p>

                                <div className="flex items-center gap-6 text-reach-blue/60 font-mono text-xs">
                                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {cast.likes_count}</span>
                                    <span className="flex items-center gap-1"><Repeat className="w-3 h-3" /> {cast.recasts_count}</span>
                                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {cast.replies_count}</span>
                                    
                                    <a 
                                        href={`https://warpcast.com/${user.username}/${cast.cast_hash.substring(0, 10)}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="ml-auto flex items-center gap-1 hover:text-reach-blue hover:underline"
                                    >
                                        View on Farcaster <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        ))}

                        {recentCasts.length === 0 && (
                            <div className="text-center py-12 border-2 border-dashed border-reach-blue/20">
                                <p className="font-mono text-reach-blue/50">No recent activity recorded on Luno.</p>
                            </div>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
}

