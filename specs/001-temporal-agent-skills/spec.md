# Feature Specification: Custom AI Agent Skills for Temporal Workflow Development

**Feature Branch**: `001-temporal-agent-skills`  
**Created**: 2026-01-20  
**Status**: Draft  
**Input**: User description: "Write a new post on using custom agents/skills that have an in-depth knowledge of how to write temporal workflows and use the aspire mcp for monitoring running resources and access to OTEL console logs, plus temporal cli tasks, plus use the temporal docs mcp server as a backstop. It will include code snippets including the full custom agent and skill for working with dotnet and temporal.io .NET SDK"

## Overview

This blog post teaches developers how to build a comprehensive AI coding assistant setup specifically tailored for Temporal workflow development with .NET. The focus is on **development-time investigation and debugging** - helping developers understand running processes, diagnose problems via OTEL telemetry, and manage local workflow state.

The article demonstrates creating custom Copilot agent modes and skills that combine:

1. Temporal documentation knowledge (via MCP server)
2. .NET Aspire resource monitoring (via Aspire MCP)
3. Temporal CLI integration for workflow management
4. OpenTelemetry log access for debugging workflows

The article will include complete, runnable code for the custom agent configuration and skill definitions.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Learning the Core Agent Configuration (Priority: P1)

A .NET developer who works with Temporal wants to set up their VS Code environment with a custom agent that understands Temporal-specific patterns and can access live system state. They read this article to understand how to configure a custom Copilot agent mode that integrates multiple MCP servers.

**Why this priority**: This is the foundational knowledge - without understanding how to configure the agent, readers cannot implement anything else in the article.

**Independent Test**: Reader can copy the provided agent configuration, install it in their VS Code, and verify the agent mode appears in Copilot with access to the MCP servers.

**Acceptance Scenarios**:

1. **Given** a reader with VS Code and GitHub Copilot installed, **When** they follow the agent configuration steps, **Then** they have a working "Temporal Developer" agent mode available in their Copilot chat.
2. **Given** a reader has configured the agent, **When** they ask Copilot about Temporal concepts, **Then** the response includes information retrieved from the Temporal docs MCP server.

---

### User Story 2 - Integrating Aspire MCP for Resource Monitoring (Priority: P2)

A developer debugging a Temporal workflow running under .NET Aspire wants to query container/resource status and access OTEL logs without leaving their editor. They read this section to understand how to configure and use the Aspire MCP server within their custom agent.

**Why this priority**: Live system observability is a key differentiator of this setup - it transforms the agent from documentation lookup to active development assistant.

**Independent Test**: Reader can start an Aspire app host, interact with the agent to query running containers, and receive accurate status information.

**Acceptance Scenarios**:

1. **Given** an Aspire application is running with Temporal resources, **When** the reader asks the agent about running containers, **Then** the agent returns accurate container status from the Aspire MCP.
2. **Given** workflows are executing and emitting OTEL logs, **When** the reader asks the agent for recent workflow logs, **Then** the agent retrieves and summarizes relevant log entries.

---

### User Story 3 - Using Temporal CLI Read-Only Skills (Priority: P3)

A developer needs to inspect Temporal workflows (list, describe, show history, query state) as part of their development workflow. They want the AI agent to execute read-only Temporal CLI commands to understand workflow state without risking data changes.

**Why this priority**: CLI integration for inspection is essential for debugging, but requires understanding of the read-only vs. write distinction.

**Independent Test**: Reader can ask the agent to list running workflows, and the agent executes `temporal workflow list` and returns formatted results.

**Acceptance Scenarios**:

1. **Given** Temporal server is running locally, **When** the reader asks to list workflows, **Then** the agent executes the CLI command and displays workflow summaries.
2. **Given** a workflow is running, **When** the reader asks to describe a specific workflow, **Then** the agent retrieves and presents workflow details including status, history, and pending activities.
3. **Given** a workflow exists, **When** the reader asks to show workflow history, **Then** the agent retrieves the event history for debugging.

---

### User Story 4 - Using Temporal CLI Dangerous/Write Skills (Priority: P4)

A developer during local development needs to clean up old workflows, terminate stuck workflows, or signal workflows. They want a separate skill that can only execute against localhost endpoints (running in Aspire), never against cloud instances.

**Why this priority**: Write operations are powerful but dangerous - splitting into a separate skill with explicit localhost-only restriction is critical for safety.

**Independent Test**: Reader can terminate a stuck workflow on their local Temporal server, but the skill refuses to execute against any non-localhost address.

**Acceptance Scenarios**:

