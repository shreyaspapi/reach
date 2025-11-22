# Engagement Scoring System

## Overview

This document describes the engagement scoring system used to evaluate user interactions with Shreyas (@shreyaspapi) on Farcaster.

## How It Works

### Flow

1. **Webhook Receives Event**: When someone mentions or replies to @shreyaspapi, the Neynar webhook fires
2. **User Validation**: The system checks if the user is registered with Privy
3. **Score Calculation**: If registered, the system calculates an engagement score (0-100)
4. **Logging**: The score and breakdown are logged for tracking
5. **Future Actions**: Score can be used to trigger rewards, Superfluid streams, or other incentives

### Scoring Metrics

The total score is calculated using four weighted metrics:

| Metric | Weight | Description |
|--------|--------|-------------|
| **Communication Quality** | 40% | Evaluates the quality and substance of the content |
| **Community Impact** | 30% | Measures engagement and reach |
| **Consistency** | 20% | Rewards regular, consistent engagement |
| **Active Campaign** | 10% | Bonus for directly engaging with Shreyas |

---

## 1. Communication Quality (40% Weight)

**Purpose**: Identify high-quality, meaningful content and filter out spam/farming.

### Scoring Factors

#### Content Length (up to 25 points)
- **25 points**: 10-280 words (ideal length)
- **15 points**: 5-10 words (short but acceptable)
- **10 points**: >280 words (might be too long)
- **5 points**: <5 words (too short, low quality)

#### Spam Detection (penalty)
- **-20 points**: Excessive character repetition (e.g., "hellooooooo")
- **-20 points**: Too many emojis (>30% emoji-to-word ratio)

#### Substance Indicators (up to 45 points)
- **+15 points**: Contains questions (?)
- **+20 points**: Uses thoughtful language (think, believe, consider, interesting, etc.)
- **+10 points**: Includes links/embeds

#### Anti-Farming (penalty)
- **-30 points**: Only contains farming keywords with ≤3 words (gm, gn, ser, fren, lfg, wagmi, ngmi)

#### User Reputation
- **+15 points**: User has a Farcaster power badge

### Examples

**High Score (85/100)**
```
"I think this is a really interesting perspective on decentralized social 
networks. How do you see this evolving over the next year? Would love to 
understand your thoughts on the technical challenges."
```
- Good length ✓
- Contains question ✓
- Thoughtful language ✓
- No spam ✓

**Low Score (20/100)**
```
"gm ser"
```
- Too short ✗
- Farming keywords ✗
- No substance ✗

---

## 2. Community Impact (30% Weight)

**Purpose**: Measure the reach and engagement of the cast.

### Scoring Factors

#### Engagement Metrics (up to 100 points)
- **Likes**: 2 points each (max 30 points)
- **Recasts**: 5 points each (max 40 points) - *most valuable*
- **Replies**: 3 points each (max 30 points)

#### Reach Potential (up to 20 points)
- **20 points**: >1,000 followers
- **15 points**: 500-1,000 followers
- **10 points**: 100-500 followers
- **5 points**: <100 followers

#### Channel Participation
- **+10 points**: Posted in a channel

### Examples

**High Impact Cast**
- 15 likes + 5 recasts + 3 replies
- 1,200 followers
- Posted in /farcaster channel
- **Score**: 30 + 25 + 9 + 20 + 10 = **94/100**

**Low Impact Cast**
- 0 likes, 0 recasts, 0 replies
- 50 followers
- No channel
- **Score**: 0 + 0 + 0 + 5 + 0 = **5/100**

---

## 3. Consistency (20% Weight)

**Purpose**: Reward regular, sustained engagement over time.

### Scoring Factors

#### Base Score
- **50 points**: Starting baseline

#### Posting Frequency (based on time since last cast)
- **+30 points**: 6-48 hours (ideal frequency)
- **+20 points**: 2-6 hours (good frequency)
- **-20 points**: <2 hours (too frequent, possible spam)
- **+10 points**: 48-168 hours (occasional poster)
- **-10 points**: >168 hours (very infrequent)

#### Total Engagement Count
- **+20 points**: >50 casts
- **+15 points**: 20-50 casts
- **+10 points**: 10-20 casts
- **+5 points**: 5-10 casts

### Examples

**Consistent User**
- Last cast: 24 hours ago
- Total casts: 35
- **Score**: 50 + 30 + 15 = **95/100**

