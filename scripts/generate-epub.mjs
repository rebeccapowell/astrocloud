#!/usr/bin/env node
/**
 * Generate EPUB output from return-on-intelligence-ebook.html.
 *
 * By default this writes an EPUB 3 file. Pass `--version=2` to write EPUB 2.
 * The HTML source is generated first if it does not already exist.
 *
 * Usage:
 *   node scripts/generate-epub.mjs
 *   node scripts/generate-epub.mjs --version=2
 *
 * Outputs:
 *   return-on-intelligence.epub        (EPUB 3)
 *   return-on-intelligence-epub2.epub  (EPUB 2)
 */

import { execFileSync } from "child_process";
import epub from "epub-gen-memory";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const renderEpub = typeof epub === "function" ? epub : epub.default;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const HTML_FILE = path.join(ROOT, "return-on-intelligence-ebook.html");
const EPUB3_FILE = path.join(ROOT, "return-on-intelligence.epub");
const EPUB2_FILE = path.join(ROOT, "return-on-intelligence-epub2.epub");

function getArgValue(name) {
  const direct = process.argv.find((arg) => arg.startsWith(`${name}=`));
  if (direct) return direct.slice(name.length + 1);

  const index = process.argv.indexOf(name);
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1];

  return undefined;
}

function stripTags(value) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function readMeta(html, pattern, fallback = "") {
  return html.match(pattern)?.[1]?.trim() ?? fallback;
}

function rewriteInternalLinks(fragment, chapterFiles) {
  return fragment.replace(/href="#([^"]+)"/g, (_match, id) => {
    const filename = chapterFiles.get(id);
    return filename ? `href="${filename}#${id}"` : `href="#${id}"`;
  });
}

function fileExtensionForMime(mimeType) {
  switch (mimeType.toLowerCase()) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/gif":
      return "gif";
    case "image/webp":
      return "webp";
    case "image/svg+xml":
      return "svg";
    default:
      return "bin";
  }
}

function externalizeDataUriImages(fragment, assetDir, prefix) {
  let imageIndex = 0;

  return fragment.replace(/src="data:([^;]+);base64,([^"]+)"/g, (_match, mimeType, base64) => {
    const extension = fileExtensionForMime(mimeType);
    const filePath = path.join(assetDir, `${prefix}-${String(imageIndex++).padStart(3, "0")}.${extension}`);
    fs.writeFileSync(filePath, Buffer.from(base64, "base64"));
    return `src="${pathToFileURL(filePath).href}"`;
  });
}

function extractDocumentParts(html) {
  const style = readMeta(html, /<style>([\s\S]*?)<\/style>/i);
  const title = stripTags(readMeta(html, /<title>([\s\S]*?)<\/title>/i, "Return on Intelligence"));
  const author = readMeta(html, /<meta\s+name="author"\s+content="([^"]+)"/i, "Rebecca Powell");
  const description = readMeta(html, /<meta\s+name="description"\s+content="([^"]+)"/i);
  const lang = readMeta(html, /<html\s+lang="([^"]+)"/i, "en");
  const titlePage = html.match(/<div class="title-page[\s\S]*?<\/div>\s*(?=<section class="toc">)/i)?.[0] ?? "";
  const toc = html.match(/<section class="toc">([\s\S]*?)<\/section>/i)?.[0] ?? "";
  const chapterMatches = [...html.matchAll(/<section class="chapter" id="([^"]+)">([\s\S]*?)<\/section>/gi)];

  const chapters = chapterMatches.map((match, index) => {
    const id = match[1];
    const sectionHtml = `<section class="chapter" id="${id}">${match[2]}</section>`;
    const label = stripTags(match[2].match(/<div class="label">([\s\S]*?)<\/div>/i)?.[1] ?? "");
    const heading = stripTags(match[2].match(/<h2>([\s\S]*?)<\/h2>/i)?.[1] ?? `Chapter ${index + 1}`);

    return {
      id,
      title: label ? `${label}: ${heading}` : heading,
      filename: `${String(index + 1).padStart(2, "0")}-${id}.xhtml`,
      content: sectionHtml,
    };
  });

  return { style, title, author, description, lang, titlePage, toc, chapters };
}

