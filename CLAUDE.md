# Claude Development Instructions

## Purpose

This repository is being developed as Platform v2: a unified AI-native business operations platform.

Before making changes, understand the architecture and follow the documented decisions.

---

# Required Reading

Before making architectural or structural changes, read:

ARCHITECTURE.md

docs/architecture/

docs/modules/

docs/database/

These documents define:

- Platform vision
- System architecture
- Module ownership
- Database boundaries
- Engineering standards

---

# Core Development Philosophy

## Build the Right Thing Simply

The goal is not maximum complexity.

The goal is a simple, powerful platform that users immediately understand.

Follow this principle:

> It just works.

Avoid unnecessary abstraction, configuration, and feature complexity.

---

# Platform Architecture Rules

## One Platform

The application is one platform.

Do not create:

- separate authentication systems
- separate billing systems
- duplicate dashboards
- isolated application experiences

Connect, Support, and Sentinel are modules.

---

## Respect Module Ownership

Before adding functionality, determine ownership.

Connect owns:

- conversations
- messages
- customer communication

Support owns:

- tickets
- knowledge
- support workflows

Sentinel owns:

- analysis
- findings
- recommendations
- reports

Do not place functionality in the wrong module.

---

# Before Coding

Before implementing a change:

1. Understand the current architecture.
2. Identify affected modules.
3. Check existing patterns.
4. Consider whether the change belongs in shared infrastructure.
5. Avoid creating duplicate functionality.

---

# Migration Rules

This project is undergoing consolidation.

Important:

- Do not rewrite working systems unnecessarily.
- Do not delete existing functionality without validation.
- Prefer incremental migration.
- Preserve existing behavior.

When uncertain:

Choose migration over replacement.

---

# Code Standards

## TypeScript

Prefer:

- Strong typing
- Explicit interfaces
- Shared types
- Database-generated types

Avoid:

- `any`
- unnecessary casting
- duplicated types

---

## React / Next.js

Prefer:

- Server components by default
- Small focused components
- Composition over complexity

Use client components only when necessary.

---

## Database

All schema changes require migrations.

Never:

- manually modify production data
- create duplicate tables without review
- bypass organization boundaries

All business data should respect organization ownership.

---

# UI Standards

Use the shared design system.

Maintain consistency in:

- Components
- Typography
- Spacing
- Layout
- Interaction patterns

Do not create one-off UI patterns unless necessary.

---

# AI Features

AI should provide meaningful value.

Avoid adding AI features simply because they are possible.

AI functionality should:

- Reduce user effort
- Improve decisions
- Increase clarity
- Save time

---

# Working Style

When completing tasks:

1. Make focused changes.
2. Explain significant architectural decisions.
3. Keep commits understandable.
4. Verify functionality before completion.

---

# When Unsure

Do not make large architectural assumptions.

Instead:

1. Explain the decision that needs to be made.
2. Identify options.
3. Recommend the safest path.
4. Wait for confirmation when appropriate.

---

# Quality Checklist

Before considering work complete:

Verify:

- Application builds
- Type checking passes
- Linting passes
- Existing functionality works
- Changes match architecture documentation

---

# Final Principle

The objective is not to create the most complicated system.

The objective is to create the most useful AI operations platform possible.

Simple.
Clear.
Maintainable.
Scalable.
