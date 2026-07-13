# Database Entity Relationship Model

## Overview

This document describes the conceptual relationships between Platform entities.

The database uses a shared architecture where all modules operate within organization boundaries.

---

# High-Level Model

                     Organization
                          |
         --------------------------------
         |              |               |
         |              |               |
      Members        Connect        Support
         |              |               |
         |              |               |
      Users        Conversations     Tickets
                        |               |
                     Messages       Knowledge


                          |
                          |
                       Sentinel

                          |
                Findings / Reports /
                Recommendations

---

# Core Platform Relationships

## Organization

The organization is the primary tenant boundary.

Relationship:

Organization

has many

Organization Members

---

## Users

Users represent authenticated individuals.

Relationship:

User

belongs to many

Organizations

through organization membership.

---

## Organization Members

Membership defines:

- Organization access
- User role
- Permissions

Example roles:

- Owner
- Admin
- Manager
- Agent
- Viewer

---

# Connect Relationships

## Contacts

Organization

has many

Contacts

---

## Conversations

Contact

has many

Conversations

---

## Messages

Conversation

has many

Messages

---

# Support Relationships

## Tickets

Organization

has many

Tickets

---

## Ticket Messages

Ticket

has many

Ticket Messages

---

## Knowledge Articles

Organization

has many

Knowledge Articles

Knowledge articles may provide context for:

- Human agents
- AI assistants
- Customer self-service

---

# Sentinel Relationships

Sentinel consumes operational data.

Sentinel does not own source records.

Example:

Connect Conversations
|
|
v

Sentinel Analysis

Support Tickets
|
|
v

Sentinel Analysis

---

## Findings

Organization

has many

Findings

Findings reference analyzed platform activity.

---

## Recommendations

Finding

creates

Recommendation

---

## Reports

Organization

has many

Reports

---

# Shared Infrastructure Relationships

## Events

Events capture important platform activity.

Example:

Conversation Created

Ticket Resolved

Knowledge Updated

Analysis Completed

Events may be consumed by:

- Sentinel
- Analytics
- Automation systems

---

## AI Jobs

AI processing tasks are tracked centrally.

Examples:

- Summarization
- Classification
- Embeddings
- Analysis

---

# Data Flow

The platform data flow:

Customer Interaction

    |
    v

Connect

    |
    v

Support Operations

    |
    v

Sentinel Intelligence

    |
    v

Recommendations

    |
    v

Business Improvement

---

# Design Principles

## Source Data Ownership

Operational modules own source data.

Examples:

Connect owns conversations.

Support owns tickets.

---

## Intelligence Separation

Sentinel analyzes data but does not become the owner of operational records.

---

## Organization Isolation

All business data must respect organization boundaries.

---

# Future Expansion

Future modules should follow the same pattern:

Module

owns operational data

produces events

can be analyzed by Sentinel

This allows Platform to grow without redesigning the database.
