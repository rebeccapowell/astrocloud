<!--
Sync Impact Report
==================
- Version change: 1.1.0 → 1.2.0 (MINOR: Added File Naming Convention section)
- Modified principles: None
- Added sections: File Naming Convention (under Content Standards)
- Removed sections: None
- Templates requiring updates: None identified
- Follow-up TODOs: None
-->

# Rebecca Powell Tech Blog Constitution

This constitution governs content creation for rebecca-powell.com, a technical blog spanning 20+ years of software engineering insights. It ensures consistency, quality, and the authentic voice that readers expect.

## Core Principles

### I. Depth Over Breadth

Every article MUST provide substantive value that justifies the reader's time investment. Surface-level content is prohibited.

- **Minimum depth**: Articles MUST explore the "why" behind technical decisions, not just the "how"
- **Context required**: Technical topics MUST be situated within historical evolution or broader industry patterns
- **No listicles without substance**: If using a list format, each item MUST include explanation and rationale
- **Length preference**: Long-form content is preferred; let the topic dictate length rather than arbitrary limits. Quick tips and curated quotes remain acceptable when appropriate.

**Rationale**: Readers come for insights they cannot find in documentation. Shallow content wastes their time and damages credibility.

### II. Structured Accessibility

Complex topics MUST be made navigable through deliberate structure. Readers should be able to scan, dive deep, or reference sections independently.

- **Headers are mandatory**: Use H2 for major sections, H3 for subsections; never skip levels
- **Tables for comparison**: When comparing options, technologies, or evolution over time, use tables
- **Code blocks with context**: Every code sample MUST include language identifier and surrounding explanation
- **Bullet points for lists**: Use bullets for 3+ related items; avoid inline comma-separated lists for technical details

**Rationale**: Technical readers often scan before committing to read. Good structure respects their workflow.

### III. Authority Through Attribution

Claims MUST be backed by evidence. Credit sources, cite experts, and distinguish opinion from fact.

- **Quote with citation**: When referencing others' ideas, use blockquotes with source links
- **Link to primary sources**: Prefer official documentation and original blog posts over secondary summaries
- **Acknowledge limitations**: State what you don't know; admit when you're speculating
- **Update dated content**: Add "Update (YYYY)" sections when revisiting old posts with new information

**Rationale**: A 20+ year blog builds trust through demonstrated intellectual honesty and proper attribution.

### IV. Practical Grounding

Abstract concepts MUST be anchored to real-world application. Theory without practice is incomplete.

- **Scenarios over abstractions**: Illustrate concepts with concrete examples (bakeries, sales managers, polling loops)
- **Show the problem first**: Before presenting a solution, establish why it matters
- **Code that works**: If including code, it MUST be accurate and runnable in context
- **Trade-offs explicit**: When recommending approaches, discuss what you're trading away

**Rationale**: Readers apply knowledge to real systems. Ungrounded theory doesn't help them ship software.

### V. Engaged Conversation

Content SHOULD invite dialogue. Articles are the beginning of a conversation, not the final word.

- **End with questions**: Conclude with open questions that invite reader reflection or response
- **Enable comments**: Giscus integration exists; use it to build community
- **Personal voice**: Write in first person; share your perspective and experience
- **Series for complex topics**: Multi-part posts allow deeper exploration and sustained engagement

**Rationale**: The best technical writing sparks discussion and learning in both directions.

## Content Standards

### File Naming Convention

Blog post files MUST follow this format:
```
YYYY-MM-DD-slug-in-kebab-case.md
```

**Rules**:
- **Date prefix**: Publication date in `YYYY-MM-DD` format (e.g., `2026-01-20`)
- **Slug**: Descriptive, kebab-case title slug (e.g., `temporal-agent-skills`)
- **Extension**: Always `.md` (Markdown)
- **Location**: `src/data/blog/`

