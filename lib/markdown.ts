import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import smartypants from "remark-smartypants";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import type { Root, Element, ElementContent } from "hast";

// Open links to other sites in a new tab. Only Markdown links are affected:
// raw HTML in posts is passed through as-is, with its own attributes.
function rehypeExternalLinks() {
  const visit = (node: Root | ElementContent) => {
    if (node.type === "element") {
      const href = node.properties.href;
      if (
        node.tagName === "a" &&
        typeof href === "string" &&
        /^https?:\/\//.test(href)
      ) {
        node.properties.target = "_blank";
        node.properties.rel = ["noopener", "noreferrer"];
      }
    }
    if ("children" in node) {
      (node.children as (Element | ElementContent)[]).forEach(visit);
    }
  };
  return (tree: Root) => visit(tree);
}

export async function markdownToHtml(markdown: string) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(smartypants)
    .use(remarkMath, { singleDollarTextMath: false })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeExternalLinks)
    // Auto-detect the language of unlabeled code blocks (the default before
    // rehype-highlight 6); most posts use unlabeled, indented code blocks.
    .use(rehypeHighlight, { detect: true })
    .use(rehypeKatex)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);

  // rehype-katex reports invalid LaTeX as messages instead of throwing:
  // fail the build so broken math never gets published.
  const mathErrors = file.messages.filter((m) => m.source === "rehype-katex");
  if (mathErrors.length) {
    throw new Error(mathErrors.map((m) => m.toString()).join("\n"));
  }

  return String(file);
}
