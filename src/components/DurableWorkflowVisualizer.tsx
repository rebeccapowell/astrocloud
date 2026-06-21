import { useEffect, useMemo, useRef, useState } from "react";

type Mode = "durable" | "standard";
type StepState = "idle" | "running" | "success" | "recovered" | "failed";
type FailureKind = "transient" | "downtime" | "crash";

type WorkflowStep = {
  id: string;
  label: string;
  detail: string;
};

type StepMetric = {
  successes: number;
  failures: number;
};

type Counters = {
  successfulRuns: number;
  transientFailures: number;
  recoveredFailures: number;
  completeFailures: number;
};

type CurrentFailure = {
  message: string;
  kind: FailureKind;
  recovery: string;
};

type RunState = {
  runId: number;
  currentStepIndex: number;
  stepStates: StepState[];
  stepMetrics: StepMetric[];
  counters: Counters;
  currentFailure: CurrentFailure | null;
  statusMessage: string;
};

const workflowSteps: WorkflowStep[] = [
  {
    id: "receive-order",
    label: "Receive order",
    detail: "Validate the incoming command and assign a workflow id.",
  },
  {
    id: "authorize-payment",
    label: "Authorize payment",
    detail: "Call the payment gateway with an idempotency key.",
  },
  {
    id: "reserve-stock",
    label: "Reserve stock",
    detail: "Hold inventory before making downstream promises.",
  },
  {
    id: "create-invoice",
    label: "Create invoice",
    detail: "Persist the commercial record after prerequisites pass.",
  },
  {
    id: "send-confirmation",
    label: "Send confirmation",
    detail: "Notify the customer once the order is safe to confirm.",
  },
  {
    id: "notify-fulfillment",
    label: "Notify fulfillment",
    detail: "Hand the completed order to the operational system.",
  },
];

const failureCatalog: Array<Omit<CurrentFailure, "recovery">> = [
  { message: "503 error on remote API", kind: "transient" },
  { message: "500 remote server error", kind: "transient" },
  { message: "Network timeout", kind: "transient" },
  { message: "Payment gateway brownout over 90 seconds", kind: "downtime" },
  { message: "Invoice service maintenance window", kind: "downtime" },
  { message: "Pod restart", kind: "crash" },
  { message: "Worker process OOM crash", kind: "crash" },
];

const emptyCounters: Counters = {
  successfulRuns: 0,
  transientFailures: 0,
  recoveredFailures: 0,
  completeFailures: 0,
};

const getInitialRunState = (): RunState => ({
  runId: 1,
  currentStepIndex: 0,
  stepStates: workflowSteps.map((_, index) =>
    index === 0 ? "running" : "idle"
  ),
  stepMetrics: workflowSteps.map(() => ({ successes: 0, failures: 0 })),
  counters: emptyCounters,
  currentFailure: null,
  statusMessage: "Run 1 started. Receive order is running.",
});

const getRecoveryMessage = (mode: Mode, kind: FailureKind) => {
  if (mode === "durable") {
    if (kind === "crash")
      return "Durable history reloads the workflow after the worker returns.";
    if (kind === "downtime")
      return "The workflow waits out the dependency outage and resumes from the saved step.";
    return "Activity retry recovers the failed call without losing workflow progress.";
  }

  if (kind === "transient")
    return "A local retry wrapper such as Polly recovers the call.";
  if (kind === "downtime")
    return "The process exhausts local retries and loses the business transaction.";
  return "The in-memory process disappears with the pod, so this run is unrecoverable.";
};

const shouldFailCompletely = (mode: Mode, kind: FailureKind) =>
  mode === "standard" && (kind === "downtime" || kind === "crash");

function pickFailure(mode: Mode): CurrentFailure {
  const durableFriendlyCatalog = failureCatalog;
  const selected =
    durableFriendlyCatalog[
      Math.floor(Math.random() * durableFriendlyCatalog.length)
    ];

  return {
    ...selected,
    recovery: getRecoveryMessage(mode, selected.kind),
  };
}

function updateStepMetric(
  metrics: StepMetric[],
  stepIndex: number,
  field: keyof StepMetric
) {
  return metrics.map((metric, index) =>
    index === stepIndex ? { ...metric, [field]: metric[field] + 1 } : metric
  );
}

function StepMetricClingers({ metric }: { metric: StepMetric }) {
  const total = metric.successes + metric.failures;
  const successRate =
    total === 0 ? 0 : Math.round((metric.successes / total) * 100);
  const failureRate = total === 0 ? 0 : 100 - successRate;

  return (
    <div
      className="mt-3 flex items-center gap-1"
      aria-label={`${successRate}% success rate and ${failureRate}% failure rate`}
    >
      {Array.from({ length: 10 }).map((_, index) => {
        const isSuccess = index < Math.round(successRate / 10);
        return (
          <span
            key={index}
            aria-hidden="true"
            className={`h-2 flex-1 rounded-full ${isSuccess ? "bg-emerald-400" : "bg-rose-400/70"}`}
          />
        );
      })}
      <span className="ml-2 text-[0.7rem] font-medium text-foreground/70">
        {successRate}%
      </span>
    </div>
  );
}

function CounterCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <dt className="text-xs font-medium text-foreground/70">{label}</dt>
      <dd className={`mt-1 text-2xl font-semibold ${tone}`}>{value}</dd>
    </div>
  );
}

export default function DurableWorkflowVisualizer() {
  const [mode, setMode] = useState<Mode>("durable");
  const [isRunning, setIsRunning] = useState(true);
  const [flakiness, setFlakiness] = useState(28);
  const [stepDelay, setStepDelay] = useState(2);
  const [runState, setRunState] = useState<RunState>(() =>
    getInitialRunState()
  );
  const timeoutRef = useRef<number | null>(null);

  const failureProbability = useMemo(() => flakiness / 100, [flakiness]);

  useEffect(() => {
    setRunState(getInitialRunState());
  }, [mode]);

  useEffect(() => {
    const terminalState =
      runState.stepStates.some(state => state === "failed") ||
      runState.stepStates.every(state => state === "success");

    if (!isRunning || terminalState) return;

    timeoutRef.current = window.setTimeout(() => {
      setRunState(current => {
        const step = workflowSteps[current.currentStepIndex];
        const failure =
          Math.random() < failureProbability ? pickFailure(mode) : null;

        if (failure) {
          const completeFailure = shouldFailCompletely(mode, failure.kind);
          const nextStepStates = [...current.stepStates];
          nextStepStates[current.currentStepIndex] = completeFailure
            ? "failed"
            : "recovered";

          const nextCounters: Counters = {
            successfulRuns: current.counters.successfulRuns,
            transientFailures:
              current.counters.transientFailures +
              (failure.kind === "transient" ? 1 : 0),
            recoveredFailures:
              current.counters.recoveredFailures + (completeFailure ? 0 : 1),
            completeFailures:
              current.counters.completeFailures + (completeFailure ? 1 : 0),
          };

          if (completeFailure) {
            return {
              ...current,
              counters: nextCounters,
              currentFailure: failure,
              stepStates: nextStepStates,
              stepMetrics: updateStepMetric(
                current.stepMetrics,
                current.currentStepIndex,
                "failures"
              ),
              statusMessage: `Run ${current.runId} failed at ${step.label}: ${failure.message}. ${failure.recovery}`,
            };
          }

          return {
            ...current,
            counters: nextCounters,
            currentFailure: failure,
            stepStates: nextStepStates,
            stepMetrics: updateStepMetric(
              current.stepMetrics,
              current.currentStepIndex,
              "failures"
            ),
            statusMessage: `Run ${current.runId} recovered at ${step.label}: ${failure.message}. ${failure.recovery}`,
          };
        }

        const nextStepStates = [...current.stepStates];
        nextStepStates[current.currentStepIndex] = "success";
        const nextStepMetrics = updateStepMetric(
          current.stepMetrics,
          current.currentStepIndex,
          "successes"
        );

        if (current.currentStepIndex === workflowSteps.length - 1) {
          return {
            ...current,
            counters: {
              ...current.counters,
              successfulRuns: current.counters.successfulRuns + 1,
            },
            currentFailure: null,
            stepStates: nextStepStates,
            stepMetrics: nextStepMetrics,
            statusMessage: `Run ${current.runId} completed successfully. A new order will start next.`,
          };
        }

        nextStepStates[current.currentStepIndex + 1] = "running";

        return {
          ...current,
          currentFailure: null,
          currentStepIndex: current.currentStepIndex + 1,
          stepStates: nextStepStates,
          stepMetrics: nextStepMetrics,
          statusMessage: `Run ${current.runId}: ${step.label} succeeded. ${workflowSteps[current.currentStepIndex + 1].label} is running.`,
        };
      });
    }, stepDelay * 1000);

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [failureProbability, isRunning, mode, runState, stepDelay]);

  useEffect(() => {
    const terminalState =
      runState.stepStates.some(state => state === "failed") ||
      runState.stepStates.every(state => state === "success");

    if (!isRunning || !terminalState) return;

    const restartId = window.setTimeout(() => {
      setRunState(current => ({
        ...current,
        runId: current.runId + 1,
        currentStepIndex: 0,
        currentFailure: null,
        stepStates: workflowSteps.map((_, index) =>
          index === 0 ? "running" : "idle"
        ),
        statusMessage: `Run ${current.runId + 1} started. Receive order is running.`,
      }));
    }, 1300);

    return () => window.clearTimeout(restartId);
  }, [isRunning, runState]);

  const modeDescription =
    mode === "durable"
      ? "Durable execution persists workflow history outside the worker, so crashes and long outages can resume."
      : "Without durable execution, quick HTTP glitches may recover locally, but crashes and long outages lose the process.";

  return (
    <section
      aria-labelledby="durable-workflow-title"
      className="not-prose my-10 rounded-2xl border border-border bg-muted/40 p-4 shadow-sm sm:p-6"
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-start">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
            Interactive workflow simulator
          </p>
          <h2
            id="durable-workflow-title"
            className="mt-2 text-2xl font-semibold text-foreground"
          >
            Retries protect calls. Workflows protect processes.
          </h2>
          <p className="mt-2 text-sm leading-6 text-foreground/80">
            {modeDescription}
          </p>

          <dl
            className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
            aria-label="Workflow run counters"
          >
            <CounterCard
              label="Successful runs"
              value={runState.counters.successfulRuns}
              tone="text-emerald-500"
            />
            <CounterCard
              label="Transient failures"
              value={runState.counters.transientFailures}
              tone="text-amber-500"
            />
            <CounterCard
              label="Recovered failures"
              value={runState.counters.recoveredFailures}
              tone="text-sky-500"
            />
            <CounterCard
              label="Complete failures"
              value={runState.counters.completeFailures}
              tone="text-rose-500"
            />
          </dl>
        </div>

        <div
          className="flex flex-col gap-3 rounded-xl border border-border bg-background p-3"
          aria-label="Workflow controls"
        >
          <div
            className="flex rounded-full border border-border bg-muted p-1"
            role="group"
            aria-label="Durability mode"
          >
            {(["durable", "standard"] as const).map(option => (
              <button
                key={option}
                type="button"
                onClick={() => setMode(option)}
                aria-pressed={mode === option}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  mode === option
                    ? "bg-accent text-background"
                    : "text-foreground/75 hover:bg-background"
                }`}
              >
                {option === "durable"
                  ? "With durable execution"
                  : "Without durable execution"}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsRunning(value => !value)}
            aria-pressed={isRunning}
            className="rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            {isRunning ? "Stop simulation" : "Start simulation"}
          </button>

          <label
            className="text-sm font-medium text-foreground"
            htmlFor="workflow-flakiness"
          >
            Dependency reliability: {flakiness}%
          </label>
          <input
            id="workflow-flakiness"
            type="range"
            min="0"
            max="75"
            value={flakiness}
            onChange={event => setFlakiness(Number(event.target.value))}
            aria-describedby="workflow-flakiness-help"
            className="accent-accent"
          />
          <p
            id="workflow-flakiness-help"
            className="text-xs text-foreground/65"
          >
            Higher values make dependency errors, restarts, and long outages
            more likely.
          </p>

          <label
            className="text-sm font-medium text-foreground"
            htmlFor="workflow-step-delay"
          >
            Step delay: {stepDelay}s
          </label>
          <input
            id="workflow-step-delay"
            type="range"
            min="1"
            max="10"
            value={stepDelay}
            onChange={event => setStepDelay(Number(event.target.value))}
            aria-describedby="workflow-step-delay-help"
            className="accent-accent"
          />
          <p
            id="workflow-step-delay-help"
            className="text-xs text-foreground/65"
          >
            Time in seconds the simulator pauses between each workflow step.
          </p>
        </div>
      </div>

      <div
        className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3"
        role="list"
        aria-label="Order workflow steps"
      >
        {workflowSteps.map((step, index) => {
          const state = runState.stepStates[index];
          const isActive = state === "running";
          const stateStyles: Record<StepState, string> = {
            idle: "border-border bg-background text-foreground/70",
            running:
              "border-accent bg-accent/10 text-foreground ring-2 ring-accent/30",
            success: "border-emerald-400/70 bg-emerald-400/10 text-foreground",
            recovered: "border-amber-400/80 bg-amber-400/10 text-foreground",
            failed: "border-rose-500 bg-rose-500/10 text-foreground",
          };

          return (
            <article
              key={step.id}
              role="listitem"
              aria-current={isActive ? "step" : undefined}
              className={`rounded-xl border p-4 transition-all sm:p-5 ${stateStyles[state]}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-foreground/60">
                  Step {index + 1}
                </span>
                <span className="rounded-full bg-background/80 px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide text-foreground/70 uppercase">
                  {state}
                </span>
              </div>
              <h3 className="mt-2 text-base leading-snug font-semibold text-foreground">
                {step.label}
              </h3>
              <p className="mt-2 text-xs leading-5 text-foreground/70">
                {step.detail}
              </p>
              <StepMetricClingers metric={runState.stepMetrics[index]} />
            </article>
          );
        })}
      </div>

      <div
        className="mt-5 rounded-xl border border-border bg-background p-4"
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="text-sm font-semibold text-foreground">
          {runState.statusMessage}
        </p>
        {runState.currentFailure && (
          <p className="mt-2 text-sm text-foreground/75">
            Last failure:{" "}
            <span className="font-medium">
              {runState.currentFailure.message}
            </span>{" "}
            — {runState.currentFailure.recovery}
          </p>
        )}
      </div>
    </section>
  );
}
