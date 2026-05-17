export type AiSeriesEntry = {
  slug: string;
  label: string;
  title: string;
  summary: string;
  experience?: string;
  kind: "preface" | "part";
  partNumber?: number;
  path: string;
  lifecycleStages?: string[];
};

export const AI_SERIES_TITLE = "Return on Intelligence";
export const AI_SERIES_SUBTITLE = "AI and the Programmable Firm";
export const AI_SERIES_LIFECYCLE = [
  "Invention",
  "Wonder",
  "Speculation",
  "Overbuild",
  "Belief break",
  "Crash",
  "Consolidation",
  "Mature infrastructure",
  "Extraction",
] as const;

export const aiSeriesEntries: AiSeriesEntry[] = [
  {
    slug: "return-on-intelligence-the-preface",
    label: "Preface",
    title: "The Return",
    summary:
      "The thesis, the reading contract, and the journey through the full eight-part argument.",
    experience: "Series map",
    kind: "preface",
    path: "/posts/return-on-intelligence-the-preface",
    lifecycleStages: [],
  },
  {
    slug: "return-on-intelligence-01-echoes",
    label: "Part 1",
    title: "Echoes",
    summary:
      "Dotcom memory, paradigm shifts, and why real technologies produce the most dangerous bubbles.",
    experience: "Interactive paradigm timeline",
    kind: "part",
    partNumber: 1,
    path: "/posts/return-on-intelligence-01-echoes",
    lifecycleStages: ["Wonder", "Speculation"],
  },
  {
    slug: "return-on-intelligence-02-prototypes",
    label: "Part 2",
    title: "Prototypes",
    summary:
      "Early companies and interfaces are prototypes of futures they may not own. A prototype can be directionally right and economically doomed.",
    experience: "Capture ladder",
    kind: "part",
    partNumber: 2,
    path: "/posts/return-on-intelligence-02-prototypes",
    lifecycleStages: ["Speculation"],
  },
  {
    slug: "return-on-intelligence-02-moats",
    label: "Part 3",
    title: "Moats",
    summary:
      "Intelligence alone is not the moat. Durable moats may be context, distribution, workflow, identity, permissions, governance, execution rights, data and systems of record.",
    experience: "Architecture toggle",
    kind: "part",
    partNumber: 3,
    path: "/posts/return-on-intelligence-02-moats",
    lifecycleStages: ["Overbuild"],
  },
  {
    slug: "return-on-intelligence-04-saas-was-a-compromise",
    label: "Part 4",
    title: "SaaS Was a Compromise",
    summary:
      "SaaS won because custom software was too expensive. AI changes that cost curve, and the compromise gets repriced.",
    experience: "Buy-build threshold",
    kind: "part",
    partNumber: 4,
    path: "/posts/return-on-intelligence-04-saas-was-a-compromise",
    lifecycleStages: ["Overbuild"],
  },
  {
    slug: "return-on-intelligence-05-firmware",
    label: "Part 5",
    title: "Firmware",
    summary:
      "Firm-ware is the operating logic embedded into the company itself. AI makes that logic programmable.",
    experience: "Operating model comparison",
    kind: "part",
    partNumber: 5,
    path: "/posts/return-on-intelligence-05-firmware",
    lifecycleStages: ["Belief break"],
  },
  {
    slug: "return-on-intelligence-05-breaking-point",
    label: "Part 6",
    title: "Breaking Point",
    summary:
      "The market does not stop believing in AI. It starts doubting who owns it. The pressure map showing how multiple assumptions weaken at the same time.",
    experience: "Convergence and belief gauge",
    kind: "part",
    partNumber: 6,
    path: "/posts/return-on-intelligence-05-breaking-point",
    lifecycleStages: ["Belief break"],
  },
  {
    slug: "return-on-intelligence-07-after-the-crash",
    label: "Part 7",
    title: "After the Crash",
    summary:
      "The crash is a repricing event. The mature AI economy begins after the first ownership story fails.",
    experience: "Reset sequence",
    kind: "part",
    partNumber: 7,
    path: "/posts/return-on-intelligence-07-after-the-crash",
    lifecycleStages: ["Crash", "Consolidation", "Mature infrastructure"],
  },
  {
    slug: "return-on-intelligence-08-new-power-map",
    label: "Part 8",
    title: "The New Power Map",
    summary:
      "A layered view of the durable winners, pressured groups, and control points in the mature AI economy.",
    experience: "Interactive power stack",
    kind: "part",
    partNumber: 8,
    path: "/posts/return-on-intelligence-08-new-power-map",
    lifecycleStages: ["Mature infrastructure", "Extraction"],
  },
];

export function getAiSeriesEntry(slug: string) {
  return aiSeriesEntries.find(entry => entry.slug === slug);
}

export function isAiSeriesSlug(slug: string) {
  return Boolean(getAiSeriesEntry(slug));
}

export function getAiSeriesNeighbors(slug: string) {
  const currentIndex = aiSeriesEntries.findIndex(entry => entry.slug === slug);

  if (currentIndex === -1) {
    return { previous: undefined, next: undefined };
  }

  return {
    previous: currentIndex > 0 ? aiSeriesEntries[currentIndex - 1] : undefined,
    next:
      currentIndex < aiSeriesEntries.length - 1
        ? aiSeriesEntries[currentIndex + 1]
        : undefined,
  };
}
