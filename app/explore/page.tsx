"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Trophy, TrendingUp, Users, ExternalLink, Loader2 } from "lucide-react";

interface LeaderboardEntry {
    fid: number;
    total_score: number;
    average_score: number;
    total_casts: number;
    gda_units: number;
    users: {
        username: string;
        display_name: string;
        pfp_url: string;
        power_badge: boolean;
    };
}

export default function ExplorePage() {
    const [leaderboard, setLeaderboard] = useState < LeaderboardEntry[] > ([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await fetch('/api/leaderboard?limit=50&minCasts=1');
                const data = await res.json();
                if (data.status === 'ok') {
                    setLeaderboard(data.data);
                }
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const filteredLeaderboard = leaderboard.filter(entry =>
        entry.users.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.users.display_name && entry.users.display_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen flex flex-col max-w-5xl mx-auto w-full">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 p-4 md:p-8 flex justify-between items-start pointer-events-none">
                <div className="pointer-events-auto bg-reach-paper/80 backdrop-blur-sm p-2 border-sketchy relative">
                    <Link href="/dashboard" className="flex items-center gap-2 text-reach-blue hover:underline decoration-wavy">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-mono text-xs font-bold tracking-widest">Back to Dashboard</span>
                    </Link>
                </div>
            </header>

            <main className="flex-1 flex flex-col p-4 md:p-8 pt-24">
                {/* Title Section */}
                <div className="max-w-4xl mx-auto w-full mb-12 relative">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-reach-blue opacity-20"></div>
                    <div className="pl-6">
                        <div className="inline-block bg-reach-blue text-reach-paper px-3 py-1 font-mono text-xs font-bold mb-4 bg-crosshatch relative">
                            <span className="bg-reach-blue px-2 relative">Community</span>
                        </div>
                        <h1 className="font-display text-5xl md:text-7xl text-reach-blue leading-none font-extrabold tracking-tight">
                            Explore
                        </h1>
                        <p className="font-mono text-lg md:text-xl text-reach-blue/80 mt-2 max-w-2xl">
                            Discover top performing users. <span className="font-bold bg-yellow-200/50 px-1">Higher Reach Score = Higher Yields.</span>
                        </p>
                    </div>
                </div>

                {/* Search & Stats */}
                <div className="max-w-4xl mx-auto w-full mb-8 grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-2 relative flex items-center">
                        <div className="absolute left-4 pointer-events-none z-10 flex items-center justify-center">
                            <Search className="w-5 h-5 text-reach-blue/40" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search users by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-14 pl-12 pr-4 bg-white/50 border-2 border-reach-blue font-mono text-lg text-reach-blue placeholder:text-reach-blue/30 focus:outline-none focus:ring-2 focus:ring-reach-blue/20 transition-all"
                        />
                    </div>
                    <div className="bg-reach-blue text-reach-paper p-4 flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-crosshatch opacity-10"></div>
                        <div className="relative z-10 flex items-center justify-between">
                            <span className="font-mono text-xs opacity-80">Total Active Users</span>
                            <Users className="w-4 h-4 opacity-80" />
                        </div>
                        <p className="relative z-10 font-display text-3xl font-bold">{leaderboard.length}</p>
                    </div>
                </div>

                {/* Leaderboard Table */}
                <div className="max-w-4xl mx-auto w-full bg-white/40 backdrop-blur-sm border-double-thick border-reach-blue relative guide-corners min-h-[400px]">

                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 p-4 border-b-2 border-reach-blue bg-reach-blue/5 font-mono text-xs font-bold tracking-widest text-reach-blue/70">
                        <div className="col-span-1 text-center">#</div>
                        <div className="col-span-5">User</div>
                        <div className="col-span-2 text-right">Avg Score</div>
                        <div className="col-span-2 text-right">Total Score</div>
                        <div className="col-span-2 text-right">GDA Units</div>
                    </div>

                    {/* Table Body */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-reach-blue/50">
                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                            <p className="font-mono text-xs uppercase">Loading data...</p>
                        </div>
                    ) : filteredLeaderboard.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-reach-blue/50">
                            <Search className="w-8 h-8 mb-2 opacity-50" />
                            <p className="font-mono text-xs uppercase">No users found</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-dashed divide-reach-blue/20">
                            {filteredLeaderboard.map((entry, index) => (
                                <Link
                                    href={`/u/${entry.users.username}`}
                                    key={entry.fid}
                                    className="grid grid-cols-12 gap-4 p-4 hover:bg-reach-blue/5 transition-colors group items-center"
                                >
                                    <div className="col-span-1 text-center font-display text-xl font-bold text-reach-blue/50 group-hover:text-reach-blue">
                                        {index + 1}
                                    </div>
                                    <div className="col-span-5 flex items-center gap-3">
                                        {entry.users.pfp_url ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={entry.users.pfp_url} alt={entry.users.username} className="w-10 h-10 rounded-full border border-reach-blue/20 bg-reach-paper" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full border border-reach-blue/20 bg-reach-blue/10 flex items-center justify-center">
                                                <span className="font-display text-lg text-reach-blue">{entry.users.username[0].toUpperCase()}</span>
                                            </div>
                                        )}
                                        <div>
                                            <div className="flex items-center gap-1">
                                                <p className="font-bold text-reach-blue leading-none">{entry.users.display_name || entry.users.username}</p>
                                                {entry.users.power_badge && <Trophy className="w-3 h-3 text-yellow-600 fill-yellow-400" />}
                                            </div>
                                            <p className="font-mono text-xs text-reach-blue/60">@{entry.users.username}</p>
                                        </div>
                                    </div>
                                    <div className="col-span-2 text-right">
                                        <div className="inline-block bg-white border border-reach-blue/20 px-2 py-1">
                                            <span className="font-mono font-bold text-reach-blue">{entry.average_score.toFixed(1)}</span>
                                        </div>
                                    </div>
                                    <div className="col-span-2 text-right">
                                        <p className="font-mono text-sm text-reach-blue/80">{entry.total_score.toFixed(0)}</p>
                                    </div>
                                    <div className="col-span-2 text-right">
                                        <div className="flex items-center justify-end gap-1 text-reach-blue font-bold">
                                            <span>{Math.round(entry.gda_units || entry.total_score)}</span>
                                            <TrendingUp className="w-3 h-3 opacity-50" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