function buildBookOptions(documentParts, version) {
  const css = [
    documentParts.style,
    "body { margin: 0; padding: 0; }",
    ".title-page, .toc, .chapter { page-break-before: auto; break-before: auto; }",
  ].join("\n\n");

  const chapterFiles = new Map(documentParts.chapters.map((chapter) => [chapter.id, chapter.filename]));
  const content = [];

  if (documentParts.titlePage) {
    content.push({
      title: "Title Page",
      content: documentParts.titlePage,
      excludeFromToc: true,
      filename: "00-title-page.xhtml",
    });
  }

  if (documentParts.toc) {
    content.push({
      title: "Contents",
      content: rewriteInternalLinks(documentParts.toc, chapterFiles),
      excludeFromToc: true,
      filename: "00-contents.xhtml",
    });
  }

  for (const chapter of documentParts.chapters) {
    content.push({
      title: chapter.title,
      content: rewriteInternalLinks(chapter.content, chapterFiles),
      filename: chapter.filename,
    });
  }

  return {
    title: documentParts.title,
    author: documentParts.author,
    description: documentParts.description,
    lang: documentParts.lang,
    publisher: documentParts.author,
    tocTitle: "Contents",
    numberChaptersInTOC: false,
    prependChapterTitles: false,
    version,
    css,
    content,
  };
}

function materializeImages(documentParts) {
  const assetDir = fs.mkdtempSync(path.join(os.tmpdir(), "roi-epub-"));

  return {
    assetDir,
    documentParts: {
      ...documentParts,
      titlePage: documentParts.titlePage
        ? externalizeDataUriImages(documentParts.titlePage, assetDir, "title-page")
        : documentParts.titlePage,
      toc: documentParts.toc
        ? externalizeDataUriImages(documentParts.toc, assetDir, "contents")
        : documentParts.toc,
      chapters: documentParts.chapters.map((chapter, index) => ({
        ...chapter,
        content: externalizeDataUriImages(chapter.content, assetDir, `chapter-${String(index + 1).padStart(2, "0")}`),
      })),
    },
  };
}

function ensureHtmlExists() {
  if (fs.existsSync(HTML_FILE)) return;

  console.log("[generate-epub] HTML not found — running generate-ebook.mjs first…");
  execFileSync("node", [path.join(__dirname, "generate-ebook.mjs")], {
    stdio: "inherit",
  });
}

async function main() {
  const version = Number.parseInt(getArgValue("--version") ?? "3", 10);
  if (![2, 3].includes(version)) {
    throw new Error("Only EPUB versions 2 and 3 are supported.");
  }

  ensureHtmlExists();

  const html = fs.readFileSync(HTML_FILE, "utf8");
  const { assetDir, documentParts } = materializeImages(extractDocumentParts(html));

  try {
    if (!documentParts.chapters.length) {
      throw new Error("No chapters were found in the generated ebook HTML.");
    }

    const outputFile = version === 2 ? EPUB2_FILE : EPUB3_FILE;
    const options = buildBookOptions(documentParts, version);
    const { content, ...metadata } = options;

    console.log(`[generate-epub] Rendering EPUB ${version}…`);
    const buffer = await renderEpub(metadata, content, version);
    fs.writeFileSync(outputFile, buffer);

    const mb = (fs.statSync(outputFile).size / 1024 / 1024).toFixed(1);
    console.log(`\n[generate-epub] Written → ${outputFile} (${mb} MB)`);
  } finally {
    fs.rmSync(assetDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error("[generate-epub] Error:", err.message);
  process.exit(1);
});