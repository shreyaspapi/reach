import { supabaseAdmin } from '../lib/supabase';

/**
 * Script to seed initial campaigns into Supabase
 */

const campaigns = [
    {
        name: "Talk to Shreyas",
        description: "Shreyas LOVES attention. Seriously. Tweet at him, cast at him, meme him, roast him—anything you do to @spapinwar on X or @shreyaspapi on Farcaster earns you $LUNO, streamed directly into your wallet via Superfluid. The more chaotic (yet relevant), the higher your score. Help Shreyas achieve his final form: a man drowning in notifications.",
        target_fid: 291496, // You'll need to replace with actual FID
        target_username: "shreyaspapi",
        is_active: true,
        start_date: new Date().toISOString(),
        communication_quality_weight: 40,
        community_impact_weight: 30,
        consistency_weight: 20,
        active_campaign_weight: 10,
        min_score_for_reward: 50,
        reward_multiplier: 1.5,
        pool_total: "1,000,000 LUNO",
        x_handle: "@spapinwar",
        farcaster_handle: "@shreyaspapi",
        faq: [
            {
                question: "How do I earn tokens?",
                answer: "Engage with @spapinwar on X or @shreyaspapi on Farcaster. Your interactions are evaluated by AI for quality and relevance."
            },
            {
                question: "When do I receive rewards?",
                answer: "Rewards are streamed in real-time via Superfluid directly to your connected wallet as you engage."
            },
            {
                question: "What makes a good engagement?",
                answer: "Quality over quantity! Thoughtful replies, creative content, and relevant discussions score higher than spam."
            },
            {
                question: "How is my score calculated?",
                answer: "Your score is based on communication quality (40%), community impact (30%), consistency (20%), and campaign-specific engagement (10%)."
            }
        ]
    },
    {
        name: "Talk to Alex Chen",
        description: "Alex is building the future of decentralized social. Reach out to discuss Web3, DeFi, or just share your thoughts on the next big thing in crypto. Every meaningful conversation on X (@alexc_dev) or Farcaster (@alexc) earns you $LUNO tokens streamed in real-time.",
        target_fid: 0, // Replace with actual FID
        target_username: "alexc",
        is_active: true,
        start_date: new Date().toISOString(),
        communication_quality_weight: 40,
        community_impact_weight: 30,
        consistency_weight: 20,
        active_campaign_weight: 10,
        min_score_for_reward: 50,
        reward_multiplier: 1.2,
        pool_total: "2,000,000 LUNO",
        x_handle: "@alexc_dev",
        farcaster_handle: "@alexc",
        faq: [
            {
                question: "What topics interest Alex?",
                answer: "Web3, DeFi, decentralized social networks, and blockchain infrastructure."
            },
            {
                question: "How often should I engage?",
                answer: "Quality matters more than frequency. Regular, thoughtful interactions work best."
            },
            {
                question: "Can I collaborate on projects?",
                answer: "Yes! Share your ideas and projects. Collaborative discussions earn bonus points."
            }
        ]
    },
    {
        name: "Talk to Example User",
        description: "This is an example campaign. Interact with @exampleuser to earn $LUNO tokens. This placeholder demonstrates how multiple campaigns appear in the list.",
        target_fid: 0,
        target_username: "exampleuser",
        is_active: true,
        start_date: new Date().toISOString(),
        communication_quality_weight: 40,
        community_impact_weight: 30,
        consistency_weight: 20,
        active_campaign_weight: 10,
        min_score_for_reward: 50,
        reward_multiplier: 1.0,
        pool_total: "500,000 LUNO",
        x_handle: "@exampleuser",
        farcaster_handle: "@exampleuser",
        faq: [
            {
                question: "Is this a real campaign?",
                answer: "This is a demo campaign to showcase the platform features."
            }
        ]
    }
];

async function seedCampaigns() {
    if (!supabaseAdmin) {
        console.error('Supabase admin client not initialized');
        process.exit(1);
    }

    console.log('Starting campaign seeding...');

    for (const campaign of campaigns) {
        try {
            const { data, error } = await supabaseAdmin
                .from('campaigns')
                .insert([campaign])
                .select()
                .single();

            if (error) {
                console.error(`Error inserting campaign "${campaign.name}":`, error);
            } else {
                console.log(`✓ Successfully created campaign: ${campaign.name} (ID: ${data.id})`);
            }
        } catch (err) {
            console.error(`Failed to insert campaign "${campaign.name}":`, err);
        }
    }

    console.log('Campaign seeding completed!');
}

seedCampaigns().then(() => {
    console.log('Done!');
    process.exit(0);
}).catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