1. **Given** a local Temporal server running in Aspire, **When** the reader asks to terminate a workflow, **Then** the agent executes the terminate command with a confirmation warning.
2. **Given** a developer wants to clean up old workflows, **When** they ask to delete completed workflows, **Then** the agent executes batch delete for the specified query.
3. **Given** an attempt to execute a write command against a cloud endpoint, **When** the agent detects the address is not localhost, **Then** the agent refuses with a clear error explaining the safety restriction.

---

### User Story 5 - Understanding the Complete Skill Definitions (Priority: P5)

A developer wants to understand how the two skills (read-only and dangerous) are structured and potentially extend them. They read the full code listing and explanation to understand the skill architecture.

**Why this priority**: Complete code serves as reference material and enables customization, but requires prior understanding of the components.

**Independent Test**: Reader can read the complete skill definitions, understand the security boundaries, and identify where they would add custom functionality.

**Acceptance Scenarios**:

1. **Given** the reader has understood the prior sections, **When** they review the skill code, **Then** they can identify the MCP server configurations, tool definitions, and localhost restrictions.
2. **Given** the reader wants to add a new CLI command, **When** they reference the skill structure, **Then** they can determine which skill (read-only or dangerous) it belongs in.

---

### Edge Cases

- What happens when the Aspire app host is not running? (Agent should gracefully indicate MCP is unavailable)
- How does the agent handle Temporal CLI commands when Temporal server is unreachable? (Clear error message with troubleshooting suggestions)
- What if the Temporal docs MCP server is rate-limited or down? (Fallback to built-in knowledge with disclaimer)
- What if a dangerous skill command is attempted against a non-localhost address? (Refuse with clear security warning)
- What happens if the Aspire MCP endpoint changes or restarts mid-session? (Use `select_apphost` tool to re-select; mention in Section 6 troubleshooting)

## Clarifications

### Session 2026-01-20

- Q: Which Temporal CLI commands should the agent be able to execute? → A: Split into two separate skills - read-only (list, describe, show, query, count, trace) and dangerous/write (terminate, signal, cancel, delete, reset, start) with the write skill restricted to localhost only.
- Q: Should the article use the existing Temporal docs MCP or build a custom one? → A: Use a **custom .NET-focused skill instruction file** as the primary knowledge source (covering determinism rules, Aspire integration, testing strategies, agent behavior), with the Temporal docs MCP as a backstop for official documentation lookups. The custom skill is language/framework-specific and opinionated; the Temporal docs MCP is broad but authoritative.
- Q: How much of the 18-section custom .NET Temporal skill should be included? → A: Include the **complete 18-section skill** as a full code listing. Readers can copy the entire file as-is for maximum reference value.
- Q: What debugging scenario for the development session walkthrough? → A: **Non-determinism bug** (developer adds `DateTime.Now`, discovers replay failures in OTEL logs, fixes with `Workflow.Now`). Also include a **Temporal-recommended .editorconfig** for workflow files that suppresses false-positive analyzer warnings (CA1024, CA1822, CA2007, CA2008, CA5394, CS1998, VSTHRD105) - place in workflows folder or project root.
- Q: What is the primary use case for these skills during development? → A: **Investigation and debugging**, not routine workflow management. The agent helps developers understand running processes, diagnose problems via OTEL logs/traces, and clean up stuck workflows. Starting/executing workflows is an edge case - developers typically trigger workflows through their application code or tests.
- Q: What qualifies as an "Aspire-managed endpoint" for the dangerous skill localhost restriction? → A: Aspire uses **service discovery** with named endpoints (e.g., `temporal-server`, `_grpc.temporal`). Valid addresses are: `127.0.0.1`, `localhost`, and Aspire service discovery names (which resolve internally during local development). Cloud endpoints like `*.tmprl.cloud` or explicit IP addresses outside localhost range MUST be blocked.

## Requirements *(mandatory)*

### Functional Requirements

**Article Content Requirements**:

- **FR-001**: Article MUST include a working VS Code agent mode configuration (`.github/copilot-agents.json` or equivalent)
- **FR-002**: Article MUST provide complete configuration for: Temporal docs MCP server, Aspire MCP (via `aspire mcp init`), and Temporal CLI skill instruction files (note: CLI integration is via skill files wrapping the `temporal` binary, not a formal MCP server)
- **FR-003**: Article MUST include code snippets that readers can copy and use directly
- **FR-004**: Article MUST explain what each MCP server provides and when to use it
- **FR-005**: Article MUST show real examples of agent interactions with each integrated tool
- **FR-006**: Article MUST follow the constitution's structure: opening context, problem statement, solution walkthrough, complete code, closing with reader engagement

**Technical Accuracy Requirements**:

- **FR-007**: All code snippets MUST be syntactically correct and follow current Copilot/MCP conventions
- **FR-008**: Temporal workflow examples MUST use the official .NET SDK patterns
- **FR-009**: Aspire MCP integration MUST demonstrate container listing and OTEL log access
- **FR-010**: Article MUST include prerequisites section listing required tools and versions

