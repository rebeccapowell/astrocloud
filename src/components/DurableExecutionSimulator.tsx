import { useMemo, useState } from "react";

type FailurePoint = "none" | "invoice-call" | "after-payment";
type Mode = "call" | "durable";

type Step = {
  label: string;
  callRetry: string;
  durable: string;
};

const steps: Step[] = [
  {
    label: "Receive order",
    callRetry: "The worker holds the process in memory.",
    durable: "The workflow instance is recorded and can be resumed.",
  },
  {
    label: "Authorize payment",
    callRetry:
      "The payment call may be retried, but process progress is not durable.",
    durable: "The payment step and its result become part of workflow history.",
  },
  {
    label: "Create invoice",
    callRetry: "A 503 can be retried while the worker is still alive.",
    durable:
      "The workflow knows this is the next incomplete step after recovery.",
  },
  {
    label: "Send confirmation",
    callRetry:
      "If the process vanished earlier, the retry policy cannot continue it.",
    durable: "The recovered workflow continues only from the safe boundary.",
  },
  {
    label: "Notify fulfilment",
    callRetry:
      "The whole business journey is still reconstructed by application code.",
    durable:
      "The runtime coordinates the long-running process across failures.",
  },
];

const failureCopy = {
  none: {
    label: "No failure",
    call: "Both approaches look similar when nothing goes wrong. That is why the difference is easy to miss in happy-path diagrams.",
    durable:
      "Both approaches complete, but the durable workflow still leaves a recoverable history behind.",
  },
  "invoice-call": {
    label: "Invoice API returns 503",
    call: "Call-level resilience helps here: retry, back off, timeout, or open a circuit around the invoice operation.",
    durable:
      "Durable execution can also retry the activity, but the bigger value is that the process state survives outside the worker.",
  },
  "after-payment": {
    label: "Worker crashes after payment",
    call: "The retry policy died with the worker. It cannot answer which business step already happened or what is safe to do next.",
    durable:
      "The workflow history says payment was authorized and invoice creation is next, so a new worker can resume safely.",
  },
} satisfies Record<
  FailurePoint,
  { label: string; call: string; durable: string }
>;

export default function DurableExecutionSimulator() {
  const [mode, setMode] = useState<Mode>("durable");
  const [failurePoint, setFailurePoint] =
    useState<FailurePoint>("after-payment");

  const activeFailure = failureCopy[failurePoint];
  const outcome = mode === "call" ? activeFailure.call : activeFailure.durable;

  const activeStepIndex = useMemo(() => {
    if (failurePoint === "invoice-call") return 2;
    if (failurePoint === "after-payment") return 1;
    return steps.length - 1;
  }, [failurePoint]);

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
            Change the failure and compare the recovery story. Retry libraries
            protect a running call. Durable execution protects the process that
            surrounds many calls.
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
            Failure to simulate
          </div>
          <div className="mt-3 grid gap-2">
            {(Object.keys(failureCopy) as FailurePoint[]).map(key => (
              <button
                key={key}
                type="button"
                onClick={() => setFailurePoint(key)}
                className={`rounded-xl border p-3 text-left text-sm transition-colors ${
                  failurePoint === key
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-border text-foreground/75 hover:border-accent/70"
                }`}
              >
                {failureCopy[key].label}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-border bg-muted/50 p-4">
            <div className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
              Result
            </div>
            <p className="mt-2 text-sm leading-6 text-foreground/85">
              {outcome}
            </p>
          </div>
        </div>

        <ol className="relative grid gap-3">
          {steps.map((step, index) => {
            const isPast = index < activeStepIndex || failurePoint === "none";
            const isActive =
              index === activeStepIndex && failurePoint !== "none";
            const body = mode === "call" ? step.callRetry : step.durable;

            return (
              <li
                key={step.label}
                className={`rounded-2xl border p-4 transition-colors ${
                  isActive
                    ? "border-accent bg-background shadow-sm"
                    : isPast
                      ? "border-border bg-background/90"
                      : "border-border bg-background/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
                      isActive
                        ? "border-accent bg-accent text-background"
                        : "border-border bg-muted text-foreground/80"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-foreground">
                      {step.label}
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
