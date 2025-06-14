---
id: 10001
title: 'The Five Waves of Distributed Resilience'
pubDatetime: 2025-06-09T17:45:00+01:00
author: rebecca
layout: '../layouts/BlogPost.astro'
guid: 'https://rebecca-powell.com/?p=10000'
slug: 2025-06-14-the-five-waves-of-distributed-resilience
description: Over the past 30 years, distributed systems have undergone a quiet revolution. From crude polling loops to language-native durable execution engines, the way we build and orchestrate resilient business logic has advanced through a series of distinct technological waves.
featured: true
categories:
  - work
tags:
  - resilience
  - distributed-applications
  - history
  - technology
---

# The Five Waves of Distributed Resilience

_This post is the first in a multi-part series exploring the evolution and future of resilient distributed systems. It serves as a primer on the abstractions that have shaped event-driven and workflow-based architectures over the last three decades. In upcoming posts, we'll shift gears into practical territory — demonstrating how to use [Temporal](https://temporal.io) and [.NET Aspire](https://learn.microsoft.com/en-us/dotnet/aspire/) to build durable workflows in modern, cloud-native applications._


Over the past 30 years, distributed systems have undergone a quiet revolution. From crude polling loops to language-native durable execution engines, the way we build and orchestrate resilient business logic has advanced through a series of distinct technological waves.

Each wave introduced a new level of abstraction. Each promised to make distributed systems simpler, safer, and more scalable. And each came with its own set of trade-offs.

This post charts the five waves of distributed resilience — what drove them, where they fell short, and how we arrived at the current frontier: durable execution as code.

---

## Wave 1: Databases as Queues (1990s–2005)

**Pattern:** Use of RDBMS tables to simulate queues, with polling mechanisms.

**Why it happened:** In the absence of mature messaging infrastructure, relational databases were the only available tool with durability and transactional guarantees.

**How it worked:**
- Application writes “work items” to a table.
- Background workers poll the table for rows.
- Single threaded polling applications 
- Later, workers lock rows (`SELECT FOR UPDATE`) to simulate queue behavior.

**Limitations:**
- Inefficient polling loops.
- Complex concurrency handling.
- No guarantees of message delivery or ordering.
- Poor visibility and control over execution state.

**Key Innovators & Tools:**
- Enterprise architects and operations engineers in Java/.NET ecosystems.
- Patterns formalized in *Enterprise Application Architecture* (Martin Fowler).
- Queue-like behavior via SQL Server, Oracle, PostgreSQL — plus `cron`-based task runners.

---

## Wave 2: Durable Messaging Infrastructure (2005–2013)

**Pattern:** Event-driven messaging using message brokers.

**Why it mattered:** Dedicated infrastructure (e.g., RabbitMQ, Kafka, MSMQ) introduced reliable delivery, pub/sub patterns, and back-pressure.

**What changed:**
- Asynchronous communication became normalized.
- Systems became more loosely coupled.
- Dead-letter queues, retries, and delivery guarantees improved robustness.

**Limitations:**
- Orchestration logic was still ad hoc.
- Complex error handling was scattered across services.
- Developer tooling for tracing and debugging was immature.

**Key Innovators & Tools:**
- **Gregor Hohpe & Bobby Woolf** – *Enterprise Integration Patterns* (2003), formalized message routing, splitting, compensation.
- **Martin Fowler** – Evangelized asynchronous architectures and event sourcing.
- **Jay Kreps** – Co-creator of **Apache Kafka** at LinkedIn.
- **Udi Dahan** – Created **NServiceBus**, a message-driven service bus for .NET.
- **Chris Patterson & Dru Sellers** – Core authors of **MassTransit**, a popular open-source .NET message bus supporting sagas, retries, and transports like RabbitMQ, Azure Service Bus, and more.

---

## Wave 3: Declarative Orchestration (2013–2018)

**Pattern:** Workflows modeled as DAGs or state machines using visual tools or DSLs.

**Examples:** Camunda BPMN, AWS Step Functions, Azure Durable Functions.

**What changed:**
- Orchestration logic was externalized and made visible.
- Some platforms targeted business analysts directly with drag-and-drop editors.

**The promise:**
> Business users could "own" their workflows, and developers would merely implement steps. 

**Why it struggled:**
- BPMN and similar tools required deep technical understanding to use safely.
- Real-world logic (retries, compensations, edge cases) demanded scripting or embedded code.
- Developers disliked losing IDE support, version control, type safety, and testability.
- This was often based on a false expectation of what users actually wanted in the enterprise. What actually happens is that business people turn to the developer to configure their workflows, but now they are forced to use the poor UI driven workflow designers rather than code based which they are much happier working in.
- These could only be tested in integration tests (and often were not)
- There was no source control, no good auditing of changes. Often problematic for situations like ISO 27001 with auditors in enterprises.

