<!-- BEGIN:nextjs-agent-rules -->

# Agent Instructions

## Project Context

This repository is Platform v2: a unified AI-native business operations platform.

The system combines:

- Connect
- Support
- Sentinel

into one platform experience.

---

# First Rule

Before making changes:

Read:

ARCHITECTURE.md

CLAUDE.md

docs/

Understand the intended architecture before modifying code.

---

# Architecture Rules

## One Platform

Treat this repository as one product.

Do not create:

- duplicate applications
- duplicate authentication
- duplicate billing
- isolated module systems

---

## Respect Ownership Boundaries

Modules have clear responsibilities.

Connect:

- communication
- conversations
- messages

Support:

- tickets
- knowledge
- workflows

Sentinel:

- intelligence
- analysis
- recommendations

Keep functionality within the correct boundary.

---

# Change Management

## Prefer Incremental Changes

Make small, understandable changes.

Avoid:

- large rewrites
- unnecessary migrations
- replacing working systems without reason

---

## Preserve Existing Functionality

Before removing or replacing code:

- understand its purpose
- verify dependencies
- confirm migration path

---

# Code Quality

Changes should prioritize:

- readability
- maintainability
- consistency

Prefer:

- simple solutions
- existing patterns
- shared components

Avoid:

- unnecessary abstractions
- duplicate code
- premature optimization

---

# Database Rules

Database changes must:

- use migrations
- preserve organization boundaries
- maintain security policies

Do not manually modify production databases.

---

# UI Rules

Use the existing design system.

Maintain consistency across:

- layouts
- components
- typography
- interactions

The user should experience one unified product.

---

# AI Development Rules

AI features should solve real problems.

Do not add complexity just because a technology exists.

AI should improve:

- efficiency
- clarity
- decision making

---

# Verification

Before completing work:

Check:

- build succeeds
- types pass
- lint passes
- functionality works

---

# Communication

When making significant changes:

Explain:

- what changed
- why it changed
- impact on architecture

If uncertain about architecture:

Ask before making major decisions.

---

# Guiding Principle

Build a platform that feels simple to users and understandable to developers.

The best architecture is the one that enables the product to improve continuously.

<!-- END:nextjs-agent-rules -->
