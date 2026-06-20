---
title: "Durable Execution for Dummies: Retries Protect Calls, Workflows Protect Processes"
pubDatetime: 2026-06-20T20:00:00+02:00
author: rebecca
description: "A practical explanation of durable execution, why retry libraries are not enough, and the WOWL rule: Write Once, Write Last."
featured: false
draft: false
tags:
  - temporal
  - durable-execution
  - workflows
  - resilience
  - distributed-systems
  - architecture
---

![Retries are not durable execution](/assets/posts/durable-execution-wowl/01-retries-are-not-durable-execution.jpg)

Retries are not durable execution.

That sounds obvious when written down. But in real architecture conversations the distinction gets blurry very quickly.

Someone says:

> We already have retries.  
> We use exponential backoff.  
> We have circuit breakers.  
> We use Polly, Resilience4j, Tenacity, Spring Retry, Opossum, or whatever the equivalent is in our stack.

Good. You should.

But those tools usually sit around a **call**.

Durable execution sits around a **process**.

That is the abstraction shift.

![The difference is the abstraction layer](/assets/posts/durable-execution-wowl/02-abstraction-layer.jpg)

## Resilience depends on what you wrap

A retry library wraps an operation:

- an HTTP call
- a database call
- a message publish
- a dependency interaction
- a remote procedure call

It asks a small, local question:

> Did this operation succeed?

If not, maybe retry it. Maybe back off. Maybe open a circuit. Maybe timeout. Maybe fall back.

That is valuable. It protects a running process from transient dependency failure.

Durable execution wraps something larger:

- a workflow
- an activity graph
- a business transaction
- a customer journey across systems
- a long-running process with waits, callbacks, side effects, and recovery points

It asks a different question:

> Can this process safely continue?

That is not just a bigger retry. It is a different abstraction layer.

## The easy mistake

Imagine this order flow:

```text
Receive order
Authorize payment
Reserve stock
Create invoice
Send confirmation
Notify fulfilment
```

A resilience library can help with the call to the invoice service.

If the invoice API returns `503`, retry it. If it times out, back off. If it keeps failing, open the circuit. Great.

But now ask a different question:

> What happens if the worker crashes after the payment is authorized but before the invoice is created?

A retry policy around the invoice call does not answer that.

Neither does a circuit breaker.

Neither does a timeout.

The problem is no longer "did this HTTP call succeed?" The problem is:

> Where exactly was this business process, what already happened, and what is safe to do next?

That is durable execution territory.

## A reliable call is not the same as a recoverable process

![Call failure versus process failure](/assets/posts/durable-execution-wowl/05-call-failure-vs-process-failure.jpg)

This is the distinction I wish more architecture diagrams made visible.

Call-level resilience protects a single dependency interaction. Process-level durability protects the journey across interactions.

A reliable call can still live inside an unrecoverable process.

For example:

```text
1. Charge payment gateway
2. Update CRM
3. Send confirmation email
4. Publish OrderConfirmed event
```

Each individual call might have a lovely retry policy. Each might use backoff. Each might have timeouts. Each might be observable.

But if all four side effects live inside one retryable unit, the recovery story is still messy.

If the process crashes after step 1, do you charge again?

If it crashes after step 2, do you update CRM again?

If the email send succeeds but the event publish fails, what is the source of truth?

If the whole activity retries, which side effects are safe to repeat?

