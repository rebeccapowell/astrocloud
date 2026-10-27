export type EvidenceStatus = "Observed" | "Emerging" | "Mixed" | "Unconfirmed";
export type ConvergencePressure = {
  id: string;
  title: string;
  status: EvidenceStatus;
  conclusion: string;
  may: string;
  evidence: { date: string; fact: string; source: string }[];
  meaning: string;
  reservation: string;
};

// Editorial assessments as at 26 October 2026. These are not crash probabilities.
export const convergenceEvidence: ConvergencePressure[] = [
  {
    id: "model-scarcity",
    title: "Model scarcity",
    status: "Emerging",
    conclusion:
      "Customers have more credible alternatives to the leading closed models.",
    may: "Smaller, cheaper, specialised and local models could reduce the premium for access to intelligence.",
    evidence: [
      {
        date: "July 2026",
        fact: "Kimi's K3 release expanded its agent and coding offering; its current documentation reports released weights.",
        source: "#source-kimi",
      },
      {
        date: "10 September 2026",
        fact: "DeepSeek introduced V4.1-Flash with lower API prices and peak/off-peak rates.",
        source: "#source-deepseek",
      },
      {
        date: "6 October 2026",
        fact: "Mistral launched the Large 4 API preview, nicknamed Le Chonk, with weights promised for the end of October.",
        source: "#source-mistral",
      },
      {
        date: "7 October announcement",
        fact: "Microsoft offered local-AI Surface hardware: laptop availability from 16 October, with the US RTX Spark Dev Box due to ship in November.",
        source: "#source-surface-local",
      },
      {
        date: "15 October 2026",
        fact: "Apple demonstrated Qwen and other open models with MLX on Mac Studio, including multi-machine inference for larger models.",
        source: "#source-apple-local",
      },
    ],
    meaning:
      "A buyer can compare APIs with models on a laptop or dedicated infrastructure, using paid services for work that needs them. Some computing spend could move towards hardware and hosting rather than model-access fees.",
    reservation:
      "How much work will customers actually move? A cheaper model still has to do the job well enough, and running it yourself requires suitable hardware.",
  },
  {
    id: "token-economics",
    title: "Token economics",
    status: "Observed",
    conclusion:
      "The cost of agent work is more visible, even as token prices fall.",
    may: "Subsidised experimentation would give way to customers measuring the cost of useful work.",
    evidence: [
      {
        date: "27 April → 1 June 2026",
        fact: "GitHub announced AI Credits based on token consumption, replacing premium requests for migrating plans. Annual subscribers had a separate transition.",
        source: "#source-copilot-billing",
      },
      {
        date: "30 July 2026",
        fact: "OpenAI cut GPT-5.6 Luna's API prices by 80%, attributing the reduction to efficiency gains.",
        source: "#source-openai-price-cut",
      },
      {
        date: "22 September 2026",
        fact: "Opus 5.5 launched with input and output prices 20% below Opus 5 and cached-input prices 60% lower. Anthropic says it requires less compute to serve.",
        source: "#source-anthropic-price-cut",
      },
      {
        date: "15 October 2026",
        fact: "Vercel reports September AI Gateway spending about thirteen times December's, alongside a 47% fall in average price per token. The mix of models also changed.",
        source: "#source-gateway-pricing",
      },
      {
        date: "26 October pricing snapshot",
        fact: "Claude Enterprise lists a seat charge plus usage at API rates. Consumer usage limits are a different arrangement.",
        source: "#source-claude-billing",
      },
      {
        date: "26 October pricing snapshot",
        fact: "OpenAI documents shared Work/Codex allowances and credits, with token rates for credit-based usage; API billing remains separate.",
        source: "#source-openai-billing",
      },
    ],
    meaning:
      "Usage can grow faster than prices fall. Buyers need to compare the cost of completed work and their subscription allowances; suppliers need enough income after computing costs to fund the rest of the business.",
    reservation:
      "How much do price cuts reflect cheaper computing, and how much is competition squeezing margins? The price alone does not tell us whether a supplier is losing money.",
  },
  {
    id: "enterprise-roi",
    title: "Enterprise returns",
    status: "Mixed",
    conclusion:
      "The gap between using AI and achieving major business gains is measurable.",
    may: "Integration, permissions, data quality and organisational change could delay enterprise returns.",
    evidence: [
      {
        date: "19 October 2026",
        fact: "Gartner reports that 13% of surveyed CIOs see significant or transformational AI value. The survey covered 2,002 CIOs and technology executives in May–July.",
        source: "#source-roi",
      },
    ],
    meaning:
      "The revenue that suppliers expect from widespread transformation may arrive later than the investment made to serve it.",
    reservation:
      "How quickly will smaller benefits turn into lasting business gains? The other survey respondents may already be getting useful, less dramatic results.",
  },
  {
    id: "capex",
    title: "Infrastructure spending",
    status: "Observed",
    conclusion:
      "Infrastructure spending is being questioned as well as celebrated.",
    may: "The same capital spending could change from proof of demand into concern about mistimed supply.",
    evidence: [
      {
        date: "23 October 2026",
        fact: "Reuters describes investor concern over the financing of AI spending and scrutiny of future buildout plans.",
        source: "#source-capex-market",
      },
      {
        date: "April 2026 baseline",
        fact: "Amazon's shareholder letter described unserved demand and capacity constraints, a counterpoint to the overbuild argument.",
        source: "#source-aws-demand",
      },
      {
        date: "21 October 2026",
        fact: "Dell reports more than 6,500 AI Factory customers, up from 5,000 the previous quarter.",
        source: "#source-private-adoption",
      },
    ],
    meaning:
      "Investors are asking when capacity will earn enough to justify its cost. Local and private inference also change which provider might receive the revenue, while shifting some investment risk to customers.",
    reservation:
      "Will future capacity attract enough paying work? Today's shortages can coexist with too much investment in tomorrow's supply.",
  },
  {
    id: "saas",
    title: "SaaS pricing power",
    status: "Mixed",
    conclusion:
      "Software is easier to challenge, but established platforms can still grow.",
    may: "Generated software, fewer seats and bundled AI could weaken generic workflow subscriptions.",
    evidence: [
      {
        date: "October 2026",
        fact: "ArtCraft's applications demonstrate an attempt to reproduce established creative workflows; PhotoCraft remains early alpha.",
        source: "#source-photocraft",
      },
      {
        date: "21 October 2026",
        fact: "SAP reported stronger cloud revenue and backlog as customers continued to buy its services.",
        source: "#source-saas-results",
      },
      {
        date: "28 September 2026",
        fact: "Microsoft researchers and collaborators describe software-factory work across tens of repositories, focused on improving data systems.",
        source: "#source-software-factories",
      },
    ],
    meaning:
      "The threat depends on what the customer pays for: a replaceable feature, or records, integration and a dependable service.",
    reservation:
      "Will customers replace subscriptions, or keep paying for reliable service and integration? Building an alternative is only the beginning.",
  },
  {
    id: "wrappers",
    title: "Standalone AI products",
    status: "Emerging",
    conclusion:
      "ChatGPT and Gemini now include work that once supported separate AI tools.",
    may: "Narrow AI products could fail as platforms, incumbents and internal builds absorb their functions.",
    evidence: [
      {
        date: "July 2026",
        fact: "OpenAI's Work documentation describes research, files, apps and finished documents, spreadsheets, presentations and Sites inside its broader product.",
        source: "#source-platform-bundling",
      },
      {
        date: "19 August 2026",
        fact: "Google announced Deep Research in Gemini Live for all Gemini app users, subject to availability and usage limits.",
        source: "#source-gemini-research",
      },
      {
        date: "20 October 2026",
        fact: "Google announced Gemini business tools for brand assets, connected apps and financial insights.",
        source: "#source-gemini-business",
      },
    ],
    meaning:
      "A separate product must offer enough additional value to justify another purchase when a similar function is already available in the customer's main assistant.",
    reservation:
      "Which specialists offer enough extra value to keep their customers? Bundled features raise the pressure, but quality, trust and integration can still justify another purchase.",
  },
  {
    id: "financing",
    title: "Financing stress",
    status: "Unconfirmed",
    conclusion:
      "There is more scrutiny of the financing, but the stress May anticipated remains an open risk.",
    may: "Leases, debt and guarantees could transmit trouble before the technology itself disappoints.",
    evidence: [
      {
        date: "26 October 2026",
        fact: "Anthropic's IPO filing warns about capacity payments regardless of usage, alongside improved operating results.",
        source: "#source-anthropic-filing",
      },
      {
        date: "October 2026",
        fact: "Brace for Impact maps financial connections and possible transmission of losses beyond AI suppliers.",
        source: "#source-report",
      },
      {
        date: "26 October 2026",
        fact: "Reuters links market unease to the capital needed for AI investment.",
        source: "#source-belief-market",
      },
    ],
    meaning:
      "Useful products do not remove payment deadlines. Some businesses may need to refinance before customer income covers their commitments.",
    reservation:
      "Who has to pay if a customer or project runs out of money? That depends on the borrowing, leases and guarantees behind each deal.",
  },
  {
    id: "belief",
    title: "Belief stress",
    status: "Emerging",
    conclusion:
      "Investors are questioning AI spending despite continuing enthusiasm for AI.",
    may: "Investors would start asking who earns the profit rather than rewarding AI exposure alone.",
    evidence: [
      {
        date: "16 October 2026",
        fact: "The Ezra Klein Show brought the bubble argument and a more optimistic case into a direct debate.",
        source: "#source-klein",
      },
      {
        date: "26 October 2026",
        fact: "Reuters reports selling in technology stocks and concern over the eventual payoff from AI spending.",
        source: "#source-belief-market",
      },
    ],
    meaning:
      "The change in the story has begun: spending more is no longer automatically reassuring. That is evidence of strain in belief, even while AI remains useful.",
    reservation:
      "Will the doubts last, or will optimism return? A selloff can reverse, and AI is only one of the forces moving markets.",
  },
];