**Skill Architecture Requirements**:

- **FR-011**: Article MUST define TWO separate Temporal CLI skills: read-only and dangerous/write
- **FR-012**: Read-only skill MUST include: `temporal workflow list`, `describe`, `show`, `query`, `stack`, `count`, `trace`, `start`, `execute` (starting workflows creates new executions but does not modify existing data)
- **FR-013**: Dangerous/write skill MUST include: `terminate`, `signal`, `cancel`, `delete`, `reset` (operations that modify or destroy existing workflow state)
- **FR-014**: Dangerous/write skill MUST validate the `--address` flag is localhost (`127.0.0.1`, `localhost`) or an Aspire service discovery name (e.g., `temporal-server`, `_grpc.temporal`). Cloud endpoints (`*.tmprl.cloud`, external IPs) MUST be blocked.
- **FR-015**: Dangerous/write skill MUST refuse execution with clear error if non-localhost address detected
- **FR-016**: Article MUST explain the security rationale for the localhost-only restriction
- **FR-021**: Article MUST include a complete custom .NET Temporal skill instruction file covering determinism rules, Aspire integration, testing strategies, and agent output expectations
- **FR-022**: Article MUST explain the layered approach: custom skill for opinionated .NET patterns, Temporal docs MCP for authoritative documentation backstop
- **FR-023**: Custom skill MUST include sections on: Mental Model, Determinism Rules, Workflow/Activity/Signal/Query Structure, Aspire Integration, Testing, Observability, Versioning, and Agent Output Expectations
- **FR-024**: Article MUST include the Temporal-recommended .editorconfig for workflow files suppressing false-positive analyzer warnings (CA1024, CA1822, CA2007, CA2008, CA5394, CS1998, VSTHRD105)
- **FR-025**: Article MUST explain .editorconfig placement options (workflows folder for scoped rules vs project root) with recommendation for scoped placement

**Content Structure Requirements**:

- **FR-017**: Article MUST include a header image placeholder for AI generation
- **FR-018**: Article MUST use tables for comparing MCP server capabilities and CLI command categories
- **FR-019**: Article MUST include screenshot placeholders for VS Code agent mode selection and example interactions
- **FR-020**: Article MUST end with a question inviting reader discussion

### Key Entities

- **Agent Mode**: A custom Copilot configuration that defines system prompts, available tools, and MCP server connections
- **MCP Server**: Model Context Protocol server that exposes tools and resources to AI assistants
- **Custom .NET Temporal Skill**: An opinionated, framework-specific instruction file covering determinism rules, Aspire integration, testing strategies, and agent behavior expectations for Temporal .NET development
- **Temporal Docs MCP**: The official Temporal MCP server providing broad documentation search as a backstop (covers all languages, useful for authoritative lookups)
- **Aspire MCP**: The .NET Aspire Dashboard MCP server exposing resource management and observability tools
- **Aspire MCP Tools**: `list_resources`, `list_console_logs`, `execute_resource_command`, `list_structured_logs`, `list_traces`, `list_trace_structured_logs`, `select_apphost`, `list_apphosts`, `doctor`
- **Read-Only Temporal CLI Skill**: Skill wrapping safe CLI commands (list, describe, show, query, count, trace)
- **Dangerous Temporal CLI Skill**: Skill wrapping mutating CLI commands (terminate, signal, cancel, delete, reset, start) with localhost-only restriction
- **Temporal Workflow**: A durable, fault-tolerant function orchestrated by Temporal
- **Aspire App Host**: The .NET Aspire orchestrator that manages distributed application resources

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Reader can configure a working Temporal-aware agent mode within 15 minutes of reading the article
- **SC-002**: Reader can successfully query Temporal documentation through the agent after following the setup
- **SC-003**: Reader can view Aspire container status through the agent when running an Aspire application
- **SC-004**: Reader can execute Temporal CLI commands through the agent with correct output formatting
- **SC-005**: Article receives engagement (comments, shares) indicating practical value to readers
- **SC-006**: Code snippets are complete enough that no external references are required to implement

## Article Outline

### Proposed Structure

1. **Introduction** (200-300 words)
   - The evolution from rubber duck debugging to "robotic rubber ducks"
   - Why Temporal workflows need specialized AI assistance
   - What we're building: a multi-MCP agent with read-only and dangerous skills

2. **Prerequisites** (100 words)
   - VS Code with GitHub Copilot
   - .NET 8+ and Aspire workload
   - Temporal CLI installed
   - Node.js for MCP servers

