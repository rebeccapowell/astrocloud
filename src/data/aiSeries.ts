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

export const AI_SERIES_TITLE = "The AI Bubble Will Burst Because AI Is Real";
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
    title: AI_SERIES_TITLE,
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
    title: "The Business Cards in the Drawer",
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
    title: "The AI Bubble Will Not Burst Because AI Is Fake",
    summary:
      "Why obvious utility creates the most convincing overvaluation and why utility is not the same as capture.",
    experience: "Capture ladder",
    kind: "part",
    partNumber: 2,
    path: "/posts/the-ai-bubble-will-burst-because-ai-is-real-02-ai-is-not-fake",
    lifecycleStages: ["Speculation"],
  },
  {
    slug: "the-ai-bubble-will-burst-because-ai-is-real-03-false-moat",
    label: "Part 3",
    title: "The False Moat of Intelligence as an API",
    summary:
      "Why centralized model APIs look powerful now but may not own the mature AI economy.",
    experience: "Architecture toggle",
    kind: "part",
    partNumber: 3,
    path: "/posts/the-ai-bubble-will-burst-because-ai-is-real-03-false-moat",
    lifecycleStages: ["Overbuild"],
  },
  {
    slug: "the-ai-bubble-will-burst-because-ai-is-real-04-saas-was-a-workaround",
    label: "Part 4",
    title: "SaaS Was a Workaround",
    summary:
      "How cheaper software generation threatens the economics that made generic workflow SaaS dominant.",
    experience: "Buy-build threshold",
    kind: "part",
    partNumber: 4,
    path: "/posts/the-ai-bubble-will-burst-because-ai-is-real-04-saas-was-a-workaround",
    lifecycleStages: ["Overbuild"],
  },
  {
    slug: "the-ai-bubble-will-burst-because-ai-is-real-05-ai-operated-company",
    label: "Part 5",
    title: "The AI-Operated Company",
    summary:
      "Why AI matters not only as a tool but as a new operating model for the company itself.",
    experience: "Operating model comparison",
    kind: "part",
    partNumber: 5,
    path: "/posts/the-ai-bubble-will-burst-because-ai-is-real-05-ai-operated-company",
    lifecycleStages: ["Belief break"],
  },
  {
    slug: "the-ai-bubble-will-burst-because-ai-is-real-06-convergence-point",
    label: "Part 6",
    title: "The Convergence Point",
    summary:
      "The pressure map showing how multiple AI-market assumptions can weaken at the same time.",
    experience: "Convergence and belief gauge",
    kind: "part",
    partNumber: 6,
    path: "/posts/the-ai-bubble-will-burst-because-ai-is-real-06-convergence-point",
    lifecycleStages: ["Belief break"],
  },
  {
    slug: "the-ai-bubble-will-burst-because-ai-is-real-07-after-the-crash",
    label: "Part 7",
    title: "After the Crash Comes the Real AI Economy",
    summary:
      "Why the crash is a repricing event and the mature AI economy begins after the first story fails.",
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
