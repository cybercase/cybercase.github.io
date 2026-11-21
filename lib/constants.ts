import { NextPage } from "next";
import { ComponentType, ReactElement, ReactNode } from "react";

export type NextPageWithLayout<P = object> = NextPage<P> & {
  getLayout?: (_page: ReactElement, _props: P) => ReactNode;
  layout?: ComponentType;
};

export const postMetaFields = [
  "slug",

  "title",
  "description",
  "date",

  "coverImage",
  "coverTitle",
  "coverSubtitle",
  "coverCaption",
  "coverDark",

  "content",
] as const;

export type PostField = (typeof postMetaFields)[number];
/** Front matter of a post (plus slug and raw content). Which fields are present depends on what getPostBySlug was asked for. */
export interface PostType {
  slug: string;
  title: string;
  description: string;
  date: string;
  coverImage?: string;
  coverTitle?: string;
  coverSubtitle?: string;
  coverCaption?: string;
  coverDark?: boolean;
  content: string;
}

export const baseUrl = `https://stefano.brilli.me`;
