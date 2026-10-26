import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

// BROWSER_MODULE optionally supplies a packaged Chromium in restricted environments.
const server = spawn(process.execPath, ["node_modules/astro/astro.js", "dev", "--host", "127.0.0.1", "--port", "4333"], { stdio: "ignore" });
const url = "http://127.0.0.1:4333/posts/return-on-intelligence-the-map-moved/";
let browser;
try {
  let response;
  for (let i = 0; i < 60; i++) {
    try { response = await fetch(url); if (response.ok) break; } catch { /* server is starting */ }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  assert(response?.ok, "Preview route unavailable: set the article's draft flag to false locally.");
  let launchOptions = {};
  if (process.env.BROWSER_MODULE) {
    const { default: packaged } = await import(process.env.BROWSER_MODULE);
    launchOptions = { executablePath: await packaged.executablePath(), args: packaged.args };
  }
  browser = await chromium.launch(launchOptions);
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(url);
  await page.waitForFunction(() => {
    const island = document.querySelector('astro-island[component-export="MapExplorer"]');
    return island && !island.hasAttribute("ssr");
  });
  const map = page.locator(".intelligence-atlas").nth(0);
  await map.getByRole("button", { name: "May 2026", exact: true }).click();
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some(b => b.textContent?.trim() === 'May 2026' && b.getAttribute('aria-pressed') === 'true'));
  assert.equal(await map.getByText("Revised judgement", { exact: true }).count(), 0);
  await map.getByRole("button", { name: "Revised map", exact: true }).click();
  await map.getByRole("button", { name: /Identity and authority/ }).click();
  await page.waitForFunction(() => document.querySelector('.atlas-map-grid h4')?.textContent === 'Identity and authority');
  assert.match(await map.innerText(), /Authority crosses every layer/);
  await map.getByRole("button", { name: "Compare", exact: true }).click();
  const calculator = page.locator(".intelligence-atlas").nth(1);
  await calculator.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => !document.querySelector('astro-island[component-export="OutcomeCalculator"]')?.hasAttribute("ssr"));
  await calculator.getByRole("button", { name: "Reset assumptions" }).click();
  await page.waitForFunction(() => document.querySelectorAll('.atlas-result > strong')[0]?.textContent === '£8.81');
  const acceptance = calculator.getByRole("slider", { name: /Accepted outcomes/ });
  await acceptance.focus();
  await page.keyboard.press("Home");
  await page.waitForFunction(() => document.querySelector('.atlas-result > strong')?.textContent === 'No accepted outcomes');
  await page.keyboard.press("End");
  await page.waitForFunction(() => document.querySelector('.atlas-result > strong')?.textContent === '£6.17');
  await calculator.getByRole("button", { name: "Reset assumptions" }).click();
  const exposure = page.locator(".intelligence-atlas").nth(2);
  await exposure.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => !document.querySelector('astro-island[component-export="ExposureExplorer"]')?.hasAttribute("ssr"));
  await exposure.getByRole("button", { name: "Revenue arrives late" }).click();
  await page.waitForFunction(() => document.querySelector('.atlas-trigger')?.textContent?.includes('cash receipts fall short'));
  await exposure.getByRole("button", { name: "The buildout earns its keep" }).click();
  await page.waitForFunction(() => document.querySelector('.atlas-trigger')?.textContent?.includes('Customers renew'));
  const brokenAnchors = await page.locator('a[href^="#source-"]').evaluateAll(links => links.filter(a => !document.getElementById(a.hash.slice(1))).map(a => a.hash));
  assert.deepEqual(brokenAnchors, []);
  await mkdir("/tmp/map-moved-qa", { recursive: true });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), `Horizontal overflow at ${width}px`);
    if (width === 1440) {
      const sizes = await page.evaluate(() => ({ prose: document.querySelector('#article').clientWidth, figure: document.querySelector('.essay-wide').clientWidth }));
      assert(sizes.figure > sizes.prose + 200, "Wide figure did not break out of the reading column");
    }
    await map.screenshot({ path: `/tmp/map-moved-qa/map-${width}.png` });
  }
  await calculator.screenshot({ path: "/tmp/map-moved-qa/calculator.png" });
  await exposure.screenshot({ path: "/tmp/map-moved-qa/exposure.png" });
  await page.evaluate(() => document.documentElement.dataset.theme = "dark");
  await map.screenshot({ path: "/tmp/map-moved-qa/map-dark.png" });
  assert.deepEqual(errors, [], "Client runtime errors");
  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const fallback = await noJs.newPage();
  await fallback.goto(url);
  await fallback.getByText("Read every layer without using the controls", { exact: true }).click();
  await fallback.getByText("May: The physical substrate remains strategic.", { exact: true }).waitFor({ state: "visible" });
  console.log("PASS: map views/layers, scenarios, calculator including zero outcomes, keyboard range control, source anchors, 320/390/768/1440px overflow, wide figures, dark screenshot, no-JS fallback and client runtime.");
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
