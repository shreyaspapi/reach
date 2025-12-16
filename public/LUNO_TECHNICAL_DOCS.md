# Luno Protocol: Technical Documentation v1.2

## 1. System Overview

Luno is a SocialFi infrastructure layer connecting decentralized social activity (Farcaster) with programmable value streams. It functions as a reputation and distribution engine that quantifies user attention and quality of discourse, converting these metrics into real-time financial flows via Superfluid General Distribution Agreements (GDA).

## 2. Architecture

The system operates on a four-tier architecture:

1.  **Ingestion Layer (Social)**: Captures user interactions via Farcaster protocol.

2.  **Processing Layer (Compute)**: Analyzes semantic quality using rule-based heuristics with optional LLM enhancement.

3.  **State Layer (Data)**: Persists user reputation and triggers financial state updates.

4.  **Distribution Layer (Finance)**: Executes real-time reward streaming on Ethereum Sepolia testnet.

## 3. Engagement Scoring Engine

The scoring logic (`lib/scoring.ts`, `lib/llm-scoring.ts`) employs a primary **rule-based heuristic system** with an optional **LLM enhancement** (Azure OpenAI GPT-4o) when configured. The system gracefully falls back to deterministic scoring if LLM services are unavailable.

### 3.1. Scoring Dimensions

The Total Engagement Score (0-100) is a weighted aggregate:

| Dimension | Weight | Heuristic Validation Thresholds |
| :--- | :--- | :--- |
| **Communication Quality** | **40%** | **Length:** 10-280 words optimal.<br>**Spam:** Penalty if emoji ratio > 30% or repeating char > 4.<br>**Sybil:** Penalty for isolated keywords ("gm", "ser", "wagmi"). |
| **Community Impact** | **30%** | **Reach:** Bonus for follower count > 500.<br>**Engagement:** Weighted sum of Likes (1x), Replies (3x), Recasts (5x). |
| **Consistency** | **20%** | **Frequency:** Reward window 6h-48h. Penalty for <2h intervals (spam detection). |
| **Active Campaign** | **10%** | **Targeting:** Validates direct interaction with campaign-specific FIDs (e.g., replying to admin). |

### 3.2. Processing Pipeline

1.  **Extraction:** Event text and metadata extracted from Neynar webhook.

2.  **Evaluation:** Rule-based heuristic engine analyzes content quality, engagement metrics, and spam patterns. Optional GPT-4o enhancement provides semantic depth analysis when Azure OpenAI is configured.

3.  **Normalization:** Scores clamped 0-100 and weighted according to dimension importance.

4.  **Persistence:** Score recorded in `casts` table; aggregates updated in `user_stats` via PostgreSQL triggers.

## 4. Technical Stack & Deployments

### 4.1. Core Infrastructure

* **Frontend**: Next.js 15 (App Router), TypeScript, React 19.

* **Auth**: Neynar (Farcaster OAuth & Social Graph).

* **Intelligence**: Azure OpenAI (`gpt-4o`) - optional enhancement.

* **Database**: Supabase (PostgreSQL with real-time subscriptions).

### 4.2. Smart Contract Deployments (Ethereum Sepolia Testnet)

The protocol utilizes the Superfluid stack for continuous distribution on Ethereum Sepolia testnet.

* **LUNO/REACH Supertoken**: `0xE58C945fbb1f2c5e7398f1a4b9538f52778b31a7` (ERC-20 Superfluid Wrapper)

* **GDA Pool Contract**: `0x2cc199976B4ACBe4211E943c1E7F070d76570D4e` (General Distribution Agreement Pool)

* **GDA Forwarder**: `0x6DA13Bde224A05a288748d857b9e7DDEffd1dE08` (Batch Operations Contract)

## 5. Data Schema & State Transitions

The database schema (`supabase/schema.sql`) manages the bridge between social activity and token streaming.

### 5.1. Primary Tables

* `users`: Identity mapping (FID ↔ Wallet Address).

* `casts`: Immutable record of interactions and individual scores.

* `user_stats`: Aggregate performance metrics (Total Score, Average Score).

* `campaigns`: Configuration for target FIDs and weight logic.

### 5.2. The Distribution Trigger

The system utilizes a PostgreSQL trigger to automate distribution logic:

```sql
TRIGGER trigger_update_user_stats
AFTER INSERT ON casts
EXECUTE FUNCTION update_user_stats();
```

**Logic:**

1.  New cast inserted with `total_score`.

2.  `update_user_stats` function fires.

3.  `user_stats.gda_units` is incremented by the `total_score`.

4.  This `gda_units` value determines the user's share of the Superfluid GDA Pool, effectively adjusting their token stream rate in real-time.

## 6. Security & Infrastructure

  * **Webhook Validation**: HMAC signature verification (Neynar webhook secret) prevents replay attacks on the ingestion layer.

  * **Sybil Resistance**: Multi-layered heuristic filters detect farming patterns (e.g., "gm", "ser", "wagmi" spam) and apply negative score weights (-30) to low-effort content.

  * **Row Level Security (RLS)**: Supabase database policies restrict write access to the service role, preventing client-side score manipulation.

  * **Network**: Currently deployed on Ethereum Sepolia testnet. Production deployment targets Base network for lower fees and faster finality.

## 7. Team

<div class="grid gap-4 md:grid-cols-2">

  <a href="https://x.com/spapinwar" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 border border-reach-blue/30 rounded-lg p-3 hover:bg-reach-blue/5 transition">
    <img src="https://unavatar.io/x/spapinwar" alt="Shreyas" class="h-12 w-12 rounded-full border-2 border-reach-blue/30" />
    <div>
      <p class="font-semibold text-reach-blue leading-tight">Shreyas</p>
      <p class="text-sm text-reach-blue/70 leading-tight">@spapinwar</p>
    </div>
  </a>

  <a href="https://x.com/Avadam21" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 border border-reach-blue/30 rounded-lg p-3 hover:bg-reach-blue/5 transition">
    <img src="https://unavatar.io/x/Avadam21" alt="Hardik" class="h-12 w-12 rounded-full border-2 border-reach-blue/30" />
    <div>
      <p class="font-semibold text-reach-blue leading-tight">Hardik</p>
      <p class="text-sm text-reach-blue/70 leading-tight">@Avadam21</p>
    </div>
  </a>

  <a href="https://x.com/ninja_writer21" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 border border-reach-blue/30 rounded-lg p-3 hover:bg-reach-blue/5 transition">
    <img src="https://unavatar.io/x/ninja_writer21" alt="Uddalak" class="h-12 w-12 rounded-full border-2 border-reach-blue/30" />
    <div>
      <p class="font-semibold text-reach-blue leading-tight">Uddalak</p>
      <p class="text-sm text-reach-blue/70 leading-tight">@ninja_writer21</p>
    </div>
  </a>

  <a href="https://x.com/anishbuilds" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 border border-reach-blue/30 rounded-lg p-3 hover:bg-reach-blue/5 transition">
    <img src="https://unavatar.io/x/anishbuilds" alt="Anish" class="h-12 w-12 rounded-full border-2 border-reach-blue/30" />
    <div>
      <p class="font-semibold text-reach-blue leading-tight">Anish</p>
      <p class="text-sm text-reach-blue/70 leading-tight">@anishbuilds</p>
    </div>
  </a>

</div>
