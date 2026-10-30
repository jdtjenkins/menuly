# Agent Instructions

This file defines the development conventions and workflows for AI coding agents working in this repository.

## 1. Project Context

This is a Next.js application developed using Specification-Driven Development (SDD) with OpenSpec.

Before planning or implementing significant changes, read the relevant project documentation:

* `docs/product-vision.md` — Overall product vision, requirements, and V1 scope.
* `docs/implementation-roadmap.md` — Planned changes, implementation order, dependencies, and progress.
* `openspec/config.yaml` — OpenSpec project configuration.
* `openspec/specs/` — Current accepted specifications.

Only reference files that exist. If expected documentation is missing, ask for clarification rather than inventing requirements.

Project documentation is the source of truth for product requirements. The existing codebase is the source of truth for current implementation behaviour.

If the two conflict, identify the discrepancy rather than silently choosing one.

## 2. Specification-Driven Development

Use OpenSpec as the primary workflow for planning and implementing application features.

### Explore

When exploring requirements or discussing architecture:

* Use the `openspec-explore` skill when appropriate.
* Discuss requirements, alternatives, trade-offs, and technical decisions.
* Ask clarifying questions when requirements are ambiguous.
* Prefer simple, maintainable solutions over unnecessary complexity.
* Do not write application code during exploration.
* Do not create OpenSpec changes unless explicitly requested.

### Propose

When asked to plan a feature or change:

* Use the `openspec-propose` skill.
* Consult the product vision, roadmap, and existing specifications.
* Keep changes small, focused, and independently implementable.
* Clearly define scope, expected behaviour, acceptance criteria, and testing requirements.
* Document significant architectural decisions and trade-offs.
* Do not implement application code during the proposal stage.

### Apply

When asked to implement an approved change:

* Use the `openspec-apply-change` skill.
* Read all relevant OpenSpec artifacts before modifying code.
* Follow the approved specification and implementation tasks.
* Implement incrementally, keeping changes focused.
* Write or update tests alongside implementation.
* Update task completion status as work progresses.
* Do not introduce unrelated features or refactoring.
* If implementation reveals a problem with the specification, explain it and propose an amendment rather than silently deviating.

### Verify

After implementing a change:

* Verify the implementation against its specifications and acceptance criteria.
* Run relevant automated tests, linting, and type checking.
* Identify incomplete tasks, regressions, and deviations from the specification.
* Report any checks that could not be performed.
* Do not claim a change is complete unless verification supports that conclusion.

### Archive

When a change is complete and approved:

* Use the `openspec-archive-change` skill.
* Ensure the implementation and specifications are consistent.
* Update the implementation roadmap to reflect completion.
* Preserve the relevant specification history.

Do not archive changes without explicit approval.

## 3. Development Workflow

Follow these principles:

1. Explore and clarify requirements.
2. Create or refine an OpenSpec proposal.
3. Wait for approval before implementation.
4. Implement the approved change.
5. Test and verify the implementation.
6. Request approval before archiving.
7. Update project documentation where appropriate.

Do not combine planning and implementation unless explicitly requested.

For small fixes that do not affect documented behaviour or architecture, a full OpenSpec change is not necessarily required.

When uncertain whether a change requires a specification, ask.

## 4. Git and Version Control

* Use feature branches for implementation work.
* Never commit directly to `main`.
* Never create commits, push changes, merge branches, or open pull requests without explicit instruction.
* Do not switch branches or discard uncommitted changes without permission.
* Keep commits focused and logically organised.
* Do not include unrelated changes in commits.
* Never force-push or rewrite shared Git history without explicit approval.

Suggested branch naming:

* `feat/<change-name>`
* `fix/<issue-name>`
* `chore/<task-name>`

OpenSpec change names and feature branch names should correspond where practical.

## 5. Architecture and Code Quality

### General Principles

* Prefer simplicity, readability, and maintainability.
* Follow existing project conventions before introducing new patterns.
* Avoid unnecessary abstractions, dependencies, and architectural complexity.
* Keep components and functions focused on a single responsibility.
* Prefer explicit, type-safe implementations over clever shortcuts.
* Do not duplicate business logic.
* Avoid premature optimisation.
* Remove obsolete code introduced by the current change when safe.

### TypeScript

* Use TypeScript with strict type checking.
* Avoid `any` unless unavoidable and justified.
* Prefer well-defined types and interfaces.
* Validate untrusted input at system boundaries.
* Handle errors explicitly.
* Avoid suppressing TypeScript or linting errors without justification.

### Next.js

* Follow the conventions of the installed Next.js version.
* Prefer Server Components where appropriate.
* Use Client Components only when client-side interactivity is required.
* Keep server-only logic and secrets out of client bundles.
* Follow established patterns for routing, data fetching, caching, and mutations.
* Do not assume APIs from older Next.js versions are compatible.

## 6. Testing and Verification

Testing is part of implementation, not a separate optional activity.

* Write unit tests for meaningful business logic.
* Write integration tests for important interactions between components and services.
* Use end-to-end tests for critical user journeys where appropriate.
* Test expected behaviour, edge cases, and failure conditions.
* Prefer deterministic tests over tests dependent on external services.
* Mock external dependencies where appropriate.
* Avoid tests that merely reproduce implementation details.

Before reporting completion, run the relevant available checks:

* Type checking
* Linting
* Unit and integration tests
* End-to-end tests where applicable
* Production build when relevant

Use the scripts and tools configured in the repository. Do not assume particular test frameworks or commands exist.

If a required check cannot run, explain why.

## 7. Dependencies and Tooling

* Use the package manager already configured in the repository.
* Do not introduce dependencies without a clear reason.
* Prefer existing dependencies and platform capabilities.
* Check compatibility with the installed framework and runtime versions.
* Avoid unnecessary configuration changes.
* Do not change package managers without explicit approval.

## 8. Security

* Never hardcode credentials, tokens, API keys, or secrets.
* Use environment variables for sensitive configuration.
* Never commit `.env` files containing secrets.
* Validate and authorise server-side operations.
* Treat client input as untrusted.
* Avoid exposing sensitive information through logs or API responses.
* Follow the principle of least privilege.

## 9. Documentation

Keep documentation accurate and useful.

* Update documentation when functionality or architecture changes.
* Keep `docs/product-vision.md` focused on overall product requirements.
* Keep `docs/implementation-roadmap.md` aligned with actual development progress.
* Use OpenSpec for detailed feature requirements and change specifications.
* Document significant architectural decisions and non-obvious behaviour.
* Avoid redundant documentation that duplicates implementation details.

Do not silently change the product vision or agreed scope.

## 10. Agent Communication

When working on a task:

* State important assumptions.
* Ask questions when missing information could materially affect the result.
* Explain significant technical trade-offs.
* Flag conflicts between requirements, specifications, and implementation.
* Keep responses concise and actionable.
* Do not claim tests passed unless they were actually executed.
* Do not claim files were modified unless they were actually modified.

When completing implementation, summarise:

1. What changed.
2. Which specification or tasks were addressed.
3. What verification was performed.
4. Any outstanding issues or follow-up work.

## 11. Decision-Making Priorities

When choosing between possible implementations, prioritise:

1. Correctness and security.
2. Compliance with approved specifications.
3. Simplicity and maintainability.
4. Consistency with existing architecture.
5. Testability.
6. Performance where justified by requirements.

If these priorities conflict, explain the trade-off.

---

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
