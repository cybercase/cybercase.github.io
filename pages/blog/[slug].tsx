import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";
import BaseLayout from "../../components/layouts/base";
import { SiteHeader } from "../../components/site-header";
import { getAllPosts, getPostBySlug } from "../../lib/api";
import {
  postMetaFields,
  PostType,
  NextPageWithLayout,
} from "../../lib/constants";
import { getAbsoluteURL } from "../../lib/url";
import { markdownToHtml } from "../../lib/markdown";

export interface PostProps {
  post: PostType;
}

const Post: NextPageWithLayout<PostProps> = ({ post }) => {
  const { asPath } = useRouter();
  const date = new Date(post.date);
  return (
    <>
      <Head>
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        {post.coverImage ? (
          <meta property="og:image" content={getAbsoluteURL(post.coverImage)} />
        ) : null}
        <meta property="og:url" content={getAbsoluteURL(asPath)} />
        <meta property="og:type" content="website" />
      </Head>
      <div className="content post-meta">
        <p className="post-date">
          <time dateTime={date.toISOString().slice(0, 10)}>
            {date.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            })}
          </time>
        </p>
      </div>
      <article
        className="content blog-article"
        lang="en"
        dangerouslySetInnerHTML={{ __html: post.content }}
      ></article>
    </>
  );
};

Post.getLayout = (page, props) => {
  return (
    <BaseLayout
      title={props.post.title}
      description={props.post.description}
      header={
        <SiteHeader
          cover={props.post.coverImage}
          coverTitle={props.post.coverTitle}
          coverCaption={props.post.coverCaption}
          coverDark={props.post.coverDark}
          coverSubtitle={props.post.coverSubtitle}
          coverTall={false}
        />
      }
    >
      {page}
    </BaseLayout>
  );
};

export default Post;

interface PostParams extends ParsedUrlQuery {
  slug: string;
}

export const getStaticProps: GetStaticProps<PostProps, PostParams> = async ({
  params,
}) => {
  const post = getPostBySlug(params!.slug, postMetaFields);
  const content = await markdownToHtml(post.content || "");
  return { props: { post: { ...post, content } } };
};

export const getStaticPaths: GetStaticPaths<PostParams> = async () => {
  const posts = getAllPosts(["slug"]);
  return {
    paths: posts.map((post) => {
      return {
        params: {
          slug: post.slug,
        },
      };
    }),
    fallback: false,
  };
};