This is why durable execution platforms such as [Temporal](https://temporal.io/), [Azure Durable Functions](https://learn.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-overview), [Dapr Workflow](https://docs.dapr.io/developing-applications/building-blocks/workflow/), [AWS Step Functions](https://aws.amazon.com/step-functions/), and [Netflix Conductor](https://conductor-oss.github.io/conductor/) exist.

They are not just retry engines. They are process recovery engines.

They persist progress outside the worker process. They keep history. They know which step ran. They know what is waiting. They can resume after crashes, restarts, redeployments, callbacks, timers, and human input.

The developer still has to design the steps well. But the platform gives the process somewhere to live other than memory.

## The call-level question

![Call-level resilience](/assets/posts/durable-execution-wowl/03-call-level-resilience.jpg)

Call-level resilience asks:

> Did this operation succeed?

That is the world of:

- retries
- timeouts
- rate limits
- backoff
- circuit breakers
- fallbacks
- hedging
- bulkheads

In .NET, [Polly](https://www.pollydocs.org/) is the obvious example. In Java you might think of Resilience4j or Spring Retry. In Python, Tenacity. In Node.js, Opossum.

These libraries are not the enemy. They are useful and necessary.

But they normally live inside a running process.

If the process is gone, the retry policy is gone with it.

## The durable-execution question

![Durable execution workflow](/assets/posts/durable-execution-wowl/04-durable-execution-workflow.jpg)

Durable execution asks:

> Can this process safely continue?

That means the runtime needs to know things like:

- which workflow instance this is
- which steps completed
- which step is currently running or waiting
- which events were received
- which timers were scheduled
- which activities failed
- which retries are still pending
- which side effects may already have happened
- what must not be repeated blindly

This is why durable execution is so powerful for real business processes.

It is not about making every call magically succeed. Distributed systems still fail.

It is about making the process survivable.

## The activity-design problem

Durable execution solves the process recovery problem.

It does not remove the need to think carefully about side effects.

This is the part people often miss.

A workflow engine can remember that an activity failed. It can retry it. It can show you where the workflow is stuck. It can resume after the worker comes back.

But if your activity performs four different external writes and then crashes halfway through, the workflow engine cannot magically know whether your external systems are in a safe state unless you design for that.

That is where my own shorthand comes in:

> **WOWL: Write Once, Write Last**

## WOWL: Write Once, Write Last

![WOWL: Write once, write last activity design](/assets/posts/durable-execution-wowl/07-wowl-write-once-write-last.jpg)

WOWL is a simple rule of thumb for retryable steps:

> Do repeatable work first. Put one externally visible write at the end.

Or shorter:

> Read many. Decide once. Write last.

Inside a retryable activity, reads are usually fine:

```text
Read order
Read customer
Read current price
Read account status
Validate
Calculate
Prepare request
```

If that activity fails before the final side effect, it can usually run again.

The danger begins when the activity changes the outside world:

```text
Charge payment
Send email
Update CRM
Publish event
Create shipment
Write audit record
```

Those are not just calculations. They are side effects.

A side effect should either be:

- naturally idempotent
- protected by an idempotency key
- guarded by a uniqueness constraint
- implemented as an upsert or dedupe operation
- handled through an outbox/inbox pattern
- or isolated as the final action in the retryable step

The important thing is not the acronym. The important thing is the boundary.

Before the boundary: repeatable work.

After the boundary: one controlled side effect.

## Bad smell: one activity sprays writes everywhere

This is the smell I look for in workflow code:

```text
Activity: CompleteOrder

1. Charge payment gateway
2. Update CRM
3. Send confirmation email
4. Publish event
5. Update reporting database
```

This activity name sounds helpful. It is also hiding a recovery nightmare.

What happens if step 1 succeeds and step 2 fails?

What happens if step 3 succeeds but step 4 times out?

What happens if the activity retries from the beginning?

What happens if the payment gateway is idempotent but the email provider is not?

What happens if the event publish succeeds but the local database write does not?

You can make this work. But you have to design it. If you do not, you have created a process that looks simple in code and behaves chaotically under failure.

## Better: split the flow into safe steps

![Why WOWL matters: safe steps versus spray writes](/assets/posts/durable-execution-wowl/08-why-wowl-matters.jpg)

A better workflow shape is often:

```text
Activity 1: ChargePayment
Activity 2: RecordPaymentResult
Activity 3: UpdateCrm
Activity 4: SendConfirmationEmail
Activity 5: PublishOrderConfirmedEvent
```

Each activity has one meaningful side effect.

Each activity can have its own idempotency strategy.

Each activity has a clearer retry boundary.

The workflow then coordinates the process:

```text
ChargePayment -> RecordPaymentResult -> UpdateCrm -> SendEmail -> PublishEvent
```

Now the durable execution platform can show where the business process is. And when something fails, the question is not "which of the five hidden writes happened inside this one blob of code?"

The question is much cleaner:

> Which process step failed, and is that step safe to retry?

## Important nuance: not all writes are equal

WOWL is a rule of thumb, not a law of physics.

Multiple database writes inside one real database transaction can be fine. If they commit atomically, they behave as one write boundary.

For example:

```text
BEGIN TRANSACTION
  Insert order row
  Insert order line rows
  Insert audit row
COMMIT
```

That is not the same problem as this:

```text
Charge payment gateway
Update CRM
Send email
Publish Kafka event
```

The first has one transactional boundary.

The second has four different external systems and no single atomic commit across all of them.

That is the distinction.

WOWL is mostly about externally visible side effects across system boundaries.

## What about events?

Event publishing is a write.

This is easy to forget because events feel lightweight. They are "just messages".

But if another service can observe it, react to it, bill from it, email from it, reserve stock from it, or update customer state from it, then it is a side effect.

That means event publishing needs the same discipline as any other write.

In many systems, the safest answer is the transactional outbox pattern:

1. Write business state and an outgoing event record in the same database transaction.
2. Have a separate publisher reliably publish pending events.
3. Make consumers idempotent.

Again, the theme is the same: make the boundary explicit.

## Durable execution does not replace idempotency

This is worth saying plainly.

Durable execution does not make side effects safe by itself.

It makes the process recoverable.

Your activities still need idempotency.

If you charge a credit card twice, the workflow engine cannot pretend that did not happen.

If you send the same email ten times, the workflow history may explain why, but the customer still received ten emails.

If you publish duplicate events and consumers are not idempotent, the blast radius moves downstream.

Durable execution gives you state, history, retries, timers, waits, signals, and recovery.

WOWL gives you a practical design discipline for the side effects inside that durable process.

They belong together.

## How I think about the layers

![You often need both: call-level resilience and durable execution](/assets/posts/durable-execution-wowl/06-you-often-need-both.jpg)

The cleanest mental model is this:

```text
Durable workflow
  Activity: read/prepare -> one idempotent write
  Activity: read/prepare -> one idempotent write
  Activity: read/prepare -> one idempotent write
```

Inside each activity, call-level resilience still matters.

You still want timeouts.

You still want bounded retries.

You still want circuit breakers in the right places.

You still want rate limits.

You still want observability.

But those techniques protect individual operations.

The durable workflow protects the process.

## A practical checklist

When reviewing workflow or activity code, I ask these questions:

### 1. What is the unit of retry?

If this thing fails, what exactly will run again?

A method?
An activity?
A message handler?
A background job?
A whole workflow step?

You cannot reason about side effects until you know the retry boundary.

### 2. Which operations are reads?

Reads are usually repeatable, but be careful with unstable reads. Reading "the current price" or "the current risk score" may be technically read-only but semantically time-sensitive.

Sometimes you need to snapshot the input so the process is deterministic from a business perspective.

### 3. Which operations are writes?

Be strict here.

A write is anything that changes externally observable state.

That includes sending email, publishing events, creating tickets, charging payment methods, starting shipments, mutating databases, updating CRM, calling webhooks, and sometimes even calling third-party APIs that record requests.

### 4. Can the write be repeated safely?

If yes, how?

- idempotency key
- natural business key
- unique constraint
- dedupe table
- upsert
- outbox
- inbox
- consumer idempotency

If the answer is "probably", that is not an answer.

### 5. Is the write last?

If the write is followed by more logic, ask why.

Sometimes there is a good reason. Often there is not.

The safest retryable shape is:

```text
read -> read -> calculate -> validate -> prepare -> write
```

not:

```text
write -> calculate -> write -> call -> write -> hope
```

## The one-sentence version

Call resilience asks:

> Did this operation succeed?

Durable execution asks:

> Can this process safely continue?

WOWL asks:

> If this step retries, what side effect might happen again?

That combination is the point.

Retries make calls more reliable.

Durable execution makes processes recoverable.

WOWL keeps the side-effect boundary clean.
