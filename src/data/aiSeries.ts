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
    slug: "the-ai-bubble-will-burst-because-ai-is-real",
    label: "Preface",
    title: "The Return",
    summary:
      "The thesis, the reading contract, and the journey through the full eight-part argument.",
    experience: "Series map",
    kind: "preface",
    path: "/posts/the-ai-bubble-will-burst-because-ai-is-real",
    lifecycleStages: [],
  },
  {
    slug: "the-ai-bubble-will-burst-because-ai-is-real-01-business-cards",
    label: "Part 1",
    title: "Echoes",
    summary:
      "Dotcom memory, paradigm shifts, and why real technologies produce the most dangerous bubbles.",
    experience: "Interactive paradigm timeline",
    kind: "part",
    partNumber: 1,
    path: "/posts/the-ai-bubble-will-burst-because-ai-is-real-01-business-cards",
    lifecycleStages: ["Wonder", "Speculation"],
  },
  {
    slug: "the-ai-bubble-will-burst-because-ai-is-real-02-ai-is-not-fake",
    label: "Part 2",
    title: "Prototypes",
    summary:
      "Early companies and interfaces are prototypes of futures they may not own. A prototype can be directionally right and economically doomed.",
    experience: "Capture ladder",
    kind: "part",
    partNumber: 2,
    path: "/posts/the-ai-bubble-will-burst-because-ai-is-real-02-ai-is-not-fake",
    lifecycleStages: ["Speculation"],
  },
  {
    slug: "the-ai-bubble-will-burst-because-ai-is-real-03-false-moat",
    label: "Part 3",
    title: "Moats",
    summary:
      "Intelligence alone is not the moat. Durable moats may be context, distribution, workflow, identity, permissions, governance, execution rights, data and systems of record.",
    experience: "Architecture toggle",
    kind: "part",
    partNumber: 3,
    path: "/posts/the-ai-bubble-will-burst-because-ai-is-real-03-false-moat",
    lifecycleStages: ["Overbuild"],
  },
  {
    slug: "the-ai-bubble-will-burst-because-ai-is-real-04-saas-was-a-workaround",
    label: "Part 4",
    title: "SaaS Was a Compromise",
    summary:
      "SaaS won because custom software was too expensive. AI changes that cost curve, and the compromise gets repriced.",
    experience: "Buy-build threshold",
    kind: "part",
    partNumber: 4,
    path: "/posts/the-ai-bubble-will-burst-because-ai-is-real-04-saas-was-a-workaround",
    lifecycleStages: ["Overbuild"],
  },
  {
    slug: "the-ai-bubble-will-burst-because-ai-is-real-05-ai-operated-company",
    label: "Part 5",
    title: "Firmware",
    summary:
      "Firm-ware is the operating logic embedded into the company itself. AI makes that logic programmable.",
    experience: "Operating model comparison",
    kind: "part",
    partNumber: 5,
    path: "/posts/the-ai-bubble-will-burst-because-ai-is-real-05-ai-operated-company",
    lifecycleStages: ["Belief break"],
  },
  {
    slug: "the-ai-bubble-will-burst-because-ai-is-real-06-convergence-point",
    label: "Part 6",
    title: "Breaking Point",
    summary:
      "The market does not stop believing in AI. It starts doubting who owns it. The pressure map showing how multiple assumptions weaken at the same time.",
    experience: "Convergence and belief gauge",
    kind: "part",
    partNumber: 6,
    path: "/posts/the-ai-bubble-will-burst-because-ai-is-real-06-convergence-point",
    lifecycleStages: ["Belief break"],
  },
  {
    slug: "the-ai-bubble-will-burst-because-ai-is-real-07-after-the-crash",
    label: "Part 7",
    title: "After the Crash",
    summary:
      "The crash is a repricing event. The mature AI economy begins after the first ownership story fails.",
    experience: "Reset sequence",
    kind: "part",
    partNumber: 7,
    path: "/posts/the-ai-bubble-will-burst-because-ai-is-real-07-after-the-crash",
    lifecycleStages: ["Crash", "Consolidation", "Mature infrastructure"],
  },
  {
    slug: "the-ai-bubble-will-burst-because-ai-is-real-08-new-power-map",
    label: "Part 8",
    title: "The New Power Map",
    summary:
      "A layered view of the durable winners, pressured groups, and control points in the mature AI economy.",
    experience: "Interactive power stack",
    kind: "part",
    partNumber: 8,
    path: "/posts/the-ai-bubble-will-burst-because-ai-is-real-08-new-power-map",
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
