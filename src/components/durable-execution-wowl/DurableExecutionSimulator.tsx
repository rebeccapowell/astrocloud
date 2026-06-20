import { useState } from "react";
import {
  durableExecutionRetrySuccessChance,
  durableExecutionSteps,
  getDurableExecutionOutcome,
  getDurableExecutionStepStatus,
  getRandomDurableExecutionStepIndex,
  initialFailedDurableExecutionStep,
  type DurableExecutionMode,
} from "./durableExecutionModel";

export default function DurableExecutionSimulator() {
  const [mode, setMode] = useState<DurableExecutionMode>("durable");
  const [failedStepIndex, setFailedStepIndex] = useState<number | null>(
    initialFailedDurableExecutionStep
  );
  const [retryAttempts, setRetryAttempts] = useState(1);
  const [lastRetrySucceeded, setLastRetrySucceeded] = useState(false);

  const randomizeFailure = () => {
    setFailedStepIndex(getRandomDurableExecutionStepIndex());
    setRetryAttempts(1);
    setLastRetrySucceeded(false);
  };

  const retryFailedStep = () => {
    if (failedStepIndex === null) return;

    const didSucceed = Math.random() < durableExecutionRetrySuccessChance;
    setRetryAttempts(current => current + 1);
    setLastRetrySucceeded(didSucceed);

    if (didSucceed) {
      setFailedStepIndex(null);
    }
  };

  const resetToKnownFailure = () => {
    setFailedStepIndex(initialFailedDurableExecutionStep);
    setRetryAttempts(1);
    setLastRetrySucceeded(false);
  };

  const outcome = getDurableExecutionOutcome(
    mode,
    failedStepIndex,
    retryAttempts
  );
  const failedStep =
    failedStepIndex === null ? null : durableExecutionSteps[failedStepIndex];

  return (
    <section className="not-prose my-10 overflow-hidden rounded-2xl border border-border bg-muted/40 p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
            Interactive view
          </p>
          <div className="mt-1 text-xl font-semibold text-foreground">
            Calls retry; workflows resume
          </div>
          <p className="mt-2 text-sm leading-6 text-foreground/80">
            Generate a random activity failure, then retry it. A failed step
            stays the current step until it succeeds; the next step does not
            begin while the previous one is still in error.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          {(["call", "durable"] as DurableExecutionMode[]).map(option => (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              aria-pressed={mode === option}
              className={`rounded-md border px-3 py-1.5 transition-colors ${
                mode === option
                  ? "border-accent bg-accent text-background"
                  : "border-border bg-background text-foreground hover:border-accent"
              }`}
            >
              {option === "call" ? "Call retry" : "Durable workflow"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="text-sm font-semibold text-foreground">
            Failure controls
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <button
              type="button"
              onClick={randomizeFailure}
              className="rounded-md border border-accent bg-accent px-3 py-1.5 text-background transition-opacity hover:opacity-90"
            >
              Random activity error
            </button>
            <button
              type="button"
              onClick={retryFailedStep}
              disabled={failedStepIndex === null}
              className="rounded-md border border-border px-3 py-1.5 text-foreground transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              Retry failed step
            </button>
            <button
              type="button"
              onClick={resetToKnownFailure}
              className="rounded-md border border-border px-3 py-1.5 text-foreground transition-colors hover:border-accent"
            >
              Reset
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-muted/50 p-4">
            <div className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
              Current failure
            </div>
            <p className="mt-2 text-sm leading-6 text-foreground/85">
              {failedStep
                ? `${failedStep.failure} Retry attempts: ${retryAttempts}.`
                : "No failed step remains. The workflow can move through the remaining process."}
            </p>
            {lastRetrySucceeded && (
              <p className="mt-2 text-sm font-semibold text-accent">
                Last retry succeeded, so the blocked step cleared.
              </p>
            )}
          </div>

          <div className="mt-4 rounded-xl border border-border bg-muted/50 p-4">
            <div className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
              Recovery story
            </div>
            <p className="mt-2 text-sm leading-6 text-foreground/85">
              {outcome}
            </p>
          </div>
        </div>

        <ol className="relative grid gap-3">
          {durableExecutionSteps.map((step, index) => {
            const status = getDurableExecutionStepStatus(
              index,
              failedStepIndex
            );
            const body = mode === "call" ? step.callRetry : step.durable;

            return (
              <li
                key={step.label}
                className={`rounded-2xl border p-4 transition-colors ${
                  status === "error"
                    ? "border-accent bg-background shadow-sm"
                    : status === "completed"
                      ? "border-border bg-background/90"
                      : "border-border bg-background/45 opacity-75"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
                      status === "error"
                        ? "border-accent bg-accent text-background"
                        : status === "completed"
                          ? "border-border bg-muted text-foreground/80"
                          : "border-border bg-background text-foreground/45"
                    }`}
                  >
                    {status === "completed" ? "✓" : index + 1}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-semibold text-foreground">
                        {step.label}
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          status === "error"
                            ? "bg-accent/15 text-accent"
                            : status === "completed"
                              ? "bg-muted text-foreground/65"
                              : "bg-background text-foreground/45"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-foreground/75">
                      {body}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
