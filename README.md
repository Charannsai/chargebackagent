# Razorpay Agentic Chargeback Resolver

Autonomous payment dispute investigation and representment system built with Next.js, TypeScript, Groq LLM tool calling, and a guardrailed agent state machine.

---

## Table of Contents

1. [Overview](#overview)
2. [Problem Context and Operational Cost](#problem-context-and-operational-cost)
3. [Core Architecture and Design Principles](#core-architecture-and-design-principles)
   - [Guardrailed Agent State Machine vs. Unconstrained LLMs](#guardrailed-agent-state-machine-vs-unconstrained-llms)
   - [Human-in-the-Loop (HITL) Safety Guardrails](#human-in-the-loop-hitl-safety-guardrails)
   - [Merchant Health and Card Network Compliance](#merchant-health-and-card-network-compliance)
4. [Autonomous Investigation Lifecycle and Tooling](#autonomous-investigation-lifecycle-and-tooling)
   - [Lifecycle Stages](#lifecycle-stages)
   - [Registered Agent Tools](#registered-agent-tools)
5. [Benchmark Case Studies](#benchmark-case-studies)
6. [System Architecture and Technical Stack](#system-architecture-and-technical-stack)
   - [Technology Stack](#technology-stack)
   - [API Reference](#api-reference)
   - [Database Schema](#database-schema)
7. [Production Architecture Roadmap](#production-architecture-roadmap)
8. [Local Development and Setup](#local-development-and-setup)

---

## Overview

The Razorpay Agentic Chargeback Resolver is an autonomous risk and operations system designed to automate the manual investigation cycle for payment disputes and chargebacks.

When a cardholder files a dispute with their issuing bank, merchant operations teams typically have a strict window (often 7 to 14 calendar days) to compile evidence, determine whether the dispute is legitimate or fraudulent, and assemble a formal representment rebuttal.

This system replaces manual data collection across disjointed portals with an autonomous tool-calling agent. The agent inspects transaction records, verifies carrier delivery telemetry and signatures, evaluates customer behavioral risk profiles, and drafts formal representment packages with full evidence citations. Every action is executed within deterministic guardrails, streamed in real time via Server-Sent Events (SSE), and preserved in an immutable audit trail requiring operator sign-off before submission.

---

## Problem Context and Operational Cost

### The Manual Investigation Bottleneck

In standard payment operations, investigating a single chargeback requires a human analyst to manually gather and reconcile records across multiple disconnected systems:

1. **Payment Gateway Ledgers:** Verifying payment authorization codes, settlement timestamps, card network tokens, and 3D-Secure (3DS) authentication status.
2. **Third-Party Logistics (3PL) Portals:** Querying courier APIs (e.g., BlueDart, Delhivery, Shadowfax) for Proof of Delivery (POD), delivery timestamps, recipient signatures, and GPS geofence confirmations.
3. **Customer Relationship and Risk Systems:** Reviewing account tenure, historical chargeback counts, lifetime order volume, and device fingerprints.
4. **Card Scheme Compliance Portals:** Drafting rebuttal letters tailored to scheme-specific compelling evidence rules (such as Visa Compelling Evidence 3.0 / CE3.0 or Mastercard dispute reason code guidelines).

This manual workflow causes operational friction:
- **High Operational Latency:** Average resolution times can span 24 to 48 hours per disputed case.
- **Risk of Default Loss:** Missing strict network response deadlines results in an automatic, non-appealable loss of funds plus scheme dispute fees.
- **Inconsistent Evidence Quality:** Human error in assembling evidence packages leads to avoidable representment losses.

### Operational Objectives

The Agentic Chargeback Resolver addresses these bottlenecks by:
- Reducing evidence collection and analysis time from hours to seconds.
- Enforcing consistent evidence standards across all dispute categories.
- Providing human operators with a single unified interface containing complete telemetry traces, confidence scores, and pre-drafted rebuttal letters.

---

## Core Architecture and Design Principles

### Guardrailed Agent State Machine vs. Unconstrained LLMs

Unconstrained LLMs and generic chatbot interfaces are unsuitable for financial operations due to hallucination risks, non-deterministic outputs, and lack of verifiable auditability.

While the LLM dynamically decides which investigative tool to dispatch next based on accumulated evidence, the entire environment around it is guardrailed: tool schemas, parameter validation, tool execution, safety boundaries, state transitions, and evidence compilation are deterministic.

```
+-------------------------------------------------------------------+
|                        DISPUTE INTAKE                             |
|  (Dispute Reason, Transaction ID, Amount, Customer Metadata, ARN) |
+---------------------------------+---------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                   GROQ LLM REASONING ENGINE                       |
|           (Llama 3.3 70B Versatile / JSON Tool Calling)           |
+-------------------+---------------------------+-------------------+
                    |                           ^
      Tool Calls    |                           |  Tool Results
      (JSON Schema) |                           |  (Structured JSON)
                    v                           |
+-------------------------------------------------------------------+
|               DETERMINISTIC TOOL DISPATCH LAYER                   |
|   - get_transaction_details      - get_user_behavior_profile      |
|   - verify_delivery_courier      - calculate_risk_score           |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                    DECISION SYNTHESIS LAYER                       |
|   - Evidence Scoring (High / Moderate / Low)                      |
|   - Corroborating and Contradictory Signal Classification        |
|   - Formal Representment Letter and Exhibit Construction          |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|              HUMAN-IN-THE-LOOP (HITL) GUARDRAIL                   |
|   - Operator Review of Step-by-Step Live Telemetry Trace         |
|   - Actions: Approve & Submit | Override | Rerun with Guidance    |
+-------------------------------------------------------------------+
```

Key characteristics:
- **Constrained Tool Schemas:** The LLM does not generate free-form actions. It chooses exclusively from strictly typed JSON tool schemas.
- **Deterministic Tool Execution:** Tool implementations execute deterministic data lookups and mathematical risk calculations. The LLM receives verified factual payloads.
- **Bounded Iteration Loop:** The agent loop is constrained to a maximum of 5 iterations. If the agent fails to converge or encounters missing data, it safely terminates and flags the dispute for human escalation.
- **Zero-Friction Fallback:** If live Groq API access is unavailable or unconfigured, the system automatically falls back to an internal deterministic operations simulation engine to ensure uninterrupted evaluation.

### Human-in-the-Loop (HITL) Safety Guardrails

Fully autonomous execution in financial dispute resolution introduces compliance and liability risks. The system is architected as an operator copilot rather than an unmonitored autopilot:

1. **Suspended State:** Upon completing an investigation, the dispute remains in a `PENDING` state. Representment packages are never submitted to card networks automatically.
2. **Complete Trace Inspection:** Operators can inspect the exact sequence of tools called, arguments supplied, raw JSON responses, and execution latency.
3. **Explicit Operator Actions:**
   - **Approve and Submit:** Commits the agent verdict and representment dossier to the audit log and updates the dispute status.
   - **Override Verdict:** Enables the operator to change the resolution verdict (e.g., from `REPRESENT_DISPUTE` to `ACCEPT_REFUND` or `ESCALATE_TO_HUMAN`) with mandatory operational justification notes.
   - **Rerun with Guidance:** Allows the operator to provide contextual hints (e.g., *"Re-evaluate focusing on OTP timestamp mismatch"*), prompting the agent to re-execute its reasoning loop with the injected prompt context.

### Merchant Health and Card Network Compliance

Excessive chargeback rates threaten a merchant's payment processing capabilities:
- **Card Scheme Monitoring Programs:** Visa (VAMP / VFMP) and Mastercard (ECP) enforce strict dispute-to-transaction thresholds (typically 0.9% to 1.5% dispute ratio). Exceeding these limits results in fines and potential merchant account termination.
- **Strategic Refund vs. Representment Decisions:** Defending every chargeback is not always optimal. When clear indicators of Account Takeover (ATO) or stolen card usage exist, contesting the dispute is counterproductive. The agent identifies identity fraud cases and recommends immediate refund acceptance to minimize network penalties.

---

## Autonomous Investigation Lifecycle and Tooling

### Lifecycle Stages

1. **Intake & Hydration:** Ingestion of dispute parameters including Acquirer Reference Number (ARN), card network (Visa, Mastercard, RuPay), dispute reason code, and disputed amount.
2. **Autonomous Tool Dispatch:** The reasoning engine inspects intake data and dynamically calls relevant tools based on dispute category and intermediate results.
3. **Evidence Correlation & Heuristics:** Correlating logistics records, delivery signatures, GPS coordinates, 3DS authentication logs, and customer transaction history.
4. **Synthesis & Package Compilation:** Computing evidence strength ratings, itemizing corroborating and contradictory signals, and generating a formal rebuttal letter.
5. **Operator Review & Audit Logging:** Displaying the finalized resolution package in the operator dashboard for verification, override, or submission.

### Registered Agent Tools

| Tool Name | Parameters | Description |
| :--- | :--- | :--- |
| `get_transaction_details` | `transaction_id: string` | Retrieves transaction metadata, settlement status, gateway response codes, 3DS 2.0 authentication verification, card last 4 digits, billing and shipping addresses, IP country, and proxy flags. |
| `get_user_behavior_profile` | `email: string` | Retrieves customer account tenure, lifetime purchase volume, historical dispute count, dispute ratio, registered device IDs, and risk flag. |
| `verify_delivery_courier` | `tracking_number: string`, `carrier?: string` | Queries logistics telemetry for delivery status, Proof of Delivery (POD) signature, OTP verification record, GPS coordinates, and carrier transit event history. |
| `calculate_risk_score` | `user_id: string`, `transaction_id: string` | Computes a composite risk score (0 to 100) based on proxy/Tor detection, IP mismatch against known customer location, 3DS authentication enrollment, account age, and prior chargeback history. |

---

## Benchmark Case Studies

The system includes pre-configured seed scenarios representing real-world payment dispute types:

### 1. Friendly Fraud (INR 14,999.00)
- **Dispute ID:** `disp_01H9A_FRIENDLY`
- **Claim:** Cardholder claimed non-receipt of a consumer electronics order (Sony WH-1000XM5 headphones).
- **Investigation Trace:**
  - `get_transaction_details` confirmed successful settlement with 3DS 2.0 two-factor authentication.
  - `verify_delivery_courier` retrieved BlueDart logistics records confirming delivery to the cardholder address with digital recipient signature and verified OTP.
  - `get_user_behavior_profile` confirmed clean customer history with 34 prior orders and 0 disputes.
- **Agent Verdict:** `REPRESENT_DISPUTE` (Confidence: 96%, Evidence Strength: `HIGH`).
- **Outcome:** Generated formal representment letter citing 3DS authentication stamps, carrier AWB tracking, and signed OTP proof.

### 2. Account Takeover / Identity Fraud (INR 48,500.00)
- **Dispute ID:** `disp_02B8K_IDENTITY_FRAUD`
- **Claim:** Cardholder reported unauthorized transaction for a luxury timepiece.
- **Investigation Trace:**
  - `get_transaction_details` revealed the order originated from a German Tor exit node IP and 3DS authentication was bypassed.
  - `get_user_behavior_profile` and `calculate_risk_score` showed an account created <48 hours prior with multiple unrepresented chargebacks.
  - `verify_delivery_courier` showed carrier delivery failed and Return to Origin (RTO) was initiated.
- **Agent Verdict:** `ACCEPT_REFUND` (Confidence: 94%, Evidence Strength: `HIGH`).
- **Outcome:** Recommended immediate dispute acceptance and refund to preserve merchant dispute ratios and prevent scheme fines.

### 3. Logistics Stall / Transit Delay (INR 32,000.00)
- **Dispute ID:** `disp_03C4M_LOGISTICS_STALL`
- **Claim:** Cardholder reported non-delivery of handcrafted silk merchandise after 25 days.
- **Investigation Trace:**
  - `get_transaction_details` confirmed valid payment settlement and 3DS authentication.
  - `verify_delivery_courier` revealed the parcel had been stalled at a carrier transit sorting hub for >20 days without a delivery scan.
- **Agent Verdict:** `ESCALATE_TO_HUMAN` (Confidence: 88%, Evidence Strength: `MODERATE`).
- **Outcome:** Flagged for operations desk intervention to initiate carrier lost-in-transit tracing before contesting.

### 4. Digital Goods / Recurring SaaS Subscription (INR 4,499.00)
- **Dispute ID:** `disp_04D9Z_SAAS_SUBSCRIPTION`
- **Claim:** Cardholder filed unrecognized recurring charge dispute for cloud developer tooling access.
- **Investigation Trace:**
  - `get_transaction_details` verified recurring corporate card billing with 3DS authentication.
  - Telemetry logs confirmed 18 authenticated developer console sessions from the customer primary IP post-billing.
- **Agent Verdict:** `REPRESENT_DISPUTE` (Confidence: 91%, Evidence Strength: `HIGH`).
- **Outcome:** Assembled representment dossier containing authenticated session timestamps and terms of service renewal consent.

---

## System Architecture and Technical Stack

### Technology Stack

- **Application Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Styling & Design System:** Tailwind CSS, Lucide React icons, Inter & JetBrains Mono typography
- **LLM Reasoning Engine:** Groq SDK (`llama-3.3-70b-versatile`) with JSON tool-calling support
- **Streaming Pipeline:** Server-Sent Events (SSE) via Web Streams API
- **Data Persistence:** In-memory stateful store with complete PostgreSQL / Supabase schema

### API Reference

#### 1. Agent Investigation Stream
- **Endpoint:** `POST /api/agent/investigate`
- **Content-Type:** `application/json` -> `text/event-stream`
- **Request Body:**
  ```json
  {
    "disputeId": "disp_01H9A_FRIENDLY",
    "engineMode": "groq",
    "operatorGuidance": "Optional operator instruction string"
  }
  ```
- **Stream Events:**
  - `event: step` — Emitted for each state transition (`INVESTIGATION_STARTED`, `TOOL_INVOKED`, `TOOL_COMPLETED`, `EVALUATING`, `DECISION_READY`).
  - `event: complete` — Emitted upon completion with the finalized `AgentRun` payload.
  - `event: error` — Emitted on failure.

#### 2. Disputes Management
- **`GET /api/disputes`**: Lists all active disputes with summary metrics.
- **`GET /api/disputes?id={disputeId}`**: Retrieves a specific dispute with associated transaction, customer profile, and historical agent runs.
- **`PATCH /api/disputes`**: Submits operator review decisions:
  ```json
  {
    "disputeId": "disp_01H9A_FRIENDLY",
    "runId": "run_1723481928_ab12c",
    "action": "APPROVED",
    "overrideVerdict": null,
    "notes": "Reviewed BlueDart POD and OTP match. Representment approved."
  }
  ```
- **`POST /api/disputes`**: Ingests custom dispute simulation scenarios or resets store to seed defaults (`{ "action": "reset" }`).

#### 3. Audit Trail
- **`GET /api/audit?disputeId={disputeId}`**: Retrieves all historical runs and steps for a dispute.
- **`GET /api/audit?runId={runId}`**: Retrieves detailed step execution logs for a specific run.

#### 4. Health Check
- **`GET /api/health`**: Returns system operational status, Groq API key configuration status, and active store statistics.

### Database Schema

The database schema (`supabase/schema.sql`) defines relational tables for complete auditability:

```sql
-- Disputes Table
create table disputes (
  id varchar(100) primary key,
  transaction_id varchar(100) not null,
  user_id varchar(100) not null,
  amount numeric(12, 2) not null,
  currency varchar(3) default 'INR',
  reason varchar(100) not null,
  status varchar(50) default 'PENDING',
  customer_name varchar(255) not null,
  customer_email varchar(255) not null,
  merchant_name varchar(255) not null,
  arn varchar(100) not null,
  network varchar(50) default 'Visa',
  dispute_date timestamp with time zone default now(),
  due_date timestamp with time zone not null,
  notes text,
  latest_run_id varchar(100),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Agent Runs (Audit Record)
create table agent_runs (
  id varchar(100) primary key,
  dispute_id varchar(100) references disputes(id) on delete cascade,
  started_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  model varchar(100) not null,
  engine_mode varchar(50) default 'groq',
  iterations int default 0,
  final_verdict varchar(50),
  confidence_score numeric(5, 2),
  evaluation jsonb,
  representment_package jsonb,
  human_action varchar(50) default 'PENDING',
  human_override_verdict varchar(50),
  human_notes text,
  reviewed_at timestamp with time zone
);

-- Agent Steps (Telemetry Log)
create table agent_steps (
  id varchar(100) primary key,
  agent_run_id varchar(100) references agent_runs(id) on delete cascade,
  sequence int not null,
  event_type varchar(50) not null,
  label text not null,
  tool_name varchar(100),
  arguments jsonb,
  result jsonb,
  latency_ms int default 0,
  timestamp timestamp with time zone default now()
);
```

---

## Production Architecture Roadmap

This prototype demonstrates autonomous reasoning and streaming UI over synthetic dispute and logistics data. A production deployment involves the following integrations:

1. **Card Network Representment Gateways:**
   - Visa VROL (Visa Resolve Online) direct API integration.
   - Mastercard MasterCom API integration.
   - RuPay DMS (Dispute Management System) integration.
2. **Live Logistics Telemetry Ingestion:**
   - Webhook and polling integrations with national and global carrier APIs (Delhivery, BlueDart, Shadowfax, DTDC, FedEx, DHL).
3. **Gateway Event Ingestion:**
   - Real-time webhook handlers for chargeback notifications (`dispute.created`, `dispute.evidence_required`, `dispute.won`, `dispute.lost`).
4. **Compliance & Evidence Storage:**
   - S3-compatible encrypted object storage for signed POD PDFs, customer communication logs, and signed transaction receipts with SHA-256 integrity hashing.

---

## Local Development and Setup

### Prerequisites

- Node.js 18.17.0 or higher
- npm 9.0.0 or higher

### 1. Installation

Clone the repository and install project dependencies:

```bash
git clone https://github.com/Charannsai/chargebackagent.git
cd chargebackagent
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Configure your environment variables:

```env
# Groq API Key (Optional: system uses deterministic simulator if not provided)
GROQ_API_KEY=gsk_your_groq_api_key_here

# Supabase Configuration (Optional: defaults to in-memory store)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Running the Development Server

Start the local Next.js development server:

```bash
npm run dev
```

The application will be accessible at [http://localhost:3000](http://localhost:3000).

### 4. Building for Production

To create an optimized production build:

```bash
npm run build
npm run start
```
