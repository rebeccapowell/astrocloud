export type DurableExecutionMode = "call" | "durable";
export type DurableExecutionStepStatus = "completed" | "error" | "waiting";

export type DurableExecutionStep = {
  label: string;
  callRetry: string;
  durable: string;
  failure: string;
};

export const durableExecutionSteps: DurableExecutionStep[] = [
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

export const initialFailedDurableExecutionStep = 2;
export const durableExecutionRetrySuccessChance = 0.55;

export function getRandomDurableExecutionStepIndex() {
  return Math.floor(Math.random() * durableExecutionSteps.length);
}

export function getDurableExecutionStepStatus(
  index: number,
  failedStepIndex: number | null
): DurableExecutionStepStatus {
  if (failedStepIndex === null) return "completed";
  if (index < failedStepIndex) return "completed";
  if (index === failedStepIndex) return "error";
  return "waiting";
}

export function getDurableExecutionOutcome(
  mode: DurableExecutionMode,
  failedStepIndex: number | null,
  retryAttempts: number
) {
  if (failedStepIndex === null) {
    return "The process completed. Both approaches can look fine on the happy path, which is why the abstraction difference is easy to miss.";
  }

  const failedStep = durableExecutionSteps[failedStepIndex];

  if (mode === "call") {
    return `The current call can retry while this worker is alive, but the process state is not the retry library's job. The simulator stops at “${failedStep.label}” because the next business step must not start while this step is still in error.`;
  }

  return `The workflow remains parked at “${failedStep.label}” after ${retryAttempts} ${retryAttempts === 1 ? "attempt" : "attempts"}. It may retry this same activity again; it does not advance to the next step until the failed step succeeds.`;
}
