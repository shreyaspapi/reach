const axios = require("axios");

async function main() {
    try {
        console.log("Fetching price feeds from Pyth Hermes...");
        const response = await axios.get("https://hermes.pyth.network/v2/price_feeds");
        const feeds = response.data;

        console.log(`Found ${feeds.length} feeds.`);

        const mstrFeeds = feeds.filter(f =>
            f.attributes.symbol.toLowerCase().includes("mstr") ||
            f.attributes.description.toLowerCase().includes("microstrategy")
        );

        if (mstrFeeds.length > 0) {
            console.log("Found MSTR feeds:");
            mstrFeeds.forEach(f => {
                console.log(`- Symbol: ${f.attributes.symbol}`);
                console.log(`  ID: ${f.id}`);
                console.log(`  Description: ${f.attributes.description}`);
            });
        } else {
            console.log("No MSTR feeds found.");
        }

    } catch (error) {
        console.error("Error fetching feeds:", error.message);
    }
}

main();
