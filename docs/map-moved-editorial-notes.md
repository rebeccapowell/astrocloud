# The Map Moved: editorial handoff

The article is a standalone follow-up to the May series. Publication is proposed for 1 November 2026, with research checked to 26 October. The article uses `draft: false` so the direct preview route renders, while the future date keeps it out of listings. PR #49 remains the publication boundary.

## Editorial direction

The article now asks what May got right, what the author would change and what remains unresolved. The clearest correction is confidence in a crash as the turning point. Local models, devices, permissions and systems of record were already part of May's argument, so the follow-up credits those calls rather than pretending they were missed. The original essays are unchanged.

The main text is written for a general technology audience. Research-process comments, repeated statements about what a source does not establish, and accounting or methodology digressions have been removed. Material distinctions remain in ordinary language: a pending product is still pending, local hardware still costs money, and a survey's smaller benefits are different from no benefit. Sources retain links and dates. The Klein link is an episode listing and publisher summary; the article does not quote an unavailable transcript.

The calculator has been removed from the article, React module and CSS. Its point is now a short bug-fixing example: compare the cost of completed work, including retries and review. The three remaining figures are the convergence map, financial scenarios and ownership map. Their copy has also been simplified.

## Research and publication

- Refresh date-sensitive sources before publication and adjust the research cut-off and publication date together.
- Do not infer mass departure from hyperscalers from product announcements or Dell's supplier-reported customer count.
- Apple's March M5 Pro/Max hardware and Revolut's April UK AIR rollout predate May. Apple's October MLX demonstrations use Mac Studios.
- Microsoft announced October laptop availability and November US Dev Box delivery. Equinix Inference Exchange is a preview; HPE's services have different rollout dates.
- Software-factory research covers particular tasks and environments. Hosting choice and autonomy are separate decisions.
- The report's scenarios describe possible financial harm, not observed defaults or measured loss probabilities.
- At publication, consider a dated link from Breaking Point and The New Power Map. The follow-up is not an extra numbered chapter and does not change the ebook.

The convergence labels are two Observed, three Emerging, two Mixed and one Unconfirmed. Financing stress is Unconfirmed: scrutiny of risk and future commitments is not itself an observed financing failure. The ownership map explicitly retains May's existing argument about records and business knowledge.

Anthropic's 26 October IPO filing is included directly as counter-evidence and a description of future commitments. The financial statements report Q2 revenue of about $11.6 billion and operating income of about $1 billion. The June 30 purchase commitments of $265.6 billion and not-yet-commenced leases of $321.4 billion are future payments, not a present borrowing balance. Some lease arrangements are conditional.

The Reddit post was subsequently supplied in full and checked against the filing's Notes 2, 7, 8, 9 and 13. Note 8 discloses cost of revenue separately from R&D. The $72.4 billion fair-value charge is for H1, not Q2. The $42 billion facility was undrawn at June 30. Cloud marketplaces are billing channels for end customers, and the filing explains its principal-based gross revenue policy. The post's allegations of hidden costs or improper accounting are not adopted.

The Hacker News discussion at https://news.ycombinator.com/item?id=50242939 supplied further questions rather than new financial evidence. The filing's risk factors confirm the mismatch between primarily usage-based revenue and multi-year infrastructure commitments. The article now connects that mismatch with the earlier discussion of open models and private hosting: growing AI demand can coexist with pressure on suppliers' margins. Multi-year commitments are not compared with a single year's revenue, and channel concentration is not treated as proof of concentrated end-customer demand.

OpenAI announced a confidential S-1 submission on 8 June. No comparable public prospectus was identified as at 27 October. Its February AWS expansion and Amazon investment announcement are included as a public example of overlapping investor/supplier roles, with no inference of improper revenue. These arrangements predate May. Financial disclosures were checked on 27 October; the broader evidence map retains its 26 October assessment date.

The token-economics revision follows Max Woolf's 25 October article and the discussion at https://news.ycombinator.com/item?id=50236102. Official OpenAI and Anthropic announcements substantiate the selected price cuts and supplier claims about serving efficiency. The May essay already anticipated cheaper inference; the correction addresses its phrase "priced honestly", without inventing a prediction that token prices must rise. Caching, subscription allowances and total spending are separate from headline API prices. Vercel's October index is gateway-specific and reflects changes in model mix; its December-to-September comparison is not described as a May-to-October measure or an industry-wide price index. Provider price cuts alone establish neither profit nor loss, and serving margin is distinct from company profitability. HN comments about regulation, subsidies and provider profits are not treated as established facts.

## Implementation and checks

`EssayWide.astro` expands only the wrapped figures, up to 72rem and bounded by the viewport. The React islands provide server-rendered content and expandable text alternatives. The ownership map includes a seventh layer for distribution and personal agents. There are no new dependencies or external data requests.

`node scripts/check-map-moved.mjs` starts a local server and checks the three figures, map filters and views, financial scenarios, source anchors, no-JS alternatives and responsive layouts. It requires Playwright Chromium; `BROWSER_MODULE` can supply a packaged browser in restricted environments. Run the repository's formatting, lint and build checks before updating the PR.
