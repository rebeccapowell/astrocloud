import { useEffect, useMemo, useState } from "react";

type ScenarioId = "pod-restart" | "service-outage";
type LaneId = "plain" | "durable";
type NodeState =
  | "idle"
  | "running"
  | "done"
  | "failed"
  | "waiting"
  | "recovered";

type WorkflowStep = {
  id: string;
  label: string;
  detail: string;
};

type Scenario = {
  id: ScenarioId;
  label: string;
  headline: string;
  failureTick: number;
  recoveryTick: number;
  failureStep: number;
  plainFailure: string;
  durableRecovery: string;
};

const workflowSteps: WorkflowStep[] = [
  {
    id: "receive",
    label: "Receive order",
    detail: "The process starts in a worker.",
  },
  {
    id: "payment",
    label: "Authorize payment",
    detail: "The first external side effect succeeds.",
  },
  {
    id: "invoice",
    label: "Create invoice",
    detail: "The process needs the invoice service.",
  },
  {
    id: "email",
    label: "Send confirmation",
    detail: "The customer-visible notification is sent.",
  },
  {
    id: "fulfilment",
    label: "Notify fulfilment",
    detail: "The order can move downstream.",
  },
];

const scenarios: Scenario[] = [
  {
    id: "pod-restart",
    label: "Pod forcibly restarted",
    headline: "Worker memory disappears after payment is authorized.",
    failureTick: 3,
    recoveryTick: 5,
    failureStep: 1,
    plainFailure:
      "The process was only alive in the worker. After the restart, the retry policy is gone and the system needs manual reconstruction or compensating code.",
    durableRecovery:
      "Workflow history says payment completed. A new worker replays the history and resumes at invoice creation instead of guessing.",
  },
  {
    id: "service-outage",
    label: "Invoice API unavailable for 30 minutes",
    headline:
      "One dependency is down longer than a normal in-memory retry window.",
    failureTick: 4,
    recoveryTick: 7,
    failureStep: 2,
    plainFailure:
      "The HTTP retry loop runs while the worker is alive, then gives up or loses context. The wider order process is now stuck outside the retry library.",
    durableRecovery:
      "The workflow records the timer and failed activity attempt, waits through the outage, then resumes automatically when the dependency recovers.",
  },
];

const totalTicks = 11;
const tickDurationMs = 1200;

function getStepState(
  lane: LaneId,
  stepIndex: number,
  tick: number,
  scenario: Scenario
): NodeState {
  const shiftedTick =
    lane === "durable" && tick >= scenario.recoveryTick ? tick - 1 : tick;

  if (tick < stepIndex + 1) return "idle";

  if (lane === "plain" && tick >= scenario.failureTick) {
    if (stepIndex === scenario.failureStep) return "failed";
    if (stepIndex < scenario.failureStep) return "done";
    return "idle";
  }

  if (lane === "durable") {
    if (tick === scenario.failureTick && stepIndex === scenario.failureStep) {
      return "failed";
    }

    if (
      tick > scenario.failureTick &&
      tick < scenario.recoveryTick &&
      stepIndex === scenario.failureStep + 1
    ) {
      return "waiting";
    }

    if (
      tick === scenario.recoveryTick &&
      stepIndex === scenario.failureStep + 1
    ) {
      return "recovered";
    }
  }

  if (shiftedTick === stepIndex + 1) return "running";
  if (shiftedTick > stepIndex + 1) return "done";

  return "idle";
}

function getLaneNarrative(lane: LaneId, tick: number, scenario: Scenario) {
  if (tick < scenario.failureTick) {
    return lane === "plain"
      ? "The order is moving through ordinary process memory. Retries can protect individual calls while the worker stays alive."
      : "The workflow records each completed step outside the worker before moving to the next activity.";
  }

  if (tick === scenario.failureTick) {
    return lane === "plain"
      ? scenario.plainFailure
      : "Failure is observed, but the workflow instance and completed history still exist outside the crashed or blocked worker.";
  }

  if (tick < scenario.recoveryTick) {
    return lane === "plain"
      ? "Nothing is driving the business process forward now. Operators need logs, dashboards, or custom repair code to decide what happened."
      : scenario.id === "service-outage"
        ? "The durable runtime parks the workflow on a timer instead of burning a worker thread for the entire outage."
        : "A replacement worker can be started without losing the workflow's place in the business process.";
  }

  if (tick === scenario.recoveryTick) {
    return lane === "plain"
      ? "Restarting infrastructure does not recreate the lost process state. The next safe action is ambiguous."
      : scenario.durableRecovery;
  }

  return lane === "plain"
    ? "The non-durable lane remains stuck at the failure boundary because call retries were not a process recovery model."
    : "The durable lane finishes the remaining process steps from the recorded recovery point.";
}

