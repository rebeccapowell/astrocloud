import { useMemo, useState } from "react";

type Pressure = {
  id: string;
  title: string;
  shortLabel: string;
  signal: string;
  risk: string;
  repricingQuestion: string;
};

const pressures: Pressure[] = [
  {
    id: "model-scarcity",
    title: "Model scarcity premium declines",
    shortLabel: "Model scarcity",
    signal:
      "Smaller, cheaper, specialized, and local models absorb more routine work.",
    risk: "The centralized API captures less of the everyday value than the market expects.",
    repricingQuestion: "How much of the workflow still needs the frontier?",
  },
  {
    id: "token-economics",
    title: "Token economics become visible",
    shortLabel: "Token economics",
    signal: "Subsidized experimentation gives way to real unit economics.",
    risk: "Usage can stay high while margin quality weakens.",
    repricingQuestion:
      "Does this AI usage generate durable profit or just activity?",
  },
  {
    id: "enterprise-roi",
    title: "Enterprise ROI disappoints before it matures",
    shortLabel: "Enterprise ROI",
    signal:
      "Messy data, governance, and change management slow the conversion from pilot to operating model.",
    risk: "Revenue curves flatten before the deeper transformation arrives.",
    repricingQuestion:
      "Is the value real now, or merely delayed and more expensive than expected?",
  },
  {
    id: "capex",
    title: "Hyperscaler capex becomes a question",
    shortLabel: "Capex",
    signal:
      "The same infrastructure spend can be read as either conviction or overbuild.",
    risk: "Data-center confidence can turn into capital-discipline language very quickly.",
    repricingQuestion:
      "Is infrastructure still proof of demand, or evidence of mistimed supply?",
  },
  {
    id: "saas",
    title: "SaaS growth and pricing power weaken",
    shortLabel: "SaaS pressure",
    signal:
      "AI compresses seats, weakens workflow rents, and makes custom internal software more plausible.",
    risk: "Products that looked defensive become exposed to the new cost curve.",
    repricingQuestion:
      "Is the workflow still scarce enough to justify the multiple?",
  },
  {
    id: "wrappers",
    title: "Thin AI wrappers fail",
    shortLabel: "Wrapper failures",
    signal:
      "Model providers, incumbents, open source, and internal builds crush narrow wrapper products.",
    risk: "The market sees that not every use case is a company.",
    repricingQuestion:
      "Which products have real ownership, and which are just packaging?",
  },
  {
    id: "financing",
    title: "Financing stress appears below the surface",
    shortLabel: "Financing stress",
    signal:
      "Infrastructure commitments and private vehicles become fragile before public sentiment fully changes.",
    risk: "The crack can start in the balance sheet beneath the AI story, not only in the products above it.",
    repricingQuestion:
      "What happens if capital gets tighter before utilization catches up?",
  },
  {
    id: "belief",
    title: "Belief shifts from exposure to capture",
    shortLabel: "Belief shift",
    signal:
      "The market stops rewarding AI adjacency and starts demanding proof of who owns the profit pool.",
    risk: "Exposure stops being enough once investors begin asking harder ownership questions.",
    repricingQuestion:
      "Who owns the workflow, the data, the permissions, and the execution rights?",
  },
];

function getNarrativeState(selectedCount: number) {
  if (selectedCount <= 1) {
    return {
      label: "Story intact",
      summary:
        "The market can still explain the discomfort as the cost of owning the future.",
      marketRead:
        "Contradictions still feel temporary, and capital treats the discomfort as a tolerable tax on future ownership.",
      investorQuestion: "How do we stay exposed to the upside?",
    };
  }

  if (selectedCount <= 3) {
    return {
      label: "Story strained",
      summary:
        "A few assumptions look softer, but belief still absorbs the contradictions.",
      marketRead:
        "The narrative still works, but it needs more explanation and more faith than it used to.",
      investorQuestion:
        "Which weak points are noise, and which ones are starting to look structural?",
    };
  }

  if (selectedCount <= 5) {
    return {
      label: "Repricing risk",
      summary:
        "Too many weak points are now visible for the old narrative to feel effortless.",
      marketRead:
        "Exposure to AI is no longer enough on its own; the market begins asking who actually captures the value.",
      investorQuestion:
        "What if the technology is real, but the ownership layer has been misidentified?",
    };
  }

  return {
    label: "Belief break",
    summary:
      "The market no longer asks whether AI matters. It asks whether the current winners own enough of the future.",
    marketRead:
      "The old story stops carrying the valuation. Exposure flips from a badge of confidence into a demand for proof.",
    investorQuestion:
      "Who owns the workflow, the authority, the economics, and the durable control points after the crash?",
  };
}