**Examples**:
- ✅ `2026-01-20-temporal-agent-skills.md`
- ✅ `2024-03-15-aspire-service-discovery-deep-dive.md`
- ❌ `temporal-agent-skills.md` (missing date)
- ❌ `2026-01-20-Temporal_Agent_Skills.md` (wrong case, underscores)

### Frontmatter Requirements

Every post MUST include:
```yaml
---
title: "Clear, specific title (not clickbait)"
pubDatetime: 2025-01-20T10:00:00+01:00  # ISO 8601 with timezone
description: "Compelling 1-2 sentence summary for SEO and social"
tags:
  - relevant-tag  # 2-5 tags, kebab-case
---
```

Optional but encouraged:
- `featured: true` for cornerstone content
- `modDatetime` when significantly updating old posts
- `draft: true` for work-in-progress (prevents publication)

### Writing Voice

- **Authoritative but humble**: Share expertise without arrogance
- **Technical precision**: Use correct terminology; define jargon on first use
- **Active voice preferred**: "The system processes requests" not "Requests are processed by the system"
- **Contractions acceptable**: Write naturally; this is a blog, not a legal document

### Prohibited Patterns

- Clickbait titles that don't deliver
- "Ultimate guide" or "Complete tutorial" claims for incomplete coverage
- Unattributed code copied from other sources
- Publishing without proofreading
- Empty placeholder posts or "coming soon" content

## Visual Standards

### Header Images

- AI-generated header images MAY be used to establish article tone and theme
- All imagery and text remain under editorial control; AI suggestions require human approval
- Header images SHOULD complement the article topic without being literal or clichéd
- Use the `ogImage` frontmatter field for custom social sharing images

### Screenshots and Diagrams

- When drafting, insert placeholders where screenshots would aid understanding:
  ```markdown
  ![Screenshot: Azure portal showing Aspire dashboard configuration](placeholder)
  <!-- TODO: Capture screenshot of portal with settings panel open -->
  ```
- Screenshots SHOULD include annotations (arrows, highlights) when pointing to specific UI elements
- Diagrams are preferred for architecture explanations; use tools like Mermaid, Excalidraw, or draw.io
- All images MUST have descriptive alt text for accessibility

### Code Illustrations

- For complex code flows, consider supplementing with sequence diagrams or flowcharts
- Terminal output screenshots MAY be used when formatting is essential to understanding
- Prefer syntax-highlighted code blocks over screenshots of code

## Article Structure

### Opening (First 150 words)

MUST accomplish:
1. Establish what the article is about
2. Signal why the reader should care
3. Set expectations for depth/scope

Patterns that work:
- Lead with a provocative quote, then unpack it
- Open with a concrete scenario the reader recognizes
- State a thesis that the article will defend

### Body

SHOULD follow one of these structures:
- **Chronological**: For history/evolution pieces (The Five Waves...)
- **Problem → Solution**: For technical how-to content
- **Thesis → Evidence → Implications**: For opinion/analysis pieces
- **Tutorial flow**: Setup → Steps → Verification → Troubleshooting

### Closing

MUST include:
- Summary of key takeaways (if lengthy article)
- Call to reflection or action
- Question or invitation for reader engagement

## Governance

This constitution governs all content published to rebecca-powell.com. Amendments require:
1. Clear rationale for the change
2. Review of existing content for compliance
3. Version increment following semantic versioning

Content review checklist:
- [ ] Does the article satisfy all five Core Principles?
- [ ] Is frontmatter complete and accurate?
- [ ] Have sources been properly attributed?
- [ ] Does structure facilitate scanning and deep reading?
- [ ] Does the conclusion invite engagement?

For AI-assisted drafting: AI-generated content MUST be reviewed, fact-checked, and refined to match the authentic voice established across 20+ years of blogging. AI is a tool, not the author.

**Version**: 1.2.0 | **Ratified**: 2026-01-20 | **Last Amended**: 2026-01-20
