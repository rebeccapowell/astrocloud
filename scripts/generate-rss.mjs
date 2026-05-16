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
const DEFAULT_SITE_URL = 'https://rebecca-powell.com/';

function resolveBaseUrl() {
  const configured =
    process.env.SITE_URL ||
    process.env.CF_PAGES_URL ||
    process.env.DEPLOY_URL ||
    process.env.DEPLOY_PRIME_URL ||
    process.env.URL ||
    DEFAULT_SITE_URL;

  return new URL(configured).origin;
}

function absolutizeUrl(value, baseUrl) {
  if (!value || value.startsWith('#')) return value;
  if (/^(?:[a-z]+:|\/\/)/i.test(value)) return value;

  try {
    return new URL(value, `${baseUrl}/`).toString();
  } catch {
    return value;
  }
}

function absolutizeSrcset(value, baseUrl) {
  return value
    .split(',')
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => {
      const [url, descriptor] = part.split(/\s+/, 2);
      const absoluteUrl = absolutizeUrl(url, baseUrl);
      return descriptor ? `${absoluteUrl} ${descriptor}` : absoluteUrl;
    })
    .join(', ');
}

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

function removeMdxJsx(postLink) {
  const placeholder = `<div class="mdx-component-placeholder">To experience this interactive component, please <a href="${postLink}">visit this post online</a>.</div>`;
  return () => (tree) => {
    visit(tree, node => {
      if (
        node.type === 'mdxjsEsm' ||
        node.type === 'mdxFlowExpression' ||
        node.type === 'mdxTextExpression'
      ) {
        node.type = 'html';
        node.value = '';
        delete node.children;
        return;
      }
      if (
        node.type === 'mdxJsxFlowElement' ||
        node.type === 'mdxJsxTextElement'
      ) {
        const md = node;
        md.type = 'html';
        md.value = placeholder;
        delete md.children;
      }
    });
  };
}

async function mdxToHtml(source, { isMdx = false, postLink = '' } = {}) {
  const processor = unified().use(remarkParse);
  if (isMdx) {
    processor.use(remarkMdx).use(removeMdxJsx(postLink));
  }
  const vfile = await processor
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(source);
  return String(vfile);
}

function formatRss(items) {
  const now = new Date().toUTCString();
  const baseUrl = resolveBaseUrl();
  const channel = [];
  channel.push('<?xml version="1.0" encoding="UTF-8"?>');
  channel.push('<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">');
  channel.push('<channel>');
  channel.push(`<title>${escapeXml(process.env.SITE_TITLE || 'Site')}</title>`);
  channel.push(`<link>${escapeXml(`${baseUrl}/`)}</link>`);
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
    channel.push(escapeCdata(it.content || ''));
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

function escapeCdata(s) {
  return String(s).replace(/]]>/g, ']]]]><![CDATA[>');
}

async function main() {
  const baseUrl = resolveBaseUrl();
  const files = await listFiles(BLOG_DIR);
  const posts = [];
  for (const file of files) {
    if (!/\.(md|mdx)$/.test(file)) continue;
    const src = await fs.readFile(file, 'utf8');
    const { data, content } = matter(src);
    const slug = data.slug || path.basename(file).replace(/\.mdx?$/,'');
    const link = new URL(`/posts/${slug}/`, `${baseUrl}/`).toString();
    let html = '';
    try {
      html = await mdxToHtml(content, { isMdx: file.endsWith('.mdx'), postLink: link });
    } catch (err) {
      // fallback: use raw content escaped
      html = escapeXml(content);
    }
    const cleaned = sanitizeHtml(html, {
      allowedTags: [
        'a','p','img','ul','li','ol','strong','em','code','pre','blockquote',
        'h1','h2','h3','h4','h5','h6','br','span','div'
      ],
      allowedAttributes: { '*': ['href','src','srcset','poster','alt','title','class','id','width','height','style'] },
      transformTags: {
        '*': (tagName, attribs) => {
          Object.keys(attribs).forEach(k => { if (k.startsWith('data-astro')) delete attribs[k]; });

          if (attribs.href) {
            attribs.href = absolutizeUrl(attribs.href, baseUrl);
          }

          if (attribs.src) {
            attribs.src = absolutizeUrl(attribs.src, baseUrl);
          }

          if (attribs.poster) {
            attribs.poster = absolutizeUrl(attribs.poster, baseUrl);
          }

          if (attribs.srcset) {
            attribs.srcset = absolutizeSrcset(attribs.srcset, baseUrl);
          }

          return { tagName, attribs };
        }
      }
    });

    const normalized = cleaned.trim();
    const hasContent = normalized && normalized !== '<div></div>';
    posts.push({
      title: data.title || slug,
      description: data.description || '',
      pubDate: data.modDatetime ?? data.pubDatetime ?? new Date().toISOString(),
      content: hasContent ? cleaned : `<p>${escapeXml(data.description || '')}</p><p><a href="${escapeXml(link)}">Read this post online</a>.</p>`,
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
