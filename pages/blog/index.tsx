import { GetStaticProps } from "next";
import Link from "next/link";
import React from "react";
import BaseLayout from "../../components/layouts/base";
import { SiteHeader } from "../../components/site-header";
import { getAllPosts } from "../../lib/api";
import {
  postMetaFields,
  PostType,
  NextPageWithLayout,
} from "../../lib/constants";
import { generateRSSFeed } from "../../lib/utils";
import fs from "fs";

export interface PostProps {
  allPosts: PostType[];
}

const Blog: NextPageWithLayout<PostProps> = ({ allPosts }: PostProps) => {
  const postsByYear = React.useMemo(() => {
    const res = new Map<string, PostProps["allPosts"]>();
    for (const post of allPosts) {
      const year = new Date(post.date).getFullYear();
      const yearLabel = isNaN(year) ? `` : year.toString();
      const posts = res.get(yearLabel) ?? [];
      posts.push(post);
      res.set(yearLabel, posts);
    }
    return res;
  }, [allPosts]);

  return (
    // <BaseLayout
    //   title={"Blog Archive"}
    //   description={"Blog of Stefano Brilli"}
    //   header={<SiteHeader coverDark={false} />}
    // >
    <nav className="content">
      {Array.from(postsByYear.entries()).map(([year, posts]) => {
        return (
          <React.Fragment key={year}>
            <h2 id={year}>{year}</h2>
            <ul>
              {posts.map((post) => {
                return (
                  <li key={post.date}>
                    <Link href={`/blog/${post.slug}`}>
                      <a>{post.coverTitle ?? post.title}</a>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </React.Fragment>
        );
      })}
    </nav>
    // </BaseLayout>
  );
};

Blog.getLayout = (page, pageProps) => {
  return (
    <BaseLayout
      title={"Blog Archive"}
      description={"Blog of Stefano Brilli"}
      header={<SiteHeader coverDark={false} />}
    >
      {page}
    </BaseLayout>
  );
};

export const getStaticProps: GetStaticProps<
  PostProps,
  { slug: string }
> = async () => {
  const allPosts = getAllPosts(postMetaFields);

  // Also create the feed
  const feed = generateRSSFeed(allPosts);
  fs.writeFileSync("public/feed.rss", feed.rss2());

  return {
    props: { allPosts },
  };
};

export default Blog;
