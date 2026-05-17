#!/usr/bin/env node
/**
 * Generate a self-contained HTML ebook from the Return on Intelligence series.
 *
 * Each of the 9 MDX/MD source files is read directly. Frontmatter, import
 * statements and JSX component tags are stripped; the remaining markdown is
 * converted to HTML with `marked`. Every interactive or static figure
 * component is replaced with a pre-built static HTML block.
 *
 * Does NOT require a prior Astro build.
 *
 * Usage:
 *   node scripts/generate-ebook.mjs
 *
 * Output:
 *   return-on-intelligence-ebook.html   (project root)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { marked } from "marked";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BLOG_DIR = path.join(ROOT, "src", "data", "blog");
const OUT = path.join(ROOT, "return-on-intelligence-ebook.html");

// ── series order ──────────────────────────────────────────────────────────────

const SERIES = [
  {
    slug: "return-on-intelligence-the-preface",
    label: "Preface",
    title: "The Return",
    summary:
      "The thesis, the reading contract, and the journey through the full eight-part argument.",
  },
  {
    slug: "return-on-intelligence-01-echoes",
    label: "Part 1",
    title: "Echoes",
    summary:
      "Dotcom memory, paradigm shifts, and why real technologies produce the most dangerous bubbles.",
  },
  {
    slug: "return-on-intelligence-02-prototypes",
    label: "Part 2",
    title: "Prototypes",
    summary:
      "Early companies and interfaces are prototypes of futures they may not own. A prototype can be directionally right and economically doomed.",
  },
  {
    slug: "return-on-intelligence-02-moats",
    label: "Part 3",
    title: "Moats",
    summary:
      "Intelligence alone is not the moat. Durable moats may be context, distribution, workflow, identity, permissions, governance, execution rights, data and systems of record.",
  },
  {
    slug: "return-on-intelligence-04-saas-was-a-compromise",
    label: "Part 4",
    title: "SaaS Was a Compromise",
    summary:
      "SaaS won because custom software was too expensive. AI changes that cost curve, and the compromise gets repriced.",
  },
  {
    slug: "return-on-intelligence-05-firmware",
    label: "Part 5",
    title: "Firmware",
    summary:
      "Firm-ware is the operating logic embedded into the company itself. AI makes that logic programmable.",
  },
  {
    slug: "return-on-intelligence-05-breaking-point",
    label: "Part 6",
    title: "Breaking Point",
    summary:
      "The market does not stop believing in AI. It starts doubting who owns it.",
  },
  {
    slug: "return-on-intelligence-07-after-the-crash",
    label: "Part 7",
    title: "After the Crash",
    summary:
      "The crash is a repricing event. The mature AI economy begins after the first ownership story fails.",
  },
  {
    slug: "return-on-intelligence-08-new-power-map",
    label: "Part 8",
    title: "The New Power Map",
    summary:
      "A layered view of the durable winners, pressured groups, and control points in the mature AI economy.",
  },
];

// ── image inlining ────────────────────────────────────────────────────────────

const MIME = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", webp: "image/webp", svg: "image/svg+xml" };

async function toDataUri(srcAttr) {
  // only inline local /assets/ paths
  if (!srcAttr.startsWith("/assets/")) return srcAttr;
  const file = path.join(ROOT, "public", srcAttr.slice(1));
  if (!fs.existsSync(file)) return srcAttr;
  const ext = path.extname(file).slice(1).toLowerCase();
  if (ext === "svg") {
    return `data:image/svg+xml;base64,${fs.readFileSync(file).toString("base64")}`;
  }
  try {
    const buffer = await sharp(file)
      .resize({ width: 1100, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
    return `data:image/jpeg;base64,${buffer.toString("base64")}`;
  } catch {
    const mime = MIME[ext] ?? "application/octet-stream";
    return `data:${mime};base64,${fs.readFileSync(file).toString("base64")}`;
  }
}

async function inlineImages(html) {
  const srcs = [];
  html.replace(/(<img\s[^>]*src=")([^"]+)(")/g, (_, _pre, src) => {
    srcs.push(src);
  });
  const resolved = await Promise.all(srcs.map((src) => toDataUri(src)));
  let i = 0;
  return html.replace(
    /(<img\s[^>]*src=")([^"]+)(")/g,
    (_, pre, _src, post) => `${pre}${resolved[i++]}${post}`
  );
}

// ── find source file by frontmatter slug ──────────────────────────────────────

function findFile(slug) {
  for (const file of fs.readdirSync(BLOG_DIR)) {
    if (!/\.(md|mdx)$/.test(file)) continue;
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
    // normalise line endings so the regex works on Windows-style files too
    const normalised = raw.replace(/\r\n/g, "\n");
    const fm = normalised.match(/^---\n([\s\S]*?)\n---/);
    if (!fm) continue;
    const m = fm[1].match(/^slug:\s*(.+)$/m);
    if (m && m[1].trim() === slug) return raw;
  }
  return null;
}

// ── markdown processing ───────────────────────────────────────────────────────

async function processContent(raw) {
  // normalise line endings, then strip frontmatter
  let md = raw.replace(/\r\n/g, "\n").replace(/^---[\s\S]+?---\n/, "");

  // strip import / export lines
  md = md.replace(/^(?:import|export)\s+.+\n?/gm, "");

  // strip any leftover JSX expressions
  md = md.replace(/\{[^}]*\}/g, "");

  // find component positions, split into interleaved [md, figure, md, …]
  const COMP_RE = /<([A-Z][A-Za-z]+)\b[^>]*\/>/g;
  const parts = [];
  let last = 0;
  let m;
  while ((m = COMP_RE.exec(md)) !== null) {
    if (m.index > last) parts.push({ type: "md", text: md.slice(last, m.index) });
    parts.push({ type: "fig", name: m[1] });
    last = m.index + m[0].length;
  }
  if (last < md.length) parts.push({ type: "md", text: md.slice(last) });

  return inlineImages(
    parts
      .map((p) => (p.type === "md" ? marked.parse(p.text) : (FIGURES[p.name] ?? "")))
      .join("\n")
  );
}

// ── SVG chart helpers (mirrors BeliefBreakChart.tsx) ──────────────────────────

const CW = 720,
  CH = 360,
  CP = { top: 24, right: 22, bottom: 64, left: 56 };

function chartPts(vals) {
  const step = (CW - CP.left - CP.right) / (vals.length - 1);
  return vals.map((v, i) => ({
    x: CP.left + step * i,
    y: CH - CP.bottom - ((CH - CP.top - CP.bottom) * v) / 100,
  }));
}

function smoothPath(ps) {
  if (!ps.length) return "";
  let d = `M ${ps[0].x.toFixed(2)} ${ps[0].y.toFixed(2)}`;
  for (let i = 1; i < ps.length - 1; i++) {
    const c = ps[i],
      n = ps[i + 1];
    const mx = (c.x + n.x) / 2,
      my = (c.y + n.y) / 2;
    d += ` Q ${c.x.toFixed(2)} ${c.y.toFixed(2)} ${mx.toFixed(2)} ${my.toFixed(2)}`;
  }
  const last = ps[ps.length - 1];
  d += ` T ${last.x.toFixed(2)} ${last.y.toFixed(2)}`;
  return d;
}

function closedBuffer(nPts, ePts) {
  const top = smoothPath(nPts);
  const bot = [...ePts].reverse();
  return (
    `${top} L ${bot[0].x.toFixed(2)} ${bot[0].y.toFixed(2)}` +
    bot
      .slice(1)
      .map(p => ` L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join("") +
    " Z"
  );
}

function buildBeliefBreakSVG() {
  const narrative = [32, 60, 86, 78, 54, 34, 26];
  const evidence = [18, 28, 42, 60, 68, 60, 50];
  const phases = ["Discovery", "Speculation", "Overbuild", "Doubt", "Belief break", "Repricing", "Consolidation"];

  const nPts = chartPts(narrative);
  const ePts = chartPts(evidence);
  const bPath = closedBuffer(nPts, ePts);
  const nPath = smoothPath(nPts);
  const ePath = smoothPath(ePts);

  // linear interpolation crossing between index 3 (n=78,e=60) and index 4 (n=54,e=68)
  const t = (78 - 60) / ((78 - 60) + (68 - 54)); // 18 / 32 ≈ 0.5625
  const cx = nPts[3].x + t * (nPts[4].x - nPts[3].x);
  const cy = nPts[3].y + t * (nPts[4].y - nPts[3].y);

  const gridLines = [0, 25, 50, 75, 100]
    .map(v => {
      const y = CH - CP.bottom - ((CH - CP.top - CP.bottom) * v) / 100;
      const label = v === 0 ? "Low" : v === 100 ? "High" : "";
      return `
        <line x1="${CP.left}" x2="${CW - CP.right}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}"
          stroke="#e4e4e7" stroke-dasharray="4 5"/>
        ${label ? `<text x="${CP.left - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" fill="#a1a1aa" font-size="11">${label}</text>` : ""}`;
    })
    .join("");

  const phaseLabels = phases
    .map(
      (p, i) =>
        `<text x="${nPts[i].x.toFixed(1)}" y="${CH - CP.bottom + 24}" text-anchor="middle" fill="#71717a" font-size="10.5">${p}</text>`
    )
    .join("");

  return `<svg viewBox="0 0 ${CW} ${CH}" style="width:100%;display:block" role="img"
    aria-label="Conceptual chart: narrative belief versus contradictory evidence across bubble phases">
    ${gridLines}
    <path d="${bPath}" fill="#eff6ff" opacity="0.7"/>
    <path d="${nPath}" fill="none" stroke="#18181b" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${ePath}" fill="none" stroke="#2563eb" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="${cx.toFixed(1)}" x2="${cx.toFixed(1)}" y1="${CP.top}" y2="${(CH - CP.bottom).toFixed(1)}"
      stroke="#2563eb" stroke-dasharray="5 5" opacity="0.6"/>
    <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="6" fill="#2563eb"/>
    <text x="${(cx + 10).toFixed(1)}" y="${CP.top + 16}" fill="#2563eb" font-size="11" font-weight="700">Belief break</text>
    <text x="${nPts[2].x.toFixed(1)}" y="${(nPts[2].y - 12).toFixed(1)}" fill="#18181b" font-size="11" font-weight="600">Narrative belief</text>
    <text x="${ePts[4].x.toFixed(1)}" y="${(ePts[4].y + 20).toFixed(1)}" fill="#2563eb" font-size="11" font-weight="600">Contradictory evidence</text>
    <text x="${CP.left}" y="${CP.top - 4}" fill="#71717a" font-size="11">Market pressure →</text>
    ${phaseLabels}
  </svg>`;
}

// ── static HTML figures ───────────────────────────────────────────────────────

function card(title, body, extra = "") {
  return `<div class="card">${title ? `<div class="card-title">${title}</div>` : ""}${body ? `<div class="card-body">${body}</div>` : ""}${extra}</div>`;
}

function figWrap(tag, title, desc, content) {
  return `<div class="fig">
  <div class="fig-header">
    <div class="fig-tag">${tag}</div>
    <div class="fig-title">${title}</div>
    ${desc ? `<div class="fig-desc">${desc}</div>` : ""}
  </div>
  ${content}
</div>`;
}

// ── figure data ───────────────────────────────────────────────────────────────

const PHASE_DATA = [
  {
    n: 1,
    label: "Pioneer",
    summary:
      "The technology looks narrow, strange, or toy-like, but a few people can already feel that it changes the shape of the future.",
    marketBehavior: "Most people dismiss it because the first version is incomplete and awkward.",
    signal: "The capability is real, but the infrastructure and habits around it do not exist yet.",
  },
  {
    n: 2,
    label: "Discovery",
    summary:
      "The implications start to become legible. People cannot fully explain the business model yet, but they can sense that the technology matters.",
    marketBehavior:
      "Language, excitement, and early frameworks emerge before the market structure is settled.",
    signal: "The imagination starts to outrun the operating model.",
  },
  {
    n: 3,
    label: "Speculation",
    summary:
      "Capital, talent, and narrative rush toward the opening. Every company wants to sound native to the new paradigm.",
    marketBehavior: "The story becomes easier to fund than to operate.",
    signal: "Valuation begins leaning on possibility more than on durable economics.",
  },
  {
    n: 4,
    label: "Overbuild",
    summary:
      "The market starts pricing the mature form of the technology before the profit pools, customer habits, and control points are actually stable.",
    marketBehavior: "Infrastructure, expectations, and valuation all move too far ahead of reality.",
    signal: "The future may be real, but it is being monetized too early and too confidently.",
  },
  {
    n: 5,
    label: "Belief break",
    summary:
      "The first market story loses credibility. The technology does not disappear, but belief in the early ownership model breaks.",
    marketBehavior: "Contradictory evidence stops looking temporary and starts looking structural.",
    signal: "The story cracks before the paradigm does.",
  },
  {
    n: 6,
    label: "Consolidation",
    summary:
      "Assets survive, but ownership changes. Infrastructure is reused. Weak companies disappear or get absorbed.",
    marketBehavior: "The market becomes more selective and less romantic.",
    signal: "What matters now is durability, not symbolism.",
  },
  {
    n: 7,
    label: "Mature market",
    summary:
      "The real profit pools settle later, often in different layers than the first wave expected.",
    marketBehavior: "Power collects around the control points that turned out to matter most.",
    signal:
      "The paradigm survives, but the winners are not necessarily the companies that introduced it.",
  },
];

const phaseRow = (p) =>
  `<div class="phase-row">
        <div class="phase-num">${p.n}</div>
        <div style="flex:1">
          <div class="phase-label">${p.label}</div>
          <div class="phase-desc">${p.summary}</div>
          <div class="phase-signals">
            <span class="card-chip">Market: </span>${p.marketBehavior}&ensp;<span class="card-chip">Signal: </span>${p.signal}
          </div>
        </div>
      </div>`;

const PRESSURE_DATA = [
  {
    title: "Model scarcity premium declines",
    signal: "Smaller, cheaper, specialised, and local models absorb more routine work.",
    risk: "The centralised API captures less of the everyday value than the market expects.",
    q: "How much of the workflow still needs the frontier?",
  },
  {
    title: "Token economics become visible",
    signal: "Subsidised experimentation gives way to real unit economics.",
    risk: "Usage can stay high while margin quality weakens.",
    q: "Does this AI usage generate durable profit or just activity?",
  },
  {
    title: "Enterprise ROI pressure mounts",
    signal: "Boards begin asking for measurable output per dollar spent on AI.",
    risk: "Adoption breadth does not automatically translate into defensible margin.",
    q: "Who controls the economic relationship between AI spend and AI capture?",
  },
  {
    title: "Capex signals overbuild",
    signal: "Infrastructure spend commitments grow faster than revenue visibility.",
    risk: "The capital structure locks in costs before the demand pattern is stable.",
    q: "At what utilisation rate does the infrastructure commitment make sense?",
  },
  {
    title: "SaaS expansion slows",
    signal: "Seat-based growth plateaus as AI substitutes for incremental headcount.",
    risk: "The SaaS pricing model was built on headcount expansion and workflow lock-in.",
    q: "Which SaaS products will still exist in their current form in five years?",
  },
  {
    title: "Wrappers show structural exposure",
    signal: "Thin products built on top of API access face commoditisation from the model layer.",
    risk: "Products with no proprietary context or workflow face direct compression.",
    q: "What does this product own that the underlying model does not?",
  },
  {
    title: "Financing conditions tighten",
    signal: "Rate sensitivity and duration risk reduce the appetite for long-horizon AI bets.",
    risk: "Capital-intensive infrastructure plays become more exposed when financing costs rise.",
    q: "How long does this business model take to produce real returns at current capital costs?",
  },
  {
    title: "Belief in the first ownership story weakens",
    signal: "Investors begin asking not just whether AI is real but who captures it.",
    risk: "The narrative that justified early valuations starts looking premature.",
    q: "Which companies are positioned for the mature economy, not just the current story?",
  },
];

const pressureFig = (p) =>
  figWrap(
    "Pressure · at a glance",
    p.title,
    null,
    `<div style="font-size:0.8125rem;color:#52525b;line-height:1.7">
    <div><span class="card-chip">Signal · </span>${p.signal}</div>
    <div style="margin-top:0.25rem"><span class="card-chip">Risk · </span>${p.risk}</div>
    <div style="margin-top:0.4rem;color:#3b82f6;font-style:italic">${p.q}</div>
  </div>`
  );

const LAYER_DATA = [
  {
    n: 1,
    name: "Compute substrate",
    why: "AI still needs chips, memory, networking, power efficiency, and physical capacity even when the ownership story changes.",
    winners: ["Chip suppliers", "Memory and packaging leaders", "Efficient infrastructure owners"],
    pressured: [
      "Overbuilt capacity with weak utilisation",
      "Capital structures that assumed perfect demand timing",
    ],
  },
  {
    n: 2,
    name: "Devices and operating systems",
    why: "More intelligence moves closer to the user, the permission boundary, and the default surface where work already happens.",
    winners: ["Operating system owners", "Device ecosystems", "Default productivity surfaces"],
    pressured: [
      "Pure model destinations with weak user surface",
      "Products that rely on users choosing them explicitly every time",
    ],
  },
  {
    n: 3,
    name: "Identity and governance",
    why: "Action without permissions, policy, audit, and approval is operationally dangerous, so governance becomes a real product layer.",
    winners: ["Identity providers", "Governance platforms", "Trusted control planes"],
    pressured: ["Ungoverned agent tools", "Products that answer but cannot safely act"],
  },
  {
    n: 4,
    name: "Systems of record and context",
    why: "AI is only durable inside business systems when it can see authoritative data and act against trusted records.",
    winners: [
      "Core systems of record",
      "Deeply integrated data platforms",
      "Trusted enterprise data owners",
    ],
    pressured: [
      "Generic workflow layers without record ownership",
      "Thin surfaces sitting above someone else's data",
    ],
  },
  {
    n: 5,
    name: "Orchestration and execution",
    why: "Real AI work needs state, retries, human approval, long-running workflows, and auditability between intent and action.",
    winners: [
      "Workflow orchestration layers",
      "Execution control planes",
      "Enterprise automation backbones",
    ],
    pressured: [
      "Prompt-only agent experiences",
      "Ad hoc automation with no durable state or governance",
    ],
  },
  {
    n: 6,
    name: "AI-operated companies",
    why: "The deepest repricing may happen when companies use AI to change their own cost structure rather than merely buy AI features.",
    winners: [
      "Small AI-operated businesses",
      "Companies with strong process knowledge",
      "Firms that can encode their operating model",
    ],
    pressured: [
      "Human-heavy service models",
      "Generic workflow SaaS",
      "Companies with no proprietary workflow or trust advantage",
    ],
  },
];

const layerCard = (l) =>
  `<div class="card">
        <div class="row" style="align-items:flex-start;gap:0.75rem">
          <span class="num">${l.n}</span>
          <div style="flex:1">
            <div class="card-title">${l.name}</div>
            <div class="card-body">${l.why}</div>
            <div style="display:flex;gap:1rem;margin-top:0.5rem">
              <div style="flex:1">
                <div class="card-chip" style="margin-bottom:0.25rem">Strengthened</div>
                <ul style="padding-left:1rem;font-size:0.75rem;color:#52525b;line-height:1.6">
                  ${l.winners.map((w) => `<li>${w}</li>`).join("")}
                </ul>
              </div>
              <div style="flex:1">
                <div class="card-chip" style="margin-bottom:0.25rem">Pressured</div>
                <ul style="padding-left:1rem;font-size:0.75rem;color:#52525b;line-height:1.6">
                  ${l.pressured.map((p) => `<li>${p}</li>`).join("")}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>`;

const FIGURES = {
  // ── Preface ────────────────────────────────────────────────────────────────
  SeriesJourneyMap: figWrap(
    "Series journey",
    "Return on Intelligence",
    "AI and the Programmable Firm — read this sequence in order. Each chapter advances the same argument from a different angle.",
    `<div class="grid3">${SERIES.map(
      e =>
        `<div class="card">
      <div class="card-chip">${e.label}</div>
      <div class="card-title" style="margin-top:0.5rem">${e.title}</div>
      <div class="card-body">${e.summary}</div>
    </div>`
    ).join("")}</div>`
  ),

  // ── Part 1 ─────────────────────────────────────────────────────────────────
  PhaseMap1: figWrap(
    "Figure",
    "How a paradigm shift gets mispriced — phases 1–4",
    "The build-up arc: from the first real capability through the point where the market starts pricing a mature economy too early.",
    `<div class="phase-list">${PHASE_DATA.slice(0, 4).map(phaseRow).join("")}</div>`
  ),
  PhaseMap2: figWrap(
    "Figure (continued)",
    "How a paradigm shift gets mispriced — phases 5–7",
    null,
    `<div class="phase-list">${PHASE_DATA.slice(4).map(phaseRow).join("")}</div>`
  ),

  // ── Part 2 ─────────────────────────────────────────────────────────────────
  ValueMigrationFigure: figWrap(
    "Editorial figure",
    "Utility is real. Capture migrates.",
    "The useful technology and the durable ownership layer do not appear at the same moment. That timing gap is where the bubble hides.",
    `<div class="grid2">
    <div class="stack">
      <div class="card accent-bg">
        <div class="card-chip">Thesis line</div>
        <blockquote style="margin:0.5rem 0 0;font-style:italic;font-size:1.05rem;line-height:1.6;color:#1d4ed8">
          AI is real enough to destroy the current AI trade.
        </blockquote>
      </div>
      ${card("What people can feel", "Better drafting, coding, summarising, research, support and decision support.")}
      ${card("What markets overclaim", "That the first visible leaders, pricing models and capital structures must own the mature economy.")}
    </div>
    <div class="stack">
      <div class="card-chip" style="padding:0 0 0.5rem">Value migration</div>
      ${[
        {
          label: "01 — Utility becomes obvious",
          desc: "People can feel AI working in everyday tasks long before the economics settle.",
        },
        {
          label: "02 — The first story overclaims",
          desc: "Markets mistake visible usefulness for proof that today's winners own the mature profit pool.",
        },
        {
          label: "03 — Value starts migrating",
          desc: "Capture shifts toward workflow, governance, devices, records, orchestration and execution.",
        },
        {
          label: "04 — Durable ownership forms later",
          desc: "The real profit pool settles where intelligence meets authority, trust and operational control.",
        },
      ]
        .map(
          s =>
            `<div class="card">
          <div class="row">
            <div class="card-chip" style="min-width:2rem">${s.label.split(" — ")[0]}</div>
            <div>
              <div class="card-title">${s.label.split(" — ")[1]}</div>
              <div class="card-body">${s.desc}</div>
            </div>
          </div>
        </div>`
        )
        .join("")}
      <div class="card" style="background:#f9fafb">
        <div class="card-chip">Where durable capture goes</div>
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:0.5rem">
          ${["Devices and operating systems", "Systems of record", "Identity and governance", "Workflow orchestration", "Execution control planes", "AI-operated businesses"]
            .map(n => `<span style="background:#eff6ff;color:#1d4ed8;border-radius:6px;padding:0.2rem 0.6rem;font-size:0.75rem;font-weight:600">${n}</span>`)
            .join("")}
        </div>
      </div>
    </div>
  </div>`
  ),

  // ── Part 3 ─────────────────────────────────────────────────────────────────
  AIArchitectureToggle: figWrap(
    "Figure",
    "API-only versus hybrid AI",
    "The current centralized market story versus the hybrid stack this chapter argues toward. The point is not that the API disappears — it is that it stops being the whole architecture.",
    `<div class="grid2">
    ${[
      {
        key: "centralized",
        label: "API-only story",
        summary: "A few remote model providers remain the default path for nearly all meaningful intelligence.",
        takeaway: "This is the current market story.",
        layers: [
          {
            name: "Default surface",
            desc: "Users go to one destination product or API endpoint to reach intelligence.",
          },
          {
            name: "Where context lives",
            desc: "Important context must be shipped outward to the model provider.",
          },
          {
            name: "Economic logic",
            desc: "Scarcity and API access look like the main source of durable rents.",
          },
          {
            name: "What becomes durable",
            desc: "The moat is assumed to sit mainly in frontier model quality and infrastructure access.",
          },
        ],
      },
      {
        key: "hybrid",
        label: "Hybrid / local future",
        summary:
          "The mature stack routes work across local, embedded, tenant-local, and frontier systems based on context and cost.",
        takeaway: "This is the mature-economy architecture the essay is pointing toward.",
        layers: [
          {
            name: "Default surface",
            desc: "Intelligence sits inside the editor, device, operating system, enterprise control plane, or workflow itself.",
          },
          {
            name: "Where context lives",
            desc: "More context stays close to the user, the tenant, the system of record, or the device.",
          },
          {
            name: "Economic logic",
            desc: "Model access still matters, but value shifts toward orchestration, permissions, distribution, and execution.",
          },
          {
            name: "What becomes durable",
            desc: "The moat sits where intelligence meets workflow, authority, defaults, and customer relationship.",
          },
        ],
      },
    ]
      .map(
        mode =>
          `<div class="card">
        <div class="card-title">${mode.label}</div>
        <div class="card-body">${mode.summary}</div>
        <div class="card" style="background:#eff6ff;border-color:#bfdbfe;margin-top:0.75rem">
          <div class="card-chip">Takeaway</div>
          <div class="card-body" style="color:#1d4ed8">${mode.takeaway}</div>
        </div>
        <div class="stack" style="margin-top:0.75rem">
          ${mode.layers
            .map(
              l =>
                `<div class="card" style="background:#f9fafb">
              <div class="card-chip">${l.name}</div>
              <div class="card-body">${l.desc}</div>
            </div>`
            )
            .join("")}
        </div>
      </div>`
      )
      .join("")}
  </div>`
  ),

  // ── Part 4 ─────────────────────────────────────────────────────────────────
  BuyBuildThreshold: figWrap(
    "Figure",
    "The buy-versus-build threshold",
    "Three threshold zones determined by workflow specificity and the cost of custom software. As AI reduces the cost of building, high-specificity workflows shift toward the build side.",
    `<div class="stack">
    ${[
      {
        n: "1",
        label: "Buy the packaged workflow",
        condition: "Workflow is generic · custom software still expensive",
        summary:
          "The workflow is generic enough, and custom software is still expensive enough, that SaaS remains the rational default.",
        implication: "This is the world that made the old SaaS compromise so strong.",
      },
      {
        n: "2",
        label: "Keep the record, generate the workflow",
        condition: "Specificity rising · custom software cost falling",
        summary:
          "The core system of record may still be bought, but the workflow layer starts moving toward generated internal capability.",
        implication: "This is the transition zone where generic workflow SaaS gets pressured first.",
      },
      {
        n: "3",
        label: "Build or generate around the business",
        condition: "High specificity · custom software cheap",
        summary:
          "The workflow is specific enough, and custom software cheap enough, that the economics start favouring software shaped around the company itself.",
        implication: "This is where the SaaS workaround loses scarcity.",
      },
    ]
      .map(
        s =>
          `<div class="card">
        <div class="row" style="align-items:flex-start">
          <span class="num">${s.n}</span>
          <div style="flex:1">
            <div class="card-title">${s.label}</div>
            <div class="card-chip" style="margin-top:0.25rem">${s.condition}</div>
            <div class="card-body" style="margin-top:0.5rem">${s.summary}</div>
            <div class="card" style="background:#f9fafb;margin-top:0.5rem">
              <span class="card-chip">Implication · </span><span class="card-body">${s.implication}</span>
            </div>
          </div>
        </div>
      </div>`
      )
      .join("")}
    <div class="grid2">
      ${card("What the old SaaS era assumes", "It is cheaper to adapt the business to the software than to adapt the software to the business.")}
      ${card("What AI changes", "When workflow specificity stays high while custom software costs keep falling, the workflow layer becomes much easier to generate around the company itself.")}
    </div>
  </div>`
  ),

  // ── Part 5 ─────────────────────────────────────────────────────────────────
  AIOperatedLeverageDiagram: figWrap(
    "Visual guide",
    "From human-heavy company to AI-operated company",
    "This is not a literal org chart. It is a leverage map showing which layers shrink, which layers become software, and where the remaining human roles concentrate.",
    `<div class="grid2">
    <div class="card">
      <div class="card-chip">Human-heavy default</div>
      <div class="stack" style="margin-top:0.75rem">
        ${card("Execution surface", "Many people perform repeated operational tasks inside a growing SaaS stack.")}
        ${card("Coordination layer", "Meetings, tickets, reporting packs, and management layers absorb a large coordination tax.")}
        ${card("Human role concentration", "Humans both do the work and supervise the work, so headcount scales with output more quickly.")}
      </div>
    </div>
    <div class="card accent-bg">
      <div class="card-chip">AI-operated direction</div>
      <div class="stack" style="margin-top:0.75rem">
        ${card("Operating core", "Workflow engine, model routing, observability, approvals, and generated internal interfaces replace large parts of the old stack.")}
        ${card("Human concentration", "Humans move upward into goal-setting, trust, domain judgment, risk ownership, and final approval.")}
        ${card("Economic result", "Small teams can operate larger business surfaces, compressing both labour cost and coordination cost at the same time.")}
      </div>
    </div>
  </div>
  <div class="grid3" style="margin-top:0.75rem">
    ${card("What shrinks", "Repeated task labour, reporting overhead, and coordination-heavy middle layers.")}
    ${card("What grows", "Software-defined execution, policy, routing, monitoring, and approval systems.")}
    ${card("What stays human", "Accountability, taste, trust, capital allocation, legal responsibility, and high-risk judgment.")}
  </div>`
  ),

  // ── Part 6 ─────────────────────────────────────────────────────────────────
  Pressure1: pressureFig(PRESSURE_DATA[0]),
  Pressure2: pressureFig(PRESSURE_DATA[1]),
  Pressure3: pressureFig(PRESSURE_DATA[2]),
  Pressure4: pressureFig(PRESSURE_DATA[3]),
  Pressure5: pressureFig(PRESSURE_DATA[4]),
  Pressure6: pressureFig(PRESSURE_DATA[5]),
  Pressure7: pressureFig(PRESSURE_DATA[6]),
  Pressure8: pressureFig(PRESSURE_DATA[7]),
  BeliefGauge: figWrap(
    "Belief gauge",
    "Full convergence — eight pressures active",
    null,
    `<div class="row" style="justify-content:space-between;align-items:flex-end;margin-bottom:0.75rem">
    <div class="card-body" style="max-width:75%">The market no longer asks whether AI matters. It asks whether the current winners own enough of the future. The old story stops carrying the valuation. Exposure flips from a badge of confidence into a demand for proof.</div>
    <div style="text-align:right;min-width:5rem;padding-left:1rem">
      <div style="font-size:1.75rem;font-weight:700;color:#18181b">8<span style="font-size:1rem;color:#71717a">/8</span></div>
      <div class="card-chip">active pressures</div>
    </div>
  </div>
  <div style="height:8px;background:#e4e4e7;border-radius:4px;margin-bottom:0.75rem">
    <div style="height:8px;width:100%;background:#2563eb;border-radius:4px"></div>
  </div>
  <div class="card">
    <div class="card-chip">Investor question</div>
    <div class="card-body">Who owns the workflow, the authority, the economics, and the durable control points after the crash?</div>
  </div>`
  ),

  BeliefBreakChart: figWrap(
    "Figure",
    "The belief break",
    "Bubbles survive bad evidence until the story can no longer absorb it. This chart is conceptual rather than numeric. The shaded region between the lines is the belief buffer — when the lines cross, belief breaks and repricing begins.",
    `<div class="card" style="padding:1rem;overflow:hidden">
    ${buildBeliefBreakSVG()}
  </div>
  <div class="grid2" style="margin-top:0.75rem">
    ${card("Belief buffer", "The shaded gap between the lines. As long as it exists, the market can reinterpret weak signals as temporary noise, transition cost, or the price of owning the future.")}
    <div class="card">
      ${card("What the market still believes", "The market no longer assumes that AI exposure automatically means future ownership.")}
      ${card("What the evidence is doing", "Contradictory evidence now arrives as a pattern rather than as isolated exceptions.")}
    </div>
    <div class="card" style="grid-column:1/-1">
      <div class="card-title">What changes at the break</div>
      <div class="card-body">This is the snap point. The story breaks when the evidence exceeds the market's ability to explain it away. After the break, the question is no longer whether AI matters — it is who survives the repricing with real control.</div>
    </div>
  </div>
  <p style="margin-top:0.75rem;font-size:0.8125rem;color:#71717a;line-height:1.65">The chart does not claim precise timing. It visualises the mechanism: contradictory evidence can accumulate for a long time while the story stays intact.</p>`
  ),

  // ── Part 7 ─────────────────────────────────────────────────────────────────
  PostCrashFigure: figWrap(
    "Editorial figure",
    "The investor loses money. The asset survives.",
    "Bubble capital can disappear while the infrastructure, habits and technical direction remain. The crash clears the fantasy layer. It does not roll the world back.",
    `<div class="grid2">
    <div class="card">
      <div class="card-body">This is the chapter's core emotional shift: the capital structure can fail even when the technical substrate remains useful.</div>
      <div class="card" style="background:#f9fafb;margin-top:0.75rem">
        <div class="card-chip" style="font-style:italic">Infrastructure outlives the story</div>
      </div>
    </div>
    <div class="card">
      <div class="card-chip">Bubble phase versus mature phase</div>
      <div class="stack" style="margin-top:0.75rem">
        ${[
          ["Capital rewards exposure to the paradigm", "Capital demands proof of durable capture"],
          ["Capability and narrative dominate", "Cost, governance, execution and margins dominate"],
          [
            "Infrastructure spend reads as confidence",
            "Infrastructure spend gets judged for timing and utilisation",
          ],
          [
            "Many plausible companies get funded",
            "Fewer companies survive, but the technology spreads further",
          ],
          [
            "The story is exciting and legible",
            "The power map becomes quieter, more selective and more extractive",
          ],
        ]
          .map(
            ([b, m]) =>
              `<div class="grid2">
            <div class="card" style="background:#f9fafb"><div class="card-body">${b}</div></div>
            <div class="card accent-bg"><div class="card-body" style="color:#1d4ed8">${m}</div></div>
          </div>`
          )
          .join("")}
      </div>
    </div>
  </div>
  <p style="margin-top:0.75rem;font-size:0.8125rem;color:#71717a">The crash does not end the paradigm. It forces the technology into a more selective, more disciplined and often more extractive mature form.</p>`
  ),

  // ── Part 8 ─────────────────────────────────────────────────────────────────
  OldVsNewPowerMap: figWrap(
    "Editorial figure",
    "Paradigm shifts do not add a layer. They redraw the stack.",
    "The first AI story simply inserts model providers into the old software and cloud map. The mature AI economy rearranges the layers around authority, context, execution and control.",
    `<div class="grid2">
    <div class="card">
      <div class="card-chip">Old map</div>
      <div class="card-body" style="margin-top:0.5rem">Software and cloud-era logic, with AI treated as one more layer to bolt onto the existing stack.</div>
      <div class="stack" style="margin-top:0.75rem">
        ${["Cloud infrastructure", "Model provider layer", "Packaged SaaS applications", "Business workflows inside products", "Users and customers"]
          .map(
            (l, i, a) =>
              `<div class="card" style="background:#f9fafb">
            <div class="row" style="justify-content:space-between">
              <span class="card-title">${l}</span>
              <span class="card-chip">${a.length - i}</span>
            </div>
          </div>`
          )
          .join("")}
      </div>
    </div>
    <div class="card accent-bg">
      <div class="card-chip">New map</div>
      <div class="card-body" style="margin-top:0.5rem">AI-native logic, where intelligence becomes valuable only when it can run inside trusted systems with permission to act.</div>
      <div class="stack" style="margin-top:0.75rem">
        ${["Compute, memory, power and networks", "Devices and operating systems", "Frontier, local, open and specialised models", "Identity, permissions and governance", "Systems of record and trusted context", "Orchestration, evaluation and execution", "Generated workflows and AI-operated companies"]
          .map(
            (l, i, a) =>
              `<div class="card" style="background:#eff6ff;border-color:#bfdbfe">
            <div class="row" style="justify-content:space-between">
              <span class="card-title">${l}</span>
              <span class="card-chip">${a.length - i}</span>
            </div>
          </div>`
          )
          .join("")}
      </div>
    </div>
  </div>
  <div class="grid2" style="margin-top:0.75rem">
    ${card("What the first story assumes", "If the models are powerful enough, the old cloud and SaaS map can stay basically intact.")}
    ${card("What the mature map rewards", "Control over context, permissions, execution and trusted operating surfaces, not just access to intelligence in the abstract.")}
  </div>`
  ),

  // ── Part 8 ─────────────────────────────────────────────────────────────────
  StackA: figWrap(
    "Figure",
    "The mature AI power stack — layers 1–3",
    "Physical and trust infrastructure: the substrate on which all subsequent AI value depends.",
    `<div class="stack">${LAYER_DATA.slice(0, 3).map(layerCard).join("")}</div>`
  ),
  StackB: figWrap(
    "Figure (continued)",
    "The mature AI power stack — layers 4–6",
    "Operating layers: where intelligence connects to data, authority, and economic action.",
    `<div class="stack">${LAYER_DATA.slice(3).map(layerCard).join("")}</div>`
  ),
};

// ── embedded CSS ──────────────────────────────────────────────────────────────

const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{font-size:16px;-webkit-text-size-adjust:100%}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;font-size:1rem;line-height:1.75;color:#18181b;background:#fff}
a{color:#2563eb;text-underline-offset:2px}
.page{max-width:72ch;margin:0 auto;padding:3rem 2rem}

/* title page */
.title-page{text-align:center;padding:8rem 2rem 6rem}
.title-page .series-label{font-size:.7rem;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#2563eb}
.title-page h1{font-size:2.75rem;font-weight:800;letter-spacing:-.025em;color:#18181b;margin-top:.75rem;line-height:1.15}
.title-page .subtitle{font-size:1.2rem;color:#71717a;margin-top:.75rem}
.title-page .tagline{font-size:.875rem;line-height:1.75;color:#a1a1aa;max-width:480px;margin:2rem auto 0}
.title-page .author{font-size:.9375rem;color:#52525b;margin-top:1.5rem;font-weight:500;letter-spacing:.01em}
.title-page .date{font-size:.8125rem;color:#a1a1aa;margin-top:1rem}

/* toc */
.toc{padding:3rem 2rem}
.toc h2{font-size:1.75rem;font-weight:700;color:#18181b;margin-bottom:2rem}
.toc-item{display:flex;align-items:baseline;gap:1rem;border-bottom:1px solid #e4e4e7;padding:.875rem 0;text-decoration:none;color:inherit}
.toc-item:last-child{border-bottom:none}
.toc-label{font-size:.7rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#2563eb;min-width:4.5rem;white-space:nowrap}
.toc-main .toc-title{font-size:.9375rem;font-weight:600;color:#18181b}
.toc-main .toc-summary{font-size:.8125rem;line-height:1.6;color:#71717a;margin-top:.2rem}

/* chapter */
.chapter{padding:3rem 2rem}
.chapter-header{border-bottom:1px solid #e4e4e7;padding-bottom:1.5rem;margin-bottom:2.5rem}
.chapter-header .label{font-size:.7rem;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#2563eb}
.chapter-header h2{font-size:2.25rem;font-weight:800;letter-spacing:-.025em;color:#18181b;margin-top:.4rem;line-height:1.2}

/* prose */
.prose h1,.prose h2,.prose h3,.prose h4{font-weight:700;color:#18181b;line-height:1.3;margin:2.25rem 0 .75rem}
.prose h1{font-size:1.875rem}
.prose h2{font-size:1.5rem}
.prose h3{font-size:1.2rem}
.prose h4{font-size:1rem}
.prose p{margin:1rem 0;color:#27272a}
.prose ul,.prose ol{margin:1rem 0;padding-left:1.75rem;color:#27272a}
.prose li{margin:.4rem 0}
.prose blockquote{border-left:3px solid #2563eb;padding:.5rem 0 .5rem 1.25rem;margin:1.5rem 0;color:#52525b;font-style:italic}
.prose strong{font-weight:700;color:#18181b}
.prose code{background:#f4f4f5;padding:.15em .4em;border-radius:4px;font-size:.875em;font-family:ui-monospace,monospace}
.prose pre{background:#18181b;color:#e4e4e7;padding:1.25rem;border-radius:8px;overflow-x:auto;margin:1.5rem 0}
.prose pre code{background:none;padding:0;color:inherit}
.prose a{color:#2563eb;text-decoration:underline;text-underline-offset:2px}
.prose hr{border:none;border-top:1px solid #e4e4e7;margin:2.5rem 0}
img{max-width:100%;height:auto;display:block}
.prose table{width:100%;border-collapse:collapse;margin:1.5rem 0;font-size:.875rem}
.prose th{background:#f4f4f5;font-weight:700;padding:.5rem .75rem;border:1px solid #e4e4e7;text-align:left}
.prose td{padding:.5rem .75rem;border:1px solid #e4e4e7;vertical-align:top;color:#27272a}

/* figures */
.fig{margin:2.5rem 0;border:1px solid #e4e4e7;border-radius:14px;background:#f9fafb;padding:1.5rem;page-break-inside:avoid}
.fig-header{margin-bottom:1.25rem}
.fig-tag{font-size:.7rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#2563eb}
.fig-title{font-size:1.2rem;font-weight:700;color:#18181b;margin-top:.25rem;line-height:1.3}
.fig-desc{font-size:.875rem;line-height:1.7;color:#52525b;margin-top:.4rem}
.card{background:#fff;border:1px solid #e4e4e7;border-radius:10px;padding:.875rem}
.card-title{font-size:.875rem;font-weight:700;color:#18181b}
.card-body{font-size:.8125rem;line-height:1.65;color:#52525b;margin-top:.3rem}
.card-chip{font-size:.65rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#2563eb}
.grid2{display:grid;grid-template-columns:repeat(2,1fr);gap:.75rem}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem}
.stack{display:flex;flex-direction:column;gap:.75rem}
.num{display:inline-flex;align-items:center;justify-content:center;width:1.5rem;height:1.5rem;border-radius:50%;background:#eff6ff;color:#2563eb;font-size:.75rem;font-weight:700;flex-shrink:0;margin-top:.1rem}
.accent-bg{background:#eff6ff;border-color:#bfdbfe}
.row{display:flex;gap:.75rem;align-items:flex-start}
.phase-list{border:1px solid #e4e4e7;border-radius:10px;overflow:hidden;background:#fff}
.phase-row{display:flex;gap:1rem;padding:.75rem 1rem;border-bottom:1px solid #e4e4e7}
.phase-row:last-child{border-bottom:none}
.phase-num{display:inline-flex;align-items:center;justify-content:center;width:1.75rem;height:1.75rem;border-radius:50%;background:#eff6ff;color:#2563eb;font-size:.75rem;font-weight:700;flex-shrink:0;margin-top:.15rem}
.phase-label{font-size:.875rem;font-weight:700;color:#18181b}
.phase-desc{font-size:.8125rem;color:#27272a;margin:.2rem 0 .4rem;line-height:1.6}
.phase-signals{font-size:.8125rem;color:#52525b;line-height:1.65}

/* print */
@page{size:A4;margin:22mm 20mm}
@media print{
  .page-break-after{page-break-after:always;break-after:page}
  .chapter{page-break-before:always;break-before:page}
  .toc{page-break-before:always;break-before:page}
  .title-page{padding:0;min-height:calc(297mm - 44mm);display:flex;flex-direction:column;align-items:center;justify-content:center}
  /* figures flow as styled document sections */
  .fig{background:none!important;border:none;border-radius:0;padding:0;margin:1.5rem 0;break-inside:avoid;page-break-inside:avoid}
  .fig-header{border-top:2pt solid #2563eb;padding-top:.5rem;margin-bottom:.75rem;break-after:avoid;page-break-after:avoid}
  /* cards: separator rule only, no box overhead */
  .card{background:none!important;border:none;border-top:.5pt solid #e4e4e7;border-radius:0;padding:.3rem 0;break-inside:avoid;page-break-inside:avoid}
  .card .card{border-top-color:transparent;padding-top:.1rem}
  /* phase list */
  .phase-list{border:none;border-radius:0}
  .phase-row{border-bottom:.5pt solid #e4e4e7;padding:.5rem 0;break-inside:avoid;page-break-inside:avoid}
  body{font-size:10.5pt;orphans:3;widows:3}
  h1,h2,h3,h4{break-after:avoid;page-break-after:avoid}
  a{color:#2563eb!important}
  .prose pre{background:#f4f4f5!important;color:#18181b!important}
  .chapter-header{break-after:avoid;page-break-after:avoid}
  img{max-width:100%;height:auto;break-inside:avoid;page-break-inside:avoid}
}
@media(max-width:600px){
  .grid2,.grid3{grid-template-columns:1fr}
}
`;

// ── HTML document ─────────────────────────────────────────────────────────────

// rewrite /posts/<slug> hrefs to #<slug> anchors for in-document navigation
function fixInternalLinks(html) {
  return html.replace(
    /href="\/posts\/(return-on-intelligence-[^"]+)"/g,
    'href="#$1"'
  );
}

function buildDoc(chapters) {
  const tocItems = chapters
    .map(
      ch =>
        `<a class="toc-item" href="#${ch.slug}">
      <div class="toc-label">${ch.label}</div>
      <div class="toc-main">
        <div class="toc-title">${ch.title}</div>
        <div class="toc-summary">${ch.summary}</div>
      </div>
    </a>`
    )
    .join("");

  const chapterSections = chapters
    .map(
      ch =>
        `<section class="chapter" id="${ch.slug}">
      <div class="chapter-header">
        <div class="label">${ch.label}</div>
        <h2>${ch.title}</h2>
      </div>
      <div class="prose">${fixInternalLinks(ch.html)}</div>
    </section>`
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="author" content="Rebecca Powell">
  <meta name="description" content="A nine-part essay on artificial intelligence, the bubble it is building, and the economy that will remain after it breaks.">
  <title>Return on Intelligence — AI and the Programmable Firm</title>
  <style>${CSS}</style>
</head>
<body>

<div class="title-page page-break-after">
  <div class="series-label">Complete series</div>
  <h1>Return on Intelligence</h1>
  <div class="subtitle">AI and the Programmable Firm</div>
  <div class="author">Rebecca Powell</div>
  <div class="tagline">A nine-part essay on artificial intelligence, the bubble it is building, and the economy that will remain after it breaks.</div>
  <div class="date">${new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long" })}</div>
</div>

<section class="toc">
  <h2>Contents</h2>
  ${tocItems}
</section>

${chapterSections}

</body>
</html>`;
}

// ── main ──────────────────────────────────────────────────────────────────────

(async () => {
  console.log("[generate-ebook] Reading series posts…");

  const chapters = [];
  for (const entry of SERIES) {
    const raw = findFile(entry.slug);
    if (!raw) {
      console.warn(`  [warn] no source file found for slug: ${entry.slug}`);
      continue;
    }
    console.log(`  ✓ ${entry.label}: ${entry.title}`);
    const html = await processContent(raw);
    chapters.push({ ...entry, html });
  }

  if (chapters.length === 0) {
    console.error("[generate-ebook] No chapters found. Aborting.");
    process.exit(1);
  }

  const doc = buildDoc(chapters);
  fs.writeFileSync(OUT, doc, "utf-8");
  console.log(`\n[generate-ebook] Written → ${OUT}`);
  console.log("[generate-ebook] Open in a browser and use File → Print → Save as PDF.");
})();
