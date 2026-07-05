---
title: "Temporal .NET Nexus Preview Feedback"
pubDatetime: 2026-07-05T13:00:00+02:00
author: rebecca
slug: temporal-dotnet-nexus-preview-feedback
featured: false
draft: false
tags:
  - temporal
  - dotnet
  - nexus
  - sdk
  - architecture
description: "A detailed review of Temporal's .NET Nexus preview API, with source-linked feedback on what should change before GA."
---

Date: 5 July 2026  
Repository checked: `temporalio/sdk-dotnet` on `main` and `nexus-api-gen-signal-with-start`  
Docs checked: Temporal .NET Nexus quickstart and feature guide  
Scope: Public preview Nexus support in the .NET SDK

## Executive summary

The core idea is good. Nexus gives Temporal teams a cleaner cross-namespace boundary than "just start a workflow on that task queue". It hides implementation detail, gives a contract surface, and keeps the call durable.

The .NET SDK implementation is also better internally than the public examples make it look. The source shows careful work around callback plumbing, operation tokens, cancellation, request IDs, links, payload conversion, and error classification.

The problem is the public programming model.

Right now too much of the Nexus adapter layer leaks into normal application code. The examples teach developers to return `IOperationHandler<TInput, TResult>` from handler methods, to use `WorkflowRunOperationHandler.FromHandleFactory(...)`, and to place endpoint names directly inside the shared service interface. That is workable for preview, but it is not the API shape I would freeze at GA.

My short version of the feedback would be this:

> Do not GA the .NET Nexus SDK with the low-level handler factory as the main developer experience. Keep it as the escape hatch. Add a higher-level .NET-native handler model, make context propagation explicit, make error classification obvious, and ship analyzers/source generators so teams find contract mistakes at build time, not in production.

This report lists the issues I would raise before GA.

Line links point to the `main` branch unless noted. They may drift if the repository changes.

---

## Priority list

### Must fix before GA

1. Add a high-level handler API above `IOperationHandler<TInput, TResult>`.
2. Make header, correlation, and telemetry propagation into workflow-backed operations first-class.
3. Make application-level Nexus error classification obvious and public.
4. Add source generators or analyzers for contract and handler mistakes.
5. Make Nexus handler registration first-class in the hosted worker and DI story.

### Should fix before GA

6. Stop teaching endpoint names as static fields on the shared service contract.
7. Make sync operation guidance stricter.
8. Improve timeout naming with safer presets.
9. Make cancellation semantics more explicit.
10. Add contract testing around payload conversion, `NoValue`, codecs, and serialization context.
11. Add better observability hooks and dependency graph metadata.
12. Improve contract versioning and operation naming guidance.

---

# Issue 1: the handler API leaks too much framework plumbing

## Current implementation

The core helper API is a set of `FromHandleFactory` overloads that return `IOperationHandler<TInput, TResult>`.

