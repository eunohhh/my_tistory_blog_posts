const axios = require("axios");
const xml2js = require("xml2js");
const md = require("markdown-it")({
    html: true,
});
const fs = require("fs");
const path = require("path");
const slugify = require("slugify");

const RSS_URL = "https://infistudy.tistory.com/rss";

(async () => {
    try {
        const response = await axios.get(RSS_URL, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                Accept: "*/*",
            },
        });

        const feed = await xml2js.parseStringPromise(response.data);
        const items = feed.rss.channel[0].item;
        console.log(`Fetched ${items.length} items from RSS feed.`);

        if (!fs.existsSync("posts")) {
            fs.mkdirSync("posts");
            console.log("Created posts directory.");
        } else {
            console.log("Posts directory already exists.");
        }

        items.forEach((item) => {
            const title = item.title[0];
            const content = item.description[0];
            console.log(`Processing item: ${title}`);

            const markdownContent = md.render(content);
            const fileName = path.join("posts", `${slugify(title, { remove: /[*+~.()'"!:@]/g, lower: true })}.md`);
            fs.writeFileSync(fileName, markdownContent, "utf8");
            console.log(`Created file: ${fileName}`);
        });

        console.log("RSS feed converted to markdown files.");
    } catch (error) {
        console.error("Failed to fetch and convert RSS feed:", error);
    }
})();
