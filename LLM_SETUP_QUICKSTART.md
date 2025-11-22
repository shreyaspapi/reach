# LLM Scoring - Quick Start Guide

## What Changed?

The scoring system now uses **Azure OpenAI GPT-4.1** instead of rule-based algorithms. This provides intelligent, context-aware evaluation of cast quality.

## Setup in 5 Minutes

### Step 1: Create Azure OpenAI Resource

1. Go to [Azure Portal](https://portal.azure.com)
2. Create **Azure OpenAI** resource
3. Deploy **GPT-4** model (name it `gpt-4`)
4. Copy **Endpoint** and **API Key**

### Step 2: Add Environment Variables

Add to `.env.local`:

```bash
AZURE_OPENAI_ENDPOINT=https://spapi-m6bybx3p-eastus2.cognitiveservices.azure.com/
AZURE_OPENAI_API_KEY=your_api_key_here
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_MODEL_NAME=gpt-4o
AZURE_OPENAI_API_VERSION=2024-04-01-preview
```

**Note**: Replace `your_api_key_here` with your actual Azure OpenAI API key.

### Step 3: Restart Server

```bash
npm run dev
```

### Step 4: Test

```bash
./test-webhook.sh
```

Look for:
```
🤖 Calculating engagement score with AI...
🤖 AI ANALYSIS:
   Summary: [LLM's assessment of the cast]
```

## What You Get

### Before (Rule-Based)
- Simple keyword matching
- Basic spam detection
- Fixed scoring logic
- No context understanding

### After (LLM-Based)
- ✅ **Context-aware evaluation**
- ✅ **Sophisticated spam/farming detection**
- ✅ **Nuanced quality assessment**
- ✅ **Explainable reasoning**
- ✅ **Adaptive to content type**

## Example Output

```
🔔 CAST DETECTED from Registered User
   User: @testuser (FID: 123456)
   Text: This is a thoughtful question about...
───────────────────────────────────────────────────
🤖 Calculating engagement score with AI...
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
───────────────────────────────────────────────────
✅ User synced: testuser (ID: xxx)
✅ Cast saved to database (ID: xxx)
```

## Cost

- ~$0.015 per cast evaluation (~1.5 cents)
- For 1000 casts/day = ~$15/day
- Can optimize with caching, batching, or GPT-4-mini

## Fallback

If Azure OpenAI is unavailable:
- System automatically falls back to rule-based scoring
- No downtime
- Logs indicate fallback is being used

## Files Modified

1. **lib/llm-scoring.ts** - New LLM-based scoring service
2. **app/api/webhooks/neynar/route.ts** - Updated to use LLM scoring
3. **env.example.txt** - Added Azure OpenAI variables
4. **package.json** - Added `openai` package

## Documentation

- **LLM_SCORING.md** - Complete LLM scoring documentation
- **LLM_SETUP_QUICKSTART.md** - This file
- **SCORING_SYSTEM.md** - Original scoring system docs (now outdated)

## Troubleshooting

### "Azure OpenAI client not initialized"
→ Add Azure environment variables to `.env.local`

### "Error calling Azure OpenAI"
→ Check API key, endpoint, and deployment name

### "Falling back to rule-based scoring"
→ LLM call failed, check Azure OpenAI service status

## Next Steps

1. ✅ Set up Azure OpenAI
2. ✅ Add environment variables
3. ✅ Test with sample casts
4. 📊 Monitor costs in Azure Portal
5. 🎨 Customize prompts if needed
6. 🚀 Deploy to production

---

**Need detailed docs?** See `LLM_SCORING.md`

**Questions?** Check Azure OpenAI documentation or the troubleshooting section above.

