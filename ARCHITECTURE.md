# Platform Architecture

## Overview

Platform is an AI-native business operations platform designed to help businesses manage customer communication, support operations, and operational intelligence from one unified system.

The platform combines three core capabilities:

- Connect — customer communication
- Support — customer operations
- Sentinel — AI intelligence and analysis

These capabilities are modules inside one platform.

---

# Core Principle

The Platform is the product.

Connect, Support, and Sentinel are capabilities.

They are not independent applications.

The goal is one unified experience:

- One login
- One organization
- One billing system
- One dashboard
- One design system

---

# Architecture Documentation

Detailed architecture documentation exists in:

docs/

architecture/
vision.md
platform-blueprint.md
migration-roadmap.md
coding-constitution.md

modules/
connect.md
support.md
sentinel.md
dashboard.md

database/
schema.md
erd.md
migrations.md

These documents define:

- Product vision
- Platform architecture
- Module boundaries
- Database ownership
- Development standards

---

# Platform Structure

Target architecture:

Platform

├── Dashboard
│
├── Connect
│
├── Support
│
├── Sentinel
│
├── Settings
│
└── Billing

---

# Module Ownership

## Connect

Owns:

- Conversations
- Messages
- Customer communication
- Chat functionality

---

## Support

Owns:

- Tickets
- Knowledge base
- Support workflows
- Agent tools

---

## Sentinel

Owns:

- Findings
- Recommendations
- Reports
- Operational intelligence

---

# Technology Foundation

Current technology direction:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- Stripe
- Vercel

Technology choices should support simplicity, maintainability, and scalability.

---

# Development Rules

Before making architectural changes:

1. Read the documentation.
2. Understand module ownership.
3. Preserve existing functionality.
4. Prefer incremental migration.
5. Avoid unnecessary rewrites.

---

# Migration Status

Platform is currently transitioning from multiple applications into a unified platform architecture.

The migration follows:

Current Applications

    ↓

Shared Platform Foundation

    ↓

Unified Platform

---

# Important Instruction

Do not treat existing applications as isolated products.

They are components being consolidated into Platform.
