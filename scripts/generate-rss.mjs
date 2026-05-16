import fs from 'fs/promises';
import path from 'path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import matter from 'gray-matter';
import sanitizeHtml from 'sanitize-html';

const BLOG_DIR = path.resolve(process.cwd(), 'src', 'data', 'blog');
const OUT_DIR = path.resolve(process.cwd(), 'dist');
const OUT_FILE = path.join(OUT_DIR, 'rss.xml');

async function listFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const res = path.join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...(await listFiles(res)));
    } else if (e.isFile()) {
      files.push(res);
    }
  }
  return files;
}

function removeMdxJsx() {
  return () => (tree) => {
    visit(tree, (node, index, parent) => {
      if (!parent) return;
      if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
        // Replace component with nothing (drop it). If it has textual children you may preserve them instead.
        parent.children.splice(index, 1);
      }
    });
  };
}

async function mdxToHtml(source) {
  const vfile = await unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(removeMdxJsx)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(source);
  return String(vfile);
}

function formatRss(items) {
  const now = new Date().toUTCString();
  const channel = [];
  channel.push('<?xml version="1.0" encoding="UTF-8"?>');
  channel.push('<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">');
  channel.push('<channel>');
  channel.push(`<title>${escapeXml(process.env.SITE_TITLE || 'Site')}</title>`);
  channel.push(`<link>${escapeXml(process.env.SITE_URL || '')}</link>`);
  channel.push(`<description>${escapeXml(process.env.SITE_DESC || '')}</description>`);
  channel.push(`<lastBuildDate>${now}</lastBuildDate>`);
  for (const it of items) {
    channel.push('<item>');
    channel.push(`<title>${escapeXml(it.title || '')}</title>`);
    channel.push(`<link>${escapeXml(it.link || '')}</link>`);
    channel.push(`<guid isPermaLink="true">${escapeXml(it.link || '')}</guid>`);
    channel.push(`<description>${escapeXml(it.description || '')}</description>`);
    channel.push(`<pubDate>${new Date(it.pubDate).toUTCString()}</pubDate>`);
    channel.push('<content:encoded><![CDATA[');
    channel.push(it.content || '');
    channel.push(']]></content:encoded>');
    channel.push('</item>');
  }
  channel.push('</channel>');
  channel.push('</rss>');
  return channel.join('\n');
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function main() {
  const files = await listFiles(BLOG_DIR);
  const posts = [];
  for (const file of files) {
    if (!/\.(md|mdx)$/.test(file)) continue;
    const src = await fs.readFile(file, 'utf8');
    const { data, content } = matter(src);
    let html = '';
    try {
      html = await mdxToHtml(content);
    } catch (err) {
      // fallback: use raw content escaped
      html = escapeXml(content);
    }
    const cleaned = sanitizeHtml(html, {
      allowedTags: [
        'a','p','img','ul','li','ol','strong','em','code','pre','blockquote',
        'h1','h2','h3','h4','h5','h6','br','span','div'
      ],
      allowedAttributes: { '*': ['href','src','alt','title','class','id','width','height'] },
      transformTags: {
        '*': (tagName, attribs) => {
          Object.keys(attribs).forEach(k => { if (k.startsWith('data-astro')) delete attribs[k]; });
          return { tagName, attribs };
        }
      }
    });

    const slug = data.slug || path.basename(file).replace(/\.mdx?$/,'');
    const link = (process.env.SITE_URL || '') + '/posts/' + slug + '/';
    posts.push({
      title: data.title || slug,
      description: data.description || '',
      pubDate: data.modDatetime ?? data.pubDatetime ?? new Date().toISOString(),
      content: cleaned,
      link,
    });
  }

  // sort by pubDate desc
  posts.sort((a,b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  const xml = formatRss(posts);
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(OUT_FILE, xml, 'utf8');
  console.log('Wrote', OUT_FILE);
}

main().catch(err => { console.error(err); process.exit(1); });
