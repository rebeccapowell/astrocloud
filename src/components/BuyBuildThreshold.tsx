import { useMemo, useState } from "react";

function getRecommendation({
  workflowSpecificity,
  customSoftwareCost,
}: {
  workflowSpecificity: number;
  customSoftwareCost: number;
}) {
  const buildScore =
    workflowSpecificity * 0.65 + (100 - customSoftwareCost) * 0.35;

  if (buildScore < 40) {
    return {
      label: "Buy the packaged workflow",
      summary:
        "The workflow is generic enough, and custom software is still expensive enough, that SaaS remains the rational default.",
      implication:
        "This is the world that made the old SaaS compromise so strong.",
    };
  }

  if (buildScore < 70) {
    return {
      label: "Keep the record, generate the workflow",
      summary:
        "The core system of record may still be bought, but the workflow layer starts moving toward generated internal capability.",
      implication:
        "This is the transition zone where generic workflow SaaS gets pressured first.",
    };
  }

  return {
    label: "Build or generate around the business",
    summary:
      "The workflow is specific enough, and custom software cheap enough, that the economics start favoring software shaped around the company itself.",
    implication: "This is where the SaaS workaround loses scarcity.",
  };
}

export default function BuyBuildThreshold() {
  const [workflowSpecificity, setWorkflowSpecificity] = useState(70);
  const [customSoftwareCost, setCustomSoftwareCost] = useState(42);

  const recommendation = useMemo(
    () => getRecommendation({ workflowSpecificity, customSoftwareCost }),
    [workflowSpecificity, customSoftwareCost]
  );

  return (
    <section className="not-prose my-10 rounded-2xl border border-border bg-muted/40 p-5 sm:p-6">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
          Interactive view
        </p>
        <div className="mt-1 text-xl font-semibold text-foreground">
          The buy-versus-build threshold
        </div>
        <p className="mt-2 text-sm leading-6 text-foreground/80">
          Move the two inputs that matter most to the SaaS argument: how
          specific the workflow is, and how expensive custom software still
          feels. The recommendation below shows where the economics start to
          shift.
        </p>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-border bg-background p-5">
          <label className="block text-sm font-semibold text-foreground">
            Workflow specificity
          </label>
          <p className="mt-1 text-sm leading-6 text-foreground/70">
            Low means generic enough to package. High means the business has
            unusual rules, exceptions, and process logic.
          </p>
          <input
            type="range"
            min={0}
            max={100}
            value={workflowSpecificity}
            onChange={event =>
              setWorkflowSpecificity(Number(event.target.value))
            }
            className="mt-4 w-full accent-accent"
          />
          <div className="mt-2 flex justify-between text-xs text-foreground/60">
            <span>Generic</span>
            <span>{workflowSpecificity}</span>
            <span>Specific</span>
          </div>

          <label className="mt-6 block text-sm font-semibold text-foreground">
            Cost of custom software
          </label>
          <p className="mt-1 text-sm leading-6 text-foreground/70">
            High means bespoke software is still painful. Low means AI-assisted
            generation and maintenance have moved the madness threshold.
          </p>
          <input
            type="range"
            min={0}
            max={100}
            value={customSoftwareCost}
            onChange={event =>
              setCustomSoftwareCost(Number(event.target.value))
            }
            className="mt-4 w-full accent-accent"
          />
          <div className="mt-2 flex justify-between text-xs text-foreground/60">
            <span>Cheap to build</span>
            <span>{customSoftwareCost}</span>
            <span>Expensive to build</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background p-5">
          <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">
            Threshold reading
          </p>
          <div className="mt-2 text-lg font-semibold text-foreground">
            {recommendation.label}
          </div>
          <p className="mt-3 text-sm leading-6 text-foreground/80">
            {recommendation.summary}
          </p>

          <div className="mt-5 grid gap-3">
            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <div className="text-sm font-semibold text-foreground">
                What the old SaaS era assumes
              </div>
              <p className="mt-2 text-sm leading-6 text-foreground/75">
                It is cheaper to adapt the business to the software than to
                adapt the software to the business.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <div className="text-sm font-semibold text-foreground">
                What the slider is testing
              </div>
              <p className="mt-2 text-sm leading-6 text-foreground/75">
                When workflow specificity stays high while custom software costs
                keep falling, the workflow layer becomes much easier to generate
                around the company itself.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <div className="text-sm font-semibold text-foreground">
                Implication
              </div>
              <p className="mt-2 text-sm leading-6 text-foreground/75">
                {recommendation.implication}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
