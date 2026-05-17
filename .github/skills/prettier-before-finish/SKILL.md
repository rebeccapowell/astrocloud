---
name: prettier-before-finish
description: "Run Prettier before finishing or committing code changes. Use when a task edits files, when format:check or Prettier fails, when preparing a final answer, or before saying work is ready to merge."
user-invocable: false
---

# Prettier Before Finish

## When to Use

- Any task that edits source files
- Before claiming a change is complete
- When `pnpm run format:check` fails
- Before commit or PR-ready handoff

## Procedure

1. Identify the files you changed in the current task.
2. Run Prettier on those files directly.
3. Re-run the relevant verification command:
   - Prefer `pnpm run format:check` when practical.
   - If the repo already has unrelated formatting drift, report that clearly and distinguish it from the files changed in the current task.
4. If Prettier changed files, re-run any checks affected by formatting-sensitive files.

## Repo-Specific Commands

Format specific files:

```bash
pnpm exec prettier --write <file1> <file2>
```

Full formatting check:

```bash
pnpm run format:check
```

## Notes

- Do not stop after code edits without considering formatting.
- If `format:check` still fails because of unrelated pre-existing files, say that explicitly in the final response.
- Keep the formatting change scoped to touched files unless the user asks for a wider repo cleanup.
