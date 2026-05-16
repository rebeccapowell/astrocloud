import { useState } from "react";

type ArchitectureMode = "centralized" | "hybrid";

const architectureLayers = [
  {
    name: "Default surface",
    centralized:
      "Users go to one destination product or API endpoint to reach intelligence.",
    hybrid:
      "Intelligence sits inside the editor, device, operating system, enterprise control plane, or workflow itself.",
  },
  {
    name: "Where context lives",
    centralized:
      "Important context must be shipped outward to the model provider.",
    hybrid:
      "More context stays close to the user, the tenant, the system of record, or the device.",
  },
  {
    name: "Economic logic",
    centralized:
      "Scarcity and API access look like the main source of durable rents.",
    hybrid:
      "Model access still matters, but value shifts toward orchestration, permissions, distribution, and execution.",
  },
  {
    name: "What becomes durable",
    centralized:
      "The moat is assumed to sit mainly in frontier model quality and infrastructure access.",
    hybrid:
      "The moat sits where intelligence meets workflow, authority, defaults, and customer relationship.",
  },
];

const architectureModes = {
  centralized: {
    label: "API-only story",
    summary:
      "A few remote model providers remain the default path for nearly all meaningful intelligence.",
    takeaway: "This is the current market story.",
  },
  hybrid: {
    label: "Hybrid / local future",
    summary:
      "The mature stack routes work across local, embedded, tenant-local, and frontier systems based on context and cost.",
    takeaway:
      "This is the mature-economy architecture the essay is pointing toward.",
  },
} satisfies Record<
  ArchitectureMode,
  { label: string; summary: string; takeaway: string }
>;

export default function AIArchitectureToggle() {
  const [mode, setMode] = useState<ArchitectureMode>("centralized");
  const activeMode = architectureModes[mode];

  return (
    <section className="not-prose my-10 rounded-2xl border border-border bg-muted/40 p-5 sm:p-6">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
          Interactive view
        </p>
        <div className="mt-1 text-xl font-semibold text-foreground">
          API-only versus hybrid AI
        </div>
        <p className="mt-2 text-sm leading-6 text-foreground/80">
          Toggle between the current centralized market story and the hybrid
          stack this chapter argues for. The point is not that the API
          disappears. It is that it stops being the whole architecture.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 text-sm">
        {(Object.keys(architectureModes) as ArchitectureMode[]).map(key => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            className={`rounded-md border px-3 py-1.5 transition-colors ${
              mode === key
                ? "border-accent bg-accent text-background"
                : "border-border bg-background text-foreground hover:border-accent hover:text-accent"
            }`}
          >
            {architectureModes[key].label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-border bg-background p-5">
          <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">
            Selected architecture
          </p>
          <div className="mt-2 text-lg font-semibold text-foreground">
            {activeMode.label}
          </div>
          <p className="mt-3 text-sm leading-6 text-foreground/80">
            {activeMode.summary}
          </p>
          <div className="mt-4 rounded-2xl border border-border bg-muted/40 p-4 text-sm leading-6 text-foreground/75">
            <span className="font-medium text-foreground">Takeaway:</span>{" "}
            {activeMode.takeaway}
          </div>
        </div>

        <div className="grid gap-3">
          {architectureLayers.map(layer => (
            <div
              key={layer.name}
              className="rounded-2xl border border-border bg-background p-4"
            >
              <div className="text-sm font-semibold text-foreground">
                {layer.name}
              </div>
              <p className="mt-2 text-sm leading-6 text-foreground/75">
                {layer[mode]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
