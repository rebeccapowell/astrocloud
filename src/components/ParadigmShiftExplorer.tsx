import { type ReactNode, useEffect, useRef, useState } from "react";

type Phase = {
  id: string;
  label: string;
  years: string;
  summary: string;
  marketBehavior: string;
  signal: string;
  examples: string[];
};

type IconButtonProps = {
  label: string;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  isActive?: boolean;
};

const phases: Phase[] = [
  {
    id: "pioneer",
    label: "Pioneer",
    years: "1",
    summary:
      "The technology looks narrow, strange, or toy-like, but a few people can already feel that it changes the shape of the future.",
    marketBehavior:
      "Most people dismiss it because the first version is incomplete and awkward.",
    signal:
      "The capability is real, but the infrastructure and habits around it do not exist yet.",
    examples: ["Toy-like demos", "Hobbyist use", "Early believers"],
  },
  {
    id: "discovery",
    label: "Discovery",
    years: "2",
    summary:
      "The implications start to become legible. People cannot fully explain the business model yet, but they can sense that the technology matters.",
    marketBehavior:
      "Language, excitement, and early frameworks emerge before the market structure is settled.",
    signal: "The imagination starts to outrun the operating model.",
    examples: ["New vocabulary", "Growing attention", "Early category stories"],
  },
  {
    id: "speculation",
    label: "Speculation",
    years: "3",
    summary:
      "Capital, talent, and narrative rush toward the opening. Every company wants to sound native to the new paradigm.",
    marketBehavior: "The story becomes easier to fund than to operate.",
    signal:
      "Valuation begins leaning on possibility more than on durable economics.",
    examples: ["Funding rush", "Platform rhetoric", "Thin wrappers"],
  },
  {
    id: "overbuild",
    label: "Overbuild",
    years: "4",
    summary:
      "The market starts pricing the mature form of the technology before the profit pools, customer habits, and control points are actually stable.",
    marketBehavior:
      "Infrastructure, expectations, and valuation all move too far ahead of reality.",
    signal:
      "The future may be real, but it is being monetized too early and too confidently.",
    examples: ["Capacity buildout", "Premature moats", "Mature-market pricing"],
  },
  {
    id: "belief-break",
    label: "Belief break",
    years: "5",
    summary:
      "The first market story loses credibility. The technology does not disappear, but belief in the early ownership model breaks.",
    marketBehavior:
      "Contradictory evidence stops looking temporary and starts looking structural.",
    signal: "The story cracks before the paradigm does.",
    examples: ["Missed assumptions", "Funding stress", "Narrative fracture"],
  },
  {
    id: "consolidation",
    label: "Consolidation",
    years: "6",
    summary:
      "Assets survive, but ownership changes. Infrastructure is reused. Weak companies disappear or get absorbed.",
    marketBehavior: "The market becomes more selective and less romantic.",
    signal: "What matters now is durability, not symbolism.",
    examples: ["Mergers", "Asset reuse", "Sharper business models"],
  },
  {
    id: "mature-market",
    label: "Mature market",
    years: "7",
    summary:
      "The real profit pools settle later, often in different layers than the first wave expected.",
    marketBehavior:
      "Power collects around the control points that turned out to matter most.",
    signal:
      "The paradigm survives, but the winners are not necessarily the companies that introduced it.",
    examples: ["Settled margins", "Control points", "New incumbents"],
  },
];

function IconButton({
  label,
  onClick,
  children,
  disabled = false,
  isActive = false,
}: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      disabled={disabled}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
        isActive
          ? "border-accent bg-accent text-background"
          : "border-border bg-background text-foreground hover:bg-muted"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      <span aria-hidden="true">{children}</span>
    </button>
  );
}