export default function ConvergenceExplorer() {
  const [selectedIds, setSelectedIds] = useState<string[]>([
    "model-scarcity",
    "enterprise-roi",
  ]);

  const selectedPressures = useMemo(
    () => pressures.filter(pressure => selectedIds.includes(pressure.id)),
    [selectedIds]
  );

  const narrativeState = getNarrativeState(selectedIds.length);

  const togglePressure = (pressureId: string) => {
    setSelectedIds(current =>
      current.includes(pressureId)
        ? current.filter(id => id !== pressureId)
        : [...current, pressureId]
    );
  };

  const selectAll = () =>
    setSelectedIds(pressures.map(pressure => pressure.id));
  const resetSelection = () =>
    setSelectedIds(["model-scarcity", "enterprise-roi"]);

  return (
    <section className="not-prose my-10 rounded-2xl border border-border bg-muted/40 p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
            Interactive view
          </p>
          <div className="mt-1 text-xl font-semibold text-foreground">
            The convergence map
          </div>
          <p className="mt-2 text-sm leading-6 text-foreground/80">
            Toggle the pressures that matter. The bubble does not need one fatal
            event. It breaks when enough assumptions weaken at the same time.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <button
            type="button"
            onClick={resetSelection}
            className="rounded-md border border-border px-3 py-1.5 text-foreground transition-colors hover:border-accent hover:text-accent"
          >
            Reset map
          </button>
          <button
            type="button"
            onClick={selectAll}
            className="rounded-md border border-accent bg-accent px-3 py-1.5 text-background transition-opacity hover:opacity-90"
          >
            Show full convergence
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        <div className="grid items-start gap-3">
          {pressures.map(pressure => {
            const isActive = selectedIds.includes(pressure.id);

            return (
              <button
                key={pressure.id}
                type="button"
                onClick={() => togglePressure(pressure.id)}
                aria-pressed={isActive}
                className={`rounded-2xl border p-4 text-left transition-colors ${
                  isActive
                    ? "border-accent bg-background shadow-sm"
                    : "border-border bg-background/70 hover:border-accent/60"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="pr-2 text-sm font-semibold text-foreground">
                      {pressure.shortLabel}
                    </span>
                    <span
                      className={`shrink-0 rounded-md px-2 py-1 text-[11px] whitespace-nowrap ${
                        isActive
                          ? "bg-accent text-background"
                          : "bg-muted text-foreground/70"
                      }`}
                    >
                      {isActive ? "Feeding the break" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-foreground/75">
                    {pressure.signal}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-border bg-background p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">
                Belief gauge
              </p>
              <div className="mt-1 text-lg font-semibold text-foreground">
                {narrativeState.label}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-semibold text-foreground">
                {selectedIds.length}
                <span className="text-base text-foreground/60">/8</span>
              </div>
              <p className="text-xs text-foreground/60">active pressures</p>
            </div>
          </div>

          <div className="mt-4 h-2 rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-accent transition-[width]"
              style={{
                width: `${(selectedIds.length / pressures.length) * 100}%`,
              }}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] xl:grid-cols-4">
            {[
              "Story intact",
              "Story strained",
              "Repricing risk",
              "Belief break",
            ].map(state => (
              <div
                key={state}
                className={`flex min-h-10 items-center justify-center rounded-md border px-2 py-1 text-center leading-tight ${
                  state === narrativeState.label
                    ? "border-accent bg-accent text-background"
                    : "border-border bg-background text-foreground/65"
                }`}
              >
                {state}
              </div>
            ))}
          </div>

          <p className="mt-4 text-sm leading-6 text-foreground/80">
            {narrativeState.summary}
          </p>

          <div className="mt-5 grid gap-3">
            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <div className="text-sm font-semibold text-foreground">
                What the market reads here
              </div>
              <p className="mt-2 text-sm leading-6 text-foreground/75">
                {narrativeState.marketRead}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <div className="text-sm font-semibold text-foreground">
                What investors start asking instead
              </div>
              <p className="mt-2 text-sm leading-6 text-foreground/75">
                {narrativeState.investorQuestion}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {selectedPressures.length > 0 ? (
              selectedPressures.map(pressure => (
                <div
                  key={pressure.id}
                  className="rounded-2xl border border-border bg-muted/40 p-4"
                >
                  <div className="text-sm font-semibold text-foreground">
                    {pressure.title}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-foreground/75">
                    {pressure.risk}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground/65">
                    <span className="font-medium text-foreground">
                      Repricing question:
                    </span>{" "}
                    {pressure.repricingQuestion}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-4 text-sm leading-6 text-foreground/70">
                Select a pressure to see what it adds to the convergence.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
