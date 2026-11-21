import { Feed } from "feed";
import { baseUrl, PostType } from "./constants";

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
