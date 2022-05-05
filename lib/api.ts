import fs from "fs";
import { join } from "path";
import matter from "gray-matter";
import { PostField, PostType } from "./constants";

const postsDirectory = join(process.cwd(), "posts");

function getPostSlugsWithFileExt() {
  return fs.readdirSync(postsDirectory);
}

export function getPostBySlug(
  slugWithExt: string,
  fields: readonly PostField[] = []
): PostType {
  const realSlug = slugWithExt.replace(/\.md$/, "");
  const fullPath = join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const items: { [k: string]: string } = {};

  fields.forEach((field) => {
    if (field === "slug") {
      items[field] = realSlug;
    }
    if (field === "content") {
      items[field] = content;
    }

    if (typeof data[field] !== "undefined") {
      items[field] = data[field];
    }
  });

  return items as PostType;
}

export function getAllPosts(fields: readonly PostField[] = []): PostType[] {
  const slugs = getPostSlugsWithFileExt();
  const posts = slugs
    .map((slug) => getPostBySlug(slug, fields))
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
}
