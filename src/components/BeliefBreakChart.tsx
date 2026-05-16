import { useId, useMemo, useState } from "react";

type Point = {
  x: number;
  y: number;
};

type ChartState = {
  id: string;
  label: string;
  subtitle: string;
  narrative: number[];
  evidence: number[];
  narrativeSummary: string;
  evidenceSummary: string;
  crossingSummary: string;
  annotations: string[];
};

const phases = [
  "Discovery",
  "Speculation",
  "Overbuild",
  "Doubt",
  "Belief break",
  "Repricing",
  "Consolidation",
] as const;

const chartStates: ChartState[] = [
  {
    id: "buffer-wide",
    label: "Buffer wide",
    subtitle: "The story still absorbs uncomfortable facts with ease.",
    narrative: [28, 56, 86, 92, 88, 72, 60],
    evidence: [14, 20, 28, 38, 48, 54, 58],
    narrativeSummary:
      "The market still treats the current winners as the obvious owners of the future.",
    evidenceSummary:
      "Contradictory signals are visible, but each one still feels explainable or temporary.",
    crossingSummary:
      "There is no break yet because the narrative still has enough buffer to metabolize the evidence.",
    annotations: [
      "Open and local models improve",
      "Token costs become easier to see",
      "Enterprise ROI questions start appearing",
    ],
  },
  {
    id: "buffer-narrowing",
    label: "Buffer narrowing",
    subtitle:
      "The evidence is accumulating faster than the story can comfortably absorb.",
    narrative: [30, 58, 86, 84, 74, 56, 44],
    evidence: [16, 24, 36, 54, 66, 66, 60],
    narrativeSummary:
      "Belief remains high, but it now requires more explanation and more faith than before.",
    evidenceSummary:
      "Weak ROI, visible token economics, and slower workflow capture start to cluster together.",
    crossingSummary:
      "The buffer still exists, but the market is doing more work to defend the old interpretation.",
    annotations: [
      "Capex language becomes more disciplined",
      "SaaS expansion slows",
      "Wrappers begin to look exposed",
    ],
  },
  {
    id: "belief-break",
    label: "Belief break",
    subtitle:
      "The narrative can no longer explain away the pressure building underneath it.",
    narrative: [32, 60, 86, 78, 54, 34, 26],
    evidence: [18, 28, 42, 60, 68, 60, 50],
    narrativeSummary:
      "The market no longer assumes that AI exposure automatically means future ownership.",
    evidenceSummary:
      "Contradictory evidence now arrives as a pattern rather than as isolated exceptions.",
    crossingSummary:
      "This is the snap point. The story breaks when the evidence exceeds the market's ability to explain it away.",
    annotations: [
      "Investors ask who owns the workflow",
      "Infrastructure spend starts reading as overbuild",
      "Usage gets judged as margin, not excitement",
    ],
  },
  {
    id: "repricing",
    label: "Repricing",
    subtitle:
      "The same facts now read as excess, subsidy, or temporary advantage.",
    narrative: [34, 62, 84, 70, 40, 22, 18],
    evidence: [20, 32, 46, 62, 74, 60, 42],
    narrativeSummary:
      "Belief falls sharply because the market story no longer carries the valuation.",
    evidenceSummary:
      "The evidence stays elevated even as weaker players fail and the system begins consolidating.",
    crossingSummary:
      "After the break, the question is no longer whether AI matters. It is who survives the repricing with real control.",
    annotations: [
      "Capex becomes sunk cost",
      "AI features become table stakes",
      "Consolidation and durable ownership begin",
    ],
  },
];

const chartWidth = 720;
const chartHeight = 360;
const chartPadding = {
  top: 24,
  right: 22,
  bottom: 64,
  left: 56,
};

function toChartPoints(values: number[]) {
  const stepX =
    (chartWidth - chartPadding.left - chartPadding.right) / (values.length - 1);

  return values.map((value, index) => ({
    x: chartPadding.left + stepX * index,
    y:
      chartHeight -
      chartPadding.bottom -
      ((chartHeight - chartPadding.top - chartPadding.bottom) * value) / 100,
  }));
}

function toLinePath(points: Point[]) {
  if (points.length === 0) {
    return "";
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 1; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const midpointX = (current.x + next.x) / 2;
    const midpointY = (current.y + next.y) / 2;

    path += ` Q ${current.x} ${current.y} ${midpointX} ${midpointY}`;
  }

  const last = points.at(-1);

  if (!last) {
    return path;
  }

  path += ` T ${last.x} ${last.y}`;
  return path;
}

