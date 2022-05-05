import { NextPage } from "next";
import { ComponentType, ReactElement, ReactNode } from "react";

export type NextPageWithLayout<P = {}> = NextPage<P> & {
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

export type PostField = typeof postMetaFields[number];
export type PostType = { [k in typeof postMetaFields[number]]: any };

export const baseUrl = `https://stefano.brilli.me`;