export default function ParadigmShiftExplorer() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = (matches: boolean) => {
      setPrefersReducedMotion(matches);
      if (matches) setIsAutoPlaying(false);
    };

    updatePreference(mediaQuery.matches);

    const handleChange = ({ matches }: MediaQueryListEvent) =>
      updatePreference(matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || prefersReducedMotion) return;

    const intervalId = window.setInterval(() => {
      setActiveIndex(currentIndex =>
        currentIndex === phases.length - 1 ? 0 : currentIndex + 1
      );
    }, 3200);

    return () => window.clearInterval(intervalId);
  }, [isAutoPlaying, prefersReducedMotion]);

  useEffect(() => {
    const activeCard = cardRefs.current[activeIndex];
    if (!activeCard) return;

    activeCard.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeIndex, prefersReducedMotion]);

  const activePhase = phases[activeIndex];

  const goToPrevious = () => {
    setActiveIndex(currentIndex =>
      currentIndex === 0 ? phases.length - 1 : currentIndex - 1
    );
  };

  const goToNext = () => {
    setActiveIndex(currentIndex =>
      currentIndex === phases.length - 1 ? 0 : currentIndex + 1
    );
  };

  return (
    <section
      aria-labelledby="paradigm-shift-explorer-title"
      className="not-prose my-10 rounded-2xl border border-border bg-muted/40 p-5 sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
            Interactive view
          </p>
          <div
            id="paradigm-shift-explorer-title"
            className="mt-1 text-xl font-semibold text-foreground"
          >
            How a paradigm shift gets mispriced
          </div>
          <p className="mt-2 text-sm leading-6 text-foreground/80">
            Step through the usual arc: the capability appears, the story gets
            ahead of the economics, belief breaks, and the mature market settles
            somewhere else.
          </p>
        </div>

        <div className="flex flex-nowrap items-center gap-2 self-end sm:self-start">
          <IconButton label="Previous phase" onClick={goToPrevious}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 18l-6-6 6-6"
              />
            </svg>
          </IconButton>
          <IconButton
            label={
              prefersReducedMotion
                ? "Autoplay disabled for reduced motion"
                : isAutoPlaying
                  ? "Stop autoplay"
                  : "Play through timeline"
            }
            onClick={() => setIsAutoPlaying(current => !current)}
            disabled={prefersReducedMotion}
            isActive={isAutoPlaying}
          >
            {isAutoPlaying ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
              >
                <rect x="7" y="7" width="10" height="10" rx="1.5" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M8 6.5v11a1 1 0 0 0 1.53.848l8.8-5.5a1 1 0 0 0 0-1.696l-8.8-5.5A1 1 0 0 0 8 6.5Z" />
              </svg>
            )}
          </IconButton>
          <IconButton label="Next phase" onClick={goToNext}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 6l6 6-6 6"
              />
            </svg>
          </IconButton>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs leading-5 text-foreground/70">
            The cards flow left to right across the shift. Choose a phase or use
            autoplay to move through the story.
          </p>
          <p className="text-xs font-semibold tracking-[0.18em] whitespace-nowrap text-accent uppercase">
            Phase {activeIndex + 1} of {phases.length}
          </p>
        </div>

        <div className="relative mt-5">
          <ol className="scrollbar-thin -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pt-1 pb-4">
            {phases.map((phase, index) => {
              const isActive = index === activeIndex;

              return (
                <li
                  key={phase.id}
                  className="w-[14.5rem] max-w-[82vw] flex-none snap-center self-start sm:w-[15.5rem] lg:w-[16.25rem]"
                >
                  <button
                    type="button"
                    ref={element => {
                      cardRefs.current[index] = element;
                    }}
                    onClick={() => setActiveIndex(index)}
                    className={`relative flex h-full min-h-[15.25rem] w-full flex-col items-start rounded-2xl border px-4 pt-4 pb-4 text-left transition-all duration-300 motion-reduce:transition-none ${
                      isActive
                        ? "border-accent bg-background shadow-[0_16px_30px_rgba(0,0,0,0.08)] ring-1 ring-accent/20"
                        : "border-border bg-background/90 hover:border-accent/50"
                    }`}
                    aria-current={isActive ? "step" : undefined}
                  >
                    <div className="relative mb-5 flex h-8 w-full shrink-0 items-center justify-center">
                      {index > 0 && (
                        <span className="absolute top-3 -left-6 h-px w-[calc(50%+1.5rem)] bg-border" />
                      )}
                      {index < phases.length - 1 && (
                        <span className="absolute top-3 -right-6 h-px w-[calc(50%+1.5rem)] bg-border" />
                      )}
                      <span
                        className={`relative z-10 inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                          isActive
                            ? "bg-accent text-background"
                            : index < activeIndex
                              ? "bg-accent/15 text-accent"
                              : "bg-background text-foreground"
                        }`}
                      >
                        {phase.years}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
                        Phase
                      </span>
                      <span
                        className={`mt-1 h-2.5 w-2.5 rounded-full ${
                          isActive ? "bg-accent" : "bg-border"
                        }`}
                      />
                    </div>
                    <div className="mt-4 text-base font-semibold text-foreground">
                      {phase.label}
                    </div>
                    <div className="mt-3 text-sm leading-6 text-foreground/68">
                      {phase.signal}
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-2xl border border-border bg-background p-5">
          <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
            Current frame
          </p>
          <h4 className="mt-2 text-lg font-semibold text-foreground">
            {activePhase.label}
          </h4>
          <p className="mt-3 text-sm leading-7 text-foreground/85">
            {activePhase.summary}
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-muted/45 p-4">
              <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
                What the market does
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground/80">
                {activePhase.marketBehavior}
              </p>
            </div>
            <div className="rounded-xl bg-muted/45 p-4">
              <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
                What the reader should notice
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground/80">
                {activePhase.signal}
              </p>
            </div>
          </div>
        </div>

        <aside className="rounded-2xl border border-border bg-background p-5">
          <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
            Typical signs
          </p>
          <ul className="mt-3 space-y-3 text-sm leading-6 text-foreground/80">
            {activePhase.examples.map(example => (
              <li key={example} className="flex gap-3">
                <span className="mt-2 h-2 w-2 flex-none rounded-full bg-accent" />
                <span>{example}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 rounded-xl border border-dashed border-border p-4 text-sm leading-6 text-foreground/75">
            The mistake is not identifying the paradigm. The mistake is assuming
            the first market story already reveals the final ownership map.
          </div>
        </aside>
      </div>
    </section>
  );
}
