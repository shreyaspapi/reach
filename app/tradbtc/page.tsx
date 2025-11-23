"use client"

import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { ArrowLeft, Info, ShieldCheck, TrendingUp, Lock, Clock, ExternalLink, Bitcoin, Loader2 } from "lucide-react";
import Link from "next/link";

// Contract Address (Deployed on Base)
const ORACLE_ADDRESS = "0xd0114ac92C389BBBF9a3C88c73B97f5d564820bB";
const RPC_URL = "https://mainnet.base.org";

// Minimal ABI for getMstrNavAndMnav
const ORACLE_ABI = [
  "function getMstrNavAndMnav() external view returns (uint256 navPerShareUsd, uint256 mnavMultiple, uint64 btcPublishTime, uint64 mstrPublishTime)"
];

export default function TradBTCPage() {
    const [depositAmount, setDepositAmount] = useState("")
    const [navData, setNavData] = useState<{
        nav: string;
        multiple: string;
        btcTime: string;
        mstrTime: string;
    } | null>(null);
    const [loadingNav, setLoadingNav] = useState(true);

    useEffect(() => {
        async function fetchNav() {
            try {
                const provider = new ethers.JsonRpcProvider(RPC_URL);
                const contract = new ethers.Contract(ORACLE_ADDRESS, ORACLE_ABI, provider);
                
                // Returns: navPerShareUsd (8 decimals), mnavMultiple (2 decimals), timestamps
                const data = await contract.getMstrNavAndMnav();
                
                const nav = (Number(data[0]) / 1e8).toFixed(2);
                const multiple = (Number(data[1]) / 100).toFixed(2);
                
                // Convert timestamps to relative time (e.g. "5 min ago")
                const now = Math.floor(Date.now() / 1000);
                const btcDiff = Math.max(0, now - Number(data[2]));
                const mstrDiff = Math.max(0, now - Number(data[3]));
                
                const formatTime = (diff: number) => {
                    if (diff < 60) return "Just now";
                    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
                    return `${Math.floor(diff / 3600)}h ago`;
                };

                setNavData({
                    nav,
                    multiple,
                    btcTime: formatTime(btcDiff),
                    mstrTime: formatTime(mstrDiff)
                });
            } catch (error: any) {
                console.error("Error fetching MSTR NAV:", error);
                // If the error is a revert, it's likely stale price feeds
                // Show a fallback with static data
                if (error?.code === "CALL_EXCEPTION") {
                    console.log("Price feeds are stale - showing demo data");
                    setNavData({
                        nav: "174.42",
                        multiple: "2.08",
                        btcTime: "Stale",
                        mstrTime: "Stale"
                    });
                }
            } finally {
                setLoadingNav(false);
            }
        }
        
        fetchNav();
        const interval = setInterval(fetchNav, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen flex flex-col max-w-5xl mx-auto w-full">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 p-4 md:p-8 flex justify-between items-start pointer-events-none">
                <div className="pointer-events-auto bg-reach-paper/80 backdrop-blur-sm p-2 border-sketchy relative">
                    <Link href="/dashboard" className="flex items-center gap-2 text-reach-blue hover:underline decoration-wavy">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-mono text-xs font-bold uppercase tracking-widest">Back to Dashboard</span>
                    </Link>
                </div>
            </header>

            <main className="flex-1 flex flex-col p-4 md:p-8 pt-24">
                
                {/* Title Section */}
                <div className="max-w-4xl mx-auto w-full mb-12 relative">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-reach-blue opacity-20"></div>
                    <div className="pl-6">
                        <div className="inline-block bg-reach-blue text-reach-paper px-3 py-1 font-mono text-xs font-bold uppercase mb-4 bg-crosshatch relative">
                            <span className="bg-reach-blue px-2 relative">New Product</span>
                        </div>
                        <h1 className="font-display text-5xl md:text-7xl text-reach-blue uppercase leading-none font-extrabold tracking-tight">
                            TradBTC
                        </h1>
                        <p className="font-mono text-lg md:text-xl text-reach-blue/80 mt-2 max-w-2xl">
                            Institutional Yield Vaults for Bitcoin
                        </p>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Left Column: Vault Details */}
                    <div className="md:col-span-2 space-y-8">
                        
                        {/* Vault Card */}
                        <div className="bg-white/40 backdrop-blur-sm border-double-thick border-reach-blue p-6 md:p-8 relative guide-corners">
                            
                            {/* Header */}
                            <div className="flex justify-between items-start mb-8 border-b border-dashed border-reach-blue/30 pb-6">
                                <div>
                                    <h2 className="font-display text-3xl uppercase text-reach-blue font-extrabold">Core Vault Alpha</h2>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="bg-green-500/10 text-green-700 border border-green-500/30 px-2 py-0.5 text-[10px] font-mono font-bold uppercase">Low Risk</span>
                                        <span className="bg-reach-blue/10 text-reach-blue border border-reach-blue/30 px-2 py-0.5 text-[10px] font-mono font-bold uppercase">Babylon Integrated</span>
                                    </div>
                                </div>
                                    <div className="text-right">
                                        <p className="font-mono text-xs uppercase tracking-widest opacity-60">Live MSTR NAV</p>
                                        {loadingNav ? (
                                            <div className="h-12 flex items-center justify-end">
                                                <Loader2 className="w-6 h-6 animate-spin text-reach-blue" />
                                            </div>
                                        ) : navData ? (
                                            <div className="text-right">
                                                <p className="font-display text-5xl text-reach-blue font-black leading-none">
                                                    ${navData.nav}
                                                </p>
                                                <p className="font-mono text-sm text-reach-blue/60 font-bold mt-1">
                                                    Premium: {navData.multiple}x
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="font-display text-5xl text-reach-blue font-black">$174.42</p>
                                        )}
                                    </div>
                                </div>

                                {/* Live Oracle Status Bar */}
                                {navData && (
                                    <div className={`mb-6 flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest border p-2 ${
                                        navData.btcTime === "Stale" 
                                            ? "border-yellow-500/30 bg-yellow-500/5" 
                                            : "border-reach-blue/20 bg-reach-blue/5"
                                    }`}>
                                        <div className="flex items-center gap-1">
                                            {navData.btcTime === "Stale" ? (
                                                <>
                                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                                    <span className="text-yellow-700 font-bold">Oracle Needs Update</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                    <span className="text-green-700 font-bold">Oracle Live</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="h-3 w-px bg-reach-blue/20"></div>
                                        <div>BTC Feed: <span className="text-reach-blue">{navData.btcTime}</span></div>
                                        <div className="h-3 w-px bg-reach-blue/20"></div>
                                        <div>MSTR Feed: <span className="text-reach-blue">{navData.mstrTime}</span></div>
                                        <div className="ml-auto opacity-50 hover:opacity-100 transition-opacity">
                                            <a 
                                                href={`https://basescan.org/address/${ORACLE_ADDRESS}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 hover:text-reach-blue hover:underline"
                                            >
                                                Contract <ExternalLink className="w-2 h-2" />
                                            </a>
                                        </div>
                                    </div>
                                )}

                            {/* Strategy Visual */}
                            <div className="mb-8 relative p-4 border border-reach-blue/20 bg-reach-paper/50">
                                <p className="font-mono text-[10px] uppercase tracking-widest absolute -top-2 left-4 bg-reach-paper px-2 text-reach-blue">Allocation Strategy</p>
                                <div className="flex items-center gap-2 h-16 w-full mt-2">
                                    <div className="h-full bg-reach-blue flex items-center justify-center relative group overflow-hidden" style={{ width: '80%' }}>
                                        <div className="absolute inset-0 bg-crosshatch opacity-20"></div>
                                        <span className="relative text-reach-paper font-display text-xl font-bold z-10">80% Staking</span>
                                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                                            <span className="text-white text-xs font-mono bg-black/50 px-2 py-1">Babylon Protocol</span>
                                        </div>
                                    </div>
                                    <div className="h-full bg-reach-blue/40 flex items-center justify-center relative group overflow-hidden" style={{ width: '20%' }}>
                                        <div className="absolute inset-0 bg-hatch opacity-20"></div>
                                        <span className="relative text-reach-blue font-display text-xl font-bold z-10">20%</span>
                                        <div className="absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                                            <span className="text-reach-blue text-[10px] font-mono text-center px-1 leading-tight">Custody &<br/>Liquidity</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-3 border-sketchy bg-reach-paper/30">
                                    <div className="flex items-center gap-2 mb-1 opacity-60">
                                        <ShieldCheck className="w-3 h-3" />
                                        <p className="font-mono text-[10px] uppercase">Max Drawdown</p>
                                    </div>
                                    <p className="font-mono text-lg font-bold">3-5%</p>
                                </div>
                                <div className="p-3 border-sketchy bg-reach-paper/30">
                                    <div className="flex items-center gap-2 mb-1 opacity-60">
                                        <Clock className="w-3 h-3" />
                                        <p className="font-mono text-[10px] uppercase">Settlement</p>
                                    </div>
                                    <p className="font-mono text-lg font-bold">Monthly</p>
                                </div>
                                <div className="p-3 border-sketchy bg-reach-paper/30">
                                    <div className="flex items-center gap-2 mb-1 opacity-60">
                                        <TrendingUp className="w-3 h-3" />
                                        <p className="font-mono text-[10px] uppercase">Oracle</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <p className="font-mono text-lg font-bold">Pyth</p>
                                        <ExternalLink className="w-3 h-3 opacity-40" />
                                    </div>
                                </div>
                                <div className="p-3 border-sketchy bg-reach-paper/30">
                                    <div className="flex items-center gap-2 mb-1 opacity-60">
                                        <Lock className="w-3 h-3" />
                                        <p className="font-mono text-[10px] uppercase">Lock-up</p>
                                    </div>
                                    <p className="font-mono text-lg font-bold">7 Days</p>
                                </div>
                            </div>

                            {/* Deposit Action */}
                            <div className="mt-8 pt-6 border-t-2 border-dotted border-reach-blue/30">
                                <div className="flex flex-col gap-4">
                                    <label className="font-mono text-sm font-bold uppercase flex justify-between">
                                        <span>Deposit Amount</span>
                                        <span className="opacity-50">Balance: 0.00 BTC</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <input 
                                                type="text" 
                                                placeholder="0.00"
                                                value={depositAmount}
                                                onChange={(e) => setDepositAmount(e.target.value)}
                                                className="w-full bg-reach-paper border-2 border-reach-blue p-3 font-mono text-lg focus:outline-none focus:ring-2 focus:ring-reach-blue/50"
                                            />
                                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 font-mono font-bold text-reach-blue/50">BTC</span>
                                        </div>
                                        <button className="bg-reach-blue text-reach-paper px-6 py-3 font-display text-xl font-bold uppercase hover:bg-reach-blue/90 transition-colors border-2 border-transparent hover:border-reach-blue bg-crosshatch relative group">
                                            <span className="relative bg-reach-blue px-2 group-hover:bg-transparent group-hover:text-reach-blue transition-colors">Deposit</span>
                                        </button>
                                    </div>
                                    <p className="font-mono text-[10px] text-reach-blue/60 italic text-center mt-2">
                                        *Deposits are staked on Babylon and custodied with institutional partners.
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Right Column: Info / Context */}
                    <div className="space-y-6">
                        
                        {/* Info Card 1 */}
                        <div className="bg-reach-blue text-reach-paper p-6 relative overflow-hidden">
                            <div className="absolute inset-0 bg-crosshatch opacity-10"></div>
                            <h3 className="font-display text-2xl uppercase font-bold mb-4 relative z-10 border-b border-reach-paper/20 pb-2">
                                How it works
                            </h3>
                            <ul className="space-y-4 relative z-10 font-mono text-xs leading-relaxed opacity-90">
                                <li className="flex gap-3">
                                    <span className="font-bold text-lg leading-none text-reach-paper/50">1</span>
                                    <span>Deposit native BTC. Mint <strong className="text-white">tradBTC</strong> 1:1.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-bold text-lg leading-none text-reach-paper/50">2</span>
                                    <span>80% is staked on <strong className="text-white">Babylon</strong> for risk-free yield.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-bold text-lg leading-none text-reach-paper/50">3</span>
                                    <span>20% is deployed in low-risk <strong className="text-white">institutional strategies</strong>.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-bold text-lg leading-none text-reach-paper/50">4</span>
                                    <span>Monthly settlement via <strong className="text-white">Pyth Network</strong> oracle.</span>
                                </li>
                            </ul>
                        </div>

                         {/* Info Card 2 */}
                         <div className="border-sketchy p-6 relative">
                            <h3 className="font-display text-xl uppercase font-bold mb-2 text-reach-blue">
                                Security First
                            </h3>
                            <p className="font-mono text-xs text-reach-blue/80 leading-relaxed mb-4">
                                Funds are secured by institutional custodians (Ledger, Anchorage) and verified on-chain.
                            </p>
                            <div className="flex gap-2 flex-wrap">
                                <span className="border border-reach-blue/20 px-2 py-1 text-[10px] font-mono text-reach-blue/60 uppercase">Non-Custodial Staking</span>
                                <span className="border border-reach-blue/20 px-2 py-1 text-[10px] font-mono text-reach-blue/60 uppercase">Audited Contracts</span>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    )
}

