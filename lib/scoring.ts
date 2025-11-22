/**
 * Scoring System for User Engagement
 * 
 * Weights:
 * - Communication Quality: 4/10 (40%)
 * - Community Impact: 3/10 (30%)
 * - Consistency: 2/10 (20%)
 * - Talk to Shreyas (Active Campaign): 1/10 (10%)
 */

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

// In-memory storage for user history (should be replaced with database in production)
const userHistoryMap = new Map<number, UserHistory>();

/**
 * Calculate Communication Quality Score (40% weight)
 * Evaluates the quality and substance of the cast content
 */
function calculateCommunicationQuality(cast: CastData): number {
    let score = 0;
    const text = cast.text || '';
    
    // 1. Length check (meaningful content, not spam)
    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount >= 10 && wordCount <= 280) {
        score += 25; // Good length
    } else if (wordCount >= 5 && wordCount < 10) {
        score += 15; // Short but acceptable
    } else if (wordCount > 280) {
        score += 10; // Too long might be spam
    } else {
        score += 5; // Too short, likely low quality
    }
    
    // 2. Check for spam patterns (repeated characters, excessive emojis)
    const hasExcessiveRepetition = /(.)\1{4,}/.test(text);
    const emojiCount = (text.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
    const emojiRatio = emojiCount / Math.max(wordCount, 1);
    
    if (hasExcessiveRepetition || emojiRatio > 0.3) {
        score -= 20; // Likely spam or low quality
    }
    
    // 3. Substance check (questions, insights, meaningful engagement)
    const hasQuestion = /\?/.test(text);
    const hasThoughtfulWords = /\b(think|believe|consider|interesting|insightful|perspective|analysis|understand|explain|why|how)\b/i.test(text);
    const hasLinks = cast.embeds && cast.embeds.length > 0;
    
    if (hasQuestion) score += 15;
    if (hasThoughtfulWords) score += 20;
    if (hasLinks) score += 10;
    
    // 4. Check for sybil/farming patterns
    const hasFarmingKeywords = /\b(gm|gn|ser|fren|lfg|wagmi|ngmi)\b/i.test(text);
    const isOnlyFarmingKeywords = hasFarmingKeywords && wordCount <= 3;
    
    if (isOnlyFarmingKeywords) {
        score -= 30; // Likely farming
    }
    
    // 5. User reputation (power badge indicates quality user)
    if (cast.author.power_badge) {
        score += 15;
    }
    
    // Normalize to 0-100
    return Math.max(0, Math.min(100, score));
}

/**
 * Calculate Community Impact Score (30% weight)
 * Measures the engagement and reach of the cast
 */
function calculateCommunityImpact(cast: CastData): number {
    let score = 0;
    
    const reactions = cast.reactions || { likes_count: 0, recasts_count: 0, replies_count: 0 };
    const followerCount = cast.author.follower_count || 0;
    
    // 1. Engagement metrics (weighted by importance)
    const likesScore = Math.min(reactions.likes_count * 2, 30);
    const recastsScore = Math.min(reactions.recasts_count * 5, 40); // Recasts are more valuable
    const repliesScore = Math.min(reactions.replies_count * 3, 30);
    
    score += likesScore + recastsScore + repliesScore;
    
    // 2. Reach potential (follower count)
    if (followerCount > 1000) {
        score += 20;
    } else if (followerCount > 500) {
        score += 15;
    } else if (followerCount > 100) {
        score += 10;
    } else {
        score += 5;
    }
    
    // 3. Channel participation (posting in relevant channels)
    if (cast.channel) {
        score += 10;
    }
    
    // Normalize to 0-100
    return Math.max(0, Math.min(100, score));
}

/**
 * Calculate Consistency Score (20% weight)
 * Rewards regular, consistent engagement over time
 */
