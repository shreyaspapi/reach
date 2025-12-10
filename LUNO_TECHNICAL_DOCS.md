# Luno Protocol: Technical Documentation v1.1

## 1. System Overview

Luno is a SocialFi infrastructure layer connecting decentralized social activity (Farcaster) with programmable value streams. It functions as a reputation and distribution engine that quantifies user attention and quality of discourse, converting these metrics into real-time financial flows via Superfluid General Distribution Agreements (GDA).

## 2. Architecture

The system operates on a four-tier architecture:

1.  **Ingestion Layer (Social)**: Captures user interactions via Farcaster protocol.

2.  **Processing Layer (Compute)**: Analyzes semantic quality using dual-engine evaluation (LLM + Heuristic).

3.  **State Layer (Data)**: Persists user reputation and triggers financial state updates.

4.  **Distribution Layer (Finance)**: Executes real-time reward streaming on Ethereum Sepolia.

## 3. Engagement Scoring Engine

The scoring logic (`lib/scoring.ts`, `lib/llm-scoring.ts`) employs a primary **LLM-based evaluation** (Azure OpenAI GPT-4) with a deterministic **Rule-based fallback**.

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

2.  **Evaluation:** GPT-4 analyzes semantic depth; heuristic engine validates against spam patterns.

3.  **Normalization:** Scores clamped 0-100 and weighted.

4.  **Persistence:** Score recorded in `casts` table; aggregates updated in `user_stats`.

## 4. Technical Stack & Deployments

### 4.1. Core Infrastructure

* **Frontend**: Next.js 15 (App Router), TypeScript.

* **Auth**: Privy (Farcaster OAuth).

* **Intelligence**: Azure OpenAI (`gpt-4o`).

* **Database**: Supabase (PostgreSQL).

### 4.2. Smart Contract Deployments (Sepolia)

The protocol utilizes the Superfluid stack for continuous distribution.

* **LUNO Supertoken**: `0xE58C945fbb1f2c5e7398f1a4b9538f52778b31a7` (ERC-20 Superfluid Wrapper)

* **GDA Pool Contract**: `0x2cc199976B4ACBe4211E943c1E7F070d76570D4e` (General Distribution Agreement)

* **GDA Forwarder**: `0x6DA13Bde224A05a288748d857b9e7DDEffd1dE08`

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

## 6. Security

  * **Webhook Validation**: HMAC signature verification prevents replay attacks on the ingestion layer.

  * **Sybil Resistance**: Heuristic filters (regex matching on "farming" keywords) apply negative score weights (-30) to low-effort consensus spam.

  * **Row Level Security (RLS)**: Database policies restrict write access to the service role, preventing client-side score manipulation.

## 7. Team

* Shreyas - [@spapinwar](https://x.com/spapinwar)

* Hardik - [@Avadam21](https://x.com/Avadam21)

* Uddalak - [@ninja_writer21](https://x.com/ninja_writer21)

* Anish - [@anishbuilds](https://x.com/anishbuilds)