function getCrossingPoint(narrativePoints: Point[], evidencePoints: Point[]) {
  for (let index = 0; index < narrativePoints.length - 1; index += 1) {
    const narrativeStart = narrativePoints[index];
    const narrativeEnd = narrativePoints[index + 1];
    const evidenceStart = evidencePoints[index];
    const evidenceEnd = evidencePoints[index + 1];

    const startDifference = narrativeStart.y - evidenceStart.y;
    const endDifference = narrativeEnd.y - evidenceEnd.y;

    if (startDifference >= 0 && endDifference <= 0) {
      const denominator = startDifference - endDifference;
      const t = denominator === 0 ? 0 : startDifference / denominator;

      return {
        index,
        point: {
          x: narrativeStart.x + (narrativeEnd.x - narrativeStart.x) * t,
          y: narrativeStart.y + (narrativeEnd.y - narrativeStart.y) * t,
        },
      };
    }
  }

  return null;
}

function getBufferPath(narrativePoints: Point[], evidencePoints: Point[]) {
  const crossing = getCrossingPoint(narrativePoints, evidencePoints);

  if (!crossing) {
    const topPath = toLinePath(narrativePoints);
    const bottomPoints = [...evidencePoints].reverse();

    return `${topPath} L ${bottomPoints[0].x} ${bottomPoints[0].y}${bottomPoints
      .slice(1)
      .map(point => ` L ${point.x} ${point.y}`)
      .join("")} Z`;
  }

  const narrativeSubset = [
    ...narrativePoints.slice(0, crossing.index + 1),
    crossing.point,
  ];
  const evidenceSubset = [
    ...evidencePoints.slice(0, crossing.index + 1),
    crossing.point,
  ];
  const topPath = toLinePath(narrativeSubset);
  const bottomPoints = [...evidenceSubset].reverse();

  return `${topPath} L ${bottomPoints[0].x} ${bottomPoints[0].y}${bottomPoints
    .slice(1)
    .map(point => ` L ${point.x} ${point.y}`)
    .join("")} Z`;
}

