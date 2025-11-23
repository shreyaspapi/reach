# Reach ⚡️

> **The SocialFi Layer for the New Internet.**  
> *Where Attention Meets Finance.*

![Reach Banner](https://raw.githubusercontent.com/shreyaspapi/reach/main/images/reach-banner.jpeg)

---

## 🏆 Hackathon Submission

**Reach** is a cutting-edge **SocialFi** platform that bridges the gap between social engagement and decentralized finance. By combining the social power of **Farcaster** with the financial robustness of **Bitcoin DeFi**, we are creating a new economy where attention is currency and yield is accessible.

---

## � Deployed Contracts

All Reach smart contracts are deployed and verified on testnet. Below are the contract addresses for interaction and verification:

### Ethereum Sepolia Testnet

| Contract | Address | Purpose | Explorer |
|----------|---------|---------|----------|
| **REACH Supertoken** | `0xE58C945fbb1f2c5e7398f1a4b9538f52778b31a7` | ERC-20 Superfluid token for streaming rewards | [View on Etherscan](https://sepolia.etherscan.io/address/0xe58c945fbb1f2c5e7398f1a4b9538f52778b31a7) |
| **GDA Pool Contract** | `0x2cc199976B4ACBe4211E943c1E7F070d76570D4e` | Superfluid General Distribution Agreement pool for campaign rewards | [View on Etherscan](https://sepolia.etherscan.io/address/0x2cc199976B4ACBe4211E943c1E7F070d76570D4e) |
| **GDA Forwarder** | `0x6DA13Bde224A05a288748d857b9e7DDEffd1dE08` | Superfluid GDA forwarder for batch operations | [View on Etherscan](https://sepolia.etherscan.io/address/0x6DA13Bde224A05a288748d857b9e7DDEffd1dE08) |
| **MSTR NAV Oracle** | `0x21c1914f8f1a6cd3faaa08c761ec0990d01fab8f` | Custom oracle fetching BTC and MSTR prices from Pyth Network | [View on Etherscan](https://sepolia.etherscan.io/address/0x21c1914f8f1a6cd3faaa08c761ec0990d01fab8f) |

### External Dependencies

| Service | Address | Network | Purpose |
|---------|---------|---------|---------|
| **Pyth Oracle** | `0xDd24F84d36BF92C65F92307595335bdFab5Bbd21` | Sepolia | Pyth price feed contract for on-chain price updates |

### Pyth Price Feed IDs

| Asset | Feed ID | Description |
|-------|---------|-------------|
| **BTC/USD** | `0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43` | Bitcoin price feed |
| **MSTR/USD** | `0xe1e80251e5f5184f2195008382538e847fafc36f751896889dd3d1b1f6111f09` | MicroStrategy stock price feed (Equity.MSTR.US) |

---

## �🚀 The Problem

In the current digital landscape:
1.  **Attention is Undervalued**: Users create massive value for platforms but capture little of it. "Likes" are vanity metrics, not financial assets.
2.  **DeFi is Disconnected**: High-quality financial products (like Bitcoin yield) are siloed away from where people actually spend their time—social media.
3.  **Engagement is Noisy**: It's hard to distinguish between high-quality discourse and spam/bots.

## 💡 The Solution: SocialFi

**Reach** solves this by creating a unified ecosystem:

*   **Social Layer**: We use **AI Agents** to analyze and score Farcaster engagement in real-time. It's not just about volume; it's about *quality*.
*   **DeFi Layer**: We introduce **TradBTC**, offering institutional-grade Bitcoin yields directly within the social experience.
*   **The Bridge**: Your "Reach Score" (Social Reputation) is the key to unlocking financial opportunities.

---

## ✨ Key Features

### 1. 🤖 AI-Powered Engagement Scoring
We don't just count likes. Our **Azure OpenAI** agents analyze the context, sentiment, and quality of every interaction (mentions, replies, casts).
*   **Smart Filtering**: Distinguishes between genuine conversation and "GM" spam.
*   **Real-Time Tracking**: Powered by **Neynar** webhooks.
*   **Reputation Score**: Users earn a dynamic "Reach Score" based on their contribution to the network.

### 2. 💰 TradBTC: Bitcoin Yield Vaults
Seamlessly integrated DeFi for the social user.
*   **Babylon Integration**: Stake BTC to earn trustless yield.
*   **Institutional Strategies**: Access low-risk, high-yield vaults previously reserved for whales.
*   **Live Oracles**: Powered by **Pyth Network** for real-time NAV (Net Asset Value) updates and transparency.
*   **MSTR Tracking**: Live tracking of MicroStrategy's NAV as a benchmark.

### 3. 🔐 Seamless Onboarding
*   **Privy Auth**: Login with your Farcaster account in seconds.
*   **Non-Custodial**: You own your keys and your coins.

---

## 🛠 Tech Stack

We built Reach using the best-in-class technologies for Web3 and AI:

| Category | Technology | Usage |
|----------|------------|-------|
| **Frontend** | **Next.js 15** | High-performance React framework with Blueprint UI theme. |
| **Social** | **Farcaster** | The decentralized social protocol. |
| **Auth** | **Privy** | Seamless crypto & social login. |
| **Data** | **Neynar** | Real-time Farcaster data & webhooks. |
| **AI** | **Azure OpenAI** | LLM for semantic analysis and scoring. |
| **Database** | **Supabase** | Real-time database for user profiles and scores. |
| **DeFi** | **Foundry** | Smart contract development and testing. |
| **Oracles** | **Pyth Network** | Real-time price feeds for BTC and MSTR. |
| **Staking** | **Babylon** | Bitcoin staking protocol integration. |

---

## �📸 Screenshots

### Dashboard - Social Engagement Tracking
![Dashboard 1](https://raw.githubusercontent.com/shreyaspapi/reach/main/images/dashboard_1.png)

### Dashboard - Allocations & Campaigns
![Dashboard 2](https://raw.githubusercontent.com/shreyaspapi/reach/main/images/dashboard_2.png)

### TradBTC - Bitcoin Yield Vault
![TradBTC Vault](https://raw.githubusercontent.com/shreyaspapi/reach/main/images/tradfi.png)

---

## 🏗 Architecture

```mermaid
graph TD
    User[User] -->|Casts/Interacts| Farcaster
    Farcaster -->|Webhook| Neynar
    Neynar -->|Event| ReachAPI[Reach API]
    ReachAPI -->|Analyze| AI[Azure OpenAI]
    AI -->|Score| DB[(Supabase)]
    
    User -->|Deposits BTC| TradBTC[TradBTC Vault]
    TradBTC -->|Stakes| Babylon[Babylon Protocol]
    Pyth[Pyth Oracle] -->|Feeds Prices| TradBTC
```

---

## 🏃‍♂️ Getting Started

### Prerequisites
*   Node.js & Yarn
*   Foundry (for smart contracts)

### Installation

1.  **Clone the repo**
    ```bash
    git clone https://github.com/yourusername/reach.git
    cd reach
    ```

2.  **Install dependencies**
    ```bash
    yarn install
    ```

3.  **Set up Environment Variables**
    Copy `.env.example` to `.env.local` and fill in your keys (Privy, Supabase, Neynar, OpenAI).

4.  **Run the Development Server**
    ```bash
    yarn dev
    ```

5.  **Run Smart Contract Tests**
    ```bash
    cd mstr-nav-oracle
    forge test
    ```

---

## 🔮 What's Next?

*   **Token Launch**: Launching $REACH token to reward high-quality engagement.
*   **More Vaults**: Expanding TradBTC to include ETH and SOL strategies.
*   **DAO Governance**: Allowing high-score users to vote on vault strategies.

---
