import { AzureOpenAI } from 'openai';

// Azure OpenAI Configuration
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-04-01-preview';
const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const modelName = process.env.AZURE_OPENAI_MODEL_NAME || 'gpt-4o';
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';

if (!endpoint || !apiKey) {
    console.warn('Azure OpenAI credentials not found. LLM scoring will not work.');
}

// Initialize Azure OpenAI client
const options = { endpoint, apiKey, deployment, apiVersion };
const client = endpoint && apiKey
    ? new AzureOpenAI(options)
    : null;

interface CastData {
    text: string;
    hash: string;
    timestamp: string;
    author: {
        fid: number;
        username: string;
        follower_count?: number;
        following_count?: number;
        power_badge?: boolean;
    };
    reactions?: {
        likes_count: number;
        recasts_count: number;
        replies_count: number;
    };
    parent_hash?: string;
    embeds?: any[];
    mentions?: any[];
    channel?: any;
}

interface UserHistory {
    castCount: number;
    lastCastTimestamp?: string;
    totalScore: number;
    averageScore: number;
}

// In-memory storage for user history
const userHistoryMap = new Map<number, UserHistory>();

/**
 * Structured output schema for LLM scoring
 */
interface ScoringResponse {
    communication_quality: {
        score: number;
        reasoning: string;
        flags: {
            is_spam: boolean;
            is_farming: boolean;
            is_substantive: boolean;
            has_thoughtful_content: boolean;
        };
    };
    community_impact: {
        score: number;
        reasoning: string;
        engagement_quality: string;
    };
    consistency: {
        score: number;
        reasoning: string;
    };
    active_campaign: {
        score: number;
        reasoning: string;
        engagement_type: string;
    };
    overall_assessment: {
        total_score: number;
        summary: string;
        quality_tier: 'excellent' | 'good' | 'fair' | 'poor';
    };
}

/**
 * Calculate engagement score using Azure OpenAI GPT-4
 */
