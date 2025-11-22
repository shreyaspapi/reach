# LLM-Based Scoring System

## Overview

The Reach platform now uses **Azure OpenAI GPT-4.1** to intelligently evaluate cast quality instead of rule-based scoring. This provides much more nuanced and accurate assessments of user engagement.

## Why LLM Scoring?

### Advantages over Rule-Based Scoring

1. **Context Understanding**: LLM understands nuance, sarcasm, and complex discussions
2. **Better Spam Detection**: Can identify sophisticated farming attempts
3. **Quality Assessment**: Evaluates actual substance, not just keywords
4. **Adaptive**: Learns from context and user history
5. **Explainable**: Provides reasoning for each score

### Example Comparison

**Cast**: "This is really interesting! I've been thinking about this problem for a while. What do you think about using ZK proofs for privacy?"

**Rule-Based**: Might score based on length, question mark, keywords
**LLM-Based**: Understands technical depth, genuine curiosity, domain knowledge

## How It Works

### 1. Data Collection

When a cast is received, we gather:
- Cast content and metadata
- Author information (followers, power badge, etc.)
- Engagement metrics (likes, recasts, replies)
- User history (previous casts, average score, posting frequency)

### 2. LLM Evaluation

The cast is sent to Azure OpenAI GPT-4.1 with:
- **System Prompt**: Instructions on how to evaluate engagement
- **User Prompt**: Cast data and context
- **Structured Output**: JSON schema for consistent scoring

### 3. Scoring Dimensions

The LLM evaluates four dimensions (0-100 each):

#### Communication Quality (40% weight)
- Content substance and depth
- Spam/farming detection
- Thoughtful language
- Questions and insights
- Anti-sybil measures

#### Community Impact (30% weight)
- Engagement quality
- Reach and influence
- Channel participation
- Meaningful interactions

#### Consistency (20% weight)
- Posting frequency (ideal: 6-48 hours)
- Sustained participation
- Engagement history
- Spam detection (too frequent posting)

#### Active Campaign (10% weight)
- Direct engagement with target (@shreyaspapi)
- Quality of replies/mentions
- Substantive vs generic responses
- Thoughtful questions

### 4. Weighted Score

Final score = weighted average of all dimensions

```
Total = (Comm Quality × 0.4) + (Impact × 0.3) + (Consistency × 0.2) + (Campaign × 0.1)
```

## Setup

### 1. Azure OpenAI Setup

#### Create Azure OpenAI Resource

