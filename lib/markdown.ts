import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import smartypants from "remark-smartypants";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";

export async function markdownToHtml(markdown: string) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(smartypants)
    .use(remarkMath, { singleDollarTextMath: false })
    .use(remarkRehype, { allowDangerousHtml: true })
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