**Spammer**
- Last cast: 1 hour ago
- Total casts: 3
- **Score**: 50 - 20 + 0 = **30/100**

---

## 4. Active Campaign (10% Weight)

**Purpose**: Reward direct engagement with Shreyas (@shreyaspapi).

### Scoring Factors

#### Reply to Shreyas
- **+50 points**: This is a reply to one of Shreyas's casts

#### Mentions Shreyas
- **+30 points**: Cast mentions @shreyaspapi

#### Quality of Engagement
- **+20 points**: Substantive content (≥10 words)
- **+10 points**: Contains a question

#### Generic Reply Penalty
- **-30 points**: Generic one-word replies (gm, thanks, nice, cool, agree, yes, no)

### Examples

**High-Quality Engagement**
- Reply to Shreyas ✓
- 25 words
- Contains question
- **Score**: 50 + 20 + 10 = **80/100**

**Low-Quality Engagement**
```
"thanks"
```
- Reply to Shreyas ✓
- Generic reply ✗
- **Score**: 50 - 30 = **20/100**

---

## Total Score Calculation

The final score is a weighted average:

```
Total Score = (Communication Quality × 0.4) + 
              (Community Impact × 0.3) + 
              (Consistency × 0.2) + 
              (Active Campaign × 0.1)
```

### Example Calculation

| Metric | Raw Score | Weight | Weighted Score |
|--------|-----------|--------|----------------|
| Communication Quality | 85/100 | 40% | 34.0 |
| Community Impact | 60/100 | 30% | 18.0 |
| Consistency | 75/100 | 20% | 15.0 |
| Active Campaign | 80/100 | 10% | 8.0 |
| **TOTAL** | | | **75.0/100** |

---

## Anti-Sybil Measures

The system includes several mechanisms to prevent farming and sybil attacks:

1. **Content Quality Checks**: Penalizes short, repetitive, or spam-like content
2. **Farming Keyword Detection**: Identifies and penalizes common farming phrases
3. **Frequency Limits**: Penalizes users who post too frequently
4. **Substance Requirements**: Rewards thoughtful, meaningful engagement
5. **Generic Reply Detection**: Penalizes low-effort replies

---

## User History Tracking

The system maintains history for each user:

- **Cast Count**: Total number of casts processed
- **Last Cast Timestamp**: Used for consistency scoring
- **Total Score**: Cumulative score across all casts
- **Average Score**: Average score per cast

This data is currently stored in-memory but should be moved to a database for production use.

---

## Integration Points

### Current Implementation

The webhook automatically:
1. Validates user registration with Privy
2. Calculates engagement score
3. Logs detailed breakdown
4. Tracks user history

### Future Enhancements (TODO)

1. **Database Storage**: Store scores and history in a persistent database
2. **Superfluid Integration**: Trigger payment streams based on scores
3. **Reward Tiers**: Define reward levels based on score ranges
4. **Analytics Dashboard**: Visualize user engagement over time
5. **Leaderboard**: Show top contributors

### Example Integration

```typescript
// Calculate reward amount based on score
function calculateReward(score: number): number {
    if (score >= 80) return 100; // High quality
    if (score >= 60) return 50;  // Good quality
    if (score >= 40) return 25;  // Acceptable
    return 10; // Minimal reward
}

// Trigger Superfluid stream
async function updateUserRewards(fid: number, amount: number) {
    // Implementation depends on your Superfluid setup
    // This could adjust flow rate, send one-time payment, etc.
}
```

---

## Testing

To test the scoring system:

1. Use the webhook testing script: `./test-webhook.sh`
2. Monitor the console output for score breakdowns
3. Adjust weights and thresholds as needed based on real-world data

---

## Configuration

### Adjusting Weights

To change the importance of different metrics, modify the weights in `/lib/scoring.ts`:

```typescript
const weights = {
    communicationQuality: 0.4, // 40%
    communityImpact: 0.3,      // 30%
    consistency: 0.2,          // 20%
    activeCampaign: 0.1        // 10%
};
```

### Tuning Thresholds

Individual scoring thresholds can be adjusted in each calculation function:
- `calculateCommunicationQuality()`
- `calculateCommunityImpact()`
- `calculateConsistency()`
- `calculateActiveCampaignScore()`

---

## Notes

- All scores are normalized to 0-100 range
- The system is designed to reward quality over quantity
- Anti-farming measures are built into every metric
- User history helps identify consistent, valuable contributors

