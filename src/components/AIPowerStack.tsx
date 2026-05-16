import { useMemo, useState } from "react";

type PowerLayer = {
  id: string;
  name: string;
  whyItMatters: string;
  likelyWinners: string[];
  pressuredGroups: string[];
};

const layers: PowerLayer[] = [
  {
    id: "compute",
    name: "Compute substrate",
    whyItMatters:
      "AI still needs chips, memory, networking, power efficiency, and physical capacity even when the ownership story changes.",
    likelyWinners: [
      "Chip suppliers",
      "Memory and packaging leaders",
      "Efficient infrastructure owners",
    ],
    pressuredGroups: [
      "Overbuilt capacity with weak utilization",
      "Capital structures that assumed perfect demand timing",
    ],
  },
  {
    id: "devices",
    name: "Devices and operating systems",
    whyItMatters:
      "More intelligence moves closer to the user, the permission boundary, and the default surface where work already happens.",
    likelyWinners: [
      "Operating system owners",
      "Device ecosystems",
      "Default productivity surfaces",
    ],
    pressuredGroups: [
      "Pure model destinations with weak user surface",
      "Products that rely on users choosing them explicitly every time",
    ],
  },
  {
    id: "governance",
    name: "Identity and governance",
    whyItMatters:
      "Action without permissions, policy, audit, and approval is operationally dangerous, so governance becomes a real product layer.",
    likelyWinners: [
      "Identity providers",
      "Governance platforms",
      "Trusted control planes",
    ],
    pressuredGroups: [
      "Ungoverned agent tools",
      "Products that answer but cannot safely act",
    ],
  },
  {
    id: "records",
    name: "Systems of record and context",
    whyItMatters:
      "AI is only durable inside business systems when it can see authoritative data and act against trusted records.",
    likelyWinners: [
      "Core systems of record",
      "Deeply integrated data platforms",
      "Trusted enterprise data owners",
    ],
    pressuredGroups: [
      "Generic workflow layers without record ownership",
      "Thin surfaces sitting above someone else's data",
    ],
  },
  {
    id: "execution",
    name: "Orchestration and execution",
    whyItMatters:
      "Real AI work needs state, retries, human approval, long-running workflows, and auditability between intent and action.",
    likelyWinners: [
      "Workflow orchestration layers",
      "Execution control planes",
      "Enterprise automation backbones",
    ],
    pressuredGroups: [
      "Prompt-only agent experiences",
      "Ad hoc automation with no durable state or governance",
    ],
  },
  {
    id: "firms",
    name: "AI-operated companies",
    whyItMatters:
      "The deepest repricing may happen when companies use AI to change their own cost structure rather than merely buy AI features.",
    likelyWinners: [
      "Small AI-operated businesses",
      "Companies with strong process knowledge",
      "Firms that can encode their operating model",
    ],
    pressuredGroups: [
      "Human-heavy service models",
      "Generic workflow SaaS",
      "Companies with no proprietary workflow or trust advantage",
    ],
  },
];

export default function AIPowerStack() {
  const [selectedId, setSelectedId] = useState(layers[0].id);

  const activeLayer = useMemo(
    () => layers.find(layer => layer.id === selectedId) ?? layers[0],
    [selectedId]
  );

  return (
    <section className="not-prose my-10 rounded-2xl border border-border bg-muted/40 p-5 sm:p-6">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
          Interactive view
        </p>
        <div className="mt-1 text-xl font-semibold text-foreground">
          The mature AI power stack
        </div>
        <p className="mt-2 text-sm leading-6 text-foreground/80">
          Move up the stack. Each layer shows where durable power may sit after
          the bubble breaks, who is strengthened by that layer, and who becomes
          more exposed.
        </p>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-3">
          {layers.map((layer, index) => {
            const isActive = layer.id === selectedId;

            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => setSelectedId(layer.id)}
                className={`block w-full rounded-2xl border p-4 text-left transition-colors ${
                  isActive
                    ? "border-accent bg-background shadow-sm"
                    : "border-border bg-background/70 hover:border-accent/60"
                }`}
              >
                <div className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">
                  Layer {index + 1}
                </div>
                <div className="mt-2 text-sm font-semibold text-foreground">
                  {layer.name}
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-border bg-background p-5">
          <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">
            Active layer
          </p>
          <div className="mt-2 text-lg font-semibold text-foreground">
            {activeLayer.name}
          </div>
          <p className="mt-3 text-sm leading-6 text-foreground/80">
            {activeLayer.whyItMatters}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <div className="text-sm font-semibold text-foreground">
                Likely strengthened here
              </div>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-foreground/75">
                {activeLayer.likelyWinners.map(item => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <div className="text-sm font-semibold text-foreground">
                Pressured by this shift
              </div>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-foreground/75">
                {activeLayer.pressuredGroups.map(item => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
