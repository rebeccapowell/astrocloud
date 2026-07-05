---
title: "Temporal Nexus in .NET (Preview): What It Is, When to Use It, and a Practical Walkthrough"
pubDatetime: 2026-07-05T20:05:00+02:00
author: rebecca
slug: temporal-nexus-dotnet-sdk-preview-walkthrough
featured: false
draft: false
tags:
  - temporal
  - dotnet
  - nexus
  - architecture
  - distributed-systems
description: "A practical guide to Temporal Nexus in .NET: what it is, where it fits, how it compares to Event Grid, and how to implement workflow-backed Nexus operations in a real sample."
---

![Temporal Nexus demo start screen](/assets/posts/temporal-nexus-dotnet-sdk-preview-walkthrough/e2e-scenario-a-start.png)

Temporal Nexus is one of the most interesting things in Temporal right now.

If you are building distributed systems in .NET, it gives you a cleaner way to call cross-service or cross-namespace operations from workflows without dropping into ad-hoc HTTP orchestration and custom retry glue.

This post explains:

1. what Nexus is,
2. when it is useful (and when it is not),
3. how to reason about it compared to Azure Event Grid,
4. how to use it today in the Temporal .NET SDK preview with a real walkthrough.

The walkthrough is based on my sample repo:

- https://github.com/rebeccapowell/temporal-nexus-demo

## What Nexus is

In plain terms, Nexus is a durable service boundary for workflow-to-workflow-style operations.

In this sample, the checkout workflow runs in a `storefront` namespace and calls operations exposed by workers in other namespaces:

- `inventory`
- `payment`
- `fulfillment`

The workflow still looks like workflow code, but each cross-boundary call is modeled as a Nexus operation with Temporal durability, retries, and traceability.

![Scenario A after email verification](/assets/posts/temporal-nexus-dotnet-sdk-preview-walkthrough/e2e-scenario-a-verified-ready.png)

## When Nexus is useful

Nexus shines when you need:

- clear boundaries between domain services or namespaces,
- durable request/response coordination from workflows,
- long-running reliability semantics without hand-rolled orchestration,
- typed contracts that match business operations.

Typical examples:

- checkout orchestration calling inventory, payment, and fulfillment domains;
- regulated workflows where you need durable state transitions and replay-safe behavior;
- complex process coordination where partial failure and retries are normal.

When *not* to reach for Nexus first:

- fire-and-forget event fan-out,
- analytics-style event broadcasting,
- simple stateless HTTP request pipelines.

## Nexus vs Azure Event Grid (analogy, not equivalence)

Event Grid is a great mental anchor because both help connect distributed systems. But they solve different coordination shapes.

| Topic | Azure Event Grid | Temporal Nexus |
| --- | --- | --- |
| Primary model | Event distribution / pub-sub | Durable operation invocation from workflows |
| Coupling style | Producer publishes events to subscribers | Caller targets a typed service operation |
| Delivery semantics | Event delivery/retry over event infrastructure | Operation execution tracked in Temporal history |
| Process durability | External to Event Grid itself | Native to workflow orchestration model |
| Best fit | Broad event fan-out, reactive integration | Cross-boundary business process orchestration |

The useful shortcut is:

> Event Grid is brilliant for event distribution.  
> Nexus is compelling for durable process coordination.

## The .NET SDK preview shape

Today (preview), the .NET API centers around:

- `[NexusService]` contracts
- `[NexusOperation]` operation methods
- handler classes using `WorkflowRunOperationHandler.FromHandleFactory(...)`

### 1) Define Nexus contracts

From the sample's `ShoppingBasket.NexusContracts` project:

```csharp
[NexusService]
public interface IInventoryNexusService
{
    [NexusOperation]
    ReserveInventoryOutput ReserveInventory(ReserveInventoryInput input);
}
```

### 2) Implement a workflow-backed operation handler

From `Inventory.Worker/Handlers/InventoryNexusService.cs`:

