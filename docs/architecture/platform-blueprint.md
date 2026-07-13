# Platform Blueprint

## Overview

Platform is a unified AI-native business operations workspace.

The platform provides a single experience where businesses can manage customer conversations, support operations, and operational intelligence.

Platform consists of:

- Platform Shell
- Shared Services
- Product Modules

Product modules operate independently while sharing common infrastructure.

---

# Platform Architecture

                Platform

                   |
    --------------------------------
    |              |               |

Connect Support Sentinel

    |
    |

---

# Core Principle

The platform is the product.

Connect, Support, and Sentinel are capabilities within the platform.

Modules should never become independent applications.

---

# Platform Shell

The Platform Shell provides the common experience every user interacts with.

Responsibilities:

- Authentication
- Organization management
- Navigation
- Dashboard
- User profile
- Settings
- Billing
- Notifications
- Permissions

The shell does not contain module-specific business logic.

---

# Shared Services

Shared services are used across all modules.

## Authentication

Responsibilities:

- User authentication
- Sessions
- Password management
- OAuth providers
- Security controls

Technology:

- Supabase Auth

---

## Organizations

The platform is organization-based.

Users belong to organizations.

Organizations contain:

- Members
- Roles
- Permissions
- Data ownership

The organization is the primary tenant boundary.

---

## Billing

Billing is owned by the platform.

Responsibilities:

- Subscription management
- Plans
- Checkout
- Customer portal
- Usage tracking

Modules do not manage billing independently.

---

## AI Infrastructure

Shared AI capabilities include:

- Model providers
- Prompt management
- Embeddings
- AI jobs
- Streaming responses
- AI configuration

Modules consume AI services.

---

## Design System

All modules share:

- Components
- Typography
- Colors
- Spacing
- Motion
- Accessibility standards

The user should experience one product.

---

# Product Modules

## Connect

Purpose:

Manage customer communication.

Responsibilities:

- Customer conversations
- Chat interactions
- Messaging channels
- Customer contacts
- Lead capture

Connect owns communication data.

Connect does not own:

- Billing
- Authentication
- Organizations
- Platform settings

---

## Support

Purpose:

Manage customer service operations.

Responsibilities:

- Tickets
- Knowledge base
- Support workflows
- Agent tools
- Customer issue resolution

Support owns support operational data.

Support does not own:

- Authentication
- Billing
- Organization management

---

## Sentinel

Purpose:

Provide operational intelligence.

Responsibilities:

- Business health analysis
- Quality reviews
- Trends
- Findings
- Recommendations
- Reports

Sentinel observes platform activity and provides intelligence.

Sentinel should not directly modify operational data owned by other modules.

---

# Navigation Structure

The user experience should feel like one application.

Example:
Dashboard

Connect

Support

Sentinel

Reports

Settings

Billing

Users should not feel like they are switching products.

---

# Application Structure

The target application structure:

apps/

platform/
dashboard/
connect/
support/
sentinel/
settings/
billing/

marketing/

docs/

---

# Package Structure

Shared functionality belongs in packages.

packages/

ui/
auth/
database/
ai/
billing/
email/
types/
utils/
config/

---

# Data Ownership Rules

Every module owns its operational data.

Examples:

Connect owns:

- conversations
- messages
- contacts

Support owns:

- tickets
- knowledge articles
- support workflows

Sentinel owns:

- findings
- recommendations
- reports
- analytics

Shared platform data belongs to the platform layer.

---

# Future Modules

Future capabilities should become modules, not standalone applications.

Potential future modules:

- Automations
- AI Agents
- Analytics
- Integrations
- Voice
- Scheduling

---

# Architectural Decision

Platform should evolve through migration, not replacement.

Existing applications contain valuable functionality.

The goal is to unify them into one platform while preserving working features.
