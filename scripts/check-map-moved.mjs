import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

// BROWSER_MODULE optionally supplies a packaged Chromium in restricted environments.
const server = spawn(
  process.execPath,
  [
    "node_modules/astro/astro.js",
    "dev",
    "--host",
    "127.0.0.1",
    "--port",
    "4333",
  ],
  { stdio: "ignore" }
);
const url = "http://127.0.0.1:4333/posts/return-on-intelligence-the-map-moved/";
let browser;
try {
  let response;
  for (let i = 0; i < 60; i++) {
    try {
      response = await fetch(url);
      if (response.ok) break;
    } catch {
      /* server is starting */
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  assert(
    response?.ok,
    "Preview route unavailable: set the article's draft flag to false locally."
  );
  let launchOptions = {};
  if (process.env.BROWSER_MODULE) {
    const { default: packaged } = await import(process.env.BROWSER_MODULE);
    launchOptions = {
      executablePath: await packaged.executablePath(),
      args: packaged.args,
    };
  }
  browser = await chromium.launch(launchOptions);
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(url);
  await page.waitForFunction(() => {
    const island = document
      .querySelector(".convergence-audit")
      ?.closest("astro-island");
    return island && !island.hasAttribute("ssr");
  });
  const audit = page.locator(".convergence-audit");
  assert.match(
    await audit.locator(".convergence-detail").innerText(),
    /cost of agent work/
  );
  const initialTokenEvidenceCount = await audit
    .locator(".convergence-evidence li")
    .count();
  assert.ok(initialTokenEvidenceCount > 0, "Token evidence must be visible");
  assert.equal(await audit.locator("nav button").count(), 8);
  await audit.getByRole("button", { name: "Emerging", exact: true }).click();
  await page.waitForFunction(
    () =>
      document.querySelectorAll(".convergence-audit nav button").length === 3
  );
  await audit.getByRole("button", { name: /Model scarcity/ }).click();
  assert.match(
    await audit.locator(".convergence-detail").innerText(),
    /How much work will customers actually move/
  );
  await audit.getByRole("button", { name: "Observed", exact: true }).click();
  await page.waitForFunction(
    () =>
      document.querySelectorAll(".convergence-audit nav button").length === 2
  );
  await audit.getByRole("button", { name: /Infrastructure spending/ }).click();
  assert.match(
    await audit.locator(".convergence-detail").innerText(),
    /Will future capacity attract enough paying work/
  );
  await audit.getByRole("button", { name: "Unconfirmed", exact: true }).click();
  await page.waitForFunction(
    () =>
      document.querySelectorAll(".convergence-audit nav button").length === 1
  );
  assert.equal(
    await audit
      .locator('.convergence-detail a[href="#source-anthropic-filing"]')
      .count(),
    1
  );
  await audit.getByRole("button", { name: "Mixed", exact: true }).click();
  await page.waitForFunction(
    () =>
      document.querySelectorAll(".convergence-audit nav button").length === 2
  );
  await audit.getByRole("button", { name: "All", exact: true }).click();
  await page.waitForFunction(
    () =>
      document.querySelectorAll(".convergence-audit nav button").length === 8
  );
  await audit.getByRole("button", { name: /Token economics/ }).click();
  assert.equal(
    await audit.locator(".convergence-evidence li").count(),
    initialTokenEvidenceCount,
    "Switching pressures must not duplicate evidence"
  );
  const map = page.locator(
    'astro-island[component-export="MapExplorer"] .intelligence-atlas'
  );
  await map.scrollIntoViewIfNeeded();
  await page.waitForFunction(
    () =>
      !document
        .querySelector('astro-island[component-export="MapExplorer"]')
        ?.hasAttribute("ssr")
  );
  await map.getByRole("button", { name: "May 2026", exact: true }).click();
  await page.waitForFunction(() =>
    [...document.querySelectorAll("button")].some(
      b =>
        b.textContent?.trim() === "May 2026" &&
        b.getAttribute("aria-pressed") === "true"
    )
  );
  assert.equal(
    await map.getByText("Where I stand now", { exact: true }).count(),
    0
  );
  await map.getByRole("button", { name: "Revised map", exact: true }).click();
  await map.getByRole("button", { name: /Identity and authority/ }).click();
  await page.waitForFunction(
    () =>
      document.querySelector(".atlas-map-grid h4")?.textContent ===
      "Identity and authority"
  );
  assert.match(await map.innerText(), /Every agent needs permission/);
  await map.getByRole("button", { name: "Compare", exact: true }).click();
  assert.equal(
    await page
      .locator('astro-island[component-export="OutcomeCalculator"]')
      .count(),
    0
  );
  const exposure = page.locator(
    'astro-island[component-export="ExposureExplorer"] .intelligence-atlas'
  );
  await exposure.scrollIntoViewIfNeeded();
  await page.waitForFunction(
    () =>
      !document
        .querySelector('astro-island[component-export="ExposureExplorer"]')
        ?.hasAttribute("ssr")
  );
  await exposure.getByRole("button", { name: "Revenue arrives late" }).click();
  await page.waitForFunction(() =>
    document
      .querySelector(".atlas-trigger")
      ?.textContent?.includes("payments fall short")
  );
  await exposure
    .getByRole("button", { name: "The buildout earns its keep" })
    .click();
  await page.waitForFunction(() =>
    document
      .querySelector(".atlas-trigger")
      ?.textContent?.includes("Customers renew")
  );
  const brokenAnchors = await page
    .locator('a[href^="#source-"]')
    .evaluateAll(links =>
      links
        .filter(a => !document.getElementById(a.hash.slice(1)))
        .map(a => a.hash)
    );
  assert.deepEqual(brokenAnchors, []);
  await mkdir("/tmp/map-moved-qa", { recursive: true });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    assert(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth + 1
      ),
      `Horizontal overflow at ${width}px`
    );
    if (width === 1440) {
      const sizes = await page.evaluate(() => ({
        prose: document.querySelector("#article").clientWidth,
        figure: document.querySelector(".essay-wide").clientWidth,
      }));
      assert(
        sizes.figure > sizes.prose + 200,
        "Wide figure did not break out of the reading column"
      );
    }
    await map.screenshot({ path: `/tmp/map-moved-qa/map-${width}.png` });
    await audit.screenshot({
      path: `/tmp/map-moved-qa/convergence-${width}.png`,
    });
  }
  await exposure.screenshot({ path: "/tmp/map-moved-qa/exposure.png" });
  await page.evaluate(() => (document.documentElement.dataset.theme = "dark"));
  await map.screenshot({ path: "/tmp/map-moved-qa/map-dark.png" });
  await audit.screenshot({ path: "/tmp/map-moved-qa/convergence-dark.png" });
  assert.deepEqual(errors, [], "Client runtime errors");
  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const fallback = await noJs.newPage();
  await fallback.goto(url);
  await fallback
    .getByText("Read the whole convergence map", {
      exact: true,
    })
    .click();
  assert.equal(
    await fallback.locator(".convergence-audit details h4").count(),
    8
  );
  await fallback
    .getByText("Model scarcity: Emerging", { exact: true })
    .waitFor({ state: "visible" });
  await fallback
    .getByText("Read the whole ownership map", { exact: true })
    .click();
  await fallback
    .getByText("May: Chips, memory and energy remain essential.", {
      exact: true,
    })
    .waitFor({ state: "visible" });
  console.log(
    "PASS: eight-pressure audit, filters, evidence, map views/layers, scenarios, calculator removed, source anchors, 320/390/768/1440px overflow, wide figures, dark screenshots, no-JS fallbacks and client runtime."
  );
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