```csharp
[NexusServiceHandler(typeof(IInventoryNexusService))]
public class InventoryNexusService
{
    [NexusOperationHandler]
    public IOperationHandler<ReserveInventoryInput, ReserveInventoryOutput> ReserveInventory() =>
        WorkflowRunOperationHandler.FromHandleFactory<ReserveInventoryInput, ReserveInventoryOutput>(
            (context, input) => context.StartWorkflowAsync(
                (InventoryNexusWorkflow wf) => wf.RunAsync(input),
                new WorkflowOptions
                {
                    Id = $"inventory-nexus-{input.CheckoutId}-{context.HandlerContext.RequestId}",
                    TaskQueue = "inventory-nexus-queue",
                    IdConflictPolicy = WorkflowIdConflictPolicy.UseExisting,
                }));
}
```

The same pattern is used for payment and fulfillment handlers in their own workers.

### 3) Call Nexus operations from a workflow

From `CheckoutWorkflow.workflow.cs`:

```csharp
var inventoryClient = Workflow.CreateNexusWorkflowClient<IInventoryNexusService>("inventory-service");
var inventoryResult = await inventoryClient.ExecuteNexusOperationAsync(
    service => service.ReserveInventory(new ReserveInventoryInput(input.CheckoutId, input.Items)),
    new NexusWorkflowOperationOptions { ScheduleToCloseTimeout = TimeSpan.FromMinutes(5) });
```

Equivalent calls are made to:

- `IPaymentNexusService` (`payment-service`)
- `IFulfillmentNexusService` (`fulfillment-service`)

## Local setup notes (Aspire, briefly)

I use .NET Aspire to compose local resources and worker processes, but Nexus itself is the main topic here.

In this sample, the API initializes required Nexus endpoints at startup so local runs remain self-contained:

```csharp
("inventory-service", "inventory", "inventory-nexus-queue"),
("payment-service", "payment", "payment-nexus-queue"),
("fulfillment-service", "fulfillment", "fulfillment-nexus-queue")
```

That maps workflow client endpoint names to namespace + task queue targets.

![Aspire dashboard during E2E run](/assets/posts/temporal-nexus-dotnet-sdk-preview-walkthrough/e2e-aspire-dashboard.png)

## Why we built our own Aspire Temporal client package (for now)

A practical caveat from this implementation: preview-era Nexus integration needs in .NET/Aspire are still evolving.

To keep the walkthrough productive, I prepared a lightweight local package:

- `CommunityToolkit.Aspire.Temporal.Client`

This package is intentionally minimal and demo-focused. It helped close integration gaps needed for this Nexus scenario while preserving a clean developer experience in the sample.

Longer term, I'd love to see fuller hosting support consolidated in the Aspire ecosystem, potentially through the Aspire Community Toolkit, with collaboration across:

- the extension author community (including Elan/InfinityFlow),
- the Aspire team at Microsoft,
- the Temporal .NET SDK team.

## Preview feedback themes before GA

Nexus in .NET preview is already promising, but there are a few areas where better developer ergonomics would have outsized impact:

1. **More developer-friendly surface area**  
   The low-level handler model is powerful, but the default happy path could be simpler and clearer for application developers.

2. **OpenTelemetry propagation improvements**  
   Cross-namespace traces currently need stronger out-of-the-box context continuity for better end-to-end observability.

3. **RBAC and operator ergonomics**  
   Endpoint and operational security workflows can be made easier to reason about in day-to-day team usage.

None of these erase the value of Nexus. They are exactly the kind of polish items worth addressing before broad GA adoption.

## Final thoughts

If you already use Temporal workflows in .NET and have been looking for a cleaner cross-boundary orchestration model, Nexus is worth serious attention.

My practical recommendation is:

- start with one business flow,
- model clear service contracts,
- keep handlers boring and deterministic,
- validate observability early,
- and treat preview APIs as learning surfaces, not fixed architecture forever.

![Headless two-customer completion run](/assets/posts/temporal-nexus-dotnet-sdk-preview-walkthrough/two-customer-headless-final.png)

The model is strong. The tooling is getting there. The timing is good to experiment.
