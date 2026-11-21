import fs from "fs";
import { join } from "path";
import { getAllPosts } from "../lib/api";
import { generateRSSFeed } from "../lib/feed";

const outDir = join(process.cwd(), "out");
const feed = generateRSSFeed(
  getAllPosts(["slug", "title", "description", "date"])
);
fs.writeFileSync(join(outDir, "feed.rss"), feed.rss2());
console.log(`Wrote ${join("out", "feed.rss")}`);
