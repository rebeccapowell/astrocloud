#!/usr/bin/env node
/**
 * Render return-on-intelligence-ebook.html to a PDF using Playwright/Chromium.
 *
 * First-time setup (install browser):
 *   pnpm exec playwright install chromium
 *
 * Usage:
 *   pnpm build:pdf          # regenerates HTML then renders PDF
 *   node scripts/generate-pdf.mjs   # uses existing HTML if present
 *
 * Output: return-on-intelligence.pdf  (project root)
 */

import { chromium } from "playwright";
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const HTML_FILE = path.join(ROOT, "return-on-intelligence-ebook.html");
const PDF_FILE = path.join(ROOT, "return-on-intelligence.pdf");

// Playwright renders header/footer outside the normal page flow.
// Font, size, and colour must be specified inline — external CSS is not applied.
const HEADER = [
  `<div style="`,
  `font-size:8pt;color:#a1a1aa;width:100%;text-align:center;`,
  `padding:0 8mm;`,
  `font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif`,
  `">Return on Intelligence</div>`,
].join("");

const FOOTER = [
  `<div style="`,
  `font-size:8pt;color:#a1a1aa;width:100%;text-align:center;`,
  `padding:0 8mm;`,
  `font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif`,
  `"><span class="pageNumber"></span></div>`,
].join("");

async function main() {
  // Generate the HTML source if it is missing
  if (!fs.existsSync(HTML_FILE)) {
    console.log("[generate-pdf] HTML not found — running generate-ebook.mjs first…");
    execFileSync("node", [path.join(__dirname, "generate-ebook.mjs")], {
      stdio: "inherit",
    });
  }

  // Launch Chromium — emit a helpful message if the browser is not yet installed
  let browser;
  try {
    console.log("[generate-pdf] Launching Chromium…");
    browser = await chromium.launch();
  } catch (err) {
    if (/Executable|not found|browser.*not.*install/i.test(err.message)) {
      console.error(
        "\n[generate-pdf] Chromium browser not found.\n" +
          "Install it once with:\n\n" +
          "  pnpm exec playwright install chromium\n"
      );
    }
    throw err;
  }

  const page = await browser.newPage();

  // Convert Windows backslashes to forward slashes for the file:// URL
  const fileUrl = "file:///" + HTML_FILE.replace(/\\/g, "/");
  console.log(`[generate-pdf] Loading ${fileUrl}`);

  // networkidle waits for all base64 images to decode and any fonts to load
  await page.goto(fileUrl, { waitUntil: "networkidle", timeout: 90_000 });

  console.log("[generate-pdf] Rendering PDF (this may take a moment for a large file)…");

  await page.pdf({
    path: PDF_FILE,
    format: "A4",
    // top margin is larger to leave room for the running header
    margin: { top: "24mm", right: "20mm", bottom: "22mm", left: "22mm" },
    printBackground: true,
    // running header (series title) + footer (page number)
    displayHeaderFooter: true,
    headerTemplate: HEADER,
    footerTemplate: FOOTER,
    // embed a PDF outline (bookmarks) from the document headings
    outline: true,
    // produce a tagged PDF for better accessibility and PDF viewer navigation
    tagged: true,
  });

  await browser.close();

  const mb = (fs.statSync(PDF_FILE).size / 1024 / 1024).toFixed(1);
  console.log(`\n[generate-pdf] Written → ${PDF_FILE}  (${mb} MB)`);
  console.log(
    "[generate-pdf] Open in any PDF viewer; chapter bookmarks appear in the sidebar."
  );
}

main().catch((err) => {
  console.error("[generate-pdf] Error:", err.message);
  process.exit(1);
});
