import rss from "@astrojs/rss";
import { getCollection, type CollectionEntry } from "astro:content";
import { getPath } from "@/utils/getPath";
import getSortedPosts from "@/utils/getSortedPosts";
import { SITE } from "@/config";

// Build/dev-friendly MDX -> HTML pipeline (no component execution)
import fs from "fs/promises";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";

// Sanitize feed HTML so RSS clients don't choke on injected scripts/styles
import sanitizeHtml from "sanitize-html";

export async function GET(context?: { site?: string }) {
  // If a static RSS was generated during build, prefer serving that so dev/build outputs match.
  try {
    const distPath = new URL('../../dist/rss.xml', import.meta.url).pathname;
    const stat = await fs.stat(distPath).catch(() => null);
    if (stat) {
      const xml = await fs.readFile(distPath, 'utf8');
      return new Response(xml, { headers: { 'content-type': 'application/xml' } });
    }
  } catch {
    // ignore and continue to dynamic generation
  }
  const posts = await getCollection("blog");
  const sortedPosts = getSortedPosts(posts) as CollectionEntry<"blog">[];

  // Use a safe MDX->HTML pipeline (no component execution) so feed is identical in dev and build

  const items: Array<Record<string, unknown>> = [];
  for (const post of sortedPosts) {
    const data = post.data;
    const id = post.id;
    const filePath = post.filePath;
    let rendered = "";

    // We'll prefer using the raw file and compiling MDX->HTML while stripping JSX (client-only)
    try {
      if (filePath) {
        // Only run the MDX pipeline for actual .mdx files. Plain .md posts can use post.rendered?.html
        if (filePath.endsWith('.md')) {
          rendered = post.rendered?.html ?? "";
        } else {
        const abs = filePath.startsWith('/') || filePath.match(/^[A-Za-z]:/) ? filePath : `./${filePath}`;
        const src = await fs.readFile(abs, 'utf8');

        // Remove MDX JSX nodes (client components) and convert to HTML
        const postLink = getPath(id, filePath);
        const placeholder = `<div class="mdx-component-placeholder" style="border:1px solid #e6e6e6;padding:8px;border-radius:6px;background:#fafafa;font-style:italic;color:#333;margin:8px 0">To experience this interactive component, please <a href="${postLink}">visit this post online</a>.</div>`;

        const processor = unified()
          .use(remarkParse)
          .use(remarkMdx)
          .use(() => (tree) => {
            visit(tree, (node) => {
              if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
                // mutate the node in-place into an HTML node placeholder linking to the live post
                const md = node as unknown as { type: string; value?: string; children?: unknown[] };
                md.type = 'html';
                md.value = placeholder;
                delete md.children;
              }
            });
          })
          .use(remarkRehype, { allowDangerousHtml: true })
          .use(rehypeStringify, { allowDangerousHtml: true });

        const vfile = await processor.process(src);
        rendered = String(vfile);
        }
      } else {
        rendered = post.rendered?.html ?? "";
      }
    } catch (err) {
      // fallback to pre-rendered HTML if available and log the error so it's visible during dev
      // eslint-disable-next-line no-console
      console.warn(`RSS: failed to compile MDX for post ${id} (${filePath}) — falling back to pre-rendered HTML`, err);
      rendered = post.rendered?.html ?? "";
    }

    // Sanitize the rendered HTML for feed consumers
    const defaultAllowedTags = [
      'a','p','img','ul','li','ol','strong','em','code','pre','blockquote',
      'h1','h2','h3','h4','h5','h6','br','span','div'
    ];

    const cleaned = sanitizeHtml(rendered, {
      allowedTags: defaultAllowedTags,
      allowedAttributes: {
        '*': [
          'href',
          'src',
          'alt',
          'title',
          'width',
          'height',
          'class',
          'id'
        ]
      },
      transformTags: {
        '*': (tagName: string, attribs: Record<string, string>) => {
          Object.keys(attribs).forEach(k => { if (k.startsWith('data-astro')) delete attribs[k]; });
          return { tagName, attribs };
        }
      }
    });

    items.push({
      link: getPath(id, filePath),
      title: data.title,
      description: data.description,
      pubDate: new Date(data.modDatetime ?? data.pubDatetime),
      content: cleaned,
    });
  }

  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: context?.site ?? SITE.website,
    items,
  });
}
