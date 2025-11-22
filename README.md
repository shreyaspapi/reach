# REACH

![Reach Banner](images/reach-banner.png)
 
### The Currency of Attention

**REACH turns social engagement into real-time on-chain rewards.**  
Protocols launch AI-scored posting campaigns, and users earn streaming tokens for tweeting or casting about them across X and Farcaster. It’s social mining for the entire crypto ecosystem.

---

## What REACH Is

REACH is an **AI-powered, multi-platform social mining protocol** that streams real tokens to users in real-time for growing a protocol's reach across X and Farcaster. 

The system rewards **actual influence**, not spam.

- **Multi-Platform**: X + Farcaster (eventually Lens, Warpcast, Telegram).
- **Protocol-Driven**: Protocols launch their own campaigns.
- **AI-Scored**: AI scores ANY interaction about them.
- **Real-Time**: Users earn actual tokens streamed via Superfluid.
- **Transparent**: Entirely on-chain, transparent, and composable.
- **Frictionless**: No tagging required — we detect organic mentions.
- **Direct**: Incentives go directly from protocol → user.

---

## What REACH is NOT (vs Kaito Yaps)

| Feature | Kaito Yaps | REACH |
| :--- | :--- | :--- |
| **Platforms** | Single-platform (X only) | **Multi-platform** (X + Farcaster, etc.) |
| **Decisions** | Centralized reward decisions | **AI scores ANY interaction** |
| **Incentives** | Points leaderboard | **Real tokens streamed via Superfluid** |
| **User Action** | Requires tagging KaitoAI | **No tagging required** (organic detection) |
| **Campaigns** | Limited campaign control | **Protocols launch their own campaigns** |
| **Scoring** | Opaque scoring | **Transparent, AI-driven scoring** |
| **Value Flow** | No on-chain value flow | **Entirely on-chain** |

---

## Uniswap v4 Hooks Integration

REACH leverages Uniswap v4 Hooks to create a direct link between social sentiment and DeFi mechanics.

### 1. AI-Scored Social → Dynamic Swap Fees (Hook)
*This is the cleanest fit for Uniswap v4.*

**The Idea:**
Swap fees in the pool dynamically change based on the social reach or sentiment of a token — as scored by REACH’s AI.

**Hook Logic:**
- **If a token’s social score spikes** → Make swap fees **lower** (incentivize trading during hype moments).
- **If sentiment is negative** → **Increase** fees (protect LPs from LVR, volatility, bot farming).

**Why it works:**
This becomes a Uniswap v4 Hook that reads REACH AI scores to dynamically adjust pool fees.
- **Real on-chain data input**
- **Real world context (social signals)**
- **Actual impact on LPs & traders**
- Fits both **Stable** and **Volatile** categories.

---

## Development

This is a [Next.js](https://nextjs.org/) project.

### Prerequisites
- Node.js 22+
- Yarn

### Getting Started

1.  **Install dependencies**
    ```bash
    yarn install
    ```

2.  **Start the development server**
    ```bash
    yarn dev
    ```

3.  **Open in Browser**
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