Source: [WorkflowRunOperationHandler.cs lines 24-67](https://github.com/temporalio/sdk-dotnet/blob/main/src/Temporalio/Nexus/WorkflowRunOperationHandler.cs#L24-L67)

```csharp
public static IOperationHandler<TInput, TResult> FromHandleFactory<TInput, TResult>(
    Func<WorkflowRunOperationContext, TInput, Task<NexusWorkflowRunHandle<TResult>>> handleFactory) =>
    new WorkflowRunOperationHandler<TInput, TResult>(
        async (context, input) => await handleFactory(context, input).ConfigureAwait(false));
```

The sample then exposes that low-level shape directly in application code.

Source: [samples-dotnet NexusSimple handler lines 22-30](https://github.com/temporalio/samples-dotnet/blob/main/src/NexusSimple/Handler/HelloService.cs#L22-L30)

```csharp
[NexusOperationHandler]
public IOperationHandler<IHelloService.HelloInput, IHelloService.HelloOutput> SayHello() =>
    // This Nexus service operation is backed by a workflow run
    WorkflowRunOperationHandler.FromHandleFactory(
        (WorkflowRunOperationContext context, IHelloService.HelloInput input) =>
            context.StartWorkflowAsync(
                (HelloHandlerWorkflow wf) => wf.RunAsync(input),
```

## Problem

This is fine as a low-level adapter. It is not fine as the main developer experience.

The developer is not writing a service handler. They are writing a method that returns an operation handler that wraps a factory that starts a workflow. That is too much ceremony for the normal case.

Most .NET developers will expect this to look like implementing a service or deriving from a handler base class. The current shape makes the application code feel like SDK internals.

It is also harder to teach. You have to explain:

- the service interface is the contract;
- the handler class does not implement the interface;
- the handler method does not handle the operation directly;
- it returns an `IOperationHandler`;
- `WorkflowRunOperationHandler.FromHandleFactory` turns a workflow start into an async Nexus operation;
- the returned workflow handle becomes an operation token.

All of that is true, but it is too much surface area for the first-class path.

## Ideally

Keep `IOperationHandler<TInput, TResult>` and `FromHandleFactory(...)` as the escape hatch. Add a higher-level handler model that is boring to read.

```csharp
[NexusServiceHandler(typeof(IHelloService))]
public sealed class HelloServiceHandler : NexusServiceHandler<IHelloService>
{
    public Task<NexusWorkflowRun<IHelloService.HelloOutput>> SayHelloAsync(
        IHelloService.HelloInput request,
        NexusOperationContext context)
    {
        return context.StartWorkflowAsync<HelloHandlerWorkflow, IHelloService.HelloOutput>(
            wf => wf.RunAsync(request),
            new NexusWorkflowStartOptions
            {
                Id = request.BusinessOperationId,
            });
    }
}
```

Or, if inheritance is not wanted, source-generate the adapter:

```csharp
[NexusServiceHandler(typeof(IHelloService))]
public sealed partial class HelloServiceHandler
{
    [NexusWorkflowBackedOperation]
    public Task<NexusWorkflowRun<IHelloService.HelloOutput>> SayHelloAsync(
        IHelloService.HelloInput request,
        NexusOperationContext context)
    {
        return context.StartWorkflowAsync<HelloHandlerWorkflow, IHelloService.HelloOutput>(
            wf => wf.RunAsync(request),
            new NexusWorkflowStartOptions
            {
                Id = request.BusinessOperationId,
            });
    }
}
```

The current API can remain underneath. The main path should be the service intent, not the adapter mechanics.

---

# Issue 2: the service interface looks like a normal .NET interface, but it is really metadata

## Current implementation

The service contract is an attributed interface. It also carries an endpoint name in the sample.

Source: [samples-dotnet IHelloService.cs lines 5-17](https://github.com/temporalio/samples-dotnet/blob/main/src/NexusSimple/IHelloService.cs#L5-L17)

```csharp
[NexusService]
public interface IHelloService
{
    static readonly string EndpointName = "nexus-simple-endpoint";

    [NexusOperation]
    EchoOutput Echo(EchoInput input);

    [NexusOperation]
    HelloOutput SayHello(HelloInput input);
```

The handler is linked back to that interface using an attribute, but does not implement the interface.

Source: [samples-dotnet HelloService.cs lines 7-14](https://github.com/temporalio/samples-dotnet/blob/main/src/NexusSimple/Handler/HelloService.cs#L7-L14)

```csharp
[NexusServiceHandler(typeof(IHelloService))]
public class HelloService
{
    [NexusOperationHandler]
    public IOperationHandler<IHelloService.EchoInput, IHelloService.EchoOutput> Echo() =>
```

## Problem

The interface is doing useful work. It gives the caller a typed contract. That is good.

The trap is that it looks like ordinary .NET polymorphism, but it is not. A normal .NET developer sees an interface and expects the handler to implement it. Here the interface is closer to a contract descriptor used by the Nexus runtime.

That distinction matters. If the SDK uses familiar .NET syntax but gives it Temporal-specific semantics, the docs and analyzers need to be very explicit. Otherwise developers will learn by runtime failure.

This is similar to the existing workflow-interface gotcha in Temporal .NET. It looks like C#, but it does not behave like normal C#.

## Ideally

Either make the handler implement a generated or abstract version of the contract:

```csharp
[NexusService(Name = "hello-service")]
public interface IHelloService
{
    [NexusOperation("say-hello")]
    Task<HelloResponse> SayHelloAsync(HelloRequest request);
}

public sealed class HelloServiceHandler : IHelloService
{
    public Task<HelloResponse> SayHelloAsync(HelloRequest request)
    {
        // For synchronous operations only.
    }
}
```

Or make the metadata nature painfully clear:

```csharp
[NexusContract(Name = "hello-service")]
public interface IHelloServiceContract
{
    [NexusOperation("say-hello")]
    Operation<HelloRequest, HelloResponse> SayHello { get; }
}
```

If the current `[NexusService] interface` model stays, then I would at least add documentation and analyzers that say:

```text
This interface is a Nexus contract descriptor.
Nexus service handlers do not implement this interface directly.
Use [NexusServiceHandler(typeof(...))] or the generated handler base.
```

---

# Issue 3: endpoint names should not be taught as static fields on shared contracts

## Current implementation

The quickstart explicitly teaches a static endpoint name field on the service interface.

Docs: [Nexus .NET quickstart lines 103-124](https://docs.temporal.io/develop/dotnet/nexus/quickstart)

```csharp
[NexusService]
public interface ISayHelloNexusService
{
  public static readonly string EndpointName = "my-nexus-endpoint-name";

  [NexusOperation]
  string SayHello(MyInput input);
}
```

The SDK client option is also just an endpoint string.

Source: [NexusWorkflowClientOptions.cs lines 20-29](https://github.com/temporalio/sdk-dotnet/blob/main/src/Temporalio/Workflows/NexusWorkflowClientOptions.cs#L20-L29)

```csharp
public NexusWorkflowClientOptions(string endpoint) => Endpoint = endpoint;

/// <summary>
/// Gets or sets the endpoint.
/// </summary>
public string? Endpoint { get; set; }
```

The workflow API takes that endpoint directly.

Source: [Workflow.cs lines 342-373](https://github.com/temporalio/sdk-dotnet/blob/main/src/Temporalio/Workflows/Workflow.cs#L342-L373)

```csharp
public static NexusWorkflowClient CreateNexusWorkflowClient(string service, string endpoint) =>
    CreateNexusWorkflowClient(service, new NexusWorkflowClientOptions(endpoint));

public static NexusWorkflowClient<TService> CreateNexusWorkflowClient<TService>(string endpoint) =>
    CreateNexusWorkflowClient<TService>(new NexusWorkflowClientOptions(endpoint));
```

## Problem

A Nexus service contract should describe service and operation shape. An endpoint is deployment routing.

Putting endpoint names into the contract package couples all consumers of that contract to a routing choice. It is sample-friendly, but it is a bad enterprise habit to teach.

I understand why this is attractive in workflows. Workflow code must be deterministic, so you do not casually read environment configuration from inside a workflow. But that does not mean the endpoint belongs inside the shared contract interface.

Endpoint naming is closer to API gateway routing than to the service schema.

## Ideally

Keep endpoint constants outside the service contract. For example:

```csharp
[NexusService(Name = "hello-service")]
public interface IHelloService
{
    [NexusOperation("say-hello")]
    HelloResponse SayHello(HelloRequest request);
}

public static class NexusEndpoints
{
    public const string HelloServiceV1 = "hello-service-v1";
}
```

The workflow still uses a deterministic string, but that string is not part of the shared contract type:

```csharp
var hello = Workflow.CreateNexusWorkflowClient<IHelloService>(
    NexusEndpoints.HelloServiceV1);
```

For larger platforms, provide a generated endpoint catalog:

```csharp
var hello = Workflow.CreateNexusWorkflowClient<IHelloService>(
    PlatformNexusEndpoints.HelloService.Current);
```

The key point is simple: service contract and endpoint routing are different things. The samples should not blur them.

---

# Issue 4: header and context propagation into workflow-backed operations is not first-class enough

## Current implementation

The Nexus worker does create an `OperationStartContext` with headers from the incoming Nexus request.

Source: [NexusWorker.cs lines 168-200](https://github.com/temporalio/sdk-dotnet/blob/main/src/Temporalio/Worker/NexusWorker.cs#L168-L200)

```csharp
var context = new OperationStartContext(
    Service: startOp.Service,
    Operation: startOp.Operation,
    CancellationToken: running.CancellationTokenSource.Token,
    RequestId: startOp.RequestId)
{
    Headers = task.Request.Header.Count == 0 ? null :
        new Dictionary<string, string>(task.Request.Header, StringComparer.OrdinalIgnoreCase),
    CallbackUrl = string.IsNullOrEmpty(startOp.Callback) ? null : startOp.Callback,
    CallbackHeaders = startOp.CallbackHeader.Count == 0 ? null :
        new Dictionary<string, string>(startOp.CallbackHeader, StringComparer.OrdinalIgnoreCase),
    InboundLinks = startOp.Links.Select(l =>
```

The workflow-backed start helper copies internal Nexus plumbing into `WorkflowOptions`: task queue, links, callbacks, operation token header, and request ID.

Source: [NexusWorkflowStartHelper.cs lines 50-105](https://github.com/temporalio/sdk-dotnet/blob/main/src/Temporalio/Nexus/NexusWorkflowStartHelper.cs#L50-L105)

```csharp
options = (WorkflowOptions)options.Clone();
options.TaskQueue ??= temporalContext.Info.TaskQueue;

if (nexusStartContext.InboundLinks.Count > 0)
{
    options.Links = nexusStartContext.InboundLinks.Select(link =>
    {
        ...
    }).OfType<Link>().ToList();
}

if (nexusStartContext.CallbackUrl is { } callbackUrl)
{
    ...
    options.CompletionCallbacks = new[] { callback };
}

options.RequestId = nexusStartContext.RequestId;
```

A community report also describes this exact gap: incoming Nexus headers are visible, but workflow start options do not expose an obvious `Headers` property for passing them into the backing workflow.

Source: [Temporal community thread](https://community.temporal.io/t/net-sdk-nexus-workflowrunoperationhandler-bypasses-interceptors-and-lacks-header-support/19239)

```csharp
// The incoming Nexus context has headers.
context.HandlerContext.Headers

// But WorkflowOptions passed to StartWorkflowAsync does not expose Headers.
context.StartWorkflowAsync(..., new WorkflowOptions { ... });
```

## Problem

The implementation does useful internal propagation. It is not sloppy.

But there is no obvious first-class application-level propagation model for things teams actually need:

- correlation ID;
- causation ID;
- tenant ID;
- authenticated caller identity;
- data classification;
- OpenTelemetry baggage;
- business context;
- contract version.

This matters more for Nexus than for ordinary workflow starts because Nexus is explicitly a cross-team, cross-namespace boundary. If context propagation is not obvious, every team will invent its own version.

The source-level nuance from the preview branch is that this path does not automatically inject W3C trace context (`traceparent`/`tracestate`) either. You can manually copy headers, but there is no built-in "adopt current Activity context" behavior at the Nexus boundary today.

The fair correction to my earlier thinking is this: Nexus worker interceptors are not simply bypassed. The source creates Nexus middleware from worker interceptors.

Source: [NexusWorker.cs lines 61-71](https://github.com/temporalio/sdk-dotnet/blob/main/src/Temporalio/Worker/NexusWorker.cs#L61-L71)

```csharp
var middleware = Array.Empty<IOperationMiddleware>();
if (worker.Interceptors is { } interceptors && interceptors.Count > 0)
{
    middleware = new[] { new NexusMiddlewareForInterceptors(interceptors) };
}

handler = new Handler(
    worker.Options.NexusServices,
    new NexusPayloadSerializer(worker.Client.Options.DataConverter),
    middleware);
```

So the issue is not "interceptors do not exist". The issue is that context propagation from the Nexus boundary into the workflow start is still too implicit.

## Ideally

Expose propagation on the workflow-backed Nexus start path.

```csharp
return context.StartWorkflowAsync(
    (OfferCalculationWorkflow wf) => wf.RunAsync(request),
    new NexusWorkflowStartOptions
    {
        Id = request.OperationId,

        HeaderPropagation = NexusHeaderPropagation.Copy(
            "x-correlation-id",
            "x-causation-id",
            "x-tenant-id",
            "x-contract-version"),

        PropagateTelemetryContext = true,
    });
```

Or make it a worker-level policy:

```csharp
builder.Services.AddTemporalNexus(options =>
{
    options.PropagateHeadersToWorkflowStarts = headers => headers
        .Include("x-correlation-id")
        .Include("x-causation-id")
        .Include("x-tenant-id")
        .Include("traceparent")
        .Include("baggage");
});
```

The SDK should decide the safe/default deterministic shape, but the concept needs to be explicit.

---

# Issue 5: error handling is internally sensible, but not obvious enough for application developers

## Current implementation

The worker has internal mapping from RPC status codes to Nexus handler error types, and a set of non-retryable RPC status codes.

Source: [NexusWorker.cs lines 30-45](https://github.com/temporalio/sdk-dotnet/blob/main/src/Temporalio/Worker/NexusWorker.cs#L30-L45)

```csharp
private static readonly Dictionary<RpcException.StatusCode, HandlerErrorType> RpcStatusCodeErrorTypes = new()
{
    [RpcException.StatusCode.InvalidArgument] = HandlerErrorType.BadRequest,
    [RpcException.StatusCode.NotFound] = HandlerErrorType.NotFound,
    [RpcException.StatusCode.ResourceExhausted] = HandlerErrorType.ResourceExhausted,
    [RpcException.StatusCode.Unimplemented] = HandlerErrorType.NotImplemented,
    [RpcException.StatusCode.DeadlineExceeded] = HandlerErrorType.UpstreamTimeout,
};

private static readonly HashSet<RpcException.StatusCode> NonRetryableRpcStatusCodes = new()
{
    RpcException.StatusCode.InvalidArgument,
    RpcException.StatusCode.AlreadyExists,
    RpcException.StatusCode.FailedPrecondition,
    RpcException.StatusCode.OutOfRange,
};
```

The worker also converts several exception types into handler errors.

Source: [NexusWorker.cs lines 380-426](https://github.com/temporalio/sdk-dotnet/blob/main/src/Temporalio/Worker/NexusWorker.cs#L380-L426)

```csharp
private HandlerException ConvertToHandlerException(Exception exc)
{
    if (exc is HandlerException handlerExc)
    {
        return handlerExc;
    }
    if (exc is WorkflowFailedException)
    {
        return new(HandlerErrorType.BadRequest, "Workflow failed", exc);
    }
    else if (exc is ApplicationFailureException appExc && appExc.NonRetryable)
    {
        return new(
            HandlerErrorType.Internal,
            "Handler failed with non-retryable application error",
            appExc,
            HandlerErrorRetryBehavior.NonRetryable);
    }
    ...
    else
    {
        return new(HandlerErrorType.Internal, "Internal handler error", exc);
    }
}
```

## Problem

The internal behaviour is not the weak point. This is reasonably thoughtful.

The weak point is that application developers are still likely to throw ordinary exceptions and hope the SDK does the right thing. With Nexus, that is dangerous because error retryability is part of the endpoint safety model. The docs explicitly say the circuit breaker trips after 5 consecutive retryable errors and blocks all operations from the caller to that endpoint.

Docs: [feature guide lines 186-193](https://docs.temporal.io/develop/dotnet/nexus/feature-guide)

```text
Handlers should be reliable since the circuit breaker trips after 5 consecutive
retryable errors, blocking all Operations from the caller to that Endpoint.
```

A validation error, duplicate request, failed precondition, permission issue, and transient infrastructure issue should not all look like "throw exception".

## Ideally

Add a public, obvious, boring error API.

```csharp
throw NexusError.InvalidArgument(
    code: "customer-number-required",
    message: "CustomerNumber is required.");

throw NexusError.FailedPrecondition(
    code: "offer-already-signed",
    message: "The offer has already been signed.");

throw NexusError.PermissionDenied(
    code: "namespace-not-authorized",
    message: "The caller namespace is not allowed to use this operation.");

throw NexusError.RetryableUnavailable(
    code: "dnb-temporary-failure",
    message: "D&B is temporarily unavailable.");
```

Or a result-based model:

```csharp
return NexusResult.InvalidArgument<CalculateOfferResponse>(
    "meter-location-required",
    "Market location is required for gas.");
```

I am not saying remove `HandlerException`. I am saying it should not be the first thing application teams have to learn.

---

# Issue 6: sync operation examples are too permissive

## Current implementation

The docs describe sync handlers as a way to expose simple RPC handlers and also say they can use the Temporal client for signalling, querying, listing, and updates.

Docs: [feature guide lines 194-222](https://docs.temporal.io/develop/dotnet/nexus/feature-guide)

```text
The OperationHandler.Sync method is for exposing simple RPC handlers.
Use NexusOperationExecutionContext.Current.TemporalClient to get the Temporal Client
for signaling, querying, and listing Workflows.
...
All calls must complete within the Nexus request timeout.
Updates should be short-lived to stay within this deadline.
```

The sample sync operation is simple and safe enough.

Source: [samples-dotnet HelloService.cs lines 12-20](https://github.com/temporalio/samples-dotnet/blob/main/src/NexusSimple/Handler/HelloService.cs#L12-L20)

```csharp
[NexusOperationHandler]
public IOperationHandler<IHelloService.EchoInput, IHelloService.EchoOutput> Echo() =>
    // This Nexus service operation is a simple sync handler
    OperationHandler.Sync<IHelloService.EchoInput, IHelloService.EchoOutput>(
        (ctx, input) => new(input.Message));
```

## Problem

The sample is fine. The guidance is the risk.

A sync Nexus operation is not just "a method call". It is a cross-boundary operation with request timeout and circuit breaker consequences. If teams use sync handlers for business work, they will eventually create timeout, retry, and circuit breaker problems.

The docs do warn about reliability and request timeout. I would still make the golden path more strict.

For real enterprise use, sync Nexus operations should be treated as control-plane operations:

- query something small;
- signal something;
- perform a short update;
- return small state;
- avoid starting meaningful business work unless it is an async operation backed by a workflow.

## Ideally

Make the API naming and samples less casual.

```csharp
[NexusOperationHandler]
public ISyncNexusOperationHandler<EchoRequest, EchoResponse> Echo() =>
    NexusOperation.ShortRpc<EchoRequest, EchoResponse>(
        maxExpectedDuration: TimeSpan.FromSeconds(1),
        handler: (context, request) => new EchoResponse(request.Message));
```

And make workflow-backed async operations the default sample:

```csharp
[NexusOperationHandler]
public IWorkflowBackedNexusOperation<CalculateOfferRequest, CalculateOfferResponse> CalculateOffer() =>
    NexusOperation.WorkflowBacked<CalculateOfferWorkflow, CalculateOfferRequest, CalculateOfferResponse>(
        (context, request) => wf => wf.RunAsync(request),
        id: request.OperationId);
```

Also add an analyzer warning if a sync handler calls the Temporal client without an explicit timeout policy.

```text
TNX020: Synchronous Nexus operation uses TemporalClient.
Ensure the operation is bounded by the Nexus request timeout.
Prefer a workflow-backed async operation for business work.
```

---

# Issue 7: Nexus handler registration is not DI-first yet

## Current implementation

The core worker options expose a list of Nexus service instances and `AddNexusService(object serviceHandler)`.

Source: [TemporalWorkerOptions.cs lines 1439-1448](https://github.com/temporalio/sdk-dotnet/blob/main/src/Temporalio/Worker/TemporalWorkerOptions.cs#L1439-L1448)

```csharp
/// <summary>
/// Gets the Nexus service instances. Most users will use AddNexusService to add to this
/// list.
/// </summary>
/// <remarks>WARNING: Nexus support is experimental.</remarks>
public IList<ServiceHandlerInstance> NexusServices => nexusServices;
```

Source: [TemporalWorkerOptions.cs lines 2034-2049](https://github.com/temporalio/sdk-dotnet/blob/main/src/Temporalio/Worker/TemporalWorkerOptions.cs#L2034-L2049)

```csharp
/// <summary>
/// Add the given Nexus service handler.
/// </summary>
/// <param name="serviceHandler">Service handler to add. It is expected to be an instance of
/// a class with a <see cref="NexusServiceHandlerAttribute"/> attribute.</param>
/// <returns>This options instance for chaining.</returns>
/// <remarks>WARNING: Nexus support is experimental.</remarks>
public TemporalWorkerOptions AddNexusService(object serviceHandler)
{
    NexusServices.Add(ServiceHandlerInstance.FromInstance(serviceHandler));
    return this;
}
```

There is already a sample request asking for a Nexus hosted worker sample analogous to the dependency injection sample.

Source: [samples-dotnet issue #118](https://github.com/temporalio/samples-dotnet/issues/118)

## Problem

This is not a fatal API problem. The .NET SDK already has `Temporalio.Extensions.Hosting`, and DI support exists for clients, workers, and activities.

The Nexus gap is that the examples still teach manual object construction:

```csharp
.AddNexusService(new SayHelloNexusServiceHandler())
```

That is not the .NET hosting model most teams will use in production.

Nexus handlers are exactly where DI matters. They need loggers, mappers, policy services, authorization helpers, maybe typed options, and sometimes a carefully controlled Temporal client.

## Ideally

Make Nexus handler registration first-class in the hosting extension.

```csharp
builder.Services
    .AddHostedTemporalWorker("temporal:7233", "handler-namespace", "hello-handler-task-queue")
    .AddWorkflow<HelloHandlerWorkflow>()
    .AddNexusService<HelloServiceHandler>();
```

Then support normal constructor injection for handler dependencies:

```csharp
[NexusServiceHandler(typeof(IHelloService))]
public sealed class HelloServiceHandler(
    ILogger<HelloServiceHandler> logger,
    ICallerAuthorizationPolicy authorization,
    ICorrelationContextMapper correlationMapper)
{
    // Nexus operation handlers here.
}
```

If handler instances must be singleton-like for safety, document that explicitly and provide scoped execution hooks in the Nexus operation context.

---

# Issue 8: the one-argument contract rule is currently enforced at runtime

## Current implementation

The typed workflow client extracts a method call and checks that there is no more than one argument.

Source: [NexusWorkflowClient.cs lines 142-158](https://github.com/temporalio/sdk-dotnet/blob/main/src/Temporalio/Workflows/NexusWorkflowClient.cs#L142-L158)

```csharp
public Task<NexusWorkflowOperationHandle> StartNexusOperationAsync(
    Expression<Action<TService>> operationStartCall,
    NexusWorkflowOperationOptions? options = null)
{
    var (method, args) = ExpressionUtil.ExtractCall(operationStartCall);
    ...
    // Must only be a single arg
    if (args.Count > 1)
    {
        throw new ArgumentException("Can only have 0 or 1 Nexus argument");
    }
    return StartNexusOperationAsync(opDefn.Name, args.SingleOrDefault(), options);
}
```

The result-returning overload does the same.

Source: [NexusWorkflowClient.cs lines 168-184](https://github.com/temporalio/sdk-dotnet/blob/main/src/Temporalio/Workflows/NexusWorkflowClient.cs#L168-L184)

```csharp
public Task<NexusWorkflowOperationHandle<TResult>> StartNexusOperationAsync<TResult>(
    Expression<Func<TService, TResult>> operationStartCall,
    NexusWorkflowOperationOptions? options = null)
{
    var (method, args) = ExpressionUtil.ExtractCall(operationStartCall);
    ...
    // Must only be a single arg
    if (args.Count > 1)
    {
        throw new ArgumentException("Can only have 0 or 1 Nexus argument");
    }
    return StartNexusOperationAsync<TResult>(opDefn.Name, args.SingleOrDefault(), options);
}
```

Docs also say Nexus operations can only take one input parameter.

Docs: [feature guide lines 296-299](https://docs.temporal.io/develop/dotnet/nexus/feature-guide)

```text
A Nexus Operation can only take one input parameter.
```

## Problem

This should not be discovered at runtime.

For contract-first work, especially with multiple teams, the SDK should catch bad contracts at build time. The same applies to return types, missing attributes, handler/operation mismatches, bad names, and ambiguous overloads.

Runtime validation is necessary. It is not enough.

## Ideally

Ship analyzers.

```csharp
[NexusService]
public interface IOfferCalculationService
{
    // TNX001: Nexus operation methods must have zero or one input parameter.
    [NexusOperation]
    OfferResponse CalculateOffer(string offerId, string customerNumber);
}
```

The corrected code should be obvious:

```csharp
[NexusService]
public interface IOfferCalculationService
{
    [NexusOperation("calculate-offer")]
    Task<CalculateOfferResponse> CalculateOfferAsync(CalculateOfferRequest request);
}

public sealed record CalculateOfferRequest(
    string OperationId,
    string OfferId,
    string CustomerNumber);
```

Useful diagnostics would include:

```text
TNX001: Nexus operation must have zero or one input parameter.
TNX002: Use a request DTO for public Nexus operation inputs.
TNX003: Nexus operation name should be explicit for public contracts.
TNX004: Handler method does not match a service operation.
TNX005: Workflow-backed Nexus operation should set a workflow ID.
TNX006: Endpoint name should not be declared on a shared contract interface.
```

This is exactly the kind of thing source generators and analyzers are good at.

---

# Issue 9: timeout options are technically correct, but too raw for most users

## Current implementation

The options expose the Temporal-native timeout names.

Source: [NexusWorkflowOperationOptions.cs lines 12-38](https://github.com/temporalio/sdk-dotnet/blob/main/src/Temporalio/Workflows/NexusWorkflowOperationOptions.cs#L12-L38)

```csharp
public class NexusWorkflowOperationOptions : ICloneable
{
    public TimeSpan? ScheduleToCloseTimeout { get; set; }

    public TimeSpan? ScheduleToStartTimeout { get; set; }

    public TimeSpan? StartToCloseTimeout { get; set; }
```

The docs explain the three timeouts.

Docs: [feature guide lines 428-454](https://docs.temporal.io/develop/dotnet/nexus/feature-guide)

```text
Schedule-to-Close timeout limits the total duration...
Schedule-to-Start timeout limits how long the caller will wait...
Start-to-Close timeout limits how long the caller will wait for an asynchronous Operation...
```

## Problem

The names are consistent with Temporal. They are not beginner-friendly.

This is not just a naming problem. Bad timeout choices will create operational pain. A developer can easily set one of these while misunderstanding which phase it applies to.

I would not remove the Temporal-native names. But I would not leave users with only those names.

## Ideally

Add named presets or clearer factory methods.

```csharp
await client.ExecuteNexusOperationAsync(
    svc => svc.CalculateOfferAsync(request),
    NexusWorkflowOperationOptions.WorkflowBacked(
        totalTimeout: TimeSpan.FromHours(2),
        handlerStartTimeout: TimeSpan.FromMinutes(2),
        executionTimeout: TimeSpan.FromHours(1)));
```

Or:

```csharp
new NexusWorkflowOperationOptions
{
    TotalOperationTimeout = TimeSpan.FromHours(2),
    HandlerStartTimeout = TimeSpan.FromMinutes(2),
    AsyncCompletionTimeout = TimeSpan.FromHours(1),

    // Temporal-native aliases remain available for advanced users.
};
```

If aliases are too messy, then at least add named helper methods:

```csharp
NexusTimeouts.ShortRpc()
NexusTimeouts.WorkflowBacked(TimeSpan.FromHours(1))
NexusTimeouts.StartAndTrack(TimeSpan.FromMinutes(5))
```

This gives teams a safer path without hiding the real Temporal concepts.

---

# Issue 10: cancellation is implemented, but the API still blurs technical and business cancellation

## Current implementation

The workflow options expose `CancellationType`.

Source: [NexusWorkflowOperationOptions.cs lines 45-58](https://github.com/temporalio/sdk-dotnet/blob/main/src/Temporalio/Workflows/NexusWorkflowOperationOptions.cs#L45-L58)

```csharp
/// <summary>
/// Gets or sets how the workflow will send/wait for cancellation of the Nexus operation.
/// Default is <see cref="NexusOperationCancellationType.WaitCancellationCompleted" />.
/// </summary>
public NexusOperationCancellationType CancellationType { get; set; } =
    NexusOperationCancellationType.WaitCancellationCompleted;

/// <summary>
/// Gets or sets the cancellation token. If unset, defaults to the workflow cancellation
/// token.
/// </summary>
public CancellationToken? CancellationToken { get; set; }

// TODO(cretz): Cancellation type - https://github.com/temporalio/sdk-dotnet/issues/514
```

The workflow-backed operation handler parses the operation token, checks namespace, and cancels the backing workflow.

Source: [WorkflowRunOperationHandler.cs lines 96-112](https://github.com/temporalio/sdk-dotnet/blob/main/src/Temporalio/Nexus/WorkflowRunOperationHandler.cs#L96-L112)

```csharp
public Task CancelAsync(OperationCancelContext context)
{
    NexusWorkflowRunHandle handle;
    try
    {
        handle = NexusWorkflowRunHandle.FromToken(context.OperationToken);
    }
    catch (ArgumentException e)
    {
        throw new HandlerException(HandlerErrorType.BadRequest, e.Message);
    }
    if (handle.Namespace != NexusOperationExecutionContext.Current.Info.Namespace)
    {
        throw new HandlerException(HandlerErrorType.BadRequest, "Invalid namespace");
    }
    return NexusOperationExecutionContext.Current.TemporalClient.
        GetWorkflowHandle(handle.WorkflowId).CancelAsync();
}
```

Docs are honest that only async operations can be cancelled and the backing resource may ignore cancellation.

Docs: [feature guide lines 557-567](https://docs.temporal.io/develop/dotnet/nexus/feature-guide)

```text
Only asynchronous operations can be canceled in Nexus...
The Workflow or other resources backing the operation may choose to ignore the cancellation request.
...
Once the caller Workflow completes, the caller's Nexus Machinery will not make any further attempts
to cancel operations that are still running.
```

## Problem

The implementation is not the problem. The semantics are the problem.

For business workflows, "cancel the Temporal workflow" is not automatically the same as "cancel the business process". In an offer flow, for example, cancellation might mean withdraw an offer, release a price lock, notify a broker, reverse a reservation, or mark the attempt as abandoned. That is domain logic, not just a cancellation token.

If the API only exposes cancellation as a technical option, developers may believe they have solved business cancellation when they have only requested workflow cancellation.

## Ideally

Make the technical nature clearer in the naming and docs.

```csharp
new NexusWorkflowOperationOptions
{
    TechnicalCancellation = NexusTechnicalCancellation.RequestAndWaitForWorkflowCancellation,
}
```

Then encourage explicit domain cancellation where correctness matters:

```csharp
await offerService.ExecuteNexusOperationAsync(
    svc => svc.RequestOfferCancellationAsync(
        new CancelOfferRequest(
            OfferId: offerId,
            RequestedBy: Workflow.Info.WorkflowId,
            Reason: "Caller workflow cancelled")));
```

Or provide an optional hook for workflow-backed operations:

```csharp
[NexusWorkflowBackedOperation]
public Task<NexusWorkflowRun<CalculateOfferResponse>> CalculateOfferAsync(
    CalculateOfferRequest request,
    NexusOperationContext context)
{
    return context.StartWorkflowAsync<CalculateOfferWorkflow, CalculateOfferResponse>(
        wf => wf.RunAsync(request),
        new NexusWorkflowStartOptions
        {
            Id = request.OperationId,
            OnCancel = NexusCancel.WithSignal<CalculateOfferWorkflow>(
                wf => wf.CancelAsync(new CancelOfferRequest(request.OperationId)))
        });
}
```

The key point is not the exact API. The key point is to stop letting technical cancellation masquerade as business cancellation.

---

# Issue 11: payload conversion is carefully handled, but it needs contract testing and clearer guidance

## Current implementation

The serializer treats `NoValue` as null, then delegates to the configured data converter.

Source: [NexusPayloadSerializer.cs lines 30-39](https://github.com/temporalio/sdk-dotnet/blob/main/src/Temporalio/Worker/NexusPayloadSerializer.cs#L30-L39)

```csharp
public async Task<ISerializer.Content> SerializeAsync(object? value)
{
    // Treat NoValue as null
    if (value is NoValue)
    {
        value = null;
    }
    var payload = await dataConverter.ToPayloadAsync(value).ConfigureAwait(false);
    return new(payload.ToByteArray());
}
```

Deserialization explicitly routes payloads through codec and converter, with different retry behaviour for codec failures and converter failures.

Source: [NexusPayloadSerializer.cs lines 55-105](https://github.com/temporalio/sdk-dotnet/blob/main/src/Temporalio/Worker/NexusPayloadSerializer.cs#L55-L105)

```csharp
var payload = Payload.Parser.ParseFrom(content.Data);

// Decode with payload codec if configured. Codec failures are treated as
// retryable INTERNAL errors since they are typically transient...
if (dataConverter.PayloadCodec != null)
{
    ...
}

// Convert with payload converter. Converter failures are non-retryable
// BAD_REQUEST errors since the payload data doesn't match the expected type/format
...
```

The workflow scheduling path still has a TODO for Nexus serialization context.

Source: [WorkflowInstance.cs lines 2584-2593](https://github.com/temporalio/sdk-dotnet/blob/main/src/Temporalio/Worker/WorkflowInstance.cs#L2584-L2593)

```csharp
// TODO(cretz): Support Nexus serialization context
var payloadConverter = instance.payloadConverterNoContext;

var seq = ++instance.nexusOperationCounter;
var cmd = new ScheduleNexusOperation()
{
    Seq = seq,
    Endpoint = input.ClientOptions.Endpoint,
    Service = input.Service,
    Operation = input.OperationName,
    Input = payloadConverter.ToPayload(input.Arg),
```

There was also a recent closed issue around asymmetric payload conversion for no-input Nexus operations with payload codecs.

Source: [sdk-dotnet issue #677](https://github.com/temporalio/sdk-dotnet/issues/677)

## Problem

This is not a "bad implementation" issue. Quite the opposite. The source shows that this area has already bitten people and the SDK team has put thought into it.

That is the point. Nexus contracts cross namespace and often cross team. Serialization, codecs, encryption, null, `NoValue`, failure conversion, and versioning all become part of the contract. If teams only find codec mismatch problems after deployment, Nexus will feel fragile even when the underlying machinery is doing the right thing.

## Ideally

Add first-class contract testing helpers.

```csharp
await NexusContractAssert.For<IHelloService>()
    .WithDataConverter(myProductionDataConverter)
    .Operation(svc => svc.SayHello(default!))
    .RoundTrips(
        new HelloRequest("Rebecca"),
        new HelloResponse("Hello Rebecca"));
```

Also add explicit tests for no-argument operations:

```csharp
await NexusContractAssert.For<IMaintenanceService>()
    .WithDataConverter(myProductionDataConverter)
    .Operation(svc => svc.Ping())
    .RoundTripsNoValue();
```

And make serialization context explicit before GA if possible:

```csharp
new NexusWorkflowOperationOptions
{
    SerializationContext = NexusSerializationContext.ForService<IHelloService>()
}
```

If that shape is too much, then at least document it as a preview limitation and add analyzer guidance around `NoValue`, null payloads, and codecs.

---

# Issue 12: observability exists at the history/link level, but needs product-level hooks

## Current implementation

The start helper carries inbound links into workflow options and adds an outbound workflow-event link back to the Nexus context.

Source: [NexusWorkflowStartHelper.cs lines 63-76](https://github.com/temporalio/sdk-dotnet/blob/main/src/Temporalio/Nexus/NexusWorkflowStartHelper.cs#L63-L76)

Preview branch reference: [`nexus-api-gen-signal-with-start` NexusWorkflowStartHelper.cs](https://github.com/temporalio/sdk-dotnet/blob/nexus-api-gen-signal-with-start/src/Temporalio/Nexus/NexusWorkflowStartHelper.cs)

```csharp
if (nexusStartContext.InboundLinks.Count > 0)
{
    options.Links = nexusStartContext.InboundLinks.Select(link =>
    {
        try
        {
            return link.ToWorkflowEvent();
        }
        catch (ArgumentException e)
        {
            temporalContext.Logger.LogWarning(e, "Invalid Nexus link: {Url}", link.Uri);
            return null;
        }
    }).OfType<Link>().ToList();
}
```

Source: [NexusWorkflowStartHelper.cs lines 111-119](https://github.com/temporalio/sdk-dotnet/blob/main/src/Temporalio/Nexus/NexusWorkflowStartHelper.cs#L111-L119)

```csharp
nexusStartContext.OutboundLinks.Add(new Link.Types.WorkflowEvent
{
    Namespace = namespace_,
    WorkflowId = workflowId,
    RunId = wfHandle.FirstExecutionRunId ??
        throw new InvalidOperationException("Handle unexpectedly missing run ID"),
    EventRef = new() { EventId = 1, EventType = EventType.WorkflowExecutionStarted },
}.ToNexusLink());
```

The worker also attaches response links to sync and async operation responses.

Source: [NexusWorker.cs lines 231-263](https://github.com/temporalio/sdk-dotnet/blob/main/src/Temporalio/Worker/NexusWorker.cs#L231-L263)

```csharp
// Drain any response links captured from outbound RPCs the handler issued...
var responseLinks = executionContext.ResponseLinks.Select(l =>
{
    ...
}).OfType<NexusLink>();

var links = context.OutboundLinks
    .Concat(responseLinks)
    .Select(l => new Api.Nexus.V1.Link() { Type = l.Type, Url = l.Uri.ToString(), });

if (result.AsyncOperationToken is { } asyncOperationToken)
{
    return new()
    {
        AsyncSuccess = new()
        {
            OperationToken = asyncOperationToken,
            Links = { links },
        },
    };
}
```

This is important and worth stating clearly: these are Temporal **workflow-event links**, not OpenTelemetry parent/span context propagation.

Docs also show Nexus events in caller workflow history.

Docs: [feature guide lines 628-663](https://docs.temporal.io/develop/dotnet/nexus/feature-guide)

```text
A synchronous Nexus Operation will surface in the caller Workflow...
An asynchronous Nexus Operation will surface...
Nexus events are included in the caller's Event history...
```

## Problem

This is a good foundation. It is still too low-level for cross-team operations.

The practical effect is visible in real telemetry: cross-namespace Nexus activity often appears as separate trace IDs, with correlation through workflow identifiers and Nexus links rather than direct parent/span links. That behavior is consistent with the source.

A production platform needs to answer these questions quickly:

- Which workflows call this endpoint?
- Which namespace owns the handler?
- Which operations are failing?
- Which caller namespace is causing circuit breaker pressure?
- What is the retry profile?
- What is the contract version?
- Which business operation ID links caller and handler?
- Which backing workflow is still running after the caller exited?

Workflow history and links are necessary. They are not enough.

There is also a concrete branch-level gap in `nexus-api-gen-signal-with-start`: the plain `StartWorkflowExecutionAsync` client path currently does not capture `StartWorkflowExecutionResponse.Link`, while signal/signal-with-start paths do. That weakens link continuity in the one path where teams expect consistent backlink behavior.

Source: [`TemporalClient.Workflow.cs` on `nexus-api-gen-signal-with-start`](https://github.com/temporalio/sdk-dotnet/blob/nexus-api-gen-signal-with-start/src/Temporalio/Client/TemporalClient.Workflow.cs)

## Ideally

Add first-class metrics and trace dimensions for Nexus.

```csharp
builder.Services.AddTemporalNexusObservability(options =>
{
    options.TagEndpoint = true;
    options.TagService = true;
    options.TagOperation = true;
    options.TagCallerNamespace = true;
    options.TagHandlerNamespace = true;
    options.TagContractVersion = true;
    options.TagOperationId = true;
});
```

And expose a minimal metadata API on contracts:

```csharp
[NexusService(
    Name = "offer-calculation",
    Version = "v1",
    Owner = "b2b-pricing",
    Domain = "energy-sales")]
public interface IOfferCalculationService
{
    [NexusOperation("calculate-offer")]
    Task<CalculateOfferResponse> CalculateOfferAsync(CalculateOfferRequest request);
}
```

This metadata should be available to telemetry, documentation generation, and contract export.

---

# Issue 13: contract versioning is not visible enough

## Current implementation

The typed client uses the Nexus service definition and method metadata to find the operation name.

Source: [NexusWorkflowClient.cs lines 88-99](https://github.com/temporalio/sdk-dotnet/blob/main/src/Temporalio/Workflows/NexusWorkflowClient.cs#L88-L99)

```csharp
public abstract class NexusWorkflowClient<TService> : NexusWorkflowClient
{
    /// <summary>
    /// Gets the service name.
    /// </summary>
    public override string Service => ServiceDefinition.Name;

    /// <summary>
    /// Gets the service definition.
    /// </summary>
    public abstract ServiceDefinition ServiceDefinition { get; }
```

Then it resolves the operation from method info.

Source: [NexusWorkflowClient.cs lines 172-184](https://github.com/temporalio/sdk-dotnet/blob/main/src/Temporalio/Workflows/NexusWorkflowClient.cs#L172-L184)

```csharp
var (method, args) = ExpressionUtil.ExtractCall(operationStartCall);
// Find name from method
var opDefn = ServiceDefinition.Operations.Values.FirstOrDefault(v => v.MethodInfo == method);
if (opDefn == null)
{
    throw new ArgumentException($"Method {method} not marked as a Nexus service operation");
}
...
return StartNexusOperationAsync<TResult>(opDefn.Name, args.SingleOrDefault(), options);
```

## Problem

This is good for type safety. It is not enough for long-lived contracts.

Nexus is a cross-team service boundary. That means service names, operation names, request and response schemas, and error codes need versioning discipline.

If the default model encourages C# method names to become operation names, teams will eventually break each other with ordinary refactors. Maybe the underlying NexusRpc attributes already allow explicit naming. If so, the .NET docs should push that pattern hard.

## Ideally

The public samples should use explicit operation names and versioned request/response records.

```csharp
[NexusService(Name = "offer-calculation.v1")]
public interface IOfferCalculationServiceV1
{
    [NexusOperation("calculate-offer")]
    Task<CalculateOfferResponseV1> CalculateOfferAsync(CalculateOfferRequestV1 request);
}

public sealed record CalculateOfferRequestV1(
    string OperationId,
    string OfferId,
    string CustomerNumber,
    IReadOnlyList<MeterRequestV1> Meters);

public sealed record CalculateOfferResponseV1(
    string OperationId,
    string OfferId,
    OfferCalculationStatus Status);
```

And ideally the SDK should be able to export this:

```bash
dotnet temporal nexus export-contract \
  --assembly B2B.OfferCalculation.Contracts.dll \
  --service offer-calculation.v1 \
  --output offer-calculation.nexus.json
```

This is not just documentation. It is governance. Nexus needs the same level of contract seriousness that teams expect from OpenAPI, AsyncAPI, or gRPC.

---

# Issue 14: the operation token is correctly opaque, but the public API should keep it that way

## Current implementation

A workflow-backed operation turns the backing workflow handle into an async Nexus operation token.

Source: [WorkflowRunOperationHandler.cs lines 88-92](https://github.com/temporalio/sdk-dotnet/blob/main/src/Temporalio/Nexus/WorkflowRunOperationHandler.cs#L88-L92)

```csharp
public async Task<OperationStartResult<TResult>> StartAsync(
    OperationStartContext context, TInput input)
{
    var handle = await handleFactory(new(context), input).ConfigureAwait(false);
    return OperationStartResult.AsyncResult<TResult>(handle.ToToken());
}
```

The start helper also injects the operation token into callback headers when needed.

Source: [NexusWorkflowStartHelper.cs lines 78-103](https://github.com/temporalio/sdk-dotnet/blob/main/src/Temporalio/Nexus/NexusWorkflowStartHelper.cs#L78-L103)

```csharp
if (nexusStartContext.CallbackUrl is { } callbackUrl)
{
    var callback = new Callback() { Nexus = new() { Url = callbackUrl } };
    var callbackHeadersHasToken = false;
    ...
    if (!callbackHeadersHasToken)
    {
        callback.Nexus.Header[NexusOperationTokenHeader] = token;
    }
    ...
    options.CompletionCallbacks = new[] { callback };
}
```

## Problem

This is not a bad implementation. The operation token should be internal Nexus machinery.

The danger is documentation and samples accidentally encouraging users to think about operation tokens as business identifiers. They are not. They are protocol state.

Teams need a separate business operation ID. That ID should drive idempotency, audit, support, and correlation.

## Ideally

Samples should always show a business ID and never imply the operation token is a business handle.

```csharp
public sealed record CalculateOfferRequest(
    string OperationId,
    string OfferId,
    string CustomerNumber);

return context.StartWorkflowAsync<CalculateOfferWorkflow, CalculateOfferResponse>(
    wf => wf.RunAsync(request),
    new NexusWorkflowStartOptions
    {
        Id = request.OperationId,
    });
```

And the docs should say plainly:

```text
The Nexus operation token is opaque SDK/protocol state. Do not store it as your
business operation ID. Put a business idempotency key in your request and use it
as the backing workflow ID where appropriate.
```

The sample already comments that workflow IDs should usually be business meaningful. That is good. I would make it consistent across all Nexus samples.

---

# Suggested final API direction

This is the kind of API I would like to see before GA.

```csharp
[NexusService(Name = "offer-calculation.v1")]
public interface IOfferCalculationServiceV1
{
    [NexusOperation("calculate-offer")]
    Task<CalculateOfferResponseV1> CalculateOfferAsync(CalculateOfferRequestV1 request);

    [NexusOperation("cancel-offer-calculation")]
    Task<CancelOfferCalculationResponseV1> CancelCalculationAsync(
        CancelOfferCalculationRequestV1 request);
}
```

```csharp
[NexusServiceHandler(typeof(IOfferCalculationServiceV1))]
public sealed class OfferCalculationNexusHandler(
    ILogger<OfferCalculationNexusHandler> logger,
    ICallerAuthorizationPolicy authorization)
    : NexusServiceHandler<IOfferCalculationServiceV1>
{
    public async Task<NexusWorkflowRun<CalculateOfferResponseV1>> CalculateOfferAsync(
        CalculateOfferRequestV1 request,
        NexusOperationContext context)
    {
        authorization.EnsureAllowed(context.Caller);

        return await context.StartWorkflowAsync<CalculateOfferWorkflow, CalculateOfferResponseV1>(
            wf => wf.RunAsync(request),
            new NexusWorkflowStartOptions
            {
                Id = request.OperationId,
                HeaderPropagation = NexusHeaderPropagation.Copy(
                    "x-correlation-id",
                    "x-causation-id",
                    "x-tenant-id",
                    "traceparent",
                    "baggage"),
                PropagateTelemetryContext = true,
            });
    }
}
```

```csharp
builder.Services
    .AddHostedTemporalWorker(
        targetHost: "temporal:7233",
        @namespace: "pricing-handler",
        taskQueue: "offer-calculation-handler")
    .AddWorkflow<CalculateOfferWorkflow>()
    .AddNexusService<OfferCalculationNexusHandler>();
```

```csharp
var offerCalculation = Workflow.CreateNexusWorkflowClient<IOfferCalculationServiceV1>(
    PlatformNexusEndpoints.OfferCalculationV1);

var result = await offerCalculation.ExecuteNexusOperationAsync(
    svc => svc.CalculateOfferAsync(request),
    NexusWorkflowOperationOptions.WorkflowBacked(
        totalTimeout: TimeSpan.FromHours(2),
        handlerStartTimeout: TimeSpan.FromMinutes(2),
        executionTimeout: TimeSpan.FromHours(1)));
```

This is still Temporal. It is still Nexus. It just reads less like plumbing.

---

# Final judgement

I would not tell Temporal to rethink Nexus. The architecture is sound.

I would tell the .NET SDK team to avoid freezing the current public surface too early.

The internals are doing a lot of the right things. The current public shape is the problem. It is too easy for application teams to copy sample code and end up with hand-rolled conventions for endpoint naming, error handling, context propagation, cancellation, and observability.

Before GA, I would focus on three things:

1. **Make the normal path boring.** A service handler should look like a service handler, not like an operation handler factory.
2. **Make the dangerous parts explicit.** Error retryability, sync deadlines, cancellation semantics, and header propagation should not be tribal knowledge.
3. **Move mistakes to build time.** Nexus is a contract boundary. Use analyzers and source generators so bad contracts do not get discovered after deployment.

That would turn the current preview from "powerful but quite low-level" into something enterprise .NET teams could safely standardise around.