function StatusPill({ state }: { state: NodeState }) {
  const label = {
    idle: "waiting",
    running: "running",
    done: "done",
    failed: "failed",
    waiting: "parked",
    recovered: "resume",
  }[state];

  const classes = {
    idle: "border-border bg-muted text-foreground/55",
    running: "border-accent bg-accent/10 text-accent",
    done: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    failed: "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-300",
    waiting:
      "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    recovered: "border-sky-500/50 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  }[state];

  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide uppercase ${classes}`}
    >
      {label}
    </span>
  );
}

function WorkflowLane({
  lane,
  tick,
  scenario,
}: {
  lane: LaneId;
  tick: number;
  scenario: Scenario;
}) {
  const laneTitle =
    lane === "plain" ? "Without durable execution" : "With durable execution";
  const laneSubtitle =
    lane === "plain"
      ? "Call retries live inside the worker."
      : "Workflow history lives outside the worker.";

  return (
    <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-base font-semibold text-foreground">
            {laneTitle}
          </div>
          <p className="mt-1 text-sm text-foreground/65">{laneSubtitle}</p>
        </div>
        <StatusPill
          state={
            lane === "plain" && tick >= scenario.failureTick
              ? "failed"
              : tick >= scenario.recoveryTick
                ? "recovered"
                : "running"
          }
        />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {workflowSteps.map((step, index) => {
          const state = getStepState(lane, index, tick, scenario);
          const isActive = [
            "running",
            "failed",
            "waiting",
            "recovered",
          ].includes(state);

          return (
            <div key={step.id} className="relative">
              {index > 0 && (
                <div
                  className={`absolute top-6 -left-3 hidden h-0.5 w-3 md:block ${
                    state === "idle" ? "bg-border" : "bg-accent/60"
                  }`}
                />
              )}
              <div
                className={`min-h-40 rounded-2xl border p-3 transition-all duration-500 ${
                  isActive
                    ? "scale-[1.02] border-accent bg-accent/10 shadow-md shadow-accent/10"
                    : state === "done"
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-border bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      state === "failed"
                        ? "bg-red-500 text-white"
                        : state === "done"
                          ? "bg-emerald-500 text-white"
                          : state === "waiting"
                            ? "bg-amber-500 text-white"
                            : state === "recovered"
                              ? "bg-sky-500 text-white"
                              : state === "running"
                                ? "animate-pulse bg-accent text-background"
                                : "bg-background text-foreground/45"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <StatusPill state={state} />
                </div>
                <div className="mt-3 text-sm leading-5 font-semibold text-foreground">
                  {step.label}
                </div>
                <p className="mt-2 text-xs leading-5 text-foreground/65">
                  {step.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4">
        <div className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
          What happens now
        </div>
        <p className="mt-2 text-sm leading-6 text-foreground/80">
          {getLaneNarrative(lane, tick, scenario)}
        </p>
      </div>
    </div>
  );
}

export default function DurableExecutionSimulator() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>("pod-restart");
  const [tick, setTick] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const scenario = useMemo(
    () => scenarios.find(item => item.id === scenarioId) ?? scenarios[0],
    [scenarioId]
  );

  useEffect(() => {
    if (!isPlaying) return undefined;

    const timer = window.setInterval(() => {
      setTick(current => (current + 1) % totalTicks);
    }, tickDurationMs);

    return () => window.clearInterval(timer);
  }, [isPlaying]);

  const selectScenario = (nextScenarioId: ScenarioId) => {
    setScenarioId(nextScenarioId);
    setTick(0);
    setIsPlaying(true);
  };

  return (
    <section className="not-prose my-10 overflow-hidden rounded-2xl border border-border bg-muted/40 p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
            Animated workflow map
          </p>
          <div className="mt-1 text-xl font-semibold text-foreground">
            Same failure, two execution models
          </div>
          <p className="mt-2 text-sm leading-6 text-foreground/80">
            Watch the order process loop through a failure. The top-level story
            is not whether one HTTP call can retry. It is whether the whole
            business process has somewhere durable to live when workers restart
            or services disappear for longer than an in-memory retry loop.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <button
            type="button"
            onClick={() => setIsPlaying(current => !current)}
            className="rounded-md border border-accent bg-accent px-3 py-1.5 text-background transition-opacity hover:opacity-90"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            onClick={() => setTick(0)}
            className="rounded-md border border-border px-3 py-1.5 text-foreground transition-colors hover:border-accent"
          >
            Restart loop
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 text-sm">
        {scenarios.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => selectScenario(item.id)}
            aria-pressed={scenario.id === item.id}
            className={`rounded-full border px-3 py-1.5 transition-colors ${
              scenario.id === item.id
                ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-background text-foreground/75 hover:border-accent/70"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-background/80 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-foreground">
              {scenario.headline}
            </div>
            <p className="mt-1 text-xs leading-5 text-foreground/60">
              Loop frame {tick + 1} of {totalTicks}: follow the highlighted
              cards through failure, waiting, recovery, and completion.
            </p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted sm:max-w-56">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${((tick + 1) / totalTicks) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5">
        <WorkflowLane lane="plain" tick={tick} scenario={scenario} />
        <WorkflowLane lane="durable" tick={tick} scenario={scenario} />
      </div>
    </section>
  );
}