function calculateConsistency(authorFid: number, currentTimestamp: string): number {
    let score = 50; // Base score
    
    const history = userHistoryMap.get(authorFid);
    
    if (!history || !history.lastCastTimestamp) {
        // First cast or no history
        return score;
    }
    
    const lastCastTime = new Date(history.lastCastTimestamp).getTime();
    const currentTime = new Date(currentTimestamp).getTime();
    const hoursSinceLastCast = (currentTime - lastCastTime) / (1000 * 60 * 60);
    
    // 1. Reward consistent posting (not too frequent, not too rare)
    if (hoursSinceLastCast >= 6 && hoursSinceLastCast <= 48) {
        score += 30; // Ideal frequency (6-48 hours)
    } else if (hoursSinceLastCast >= 2 && hoursSinceLastCast < 6) {
        score += 20; // Good frequency
    } else if (hoursSinceLastCast < 2) {
        score -= 20; // Too frequent, might be spamming
    } else if (hoursSinceLastCast > 48 && hoursSinceLastCast <= 168) {
        score += 10; // Occasional poster
    } else {
        score -= 10; // Very infrequent
    }
    
    // 2. Reward total engagement count
    if (history.castCount > 50) {
        score += 20;
    } else if (history.castCount > 20) {
        score += 15;
    } else if (history.castCount > 10) {
        score += 10;
    } else if (history.castCount > 5) {
        score += 5;
    }
    
    // Normalize to 0-100
    return Math.max(0, Math.min(100, score));
}

/**
 * Calculate Active Campaign Score (10% weight)
 * Bonus for directly engaging with Shreyas
 */
function calculateActiveCampaignScore(cast: CastData): number {
    let score = 0;
    
    // 1. Is this a reply to Shreyas?
    if (cast.parent_hash) {
        score += 50; // Replying to Shreyas (filtered by webhook)
    }
    
    // 2. Does it mention Shreyas?
    const mentionsShreyasPapi = cast.mentions?.some((mention: any) => 
        mention.username === 'shreyaspapi'
    ) || /shreyaspapi/i.test(cast.text);
    
    if (mentionsShreyasPapi) {
        score += 30;
    }
    
    // 3. Quality of engagement with Shreyas
    const text = cast.text || '';
    const isSubstantive = text.split(/\s+/).length >= 10;
    const hasQuestion = /\?/.test(text);
    
    if (isSubstantive) score += 20;
    if (hasQuestion) score += 10;
    
    // Penalize generic replies
    const isGenericReply = /^(gm|gn|thanks|thank you|nice|cool|great|agree|yes|no)$/i.test(text.trim());
    if (isGenericReply) {
        score -= 30;
    }
    
    // Normalize to 0-100
    return Math.max(0, Math.min(100, score));
}

/**
 * Calculate the overall engagement score
 * Returns a score between 0-100
 */
export function calculateEngagementScore(cast: CastData): {
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
} {
    const authorFid = cast.author.fid;
    
    // Calculate individual scores (0-100 each)
    const communicationQuality = calculateCommunicationQuality(cast);
    const communityImpact = calculateCommunityImpact(cast);
    const consistency = calculateConsistency(authorFid, cast.timestamp);
    const activeCampaign = calculateActiveCampaignScore(cast);
    
    // Define weights
    const weights = {
        communicationQuality: 0.4, // 40%
        communityImpact: 0.3,      // 30%
        consistency: 0.2,          // 20%
        activeCampaign: 0.1        // 10%
    };
    
    // Calculate weighted total score
    const totalScore = 
        (communicationQuality * weights.communicationQuality) +
        (communityImpact * weights.communityImpact) +
        (consistency * weights.consistency) +
        (activeCampaign * weights.activeCampaign);
    
    // Update user history
    const history = userHistoryMap.get(authorFid) || {
        castCount: 0,
        totalScore: 0,
        averageScore: 0
    };
    
    history.castCount += 1;
    history.lastCastTimestamp = cast.timestamp;
    history.totalScore += totalScore;
    history.averageScore = history.totalScore / history.castCount;
    
    userHistoryMap.set(authorFid, history);
    
    return {
        totalScore: Math.round(totalScore * 100) / 100,
        breakdown: {
            communicationQuality: Math.round(communicationQuality * 100) / 100,
            communityImpact: Math.round(communityImpact * 100) / 100,
            consistency: Math.round(consistency * 100) / 100,
            activeCampaign: Math.round(activeCampaign * 100) / 100
        },
        weights
    };
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

