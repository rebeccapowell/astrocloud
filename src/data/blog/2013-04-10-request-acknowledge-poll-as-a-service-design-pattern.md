---
id: 1165
title: "Request-Acknowledge-Poll as a service design pattern"
pubDatetime: 2013-04-10T14:40:41+01:00
author: rebecca
layout: "../layouts/BlogPost.astro"
guid: "https://rebecca-powell.com/request-acknowledge-is-a-service-design-pattern/"
slug: 2013-04-10-request-acknowledge-poll-as-a-service-design-pattern
description: An explanation of the Request/Acknowledge service design pattern, including variations like Request/Acknowledge/Poll and Request/Acknowledge/Callback, and their implementation in reducing temporal coupling.
categories:
  - work
tags:
  - asp.net
  - nservicebus
  - MassTransit
  - polling
  - webapi
format: quote
---

> Request/Acknowledge is a service design pattern wherein clients receive an acknowledgement as an immediate response while the original request is processed in the background. The acknowledgement typically contains a token for identifying the background task which can in turn be used to query the processing status of the task. This pattern is employed to reduce temporal coupling which is especially critical for requests requiring long processing times. Instead of having the client wait for the final response, a pull method for querying the status of the task or a push method for notifying the client is implemented. Similarly, the event-based asynchronous pattern in OOP shares the goal of reducing wasted wait time. Request/Acknowledge/Poll is a variation of this pattern wherein a method is provided for the client to query for the status of the task being processed. The other variation is Request/Acknowledge/Callback wherein a client is notified of task status immediately via callback mechanism. The callback variation ensures that the client receives task status information as it is generated but can be a burden to implement because the client must support the callback mechanism. Furthermore, it places the additional burden of tracking and invoking callbacks upon the server. The poll variation is simpler to implement and keeps the client in control of retrieving status information as it is needed.

<cite>http://gorodinski.com/blog/2012/07/13/request-acknowledge-poll-with-nservicebus-and-aspnet-webapi/</cite>

### Example Implementation using ASP.NET and MassTransit

Here is an example implementation of the Request/Acknowledge/Poll pattern using ASP.NET and MassTransit. This example demonstrates an endpoint that accepts JSON data to create an insurance claim, returns a 202 Accepted status with a GUID reference, publishes the data to a queue, processes the data in a worker, and hydrates Redis with the result.

#### ASP.NET Controller

```csharp
using MassTransit;
using Microsoft.AspNetCore.Mvc;
using StackExchange.Redis;
using System;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class InsuranceClaimController : ControllerBase
{
    private readonly IBus _bus;
    private readonly IConnectionMultiplexer _redis;

    public InsuranceClaimController(IBus bus, IConnectionMultiplexer redis)
    {
        _bus = bus;
        _redis = redis;
    }

    [HttpPost]
    public async Task<IActionResult> CreateClaim([FromBody] InsuranceClaim claim)
    {
        if (claim == null)
            return BadRequest("Invalid claim data.");

        var guid = string.IsNullOrEmpty(claim.Guid) ? Guid.NewGuid().ToString() : claim.Guid;
        claim.Guid = guid;

        await _bus.Publish(new ClaimCreated { Guid = guid, Claim = claim });

        return Accepted(new { Guid = guid });
    }

    [HttpGet("{guid}")]
    public async Task<IActionResult> GetClaimStatus(string guid)
    {
        var db = _redis.GetDatabase();
        var result = await db.StringGetAsync(guid);

        if (result.IsNullOrEmpty)
            return NotFound();

        return Ok(result);
    }
}

public class InsuranceClaim
{
    public string Guid { get; set; }
    public string PolicyNumber { get; set; }
    public string ClaimantName { get; set; }
    public string ClaimDetails { get; set; }
}

public class ClaimCreated
{
    public string Guid { get; set; }
    public InsuranceClaim Claim { get; set; }
}
```

#### MassTransit Consumer

```csharp
using MassTransit;
using StackExchange.Redis;
using System.Threading.Tasks;

public class ClaimCreatedConsumer : IConsumer<ClaimCreated>
{
    private readonly IConnectionMultiplexer _redis;

    public ClaimCreatedConsumer(IConnectionMultiplexer redis)
    {
        _redis = redis;
    }

    public async Task Consume(ConsumeContext<ClaimCreated> context)
    {
        var db = _redis.GetDatabase();
        var claim = context.Message.Claim;

        // Simulate claim processing
        var processedData = $"Processed claim for policy: {claim.PolicyNumber}, claimant: {claim.ClaimantName}";

        // Store the result in Redis
        await db.StringSetAsync(context.Message.Guid, processedData);
    }
}
```

## Idempotency and Polling

In this example, idempotency is ensured by allowing the client to pass in the GUID themselves. If the GUID is not provided, the server generates one. The client can poll the status of the claim processing by querying the endpoint with the GUID. If the processing is not yet complete, the endpoint returns a 404 Not Found status. Once the processing is finished, the endpoint returns the processed data with a 200 OK status.

## Downsides of the Request/Acknowledge/Poll Pattern

While the Request/Acknowledge/Poll pattern has its advantages, it also comes with some downsides:

1. **Client Complexity**: Implementing resilient HTTP clients to handle polling can be challenging. Clients need to manage the polling interval, handle potential timeouts, and ensure they do not overwhelm the server with too many requests.
2. **Increased Load on Server**: Polling can lead to increased load on the server, especially if many clients are polling frequently. This can be mitigated by implementing exponential backoff strategies or using a push-based notification system.
3. **Latency**: There is an inherent latency in the polling mechanism. Clients may not receive the status update immediately after the task is completed, depending on the polling interval.
4. **Resource Management**: The server needs to manage and store the state of each task, which can consume resources. Proper resource management and cleanup mechanisms need to be in place to handle this.

Despite these downsides, the Request/Acknowledge/Poll pattern remains a useful approach for handling long-running tasks in a decoupled and scalable manner.

## Alternative Patterns

1. **Request/Response**: In this pattern, the client sends a request and waits for the server to process it and send back a response. This is suitable for short-lived tasks but can lead to blocking and increased latency for long-running tasks.

2. **Request/Callback**: The client sends a request and provides a callback URL. The server processes the request and sends the result to the callback URL once the processing is complete. This reduces the need for polling but requires the client to have an endpoint to receive the callback.

3. **Event-Driven Architecture**: The client sends a request, and the server processes it asynchronously. The server publishes events to a message broker (e.g., RabbitMQ, Kafka), and the client subscribes to these events to receive updates. This pattern is highly scalable and decouples the client and server but requires a robust messaging infrastructure.

4. **WebSockets**: The client establishes a WebSocket connection with the server. The server processes the request and sends updates to the client over the WebSocket connection. This provides real-time updates and reduces the need for polling but requires the client and server to support WebSockets.

5. **Server-Sent Events (SSE)**: The client establishes a one-way connection with the server, and the server sends updates to the client as they become available. This is simpler to implement than WebSockets and provides real-time updates but is limited to one-way communication.

Each of these patterns has its own advantages and trade-offs. The choice of pattern depends on the specific requirements of the application, such as the expected load, latency requirements, and infrastructure constraints.

## Conclusion

This pattern allows the client to remain in control of retrieving status information as needed, reducing temporal coupling and improving the overall efficiency of the system.
