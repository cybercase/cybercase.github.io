import createEmotionServer from "@emotion/server/create-instance";
import { cache } from "@emotion/css";
import remarkMath from "remark-math";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import smartypants from "remark-smartypants";
import { baseUrl, PostType } from "./constants";
import { Feed } from "feed";
import remarkGfm from "remark-gfm";

export async function markdownToHtml(markdown: string) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(smartypants)
    .use(remarkMath, { singleDollarTextMath: false })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeHighlight)
    .use(rehypeKatex, { throwOnError: true, displayMode: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);
  return result.value;
}

export const extractStaticCss = async (html: string) => {
  if (html === undefined) {
    throw new Error("did you forget to return html from renderToString?");
  }
  const { extractCritical } = createEmotionServer(cache);
  const { ids, css } = extractCritical(html);

  return { html, ids, css };
};

export const generateRSSFeed = (posts: PostType[]) => {
  const author = {
    name: "Stefano Brilli",
    email: "stefano@brilli.me",
    link: "https://twitter.com/thecybercase",
  };

  const feed = new Feed({
    title: "Stefano Brilli",
    description: "Articles by Stefano Brilli",
    copyright: "Stefano Brilli",
    generator: ".",
    id: baseUrl,
    link: baseUrl,
    language: "en",
    feedLinks: `${baseUrl}/rss.xml`,
    author,
    updated: new Date(2022, 4, 6), // avoid changing the feed everytime it's built
  });

  // Add each article to the feed
  posts.forEach((post) => {
    feed.addItem({
      title: post.title,
      id: post.slug,
      link: `${baseUrl}/blog/${post.slug}`,
      description: post.description,
      // content: post.content,
      author: [author],
      date: new Date(post.date),
    });
  });

  return feed;
};

export function getAbsoluteURL(url: string) {
  const hasSiteURL = url.startsWith(baseUrl);
  const startsWithSlash = url[0] === "/";

  if (hasSiteURL) return url;
  if (startsWithSlash) return `${baseUrl}${url}`;
  return `${baseUrl}/${url}`;
}