export default function BeliefBreakChart() {
  const [activeStateId, setActiveStateId] = useState("belief-break");
  const svgTitleId = useId();
  const svgDescId = useId();

  const activeState =
    chartStates.find(state => state.id === activeStateId) ?? chartStates[2];

  const {
    narrativePoints,
    evidencePoints,
    crossing,
    bufferPath,
    narrativePath,
    evidencePath,
  } = useMemo(() => {
    const narrativePoints = toChartPoints(activeState.narrative);
    const evidencePoints = toChartPoints(activeState.evidence);

    return {
      narrativePoints,
      evidencePoints,
      crossing: getCrossingPoint(narrativePoints, evidencePoints),
      bufferPath: getBufferPath(narrativePoints, evidencePoints),
      narrativePath: toLinePath(narrativePoints),
      evidencePath: toLinePath(evidencePoints),
    };
  }, [activeState]);

  return (
    <figure className="not-prose my-10 rounded-2xl border border-border bg-muted/40 p-5 sm:p-6">
      <div>
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
            Interactive view
          </p>
          <div className="mt-1 text-xl font-semibold text-foreground">
            The belief break
          </div>
          <p className="mt-2 text-sm leading-6 text-foreground/80">
            Bubbles survive bad evidence until the story can no longer absorb
            it. This chart is conceptual rather than numeric. It shows how
            market belief can stay elevated long after contradictory evidence
            begins to accumulate.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          {chartStates.map(state => {
            const isActive = state.id === activeState.id;

            return (
              <button
                key={state.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveStateId(state.id)}
                className={`rounded-md border px-3 py-1.5 transition-colors ${
                  isActive
                    ? "border-accent bg-accent text-background"
                    : "border-border bg-background text-foreground hover:border-accent/60"
                }`}
              >
                {state.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-background p-4 sm:p-5">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full"
          role="img"
          aria-labelledby={`${svgTitleId} ${svgDescId}`}
        >
          <title id={svgTitleId}>The Belief Break conceptual chart</title>
          <desc id={svgDescId}>
            A conceptual chart showing narrative belief and contradictory
            evidence across the life of a bubble. The shaded region between the
            lines is the belief buffer. When the lines cross, belief breaks and
            repricing begins.
          </desc>

          {[0, 25, 50, 75, 100].map(value => {
            const y =
              chartHeight -
              chartPadding.bottom -
              ((chartHeight - chartPadding.top - chartPadding.bottom) * value) /
                100;

            return (
              <g key={value}>
                <line
                  x1={chartPadding.left}
                  x2={chartWidth - chartPadding.right}
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  strokeDasharray="4 6"
                  className="text-border"
                />
                <text
                  x={chartPadding.left - 12}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-foreground/60 text-[11px]"
                >
                  {value === 0 ? "Low" : value === 100 ? "High" : ""}
                </text>
              </g>
            );
          })}

          <path d={bufferPath} fill="currentColor" className="text-accent/12" />

          <path
            d={narrativePath}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-foreground"
          />
          <path
            d={evidencePath}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-accent"
          />

          {crossing && (
            <g>
              <line
                x1={crossing.point.x}
                x2={crossing.point.x}
                y1={chartPadding.top + 8}
                y2={chartHeight - chartPadding.bottom}
                stroke="currentColor"
                strokeDasharray="6 6"
                className="text-accent/70"
              />
              <circle
                cx={crossing.point.x}
                cy={crossing.point.y}
                r="6"
                fill="currentColor"
                className="text-accent"
              />
              <text
                x={crossing.point.x + 10}
                y={chartPadding.top + 20}
                className="fill-accent text-[12px] font-semibold"
              >
                Belief break
              </text>
            </g>
          )}

          <text
            x={chartPadding.left}
            y={chartPadding.top - 2}
            className="fill-foreground/70 text-[12px] font-semibold"
          >
            Market pressure
          </text>

          <text
            x={chartWidth - chartPadding.right}
            y={chartHeight - 12}
            textAnchor="end"
            className="fill-foreground/70 text-[12px] font-semibold"
          >
            Bubble maturity
          </text>

          <text
            x={narrativePoints[2].x - 18}
            y={narrativePoints[2].y - 14}
            className="fill-foreground text-[12px] font-semibold"
          >
            Narrative belief
          </text>

          <text
            x={evidencePoints[3].x - 40}
            y={evidencePoints[3].y + 22}
            className="fill-accent text-[12px] font-semibold"
          >
            Contradictory evidence
          </text>

          {phases.map((phase, index) => {
            const point = narrativePoints[index];

            return (
              <text
                key={phase}
                x={point.x}
                y={chartHeight - chartPadding.bottom + 28}
                textAnchor="middle"
                className="fill-foreground/70 text-[11px]"
              >
                {phase}
              </text>
            );
          })}
        </svg>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-background p-5">
          <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">
            Active reading
          </p>
          <div className="mt-1 text-lg font-semibold text-foreground">
            {activeState.label}
          </div>
          <p className="mt-2 text-sm leading-6 text-foreground/80">
            {activeState.subtitle}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background p-5">
          <div className="text-sm font-semibold text-foreground">
            Belief buffer
          </div>
          <p className="mt-2 text-sm leading-6 text-foreground/75">
            The shaded gap between the two lines is the belief buffer. As long
            as it exists, the market can reinterpret weak signals as temporary
            noise, transition cost, or the price of owning the future.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background p-5">
          <div className="text-sm font-semibold text-foreground">
            What the market still believes
          </div>
          <p className="mt-2 text-sm leading-6 text-foreground/75">
            {activeState.narrativeSummary}
          </p>
          <div className="mt-4 text-sm font-semibold text-foreground">
            What the evidence is doing
          </div>
          <p className="mt-2 text-sm leading-6 text-foreground/75">
            {activeState.evidenceSummary}
          </p>
          <div className="mt-4 text-sm font-semibold text-foreground">
            What changes at the break
          </div>
          <p className="mt-2 text-sm leading-6 text-foreground/75">
            {activeState.crossingSummary}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background p-5">
          <div className="text-sm font-semibold text-foreground">
            Signals shaping this state
          </div>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-foreground/75">
            {activeState.annotations.map(annotation => (
              <li key={annotation} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent" />
                <span>{annotation}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <figcaption className="mt-5 text-sm leading-6 text-foreground/75">
        The chart does not claim precise timing. It visualizes the mechanism:
        contradictory evidence can accumulate for a long time while the story
        stays intact. The break comes when the story can no longer explain the
        evidence away.
      </figcaption>
    </figure>
  );
}
