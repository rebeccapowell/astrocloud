# Tasks: Custom AI Agent Skills for Temporal Workflow Development

**Input**: Design documents from `/specs/001-temporal-agent-skills/`  
**Prerequisites**: plan.md ✓, spec.md ✓

**Tests**: Not requested for this blog post feature.

**Organization**: Tasks grouped by user story to enable independent section writing and validation.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different sections/files, no dependencies)
- **[US#]**: Maps to user story from spec.md
- Include exact file paths in descriptions

## Path Conventions

- **Blog post**: `src/data/blog/`
- **Post images**: `public/assets/posts/temporal-agent-skills/`
- **OG/header image**: `src/assets/images/` (referenced from frontmatter via relative path)

---

## Phase 1: Setup (Article Foundation)

**Purpose**: Create the blog post file with frontmatter and basic structure

- [x] T001 Create article file with frontmatter in `src/data/blog/2026-01-20-temporal-agent-skills.md`
- [x] T002 [P] Create asset directory `public/assets/posts/temporal-agent-skills/`
- [x] T003 [P] Add placeholder header image reference in frontmatter (use `src/assets/images/` per project conventions)

---

## Phase 2: Foundational (Core Content Framework)

**Purpose**: Sections that establish context before any user story content

**⚠️ CRITICAL**: Introduction and Prerequisites must be complete before user story sections

- [x] T004 Write Section 1: Introduction (200-300 words) - rubber duck evolution, why Temporal needs specialized AI, what we're building
- [x] T005 Write Section 2: Prerequisites (100 words) - VS Code, Copilot, .NET 8+, Aspire workload, Temporal CLI, Node.js - **include version requirements for each**
- [x] T006 Write Section 3: Understanding MCP and Agent Modes (300-400 words) - what MCP provides, how agent modes work, component comparison table

**Checkpoint**: Foundation ready - readers understand the concepts; user story sections can proceed

---

## Phase 3: User Story 1 - Core Agent Configuration (Priority: P1) 🎯 MVP

**Goal**: Reader can configure a working Temporal-aware agent mode

**Independent Test**: Reader can copy agent config, install in VS Code, verify agent mode appears

### Implementation for User Story 1

- [x] T007 [US1] Write Section 4: Creating the Custom .NET Temporal Skill (600-700 words)
  - Why custom skill beats generic docs
  - 18-section structure overview
  - Key sections: Mental Model, Determinism, Aspire, Testing, Agent output
  - (Note: .editorconfig content handled in T009)
- [x] T008 [P] [US1] Create complete 18-section skill code block for Section 4 (copy from gist, adapt)
- [x] T009 [P] [US1] Create .editorconfig code block for Section 4 (7 analyzer suppressions: CA1024, CA1822, CA2007, CA2008, CA5394, CS1998, VSTHRD105)
- [x] T010 [US1] Write Section 5: Configuring Temporal Docs MCP as Backstop (300-400 words)
  - When to use official MCP vs custom skill
  - Installation and configuration
  - Example queries

**Checkpoint**: User Story 1 complete - reader has working agent with custom skill and MCP backstop

---

## Phase 4: User Story 2 - Aspire MCP for Observability (Priority: P2)

**Goal**: Reader can query container status and access OTEL logs through the agent

**Independent Test**: Reader can start Aspire app, ask agent about containers, get accurate status

### Implementation for User Story 2

- [x] T011 [US2] Write Section 6: Integrating Aspire MCP for Live Observability (500-600 words)
  - Setup via `aspire mcp init` (creates `.vscode/mcp.json`)
  - How Aspire MCP exposes container and log data
  - Available tools table: list_resources, list_console_logs, list_structured_logs, list_traces
  - The three pillars of observability: logging, tracing, metrics
  - OTEL environment variables auto-configured in local dev
  - Example prompts: "Are all my resources running?", "Analyze HTTP request performance"
  - Example: accessing structured logs and traces for debugging
- [x] T012 [P] [US2] Create Aspire MCP configuration code block for Section 6 (`.vscode/mcp.json` format)
- [x] T013 [P] [US2] Add screenshot placeholder for Section 6 (agent showing Aspire resources)

**Checkpoint**: User Story 2 complete - reader can query Aspire through agent

---

## Phase 5: User Story 3 - Read-Only Temporal CLI Skills (Priority: P3)

**Goal**: Reader can execute safe CLI commands (list, describe, show, query) through agent

**Independent Test**: Reader can ask agent to list workflows, agent executes CLI and returns results

### Implementation for User Story 3

- [x] T014 [US3] Write Section 7: Building the Read-Only Temporal CLI Skill (500-600 words)
  - Commands included: list, describe, show, query, stack, count, trace, start, execute
  - Why start/execute are safe (create new executions, don't modify existing)
  - CLI command table with descriptions
  - Wrapping as agent tools
  - Example interactions
- [x] T015 [P] [US3] Create read-only skill definition code block for Section 7
- [x] T016 [P] [US3] Add example agent interaction for workflow listing

**Checkpoint**: User Story 3 complete - reader can inspect workflows through agent

---

## Phase 6: User Story 4 - Dangerous Temporal CLI Skills (Priority: P4)

**Goal**: Reader can execute mutating commands with localhost-only safety restriction

**Independent Test**: Reader can terminate a local workflow; agent refuses non-localhost addresses

### Implementation for User Story 4

- [x] T017 [US4] Write Section 8: Building the Dangerous Temporal CLI Skill (600-700 words)
  - Why separate skill for mutating operations
  - Commands: terminate, signal, cancel, delete, reset
  - Localhost-only restriction implementation
  - Address validation logic (127.0.0.1, localhost, Aspire-managed)
  - Clear error messages for blocked attempts
  - Security rationale
- [x] T018 [P] [US4] Create dangerous skill definition code block with localhost validation
- [x] T019 [P] [US4] Add screenshot placeholder for refused non-localhost command

**Checkpoint**: User Story 4 complete - reader understands the safety model for write operations

---

## Phase 7: User Story 5 - Complete Configuration Reference (Priority: P5)

**Goal**: Reader has full code reference for extending and customizing the setup

**Independent Test**: Reader can identify MCP configs, tool definitions, localhost restrictions

### Implementation for User Story 5

- [x] T020 [US5] Write Section 9: The Complete Agent Configuration (600-800 words)
  - Full JSON configuration with annotations
  - Complete skill definitions (read-only + dangerous)
  - Custom .NET skill instruction file reference
  - System prompt for Temporal-aware behavior
  - MCP server configurations
- [x] T021 [P] [US5] Create complete annotated agent configuration code block
- [x] T022 [US5] Write Section 10: Putting It All Together (500-600 words)
  - Non-determinism bug debugging walkthrough
  - Scenario: Developer adds DateTime.Now
  - Agent identifies determinism violation
  - OTEL logs reveal replay failures
  - Fix with Workflow.Now
  - Temporal MCP backstop lookup
  - Terminate stuck workflows with dangerous skill
- [x] T023 [P] [US5] Add screenshot placeholder for debugging session
- [x] T031 [US5] Create 2-3 example agent interaction transcripts showing multi-tool usage (e.g., Aspire logs + Temporal CLI + custom skill advice in one session)

**Checkpoint**: User Story 5 complete - reader has full reference implementation

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final article quality and completeness


- [x] T024 Write Section 11: Conclusion (150-200 words) - layered approach summary, future possibilities, reader question
- [x] T025 Review all code blocks for syntax correctness and copy-paste readiness
- [x] T026 Verify all tables render correctly (MCP comparison, CLI commands)
- [x] T027 Add internal cross-references between sections
- [x] T028 Review against constitution v1.2.0 quality gates
- [x] T029 Update frontmatter description and tags for SEO
- [x] T030 Final read-through for flow and technical accuracy

- [x] T032 Update Temporal Docs MCP section to use hosted HTTP endpoint (`https://temporal.mcp.kapa.ai`) and explain client vs server (VS Code/Cursor/Claude Code)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - creates article context
- **User Stories (Phase 3-7)**: All depend on Foundational completion
  - Each user story section CAN be written in parallel
  - But sequential order (P1→P2→P3→P4→P5) recommended for narrative flow
- **Polish (Phase 8)**: Depends on all user story sections complete

### User Story Dependencies

| Story | Can Start After | Depends On Other Stories? |
|-------|-----------------|---------------------------|
| US1 | Phase 2 complete | No - core foundation |
| US2 | Phase 2 complete | No - independent of US1 |
| US3 | Phase 2 complete | References agent mode from US1 |
| US4 | Phase 2 complete | Follows US3 structure (contrasts with read-only) |
| US5 | Phase 2 complete | References all prior components |

### Parallel Opportunities

```text
# After Phase 2, these can run in parallel:
T007 + T011 + T014 + T017 (main section writing)

# Within User Story 1, these can run in parallel:
T008 (skill code block) + T009 (.editorconfig block)

# Within User Story 2:
T012 (config block) + T013 (screenshot placeholder)

# Within User Story 3:
T015 (skill block) + T016 (interaction example)

# Within User Story 4:
T018 (skill block) + T019 (screenshot placeholder)

# Within User Story 5:
T021 (config block) + T023 (screenshot placeholder)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup → Article file exists
2. Complete Phase 2: Foundational → Intro, prereqs, MCP concepts
3. Complete Phase 3: User Story 1 → Custom skill + MCP backstop
4. **STOP and VALIDATE**: Article is publishable as a focused post on custom skills
5. Can publish MVP and add remaining stories later

### Incremental Delivery

1. Setup + Foundational → Article structure ready
2. Add User Story 1 → Core agent configuration (MVP!)
3. Add User Story 2 → Aspire observability
4. Add User Story 3 → Read-only CLI
5. Add User Story 4 → Dangerous CLI with safety
6. Add User Story 5 → Complete reference + walkthrough
7. Polish → Final quality pass

---

## Notes

- Constitution v1.2.0 governs writing style and structure
- 18-section skill based on: https://gist.github.com/rebeccapowell/4dbb6e09c319e8db1d6c89344271c4ca
- .editorconfig suppressions: CA1024, CA1822, CA2007, CA2008, CA5394, CS1998, VSTHRD105
- Screenshots are placeholders - to be captured during review
- Target: ~4,500-5,500 words total
- Total tasks: 31 (T001-T031)
