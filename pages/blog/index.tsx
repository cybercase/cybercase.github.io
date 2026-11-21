import { GetStaticProps } from "next";
import Link from "next/link";
import React from "react";
import BaseLayout from "../../components/layouts/base";
import { SiteHeader } from "../../components/site-header";
import { getAllPosts } from "../../lib/api";
import { PostType, NextPageWithLayout } from "../../lib/constants";

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
    <nav className="content">
      {Array.from(postsByYear.entries()).map(([year, posts]) => {
        return (
          <React.Fragment key={year}>
            <h2 id={year}>{year}</h2>
            <ul>
              {posts.map((post) => {
                return (
                  <li key={post.slug}>
                    <Link href={`/blog/${post.slug}`}>
                      {post.coverTitle ?? post.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </React.Fragment>
        );
      })}
    </nav>
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
  const allPosts = getAllPosts(["slug", "title", "coverTitle", "date"]);
  return {
    props: { allPosts },
  };
};

export default Blog;
