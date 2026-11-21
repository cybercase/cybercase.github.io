import { Feed } from "feed";
import { baseUrl, PostType } from "./constants";

const postUrl = (slug: string) => `${baseUrl}/blog/${slug}/`;

/** `posts` must be sorted newest first, as returned by getAllPosts. */
export const generateRSSFeed = (posts: PostType[]) => {
  const author = {
    name: "Stefano Brilli",
    email: "stefano@brilli.me",
    link: baseUrl,
  };

  const feed = new Feed({
    title: "Stefano Brilli",
    description: "Articles by Stefano Brilli",
    copyright: "Stefano Brilli",
    generator: ".",
    id: baseUrl,
    link: baseUrl,
    language: "en",
    feedLinks: { rss: `${baseUrl}/feed.rss` },
    author,
    // Derived from the content (not the build time) so the feed is stable.
    updated: posts.length ? new Date(posts[0].date) : undefined,
  });

  // No item id: feed then emits the link as a permalink guid.
  posts.forEach((post) => {
    feed.addItem({
      title: post.title,
      link: postUrl(post.slug),
      description: post.description,
      author: [author],
      date: new Date(post.date),
    });
  });

  return feed;
};
