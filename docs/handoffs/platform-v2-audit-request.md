# Platform v2 Architecture Audit Request

## Context

This repository is being prepared for migration into Platform v2.

Platform v2 is a unified AI-native business operations platform consisting of:

- Connect
- Support
- Sentinel
- Shared Platform Services

The architecture documentation in this repository defines the intended future state.

Your first task is analysis only.

Do not modify code.

---

# Required Reading

Before analysis, read:

ARCHITECTURE.md

CLAUDE.md

AGENTS.md

docs/architecture/

docs/modules/

docs/database/

The documentation represents the target architecture.

---

# Objective

Analyze the current repository and compare the existing implementation against the Platform v2 architecture.

The goal is to understand:

- What exists today
- What should be preserved
- What needs to move
- What needs to be consolidated
- What risks exist

---

# Audit Requirements

Provide an assessment covering:

## 1. Repository Structure

Identify:

- Current application structure
- Major directories
- Existing apps/modules
- Shared packages
- Build configuration

---

## 2. Current Feature Mapping

Map existing functionality to Platform modules:

### Connect

Identify:

- Chat functionality
- Conversations
- Messaging
- Customer communication

### Support

Identify:

- Tickets
- Knowledge base
- Support workflows
- Agent functionality

### Sentinel

Identify:

- Dashboards
- Reports
- Findings
- Recommendations
- AI analysis

---

## 3. Authentication Audit

Document:

- Current auth implementation
- Supabase Auth usage
- User tables
- Organization handling
- Duplicate auth systems

---

## 4. Database Audit

Document:

- Current Supabase schema
- Existing migrations
- Tables by ownership
- RLS policies
- Potential conflicts

Map existing tables to:

- Platform
- Connect
- Support
- Sentinel

---

## 5. Billing Audit

Document:

- Stripe implementation
- Subscription handling
- Payment ownership
- Duplicate billing logic

---

## 6. Technical Debt

Identify:

- Duplicate systems
- Conflicting patterns
- Architecture risks
- Areas requiring consolidation

---

## 7. Migration Assessment

Recommend:

- What should become the Platform foundation
- What should be migrated first
- What should remain temporarily isolated
- What should be deprecated

---

## 8. Migration Risk Analysis

Identify:

- High-risk changes
- Data risks
- Authentication risks
- Deployment risks

---

# Important Constraints

Do not:

- Modify files
- Create migrations
- Refactor code
- Rename directories
- Make architectural changes

This phase is discovery only.

---

# Final Output

Provide:

1. Current State Summary

2. Platform v2 Gap Analysis

3. Recommended Migration Sequence

4. Questions Requiring Decisions

5. First Recommended Implementation Phase
