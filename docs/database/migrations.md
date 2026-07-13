# Database Migration Strategy

## Overview

Platform uses a migration-based database development process.

All database changes must be tracked through version-controlled migrations.

The goal is to evolve the platform safely while preserving existing functionality.

---

# Migration Principles

## Never Modify Production Manually

All schema changes must be created through migrations.

Examples:

- Creating tables
- Adding columns
- Changing indexes
- Updating policies
- Modifying relationships

---

## Small Incremental Changes

Prefer small migrations over large database rewrites.

Each migration should:

- Have one clear purpose
- Be easy to review
- Be easy to troubleshoot

---

## Preserve Existing Data

Migration decisions should prioritize existing customer and application data.

Avoid destructive changes unless absolutely necessary.

---

# Migration Workflow

The standard workflow:

Create Migration

    ↓

Test Locally

    ↓

Review Schema Changes

    ↓

Generate Types

    ↓

Test Application

    ↓

Deploy

---

# Supabase Development Process

Platform uses Supabase for:

- Database
- Authentication
- Row Level Security
- Storage
- Database functions

Development should use local Supabase when possible.

---

# Schema Changes

## Creating Tables

New tables should define:

- Primary key
- Organization ownership
- Timestamps
- Appropriate indexes
- Security policies

Example:

id

organization_id

created_at

updated_at

---

## Adding Columns

New columns should:

- Have a clear purpose
- Avoid unnecessary duplication
- Include appropriate defaults when needed

---

## Removing Columns

Before removing a column:

- Verify usage
- Update application code
- Migrate existing data if necessary
- Remove only after validation

---

# Row Level Security

All organization data must enforce access boundaries.

RLS policies should ensure:

- Users can only access authorized organizations
- Members only see permitted data
- Module boundaries remain respected

---

# Database Types

Database types should be regenerated after schema changes.

Example:

supabase gen types typescript --local

Generated types should remain synchronized with the database.

---

# Module Migration Rules

## Platform Tables

Changes require extra review because they affect all modules.

Examples:

- organizations
- members
- subscriptions
- permissions

---

## Module Tables

Module owners may evolve their own tables while respecting platform standards.

Examples:

Connect:

- conversations
- messages

Support:

- tickets
- knowledge

Sentinel:

- findings
- reports

---

# Migration During Platform Consolidation

During migration from separate applications:

The goal is consolidation, not replacement.

Steps:

1. Identify existing tables
2. Determine ownership
3. Remove duplicate concepts
4. Move shared concepts into Platform tables
5. Preserve valuable data
6. Validate functionality

---

# Database Decision Rules

Before creating a new table, ask:

1. Who owns this data?

2. Does this already exist?

3. Should this belong to Platform or a module?

4. Does this need organization isolation?

5. Will future modules benefit from this design?

---

# Future Scalability

The database should support future Platform capabilities:

- AI agents
- Automation
- Integrations
- Analytics
- Voice systems

New capabilities should integrate into the existing architecture rather than creating isolated databases.

---

# Architectural Principle

The database is the foundation of Platform.

It should be:

- Clear
- Secure
- Understandable
- Evolvable

Good database architecture enables the platform to grow without becoming complicated.