export async function calculateEngagementScore(cast: CastData): Promise<{
    totalScore: number;
    breakdown: {
        communicationQuality: number;
        communityImpact: number;
        consistency: number;
        activeCampaign: number;
    };
    weights: {
        communicationQuality: number;
        communityImpact: number;
        consistency: number;
        activeCampaign: number;
    };
    reasoning?: {
        communicationQuality: string;
        communityImpact: string;
        consistency: string;
        activeCampaign: string;
        summary: string;
    };
    flags?: {
        is_spam: boolean;
        is_farming: boolean;
        is_substantive: boolean;
    };
}> {
    if (!client) {
        console.error('Azure OpenAI client not initialized. Falling back to rule-based scoring.');
        return fallbackScoring(cast);
    }

    try {
        const authorFid = cast.author.fid;
        const history = userHistoryMap.get(authorFid);

        // Prepare context for the LLM
        const prompt = buildScoringPrompt(cast, history);

        // Call Azure OpenAI with structured output
        const response = await client.chat.completions.create({
            model: modelName,
            messages: [
                {
                    role: 'system',
                    content: SYSTEM_PROMPT
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            response_format: {
                type: 'json_schema',
                json_schema: {
                    name: 'cast_scoring',
                    strict: true,
                    schema: SCORING_SCHEMA
                }
            },
            temperature: 0.3, // Lower temperature for more consistent scoring
            max_tokens: 1000
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No response from LLM');
        }

        const scoringResult: ScoringResponse = JSON.parse(content);

        // Extract scores
        const breakdown = {
            communicationQuality: scoringResult.communication_quality.score,
            communityImpact: scoringResult.community_impact.score,
            consistency: scoringResult.consistency.score,
            activeCampaign: scoringResult.active_campaign.score
        };

        // Define weights
        const weights = {
            communicationQuality: 0.4, // 40%
            communityImpact: 0.3,      // 30%
            consistency: 0.2,          // 20%
            activeCampaign: 0.1        // 10%
        };

        // Calculate weighted total score
        const totalScore = 
            (breakdown.communicationQuality * weights.communicationQuality) +
            (breakdown.communityImpact * weights.communityImpact) +
            (breakdown.consistency * weights.consistency) +
            (breakdown.activeCampaign * weights.activeCampaign);

        // Update user history
        updateUserHistory(authorFid, cast.timestamp, totalScore);

        return {
            totalScore: Math.round(totalScore * 100) / 100,
            breakdown: {
                communicationQuality: Math.round(breakdown.communicationQuality * 100) / 100,
                communityImpact: Math.round(breakdown.communityImpact * 100) / 100,
                consistency: Math.round(breakdown.consistency * 100) / 100,
                activeCampaign: Math.round(breakdown.activeCampaign * 100) / 100
            },
            weights,
            reasoning: {
                communicationQuality: scoringResult.communication_quality.reasoning,
                communityImpact: scoringResult.community_impact.reasoning,
                consistency: scoringResult.consistency.reasoning,
                activeCampaign: scoringResult.active_campaign.reasoning,
                summary: scoringResult.overall_assessment.summary
            },
            flags: scoringResult.communication_quality.flags
        };

    } catch (error) {
        console.error('Error calling Azure OpenAI for scoring:', error);
        console.log('Falling back to rule-based scoring');
        return fallbackScoring(cast);
    }
}

/**
 * Build the prompt for LLM scoring
 */
function buildScoringPrompt(cast: CastData, history?: UserHistory): string {
    const wordCount = cast.text.trim().split(/\s+/).length;
    const reactions = cast.reactions || { likes_count: 0, recasts_count: 0, replies_count: 0 };
    
    let prompt = `Evaluate this Farcaster cast for engagement quality:

CAST CONTENT:
"${cast.text}"

CAST METADATA:
- Author: @${cast.author.username} (FID: ${cast.author.fid})
- Word Count: ${wordCount}
- Followers: ${cast.author.follower_count || 0}
- Power Badge: ${cast.author.power_badge ? 'Yes' : 'No'}
- Likes: ${reactions.likes_count}
- Recasts: ${reactions.recasts_count}
- Replies: ${reactions.replies_count}
- Is Reply: ${cast.parent_hash ? 'Yes (replying to @shreyaspapi)' : 'No'}
- Has Links/Embeds: ${cast.embeds && cast.embeds.length > 0 ? 'Yes' : 'No'}
- Posted in Channel: ${cast.channel ? 'Yes' : 'No'}
`;

    if (history) {
        const hoursSinceLastCast = history.lastCastTimestamp 
            ? (new Date(cast.timestamp).getTime() - new Date(history.lastCastTimestamp).getTime()) / (1000 * 60 * 60)
            : null;

        prompt += `
USER HISTORY:
- Total Casts: ${history.castCount}
- Average Score: ${history.averageScore.toFixed(2)}/100
- Hours Since Last Cast: ${hoursSinceLastCast ? hoursSinceLastCast.toFixed(1) : 'N/A (first cast)'}
`;
    } else {
        prompt += `
USER HISTORY:
- This is the user's first tracked cast
`;
    }

    prompt += `
SCORING CRITERIA:

1. COMMUNICATION QUALITY (0-100):
   - Content substance and depth
   - Spam/farming detection (gm, gn, ser, fren, repetitive text)
   - Thoughtful language and insights
   - Questions and meaningful engagement
   - Avoid rewarding low-effort or sybil behavior

2. COMMUNITY IMPACT (0-100):
   - Engagement metrics (likes, recasts, replies)
   - Follower reach and influence
   - Channel participation
   - Quality of engagement received

3. CONSISTENCY (0-100):
   - Posting frequency (ideal: 6-48 hours between casts)
   - Too frequent (<2 hours) = likely spam
   - Total engagement history
   - Sustained participation

4. ACTIVE CAMPAIGN (0-100):
   - Direct engagement with @shreyaspapi
   - Quality of reply/mention
   - Substantive vs generic responses
   - Thoughtful questions or insights

Score each dimension 0-100, identify spam/farming, and provide reasoning.`;

    return prompt;
}

/**
 * System prompt for the LLM
 */
const SYSTEM_PROMPT = `You are an expert evaluator of social media engagement quality for a decentralized platform. Your role is to:

1. Assess the quality and authenticity of user-generated content
2. Identify spam, farming, and sybil behavior
3. Reward thoughtful, substantive engagement
4. Penalize low-effort, repetitive, or manipulative content
5. Consider context like user history and engagement metrics

Be strict but fair. High scores (80+) should be reserved for truly excellent content. Most content should fall in the 40-70 range. Obvious spam/farming should score below 30.

Provide clear reasoning for your scores to help users understand how to improve.`;

/**
 * JSON Schema for structured output
 */
const SCORING_SCHEMA = {
    type: 'object',
    properties: {
        communication_quality: {
            type: 'object',
            properties: {
                score: { type: 'number', minimum: 0, maximum: 100 },
                reasoning: { type: 'string' },
                flags: {
                    type: 'object',
                    properties: {
                        is_spam: { type: 'boolean' },
                        is_farming: { type: 'boolean' },
                        is_substantive: { type: 'boolean' },
                        has_thoughtful_content: { type: 'boolean' }
                    },
                    required: ['is_spam', 'is_farming', 'is_substantive', 'has_thoughtful_content'],
                    additionalProperties: false
                }
            },
            required: ['score', 'reasoning', 'flags'],
            additionalProperties: false
        },
        community_impact: {
            type: 'object',
            properties: {
                score: { type: 'number', minimum: 0, maximum: 100 },
                reasoning: { type: 'string' },
                engagement_quality: { type: 'string' }
            },
            required: ['score', 'reasoning', 'engagement_quality'],
            additionalProperties: false
        },
        consistency: {
            type: 'object',
            properties: {
                score: { type: 'number', minimum: 0, maximum: 100 },
                reasoning: { type: 'string' }
            },
            required: ['score', 'reasoning'],
            additionalProperties: false
        },
        active_campaign: {
            type: 'object',
            properties: {
                score: { type: 'number', minimum: 0, maximum: 100 },
                reasoning: { type: 'string' },
                engagement_type: { type: 'string' }
            },
            required: ['score', 'reasoning', 'engagement_type'],
            additionalProperties: false
        },
        overall_assessment: {
            type: 'object',
            properties: {
                total_score: { type: 'number', minimum: 0, maximum: 100 },
                summary: { type: 'string' },
                quality_tier: { 
                    type: 'string',
                    enum: ['excellent', 'good', 'fair', 'poor']
                }
            },
            required: ['total_score', 'summary', 'quality_tier'],
            additionalProperties: false
        }
    },
    required: ['communication_quality', 'community_impact', 'consistency', 'active_campaign', 'overall_assessment'],
    additionalProperties: false
};

/**
 * Fallback rule-based scoring (if LLM fails)
 */
function fallbackScoring(cast: CastData): any {
    // Simple fallback scoring
    const text = cast.text || '';
    const wordCount = text.split(/\s+/).length;
    
    let commScore = 50;
    if (wordCount >= 10) commScore += 20;
    if (/\?/.test(text)) commScore += 10;
    if (/\b(gm|gn|ser)\b/i.test(text) && wordCount <= 3) commScore -= 30;
    
    const reactions = cast.reactions || { likes_count: 0, recasts_count: 0, replies_count: 0 };
    const impactScore = Math.min(50 + reactions.likes_count * 2 + reactions.recasts_count * 5, 100);
    
    const consistencyScore = 50;
    const campaignScore = cast.parent_hash ? 60 : 30;
    
    const breakdown = {
        communicationQuality: Math.max(0, Math.min(100, commScore)),
        communityImpact: impactScore,
        consistency: consistencyScore,
        activeCampaign: campaignScore
    };
    
    const weights = {
        communicationQuality: 0.4,
        communityImpact: 0.3,
        consistency: 0.2,
        activeCampaign: 0.1
    };
    
    const totalScore = 
        (breakdown.communicationQuality * weights.communicationQuality) +
        (breakdown.communityImpact * weights.communityImpact) +
        (breakdown.consistency * weights.consistency) +
        (breakdown.activeCampaign * weights.activeCampaign);
    
    updateUserHistory(cast.author.fid, cast.timestamp, totalScore);
    
    return {
        totalScore: Math.round(totalScore * 100) / 100,
        breakdown,
        weights,
        reasoning: {
            communicationQuality: 'Fallback scoring used',
            communityImpact: 'Fallback scoring used',
            consistency: 'Fallback scoring used',
            activeCampaign: 'Fallback scoring used',
            summary: 'LLM scoring unavailable, using rule-based fallback'
        }
    };
}

/**
 * Update user history
 */
function updateUserHistory(fid: number, timestamp: string, score: number): void {
    const history = userHistoryMap.get(fid) || {
        castCount: 0,
        totalScore: 0,
        averageScore: 0
    };
    
    history.castCount += 1;
    history.lastCastTimestamp = timestamp;
    history.totalScore += score;
    history.averageScore = history.totalScore / history.castCount;
    
    userHistoryMap.set(fid, history);
}

/**
 * Get user history for a specific FID
 */
export function getUserHistory(fid: number): UserHistory | undefined {
    return userHistoryMap.get(fid);
}

/**
 * Reset user history (useful for testing)
 */
export function resetUserHistory(fid?: number): void {
    if (fid) {
        userHistoryMap.delete(fid);
    } else {
        userHistoryMap.clear();
    }
}