3. **Understanding MCP and Agent Modes** (300-400 words)
   - What MCP servers provide
   - How agent modes and custom skills customize Copilot behavior
   - Table comparing the components we'll integrate:
     | Component | Type | Purpose |
     |-----------|------|-------|
     | Custom .NET Temporal Skill | Instruction File | Opinionated .NET patterns, determinism rules, Aspire integration, testing |
     | Temporal Docs MCP | MCP Server | Authoritative documentation backstop (all languages) |
     | Aspire Dashboard MCP | MCP Server | Resource & OTEL observability |
     | Read-Only CLI Skill | Skill Definition | Wrapper for `temporal workflow list/describe/show/query` |
     | Dangerous CLI Skill | Skill Definition | Wrapper for `temporal workflow terminate/signal/delete` (localhost only) |

4. **Creating the Custom .NET Temporal Skill** (600-700 words)
   - Why a custom skill beats generic documentation (language-specific, opinionated, enforces patterns)
   - The 18-section skill structure (Mental Model, Determinism Rules, Workflow/Activity Structure, etc.)
   - Key sections: Non-negotiable determinism, Aspire integration, Testing differences, Agent output expectations
   - **Temporal-recommended .editorconfig** for workflow files (suppress CA1024, CA1822, CA2007, CA2008, CA5394, CS1998, VSTHRD105)
   - Placement guidance: workflows folder vs project root
   - Complete code listing of the skill instruction file
   - ![Code: Custom .NET Temporal Skill sections](placeholder)

5. **Configuring the Temporal Docs MCP as Backstop** (300-400 words)
   - When to use the official MCP vs custom skill
   - Installation and configuration
   - Example queries leveraging both sources
   - ![Screenshot: Agent responding with Temporal documentation](placeholder)

6. **Integrating Aspire MCP for Live Observability** (500-600 words)
   - Setup via `aspire mcp init` (auto-detects VS Code, creates `.vscode/mcp.json`)
   - How Aspire MCP exposes container and log data
   - Available tools: `list_resources`, `list_console_logs`, `list_structured_logs`, `list_traces`, `list_trace_structured_logs`
   - The three pillars: logging, tracing, metrics via OpenTelemetry
   - OTEL environment variables automatically configured in local development
   - Configuration within the agent mode
   - Example prompts: "Are all my resources running?", "Analyze HTTP request performance"
   - ![Screenshot: Agent showing Aspire resource status and logs](placeholder)

7. **Building the Read-Only Temporal CLI Skill** (500-600 words)
   - Wrapping safe CLI commands as agent tools
   - Commands included: `list`, `describe`, `show`, `query`, `stack`, `count`, `trace`, `start`, `execute`
   - Why `start`/`execute` are read-only: they create new executions but don't modify existing data
   - Table of commands with descriptions
   - Example interactions

8. **Building the Dangerous Temporal CLI Skill** (600-700 words)
   - Why a separate skill for mutating operations
   - Commands included: `terminate`, `signal`, `cancel`, `delete`, `reset`
   - **Localhost-only restriction implementation**
   - Address validation logic (127.0.0.1, localhost, Aspire-managed endpoints only)
   - Clear error messages for blocked non-local attempts
   - Security rationale and warning messages
   - ![Screenshot: Agent refusing non-localhost dangerous command](placeholder)

9. **The Complete Agent Configuration** (600-800 words)
   - Full JSON/YAML configuration with annotations
   - Complete skill definitions for both read-only and dangerous
   - Custom .NET skill instruction file reference
   - System prompt for Temporal-aware behavior
   - MCP server configurations

10. **Putting It All Together: A Development Session** (500-600 words)
    - Walkthrough of a real debugging session: **non-determinism bug**
    - Scenario: Developer adds `DateTime.Now` to a workflow
    - Agent identifies determinism violation using custom skill rules
    - OTEL logs in Aspire reveal replay failures / non-determinism exceptions
    - Agent suggests fix: replace with `Workflow.Now`
    - Developer asks about `Workflow.Now` API details → Temporal MCP backstop lookup
    - Terminate stuck workflow replays using dangerous CLI skill
    - ![Screenshot: Agent debugging workflow with traces and logs](placeholder)

11. **Conclusion** (150-200 words)
    - Summary of the layered approach: custom skill + MCP backstop + CLI skills
    - Future possibilities (additional MCP servers, custom tools)
    - Reader engagement question about their own agent setups

## Assumptions

- Reader is familiar with basic Temporal concepts (workflows, activities)
- Reader has used GitHub Copilot before
- MCP server ecosystem is stable and documented
- Aspire MCP server supports the container and log queries described
- Temporal docs MCP server is publicly available

## Out of Scope

- Detailed Temporal workflow tutorial (covered in prior series)
- .NET Aspire setup from scratch (link to existing posts)
- MCP server development/creation (using existing servers only)
- Production deployment considerations
