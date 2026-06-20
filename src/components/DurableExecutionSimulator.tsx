import { useState } from "react";

type Mode = "call" | "durable";
type StepStatus = "completed" | "error" | "waiting";

type Step = {
  label: string;
  callRetry: string;
  durable: string;
  failure: string;
};

const steps: Step[] = [
  {
    label: "Receive order",
    callRetry: "The worker holds the process in memory.",
    durable: "The workflow instance is recorded and can be resumed.",
    failure:
      "The order message is received, but the worker crashes before durable progress is recorded.",
  },
  {
    label: "Authorize payment",
    callRetry:
      "The payment call may be retried, but process progress is not durable if the worker disappears.",
    durable: "The payment attempt and result become part of workflow history.",
    failure: "The payment gateway returns a transient timeout.",
  },
  {
    label: "Create invoice",
    callRetry: "A 503 can be retried while the worker is still alive.",
    durable:
      "The workflow keeps this as the current incomplete activity until it succeeds or exhausts policy.",
    failure: "The invoice API returns 503.",
  },
  {
    label: "Send confirmation",
    callRetry:
      "If the process vanished earlier, the retry policy cannot continue it.",
    durable: "The recovered workflow continues only from this safe boundary.",
    failure:
      "The email provider accepts the request slowly and the activity times out.",
  },
  {
    label: "Notify fulfilment",
    callRetry:
      "The whole business journey is still reconstructed by application code.",
    durable:
      "The runtime coordinates the long-running process across failures.",
    failure: "The fulfilment webhook is temporarily unavailable.",
  },
];

const initialFailedStep = 2;
const retrySuccessChance = 0.55;

function getRandomStepIndex() {
  return Math.floor(Math.random() * steps.length);
}

function getStepStatus(
  index: number,
  failedStepIndex: number | null
): StepStatus {
  if (failedStepIndex === null) return "completed";
  if (index < failedStepIndex) return "completed";
  if (index === failedStepIndex) return "error";
  return "waiting";
}

function getOutcome(
  mode: Mode,
  failedStepIndex: number | null,
  retryAttempts: number
) {
  if (failedStepIndex === null) {
    return "The process completed. Both approaches can look fine on the happy path, which is why the abstraction difference is easy to miss.";
  }

  const failedStep = steps[failedStepIndex];

  if (mode === "call") {
    return `The current call can retry while this worker is alive, but the process state is not the retry library's job. The simulator stops at “${failedStep.label}” because the next business step must not start while this step is still in error.`;
  }

  return `The workflow remains parked at “${failedStep.label}” after ${retryAttempts} ${retryAttempts === 1 ? "attempt" : "attempts"}. It may retry this same activity again; it does not advance to the next step until the failed step succeeds.`;
}

export default function DurableExecutionSimulator() {
  const [mode, setMode] = useState<Mode>("durable");
  const [failedStepIndex, setFailedStepIndex] = useState<number | null>(
    initialFailedStep
  );
  const [retryAttempts, setRetryAttempts] = useState(1);
  const [lastRetrySucceeded, setLastRetrySucceeded] = useState(false);

  const randomizeFailure = () => {
    setFailedStepIndex(getRandomStepIndex());
    setRetryAttempts(1);
    setLastRetrySucceeded(false);
  };

  const retryFailedStep = () => {
    if (failedStepIndex === null) return;

    const didSucceed = Math.random() < retrySuccessChance;
    setRetryAttempts(current => current + 1);
    setLastRetrySucceeded(didSucceed);

    if (didSucceed) {
      setFailedStepIndex(null);
    }
  };

  const resetToKnownFailure = () => {
    setFailedStepIndex(initialFailedStep);
    setRetryAttempts(1);
    setLastRetrySucceeded(false);
  };

  const outcome = getOutcome(mode, failedStepIndex, retryAttempts);
  const failedStep = failedStepIndex === null ? null : steps[failedStepIndex];

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
          {(["call", "durable"] as Mode[]).map(option => (
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
          {steps.map((step, index) => {
            const status = getStepStatus(index, failedStepIndex);
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
