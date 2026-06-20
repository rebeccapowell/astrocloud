import { useMemo, useState } from "react";
import {
  wowlOperations,
  wowlSafeDefault,
  wowlSprayDefault,
} from "./wowlActivityModel";

export default function WowlActivityDesigner() {
  const [selectedIds, setSelectedIds] = useState<string[]>(wowlSprayDefault);

  const selectedOperations = useMemo(
    () =>
      wowlOperations.filter(operation => selectedIds.includes(operation.id)),
    [selectedIds]
  );

  const writeCount = selectedOperations.filter(
    operation => operation.kind === "write"
  ).length;
  const lastOperation = selectedOperations[selectedOperations.length - 1];
  const writeLast = lastOperation?.kind === "write";
  const safeShape = writeCount <= 1 && writeLast;

  const toggleOperation = (operationId: string) => {
    setSelectedIds(current =>
      current.includes(operationId)
        ? current.filter(id => id !== operationId)
        : [...current, operationId]
    );
  };

  return (
    <section className="not-prose my-10 rounded-2xl border border-border bg-muted/40 p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
            Interactive checklist
          </p>
          <div className="mt-1 text-xl font-semibold text-foreground">
            WOWL activity designer
          </div>
          <p className="mt-2 text-sm leading-6 text-foreground/80">
            Toggle what one retryable activity does. The safer shape is
            repeatable work first, then one controlled external write at the
            end.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <button
            type="button"
            onClick={() => setSelectedIds(wowlSafeDefault)}
            className="rounded-md border border-accent bg-accent px-3 py-1.5 text-background"
          >
            Show WOWL shape
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds(wowlSprayDefault)}
            className="rounded-md border border-border px-3 py-1.5 text-foreground hover:border-accent"
          >
            Show spray writes
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="grid gap-2">
          {wowlOperations.map(operation => {
            const isSelected = selectedIds.includes(operation.id);
            return (
              <button
                key={operation.id}
                type="button"
                onClick={() => toggleOperation(operation.id)}
                aria-pressed={isSelected}
                className={`flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition-colors ${
                  isSelected
                    ? "border-accent bg-background"
                    : "border-border bg-background/60 opacity-70"
                }`}
              >
                <span>
                  <span className="block text-sm font-semibold text-foreground">
                    {operation.label}
                  </span>
                  <span className="text-xs text-foreground/60">
                    {operation.kind === "write"
                      ? `External write${operation.system ? `: ${operation.system}` : ""}`
                      : "Repeatable before the boundary"}
                  </span>
                </span>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${operation.kind === "write" ? "bg-accent/15 text-accent" : "bg-muted text-foreground/70"}`}
                >
                  {operation.kind}
                </span>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="text-sm font-semibold text-foreground">
            Retry boundary
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {selectedOperations.map((operation, index) => (
              <div key={operation.id} className="flex items-center gap-2">
                <span
                  className={`rounded-full border px-3 py-1.5 text-sm ${operation.kind === "write" ? "border-accent bg-accent/10 text-accent" : "border-border bg-muted text-foreground/75"}`}
                >
                  {operation.label}
                </span>
                {index < selectedOperations.length - 1 && (
                  <span className="text-foreground/35">→</span>
                )}
              </div>
            ))}
          </div>

          <div
            className={`mt-5 rounded-xl border p-4 ${safeShape ? "border-accent bg-accent/10" : "border-border bg-muted/60"}`}
          >
            <div className="text-base font-semibold text-foreground">
              {safeShape ? "WOWL-friendly" : "Recovery smell"}
            </div>
            <p className="mt-2 text-sm leading-6 text-foreground/80">
              {safeShape
                ? "This activity reads, calculates, and performs one externally visible write last. If it retries, the side-effect question is narrow."
                : `This retry boundary contains ${writeCount} external writes. If it crashes halfway through, recovery depends on every write being idempotent or deduplicated.`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