1. Go to [Azure Portal](https://portal.azure.com)
2. Create a new resource → Search "Azure OpenAI"
3. Click "Create"
4. Fill in details:
   - Subscription: Your subscription
   - Resource group: Create new or use existing
   - Region: Choose closest to your users
   - Name: `reach-openai` (or your choice)
   - Pricing tier: Standard S0
5. Click "Review + Create" → "Create"
6. Wait for deployment (~2 minutes)

#### Deploy GPT-4 Model

1. Go to your Azure OpenAI resource
2. Click "Go to Azure OpenAI Studio"
3. Navigate to "Deployments" in left sidebar
4. Click "Create new deployment"
5. Select:
   - Model: `gpt-4` or `gpt-4-turbo` (GPT-4.1 if available)
   - Deployment name: `gpt-4` (or your choice)
   - Model version: Latest
6. Click "Create"

#### Get API Credentials

1. In Azure Portal, go to your OpenAI resource
2. Click "Keys and Endpoint" in left sidebar
3. Copy:
   - **Endpoint**: `https://your-resource.openai.azure.com/`
   - **Key 1**: Your API key

### 2. Environment Variables

Add to your `.env.local`:

```bash
# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://spapi-m6bybx3p-eastus2.cognitiveservices.azure.com/
AZURE_OPENAI_API_KEY=your_api_key_here
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_MODEL_NAME=gpt-4o
AZURE_OPENAI_API_VERSION=2024-04-01-preview
```

**Important**: 
- Replace `your_api_key_here` with your actual Azure OpenAI API key
- The endpoint is already configured for your Azure resource
- Using GPT-4o model for fast and accurate scoring

### 3. Restart Server

```bash
npm run dev
```

## Structured Output

The LLM returns a structured JSON response:

```typescript
{
  communication_quality: {
    score: 85,
    reasoning: "Thoughtful question about technical implementation...",
    flags: {
      is_spam: false,
      is_farming: false,
      is_substantive: true,
      has_thoughtful_content: true
    }
  },
  community_impact: {
    score: 70,
    reasoning: "Good engagement with 5 likes and 2 recasts...",
    engagement_quality: "high"
  },
  consistency: {
    score: 75,
    reasoning: "Posted 18 hours after last cast, good frequency..."
  },
  active_campaign: {
    score: 90,
    reasoning: "Direct reply to @shreyaspapi with substantive question...",
    engagement_type: "thoughtful_reply"
  },
  overall_assessment: {
    total_score: 80.5,
    summary: "High-quality technical engagement with thoughtful question",
    quality_tier: "excellent"
  }
}
```

## Prompt Engineering

### System Prompt

Instructs the LLM to:
- Assess quality and authenticity
- Identify spam, farming, sybil behavior
- Reward thoughtful engagement
- Penalize low-effort content
- Be strict but fair

### User Prompt

Provides:
- Cast content
- Author metadata
- Engagement metrics
- User history
- Scoring criteria

### Temperature

Set to `0.3` for consistent, deterministic scoring.

## Fallback Mechanism

If Azure OpenAI is unavailable or fails:
1. System logs the error
2. Falls back to simple rule-based scoring
3. Continues processing (no downtime)
4. Marks scores with "Fallback scoring used"

## Cost Optimization

### Estimated Costs

- GPT-4 Turbo: ~$0.01 per 1K input tokens, ~$0.03 per 1K output tokens
- Average cast evaluation: ~500 input + 300 output tokens
- Cost per cast: ~$0.015 (1.5 cents)

### Optimization Strategies

1. **Batch Processing**: Process multiple casts in one call (future)
2. **Caching**: Cache scores for duplicate content
3. **Rate Limiting**: Limit evaluations per user/hour
4. **Model Selection**: Use GPT-4-mini for lower costs if acceptable
5. **Token Limits**: Set max_tokens to control output length

## Monitoring

### Check LLM Usage

```bash
# View logs
npm run dev

# Look for:
# ✅ "LLM scoring successful"
# ❌ "Error calling Azure OpenAI"
# ⚠️  "Falling back to rule-based scoring"
```

### Azure Portal Monitoring

1. Go to Azure OpenAI resource
2. Click "Metrics" in left sidebar
3. Monitor:
   - Total calls
   - Token usage
   - Latency
   - Error rate

## Testing

### Test with Sample Cast

```bash
curl -X POST http://localhost:3000/api/webhooks/neynar \
  -H "Content-Type: application/json" \
  -d '{
    "type": "cast.created",
    "data": {
      "hash": "0xtest123",
      "author": {
        "fid": 123456,
        "username": "testuser",
        "display_name": "Test User",
        "follower_count": 100,
        "power_badge": false
      },
      "text": "This is a thoughtful question about decentralized social networks. How do you think privacy and scalability can be balanced in Web3 social platforms?",
      "timestamp": "2024-01-01T12:00:00Z",
      "parent_hash": "0xparent",
      "reactions": {
        "likes_count": 5,
        "recasts_count": 2,
        "replies_count": 1
      }
    }
  }'
```

### Expected Output

```
🔔 CAST DETECTED from Registered User
📊 ENGAGEMENT SCORE BREAKDOWN:
   ├─ Communication Quality (40%): 85.0/100
   ├─ Community Impact (30%):      70.0/100
   ├─ Consistency (20%):           75.0/100
   └─ Active Campaign (10%):       90.0/100
───────────────────────────────────────────────────
🎯 TOTAL SCORE: 80.5/100
───────────────────────────────────────────────────
🤖 AI ANALYSIS:
   Summary: High-quality technical engagement with thoughtful question
   Flags: {"is_spam":false,"is_farming":false,"is_substantive":true}
```

## Customization

### Adjust Scoring Criteria

Edit `lib/llm-scoring.ts` → `buildScoringPrompt()`:

```typescript
// Add custom criteria
prompt += `
ADDITIONAL CRITERIA:
- Bonus for technical depth
- Penalty for excessive emojis
- Reward for constructive criticism
`;
```

### Modify Weights

Change in `lib/llm-scoring.ts`:

```typescript
const weights = {
    communicationQuality: 0.5, // Increase to 50%
    communityImpact: 0.25,     // Decrease to 25%
    consistency: 0.15,         // Decrease to 15%
    activeCampaign: 0.1        // Keep at 10%
};
```

### Change Temperature

Higher = more creative, Lower = more consistent:

```typescript
temperature: 0.3, // 0.0 = deterministic, 1.0 = creative
```

## Troubleshooting

### "Azure OpenAI client not initialized"

**Cause**: Missing environment variables

**Fix**:
1. Check `.env.local` has all Azure variables
2. Restart dev server: `npm run dev`
3. Verify endpoint URL format: `https://xxx.openai.azure.com/`

### "Error calling Azure OpenAI"

**Causes**:
- Invalid API key
- Deployment not found
- Rate limit exceeded
- Network issues

**Fix**:
1. Verify API key in Azure Portal
2. Check deployment name matches `AZURE_OPENAI_DEPLOYMENT`
3. Check Azure OpenAI quotas and limits
4. Review error logs for specific message

### "Falling back to rule-based scoring"

**Cause**: LLM call failed, using fallback

**Impact**: Scores will be less accurate but system continues working

**Fix**: Resolve Azure OpenAI issues above

### High Latency

**Causes**:
- Slow LLM response
- Network latency
- Large prompts

**Fixes**:
1. Use GPT-4-turbo (faster than GPT-4)
2. Reduce max_tokens
3. Choose Azure region closer to your server
4. Consider caching for duplicate content

## Best Practices

1. **Monitor Costs**: Set up Azure cost alerts
2. **Rate Limiting**: Implement per-user rate limits
3. **Caching**: Cache scores for identical casts
4. **Error Handling**: Always have fallback mechanism
5. **Logging**: Log LLM responses for debugging
6. **Testing**: Test with various cast types
7. **Prompt Iteration**: Refine prompts based on results

## Security

- ✅ API keys stored in environment variables
- ✅ Never expose keys in client code
- ✅ Use Azure RBAC for access control
- ✅ Rotate API keys regularly
- ✅ Monitor for unusual usage patterns

## Future Enhancements

1. **Fine-tuning**: Train custom model on your data
2. **Batch Processing**: Process multiple casts per call
3. **Embeddings**: Use embeddings for similarity detection
4. **A/B Testing**: Compare LLM vs rule-based scores
5. **User Feedback**: Let users appeal scores
6. **Multi-model**: Use different models for different aspects

## Support

- **Azure OpenAI Docs**: https://learn.microsoft.com/en-us/azure/ai-services/openai/
- **OpenAI SDK**: https://github.com/openai/openai-node
- **Structured Outputs**: https://platform.openai.com/docs/guides/structured-outputs

---

**Status**: ✅ LLM scoring is now active!

**Last Updated**: November 22, 2025

