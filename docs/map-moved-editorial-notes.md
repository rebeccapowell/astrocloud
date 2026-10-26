# The Map Moved: editorial handoff

The article is a standalone postscript to the eight-part May series, delivered in a draft pull request, with a proposed publication date of 1 November 2026 and a research cut-off of 26 October. Its source is `src/data/blog/return-on-intelligence-the-map-moved.mdx`. Content uses `draft: false` so the PR's hosting preview can render the direct URL for review.

## Publication

- Refresh date-sensitive sources before publication and adjust the research cut-off and publication date together.
- Review the argument, source characterisations and assumptions in the four interactive components.
- Merge only when publication is intended. The proposed future date filters the post from discovery until then but does not prevent its direct URL from being generated. The draft PR is the publication boundary.
- At publication, add a short dated note linking to `/posts/return-on-intelligence-the-map-moved/` from Breaking Point and The New Power Map. Those historical articles are untouched in this PR, so there is no public link to an unavailable draft.
- The follow-up is not Part 9 and does not change the original series order or ebook.

## Evidence limits

The revised article follows the Pyramid Principle: its conclusion comes first, supported by three grouped reasons (billing, competition and investor confidence). The opening interactive audit revisits all eight original convergence pressures. Two are labelled Observed, four Emerging and two Mixed. These are editorial evidence assessments, not a crash score. Dated evidence and qualifications live in `src/data/convergenceEvidence.ts`; the ownership map follows the convergence argument rather than replacing it. Labels assess the original mechanism: billing and questioning capex are observable, while model substitution, standalone-product failures and a sustained shift towards profit capture need more evidence than releases, feature overlap and market unease alone.

GitHub announced its billing transition on 27 April, before the May essay; implementation began on 1 June. Current Anthropic and OpenAI pricing pages do not establish universal migration dates. Kimi and DeepSeek existed before May. Mistral's Le Chonk weights and Kimi K3.1 weights were promised, not observed released at the cut-off. Platform feature absorption does not establish named startup failures. Investor concern about overbuild is distinguished from measured excess capacity; the evidence does not establish broad SaaS contraction or systemic defaults.

The sources and access limits appear in the article. The full New York Times transcript was inaccessible; only the publisher's episode description is used. PhotoCraft's inspected README is pinned to a commit; no independent application benchmarks were performed. Supplier engineering reports describe specific environments, not general productivity. The financial report is treated as a downside analysis, without adopting its aggregate exposure figures as verified losses. No event after 26 October is presented as observed.

The scenario explorer is qualitative, with no probabilities or company-specific contractual claims. Calculator defaults are invented assumptions. Its formula charges every attempt for inference and human review, including failed attempts, and displays no unit cost when there are no accepted outcomes.

## Local models, private hosting and personal agents

The extension stays within the existing three-part argument and four interactive figures. It adds local versus API economics, customer-owned colocation versus dedicated hosting, supervised versus lights-out software factories, and competition for the personal-agent interface. These are related mechanisms, not a claim that hosting determines autonomy. The ownership figure now has a seventh layer for distribution and personal agents; the original eight-pressure convergence audit and its evidence labels remain intact.

Chronology: M5 Pro/Max hardware and Revolut AIR's UK rollout predate May. Apple's October MLX results use Mac Studios, not typical MacBooks. Surface Laptop Ultra availability begins 16 October; the US Surface RTX Spark Dev Box is still due to ship in November. Equinix Inference Exchange is a September preview. Dell's 6,500 customers versus 5,000 the prior quarter is supplier-reported, not audited repatriated cloud spend. HPE mixes currently available GPU features with late-2026 and 2027 services. Factory research is scoped and supplier-affiliated; neither it nor hosting announcements establishes widespread autonomous software production on private GPUs.

The governing impact is workload redistribution and competition for the customer relationship. Local/private inference may change who receives AI revenue and who carries financing risk without reducing aggregate chip or power demand. Apple Intelligence is hybrid and distinct from self-hosting Qwen; Grok Bot is cloud-hosted. No population-level claim about local-model adoption, universal cost advantage or enterprise departure from hyperscalers is made. The calculator explicitly excludes owned-infrastructure costs.

## Implementation

`EssayWide.astro` expands only explicitly wrapped figures to at most 72rem, bounded by the viewport. The reading column and other posts retain their existing layout. The React islands render meaningful initial content on the server; expandable text alternatives expose the map and financial scenarios without using the selectors. Controls use native buttons and ranges, visible focus and labelled groups. There are no new dependencies, external scripts or data requests.

For local browser review, run `pnpm dev` and inspect the route above. `node scripts/check-map-moved.mjs` starts its own local server for interaction, responsive layout and fallback checks. It requires an installed Playwright Chromium; restricted environments can supply a packaged browser via `BROWSER_MODULE`.
