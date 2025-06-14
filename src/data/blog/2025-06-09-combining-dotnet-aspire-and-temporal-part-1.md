---
id: 10001
title: 'Combining .NET Aspire with Temporal - Part 1'
pubDatetime: 2025-06-09T17:45:00+01:00
author: rebecca
layout: '../layouts/BlogPost.astro'
guid: 'https://rebecca-powell.com/?p=10000'
slug: 2025-06-09-combining-dotnet-aspire-and-temporal-part-1
description: Part 1 of a multi-part blog series on Temporal with .NET Aspire.
featured: true
categories:
  - work
tags:
  - dotnet
  - aspire
  - temporal
  - docker
---

## Building a Distributed Workflow App with .NET Aspire and Temporal
### Part 1: Architecting a Temporal-based Workflow App with .NET Aspire

In this post, I will kick off a multi-part series on building and deploying a resilient, distributed workflow-powered example application using [.NET Aspire](https://learn.microsoft.com/en-us/dotnet/aspire/overview) and [Temporal.io](https://temporal.io/). I will cover local development with Aspire's AppHost and containerized services, move into Kubernetes deployments with autoscaling, and integrate full observability using OpenTelemetry. In part two of this series I'll cover payload and encryption codecs in Temporal and deployments of this entire application to a local k8s cluster.

### Goals

- Set up .NET Aspire
- Orchestrate workflows using Temporal.    
- Build API endpoints that trigger workflows.    
- Run a dedicated worker to execute activities.    
- Observe logs, traces, and metrics via Aspire.    
- Enable smooth local-first development.

---

### Project Structure

```text
TemporalAspireDemo/
├── AppHost/                # Aspire app host
├── Api/                   # Minimal API to trigger workflows
├── Worker/                # Executes workflows and activities
├── Workflows/             # Reusable workflow/activity definitions
├── ServiceDefaults/       # Shared OpenTelemetry config
├── .k8s/                  # Aspirate-generated K8s manifests
```

### Workflow Basics

We’ll use a very simple `SimpleWorkflow`:

```csharp
public class SimpleWorkflow : WorkflowDefinition
{
    [WorkflowRun]
    public async Task RunAsync()
    {
        Console.WriteLine("Running workflow");
        await Task.Delay(1000);
    }
}
```

And an activity:

```csharp
public class Activities
{
    [Activity]
    public string Greet(string name) => $"Hello, {name}!";
}
```

### Shared Configuration via `ServiceDefaults`

Add OpenTelemetry support here to keep things DRY:

```csharp
builder.AddServiceDefaults(
    metrics => metrics.AddMeter("WorkflowMetrics"),
    tracing => tracing.AddSource("Temporal.Client", "Temporal.Workflow", "Temporal.Activity")
);
```

---

### Worker Setup (uses Aspire Worker template)

```csharp
var builder = DistributedApplication.CreateBuilder(args);

builder.AddServiceDefaults(
    metrics => metrics.AddMeter("WorkflowMetrics"),
    tracing => tracing.AddSource("Temporal.Client", "Temporal.Workflow", "Temporal.Activity")
);

builder.Services
    .AddTemporalClient(opts =>
    {
        opts.TargetHost = builder.Configuration.GetConnectionString("temporal");
        opts.Namespace = "default";
        opts.Interceptors = new[] { new TracingInterceptor() };
    })
    .AddHostedTemporalWorker("my-task-queue")
    .AddWorkflow<SimpleWorkflow>()
    .AddScopedActivities<Activities>();

builder.Build().Run();
```

### API Setup

The API exposes a `/workflow/start` endpoint that triggers workflows:

```csharp
app.MapPost("/workflow/start", async (ITemporalClient client) =>
{
    var result = await client.ExecuteWorkflowAsync<SimpleWorkflow, string>(x => x.RunAsync(),
        new WorkflowOptions("my-task-queue")
        {
            Id = $"workflow-{Guid.NewGuid()}"
        });

    return Results.Ok(result);
});
```

### 🧪 Local AppHost Configuration

Use `AddTemporalServerContainer` to add a lightweight Temporal dev server with Aspire:

```csharp
// using Infinity.Aspire.Temporal
var temporal = await builder.AddTemporalServerContainer("temporal", b => b
    .WithPort(7233)
    .WithHttpPort(7234)
    .WithMetricsPort(7235)
    .WithUiPort(8233)
    .WithLogLevel(LogLevel.Info));

temporal.PublishAsConnectionString();

builder.AddProject<Api>("api").WithReference(temporal);
builder.AddProject<Worker>("worker").WithReference(temporal);
```

### Developer Temporal options
Temporal provide a developer CLI but also a [combined container for local development](https://github.com/InfinityFlowApp/aspire-temporal/blob/main/src/InfinityFlow.Aspire.Temporal/TemporalServerContainerBuilderExtensions.cs#L39), which is what we are using here via [an easy to use Aspire AppHost BuGet package](https://github.com/InfinityFlowApp/aspire-temporal). This is more lightweight than running Temporal Server, Temporal UI and Postgres on your local machine. Compared to the CLI which doesn't plug well into the Aspire framework, this is a perfect balance for Aspire led development (git-pull-f5-development) and the separation of concerns for deployment, especially if you already have a Temporal self hosted or cloud instance.

### Gotchas

- **Trimming must be disabled** for Temporal SDK compatibility: `PublishTrimmed` causes issues due to P/Invoke.    
- Default `.dockerignore` and `Dockerfile` templates may omit required files—manually fix paths.    
- Use non-root container user (`USER $APP_UID`) for security.    
- Alpine is not supported by Temporal SDK due to musl/GLIBC incompatibilities.
