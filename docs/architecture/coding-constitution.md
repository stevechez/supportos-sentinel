# Coding Constitution

## Purpose

This document defines the engineering principles and standards for Platform development.

All implementation decisions should follow these principles.

The goal is to build a platform that is:

- Simple
- Maintainable
- Scalable
- Consistent
- Easy for humans and AI systems to understand

---

# Core Engineering Principles

## Build Simple Things Well

Prefer simple, understandable solutions over complex abstractions.

Do not introduce complexity unless there is a clear business or technical need.

The best solution is the simplest solution that solves the problem.

---

## The Platform Is the Product

Connect, Support, and Sentinel are modules.

They are not independent applications.

New functionality should integrate into the platform rather than creating separate systems.

---

## Preserve Existing Functionality

During migration:

- Do not rewrite working features unnecessarily.
- Do not remove working code before replacement functionality is verified.
- Prefer incremental migration over large rewrites.

---

# Code Organization

## Shared Code Belongs in Packages

Reusable functionality should live in shared packages.

Examples:

packages/

ui/
auth/
database/
ai/
billing/
email/
types/
utils/

Do not duplicate shared functionality between modules.

---

## Module Boundaries Matter

Each module owns its domain.

Examples:

Connect owns:

- conversations
- messages
- contacts

Support owns:

- tickets
- knowledge base
- support workflows

Sentinel owns:

- analysis
- findings
- recommendations
- reports

Modules should communicate through clear interfaces.

---

# TypeScript Standards

## Type Safety First

Avoid:

- `any`
- unnecessary type casting
- duplicated types

Prefer:

- explicit interfaces
- shared types
- database-generated types

TypeScript errors should be fixed, not ignored.

---

# React and Next.js Standards

## Prefer Composition

Build reusable components through composition.

Avoid large components containing multiple unrelated responsibilities.

---

## Components Should Have Clear Responsibilities

A component should:

- Have one primary purpose
- Be easy to understand
- Be reusable when appropriate

---

## Server and Client Components

Default to server components.

Use client components only when required.

Examples requiring client components:

- Browser APIs
- User interaction
- State management
- Real-time interfaces

---

# Database Standards

## Database Changes Require Migrations

Never manually modify production databases.

All schema changes must use migrations.

---

## Organization Ownership

All business data should belong to an organization.

Tables should generally include:

organization_id

when appropriate.

---

## Keep Data Ownership Clear

Modules own their operational data.

Do not create unnecessary cross-module dependencies.

---

# Authentication and Authorization

## One Authentication System

The platform uses a single authentication system.

Modules should never implement their own authentication.

---

## Organization-Based Access

Users belong to organizations.

Permissions should be handled through roles and memberships.

---

# UI Standards

## One Design System

All modules use shared UI components.

Do not create module-specific versions of existing components.

---

## Consistent Experience

Users should feel they are using one application.

Maintain consistency in:

- Navigation
- Typography
- Spacing
- Components
- Interaction patterns

---

# AI Development Standards

## AI Should Enhance the Product

AI functionality should:

- Provide clear value
- Reduce user effort
- Improve decision making

Avoid adding AI features simply because they are possible.

---

## AI Infrastructure Should Be Shared

AI providers, prompts, embeddings, and AI utilities should be centralized.

Modules consume shared AI capabilities.

---

# Git and Change Management

## Small Commits

Each meaningful change should have a focused commit.

Avoid large unrelated changes.

---

## Explain Architectural Changes

When making significant changes, document:

- What changed
- Why it changed
- Alternatives considered

---

# Testing Standards

Before completing work:

Verify:

- Application builds
- Type checking passes
- Linting passes
- Core functionality works

---

# Working With AI Coding Assistants

AI assistants should:

- Read architecture documentation before major changes
- Follow module boundaries
- Avoid unnecessary rewrites
- Ask questions when architectural decisions are unclear

AI assistants should not:

- Create duplicate systems
- Introduce new frameworks without approval
- Change architecture casually
- Optimize for speed over maintainability

---

# Definition of Quality

High-quality code is:

- Easy to understand
- Easy to change
- Consistent with the platform architecture
- Helpful to future developers and AI assistants

The goal is not the most sophisticated system.

The goal is the most useful system.
