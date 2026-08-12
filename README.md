# Razorpay Agentic Chargeback Resolver

**Target Role:** AI Builder (Razorpay)  
**Author:** Charan Sai Pathuri  
**Architecture:** Autonomous Agent State Machine (Groq / Llama 3.3 70B & Dynamic Operations Engine)

---

## ⚡ Overview
The **Razorpay Agentic Chargeback Resolver** is an autonomous risk-and-operations AI specialist designed to eliminate the high-cost, 48-hour manual investigation cycle for payment disputes and chargebacks.

Instead of hardcoded rules or rigid workflows, the agent uses a **dynamic LLM tool-calling state machine** to autonomously inspect transaction logs, verify carrier delivery signatures, analyze customer risk profiles, evaluate evidence strength, and assemble representment dossiers with full human-in-the-loop oversight and auditability.

---

## 🚀 Key Highlights & Architectural Innovations

### 1. Dynamic Agent Loop (Zero Rigid Pipelines)
- Powered by **Groq (`llama-3.3-70b-versatile`)** for ultra-fast, high-accuracy tool calling.
- The LLM autonomously inspects dispute intake parameters and chooses which investigative tools to dispatch based on evidence collected at each step.
- Built without bulky abstractions (LangChain/LangGraph) to demonstrate raw engineering control over state loops, termination bounds, and payload validation.

### 2. Operational Decision Trace (Not Private Chain-of-Thought)
- Transparent step-by-step activity feed designed specifically for operations specialists:
  - `INVESTIGATION STARTED`
  - `✓ Transaction retrieved (200_SUCCESS_SETTLED)`
  - `✓ Delivery evidence verified (BlueDart DELIVERED, OTP Signature matched)`
  - `✓ Customer history checked (0 prior chargebacks, 34 lifetime orders)`
  - `✓ Risk calculated (Score 15/100, LOW Tier)`
  - `→ Evaluating evidence & synthesizing package`
  - `✓ Decision package finalized (REPRESENT_DISPUTE, 96% Confidence)`
- Real-time Server-Sent Events (SSE) streaming with millisecond latency tags and expandable JSON payload inspectors.

### 3. "Why this decision?" Evidence Assessment Panel
- Clear, operational evidence breakdown:
  - **Evidence Strength:** High / Moderate / Low
  - **Corroborating Signals:** Bulleted verifiable signals (`✓ Delivery geofence matched`, `✓ 3DS 2.0 authenticated`, etc.)
  - **Contradictory / Risk Flags:** Highlights discrepancies or proxy anomalies.
  - **Operational Summary:** Concise executive brief for compliance review.

### 4. Enterprise-Grade Audit Trail
- Every action the agent takes is 100% auditable:
  - `agent_runs` and `agent_steps` schema records every timestamp, tool invocation, argument, response, model version, and human review decision.
  - Interactive **Audit Trail Viewer** modal to inspect historic runs and parameter diffs.

### 5. Human-in-the-Loop Decision Workshop
- Operators can:
  - **Approve & Submit:** Commits representment package to card network.
  - **Override Verdict:** Switch between Represent, Refund, or Escalate with custom operational notes.
  - **Rerun with Guidance:** Dynamically inject prompt instructions (e.g. *"Re-evaluate focusing on OTP timestamp"*).

---

## 🔬 Benchmark Case Studies Included

1. **Case 1: Friendly Fraud (INR 14,999)**
   - *Claim:* Customer reported "Product Not Received".
   - *Agent Action:* Calls transaction API -> Queries BlueDart courier API -> Finds POD signature with verified OTP -> Recommends: **Represent Dispute (Reject Customer Claim)** with 96% confidence.
2. **Case 2: Account Takeover / Stolen Card Fraud (INR 48,500)**
   - *Claim:* Unauthorized transaction.
   - *Agent Action:* Calls transaction API -> Detects foreign Tor exit node + 3DS bypass -> Calls risk engine -> High chargeback history -> Recommends: **Accept Dispute / Full Refund** to protect merchant chargeback ratio.
3. **Case 3: Courier Delay / Stalled in Transit (INR 32,000)**
   - *Claim:* Product not received.
   - *Agent Action:* Calls courier API -> Discovers package stalled in transit sorting hub for >20 days -> Recommends: **Escalate to Operations Desk**.
4. **Case 4: Digital SaaS License (INR 4,499)**
   - *Claim:* Unrecognized subscription charge.
   - *Agent Action:* Analyzes user session activity -> Confirms 18 authenticated logins post-settlement -> Recommends: **Represent Dispute**.

---

## 🛠 Tech Stack
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Design System:** Minimal, calm aesthetic (pure white `#FFFFFF`, soft slate/charcoal `#09090B`, subtle luminous lime green accents `#84CC16`, Google Fonts **Inter** and **JetBrains Mono**)
- **LLM Engine:** Groq API (`llama-3.3-70b-versatile`) with automatic zero-friction fallback to high-fidelity Deterministic Operations Simulator
- **Database & Persistence:** In-memory stateful store with Supabase PostgreSQL schema (`supabase/schema.sql`)
- **Streaming:** Server-Sent Events (SSE) via Web Streams API

---

## 🏁 Getting Started

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Configure Environment (Optional)
To use live Groq LLM tool calling, add your key to `.env.local`:
\`\`\`env
GROQ_API_KEY=gsk_your_groq_api_key_here
\`\`\`
*(Note: If no API key is provided, the application runs seamlessly out-of-the-box in Deterministic Demo Mode).*

### 3. Run Development Server
\`\`\`bash
npm run dev
\`\`\`
Open [http://localhost:3000](http://localhost:3000) in your browser.