**Key Innovators & Tools:**
- **Bernd Rücker & Jakob Freund** – Camunda BPM (Java-based BPMN engine).
- **Chris Gillum & Clemens Vasters** – Azure Durable Functions (event-sourced function chaining).
- **AWS Step Functions** – Serverless workflows with JSON-based state machines.
- Workflow standardization: BPMN 2.0, SCXML.
- Rise of business-process-centric modeling in Java/Spring-based enterprise apps.

---

## Wave 4: Code-Defined DAGs (2018–2020)

**Pattern:** Developers define workflows using code-like syntax, but orchestration still occurs externally.

**Examples:** Netflix Conductor, Dapr Workflows, AWS CDK + Step Functions.

**What changed:**
- Developers regained control using code-based DSLs.
- Improved DevOps integration and testability.
- Workflows became versionable and observable via code.

**Limitations:**
- Execution logic still lives *outside* the codebase.
- Workflow steps are often glue code to invoke other services.
- Developers still manage retries, idempotency, and compensation manually.

**Key Innovators & Tools:**
- **Netflix OSS team** – Conductor (microservice orchestration via JSON-defined workflows).
- **Microsoft Dapr Team** – Dapr Workflows added workflow primitives to event-driven components.
- **AWS CDK + Step Functions** – Code-first interface for declarative DAGs.
- Emergence of serverless orchestration ecosystems, but with DSL boundaries.

---

## Wave 5: Durable Execution as Code (2020–Present)

**Pattern:** Business logic is written *as ordinary code*, with durable state, retries, timeouts, and replays managed by the platform.

**Examples:** Temporal, Cadence.

**What changed:**
- Developers write normal functions and workflows in their own language (Go, Java, .NET).
- Temporal guarantees correctness: if a worker crashes or restarts, the logic picks up *as if nothing happened*.
- No manual retries, timers, state persistence, or distributed transactions required.

**Benefits:**
- Full developer ergonomics: testability, debugging, CI/CD.
- High-level abstraction over all distributed systems concerns.
- Built-in observability: logs, traces, metrics, and state replay.

**Key Innovators & Tools:**
- **Maxim Fateev** – Co-creator of **Amazon Simple Workflow System (SWF)**, later led **Cadence** at Uber, then founded **Temporal.io**.
- **Samar Abbas** – Co-creator of **Cadence** and **Temporal** but also led the creation of Durable Task Framework at Microsoft which powered the Azure Durable Functions.
- **Cadence** (Uber) – First mainstream “workflow as code” engine.
- **Temporal** – OSS durable execution engine with language-native SDKs.
- Ecosystem integrations: OpenTelemetry, KEDA, workflow replay tools.

> Temporal doesn't orchestrate services — it executes *durable logic*, abstracting queues, state, and retries directly into the code layer.

---

## Summary Table

| Wave | Era | Description | Example Tech | Key Contributors |
|------|-----|-------------|--------------|------------------|
| 1 | 1990–2005 | Databases as makeshift queues | SQL + polling | Martin Fowler, early enterprise devs |
| 2 | 2005–2013 | Event-driven with message brokers | RabbitMQ, Kafka, MassTransit, NServiceBus | Gregor Hohpe, Jay Kreps, Udi Dahan, Chris Patterson, Dru Sellers |
| 3 | 2013–2018 | Declarative workflows, BPMN, DSLs | Camunda, Step Functions, Durable Functions | Bernd Rücker, Clemens Vasters, Chris Gillum |
| 4 | 2018–2020 | Code-defined workflows via orchestrators | Netflix Conductor, Dapr Workflows | Netflix OSS, Microsoft Dapr |
| 5 | 2020–Now | Durable execution in native code | Temporal, Cadence | Maxim Fateev, Samar Abbas |

---

## Final Thoughts

Each wave represented a shift in **who owns resilience**:

- **Wave 1**: Operations teams wrote polling jobs.
- **Wave 2**: Developers handled message delivery and retries.
- **Wave 3**: Architects introduced visual orchestrators to bridge business and tech.
- **Wave 4**: Developers regained some control using code-first DSLs.
- **Wave 5**: Developers now own and define *durable distributed logic*, with correctness and recoverability baked into the platform.

Temporal, in particular, emerges not just as a tool — but as a **new mental model** for writing distributed systems. Durable logic is now just... code and that's testable.

What's even more important is that it leaves developers to focus on the business features they need to deliver, and not the underlying resillience patterns of old.

And like all powerful abstractions, once you see it, it’s hard to unsee.

---

*If you're exploring Temporal, Cadence, or building event-driven SaaS systems — let’s talk. I’m actively working with these ideas in production and exploring the real-world implications of the fifth wave.*

_This post is part of a multi-part series on modern durable workflows and distributed systems design. In the next installment, we'll get hands-on with Temporal and .NET Aspire to show how these ideas come to life in real-world applications._

*Stay tuned.*
