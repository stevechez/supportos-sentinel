# Database Schema Specification

## Overview

Platform uses a shared database architecture.

All modules operate within the same platform database while maintaining clear ownership boundaries.

The database is organized into:

- Platform tables
- Module tables
- Shared infrastructure tables

---

# Database Principles

## One Database

Platform uses one unified database.

Modules should not create separate databases.

---

## Organization-Based Data Ownership

Platform is organization-based.

Business data should generally belong to an organization.

Common pattern:

Common pattern:

organization_id

is used to associate records with the correct tenant.

---

## Clear Ownership

Each table belongs to one owner.

Modules may read data from other modules when appropriate, but should not directly manage another module's records.

---

# Platform Tables

Platform owns core system functionality.

## Organizations

Purpose:

Store business accounts using Platform.

Example:

organizations

id

name

created_at

updated_at

---

## Organization Members

Purpose:

Define users belonging to organizations.

Example:

organization_members

id

organization_id

user_id

role

created_at

---

## Profiles

Purpose:

Store user profile information.

Example:

profiles

id

email

name

avatar_url

---

## Subscriptions

Purpose:

Manage platform billing state.

Example:

subscriptions

id

organization_id

stripe_customer_id

plan_id

status

---

## Activity

Purpose:

Track important platform events.

Examples:

- Login events
- User actions
- Module activity

---

## Notifications

Purpose:

Store user and organization notifications.

---

# Connect Tables

Connect owns customer communication data.

Primary tables:

conversations

messages

contacts

chat_sessions

channels

widgets

leads

---

## Conversations

Purpose:

Store customer communication threads.

---

## Messages

Purpose:

Store individual communication events.

---

## Contacts

Purpose:

Store customer communication context.

---

# Support Tables

Support owns customer service operational data.

Primary tables:

tickets

ticket_messages

knowledge_articles

knowledge_categories

saved_replies

macros

attachments

---

## Tickets

Purpose:

Track customer issues and resolution workflows.

---

## Knowledge Articles

Purpose:

Store support knowledge used by humans and AI.

---

# Sentinel Tables

Sentinel owns intelligence data.

Primary tables:

health_scores

findings

recommendations

reports

quality_reviews

metrics

analysis_results

---

## Health Scores

Purpose:

Store operational health indicators.

---

## Findings

Purpose:

Store detected observations.

Examples:

- Trends
- Problems
- Opportunities

---

## Recommendations

Purpose:

Store suggested actions.

---

# Shared Infrastructure Tables

Some capabilities are used across modules.

Examples:

files

documents

embeddings

ai_jobs

events

tags

---

# Relationships

High-level relationship:

Organization

|
|
+-- Users

|
+-- Connect Data

|
+-- Support Data

|
+-- Sentinel Intelligence

---

# Data Access Rules

Modules should:

- Own their tables
- Validate organization ownership
- Use shared authentication
- Respect permissions

Modules should not:

- Duplicate platform tables
- Create independent user systems
- Create independent billing systems

---

# Future Considerations

The schema should support future capabilities:

- AI agents
- Automation workflows
- Voice
- Analytics
- Integrations

The architecture should grow without requiring major restructuring.

---

# Architectural Principle

The database represents one platform.

Separate modules share infrastructure while maintaining clear ownership boundaries.
