import Groq from 'groq-sdk';
import {
  Dispute,
  AgentRun,
  AgentStep,
  AgentVerdict,
  EvidenceEvaluation,
  RepresentmentPackage,
  StepEventType,
} from '../types';
import { mockStore } from '../mock-data';
import { AGENT_TOOLS_SCHEMA, executeAgentTool } from './tools';
import { SYSTEM_PROMPT, buildDisputeIntakePrompt } from './prompts';

export interface InvestigationOptions {
  disputeId: string;
  engineMode?: 'groq' | 'demo';
  operatorGuidance?: string;
  onStep?: (step: AgentStep) => void;
}

export async function runAgentInvestigation(
  options: InvestigationOptions
): Promise<AgentRun> {
  const { disputeId, operatorGuidance, onStep } = options;
  const dispute = mockStore.getDispute(disputeId);
  if (!dispute) {
    throw new Error(`Dispute not found: ${disputeId}`);
  }

  const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const groqApiKey = process.env.GROQ_API_KEY;
  const isGroqAvailable = Boolean(groqApiKey && groqApiKey.trim().length > 0);
  const selectedEngine = (options.engineMode === 'groq' && isGroqAvailable) ? 'groq' : 'demo';

  const run: AgentRun = {
    id: runId,
    dispute_id: dispute.id,
    started_at: new Date().toISOString(),
    model: selectedEngine === 'groq' ? 'llama-3.3-70b-versatile (Groq)' : 'Deterministic Operations Simulator',
    engine_mode: selectedEngine,
    iterations: 0,
    steps: [],
  };

  let sequence = 1;

  const emitStep = (
    eventType: StepEventType,
    label: string,
    toolName?: string,
    args?: Record<string, unknown>,
    result?: Record<string, unknown>,
    latencyMs: number = 0
  ): AgentStep => {
    const step: AgentStep = {
      id: `step_${runId}_${sequence++}`,
      agent_run_id: runId,
      sequence: sequence - 1,
      event_type: eventType,
      label,
      tool_name: toolName,
      arguments: args,
      result,
      latency_ms: latencyMs,
      timestamp: new Date().toISOString(),
    };
    run.steps.push(step);
    if (onStep) {
      onStep(step);
    }
    return step;
  };

  // 1. Initial State: Investigation Started
  emitStep('INVESTIGATION_STARTED', `Investigation initiated for Dispute ${dispute.id} (${dispute.reason})`);

  if (selectedEngine === 'groq' && groqApiKey) {
    try {
      await runGroqAutonomousLoop(dispute, run, emitStep, groqApiKey, operatorGuidance);
    } catch (err: any) {
      console.warn('Groq API execution error, falling back to dynamic deterministic runner:', err.message);
      emitStep(
        'TOOL_COMPLETED',
        `Live Groq API notice: ${err.message}. Switching to deterministic engine fallback.`,
        undefined,
        undefined,
        { fallback: true }
      );
      await runDeterministicEngine(dispute, run, emitStep, operatorGuidance);
    }
  } else {
    // Run high-fidelity deterministic engine
    await runDeterministicEngine(dispute, run, emitStep, operatorGuidance);
  }

  run.completed_at = new Date().toISOString();
  mockStore.saveAgentRun(run);
  return run;
}

// ========================================================
// Groq Live Autonomous Tool-Calling State Machine
// ========================================================

async function runGroqAutonomousLoop(
  dispute: Dispute,
  run: AgentRun,
  emitStep: (
    eventType: StepEventType,
    label: string,
    toolName?: string,
    args?: Record<string, unknown>,
    result?: Record<string, unknown>,
    latencyMs?: number
  ) => AgentStep,
  groqApiKey: string,
  operatorGuidance?: string
): Promise<void> {
  const groq = new Groq({ apiKey: groqApiKey });
  const messages: any[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildDisputeIntakePrompt(dispute, operatorGuidance) },
  ];

  let iterations = 0;
  const maxIterations = 5;

  while (iterations < maxIterations) {
    iterations++;
    run.iterations = iterations;

    const startTime = Date.now();
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      tools: AGENT_TOOLS_SCHEMA,
      tool_choice: 'auto',
      temperature: 0.1,
      max_tokens: 1800,
    });

    const choice = response.choices[0];
    const message = choice.message;
    messages.push(message);

    // If LLM wants to call tools
    if (message.tool_calls && message.tool_calls.length > 0) {
      for (const toolCall of message.tool_calls) {
        const toolName = toolCall.function.name;
        let args: Record<string, any> = {};
        try {
          args = JSON.parse(toolCall.function.arguments);
        } catch {
          args = {};
        }

        emitStep(
          'TOOL_INVOKED',
          `Invoking tool: ${toolName}`,
          toolName,
          args
        );

        const toolStart = Date.now();
        const toolResult = await executeAgentTool(toolName, args);
        const latencyMs = Date.now() - toolStart;

        emitStep(
          'TOOL_COMPLETED',
          `✓ ${toolResult.label}`,
          toolName,
          args,
          toolResult.data,
          latencyMs
        );

        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult.data),
        });
      }
    } else if (message.content) {
      // LLM has completed tool investigations and returned final verdict
      emitStep('EVALUATING', 'Evaluating gathered evidence and synthesizing representment package...');

      const parsed = extractJsonFromResponse(message.content);
      if (parsed && parsed.verdict) {
        run.final_verdict = parsed.verdict as AgentVerdict;
        run.confidence_score = parsed.confidence_score || 90;
        run.evaluation = parsed.evidence_evaluation;
        run.representment_package = parsed.representment_package;
      } else {
        // Fallback parsing if JSON wasn't cleanly returned
        run.final_verdict = 'ESCALATE_TO_HUMAN';
        run.confidence_score = 70;
        run.evaluation = {
          evidence_strength: 'MODERATE',
          corroborating_signals: ['LLM completed investigation.'],
          contradictory_signals: [],
          missing_evidence: ['Non-standard response format'],
          operational_summary: message.content.substring(0, 300),
        };
      }

      emitStep(
        'DECISION_READY',
        `✓ Decision package finalized: ${run.final_verdict} (${run.confidence_score}% Confidence)`,
        undefined,
        undefined,
        {
          verdict: run.final_verdict,
          confidence: run.confidence_score,
          strength: run.evaluation?.evidence_strength,
        }
      );
      break;
    }
  }
}

// ========================================================
// Dynamic Deterministic Engine
// (Ensures zero-friction demo & reliable sandbox testing)
// ========================================================

async function runDeterministicEngine(
  dispute: Dispute,
  run: AgentRun,
  emitStep: (
    eventType: StepEventType,
    label: string,
    toolName?: string,
    args?: Record<string, unknown>,
    result?: Record<string, unknown>,
    latencyMs?: number
  ) => AgentStep,
  operatorGuidance?: string
): Promise<void> {
  const tx = mockStore.getTransaction(dispute.transaction_id);
  const user = mockStore.getUserProfileById(dispute.user_id) || mockStore.getUserProfileByEmail(dispute.customer_email);

  // Helper for realistic pacing
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Step 1: Query transaction details
  emitStep('TOOL_INVOKED', 'Invoking tool: get_transaction_details', 'get_transaction_details', {
    transaction_id: dispute.transaction_id,
  });
  await delay(250);
  const txResult = await executeAgentTool('get_transaction_details', { transaction_id: dispute.transaction_id });
  emitStep(
    'TOOL_COMPLETED',
    `✓ ${txResult.label}`,
    'get_transaction_details',
    { transaction_id: dispute.transaction_id },
    txResult.data,
    140
  );

  // Dynamically branch based on dispute reason & evidence
  if (dispute.reason === 'PRODUCT_NOT_RECEIVED') {
    // Step 2: Check delivery evidence if tracking exists
    if (tx?.shipping_tracking_no) {
      emitStep('TOOL_INVOKED', 'Invoking tool: verify_delivery_courier', 'verify_delivery_courier', {
        tracking_number: tx.shipping_tracking_no,
        carrier: tx.shipping_carrier,
      });
      await delay(300);
      const courierResult = await executeAgentTool('verify_delivery_courier', {
        tracking_number: tx.shipping_tracking_no,
        carrier: tx.shipping_carrier,
      });
      emitStep(
        'TOOL_COMPLETED',
        `✓ ${courierResult.label}`,
        'verify_delivery_courier',
        { tracking_number: tx.shipping_tracking_no },
        courierResult.data,
        185
      );

      // Step 3: Check customer history
      emitStep('TOOL_INVOKED', 'Invoking tool: get_user_behavior_profile', 'get_user_behavior_profile', {
        email: dispute.customer_email,
      });
      await delay(200);
      const profileResult = await executeAgentTool('get_user_behavior_profile', { email: dispute.customer_email });
      emitStep(
        'TOOL_COMPLETED',
        `✓ ${profileResult.label}`,
        'get_user_behavior_profile',
        { email: dispute.customer_email },
        profileResult.data,
        95
      );

      emitStep('EVALUATING', 'Evaluating logistics telemetry, geofence records, and customer dispute history...');
      await delay(350);

      const logistics = mockStore.getLogisticsRecord(tx.shipping_tracking_no);
      if (logistics?.status === 'DELIVERED') {
        // Case 1: Friendly Fraud -> Represent
        run.final_verdict = 'REPRESENT_DISPUTE';
        run.confidence_score = 96;
        run.evaluation = {
          evidence_strength: 'HIGH',
          corroborating_signals: [
            `Shipment verified delivered on ${logistics.delivered_at || '2026-08-04'} via ${logistics.carrier}`,
            `Digital recipient signature captured: "${logistics.signature_name}"`,
            `Delivery GPS coordinates match cardholder shipping address geofence`,
            `Payment authorization passed 3D-Secure 2.0 two-factor authentication`,
            `Cardholder has 0 prior dispute records across ${user?.total_orders_count || 34} transactions`,
          ],
          contradictory_signals: [],
          missing_evidence: [],
          operational_summary:
            'Comprehensive representment evidence established. Courier telemetry and signature proof conclusively refute the customer claim of non-delivery.',
        };
        run.representment_package = {
          recommended_action: 'REPRESENT_DISPUTE',
          rebuttal_letter: generateRebuttalLetter(dispute, tx, logistics, user, 'REPRESENT_DISPUTE'),
          key_exhibits: [
            {
              title: `${logistics.carrier} Proof of Delivery (POD)`,
              category: 'DELIVERY_PROOF',
              summary: `Delivered to registered address with signature "${logistics.signature_name}" and GPS match.`,
              raw_reference_id: logistics.tracking_number,
            },
            {
              title: '3DS 2.0 Gateway Authentication Stamp',
              category: 'AUTH_LOGS',
              summary: `Transaction ${tx.id} settled with full two-factor cardholder authentication.`,
              raw_reference_id: tx.gateway_reference,
            },
          ],
        };
      } else {
        // Case 3: Logistics stalled in transit -> Escalate
        run.final_verdict = 'ESCALATE_TO_HUMAN';
        run.confidence_score = 88;
        run.evaluation = {
          evidence_strength: 'MODERATE',
          corroborating_signals: [
            `Cardholder has a clean payment history with low risk tier`,
            `Gateway payment 3DS authenticated successfully`,
          ],
          contradictory_signals: [
            `Carrier tracking indicates package stalled in transit for >20 days without delivery confirmation`,
            `No delivery signature captured`,
          ],
          missing_evidence: ['Final carrier delivery confirmation / Lost-in-transit declaration'],
          operational_summary:
            'Shipment appears delayed or lost in transit at transit sorting facility. Manual coordination with courier partner required before representment.',
        };
        run.representment_package = {
          recommended_action: 'ESCALATE_TO_HUMAN',
          rebuttal_letter: generateRebuttalLetter(dispute, tx, logistics, user, 'ESCALATE_TO_HUMAN'),
          key_exhibits: [
            {
              title: 'Carrier Stalled Telemetry Scan',
              category: 'DELIVERY_PROOF',
              summary: `Tracking ${tx.shipping_tracking_no} stuck in transit status.`,
            },
          ],
        };
      }
    }
  } else if (dispute.reason === 'FRAUDULENT_TRANSACTION') {
    // Case 2: Identity fraud
    emitStep('TOOL_INVOKED', 'Invoking tool: get_user_behavior_profile', 'get_user_behavior_profile', {
      email: dispute.customer_email,
    });
    await delay(250);
    const profileResult = await executeAgentTool('get_user_behavior_profile', { email: dispute.customer_email });
    emitStep(
      'TOOL_COMPLETED',
      `✓ ${profileResult.label}`,
      'get_user_behavior_profile',
      { email: dispute.customer_email },
      profileResult.data,
      110
    );

    emitStep('TOOL_INVOKED', 'Invoking tool: calculate_risk_score', 'calculate_risk_score', {
      user_id: dispute.user_id,
      transaction_id: dispute.transaction_id,
    });
    await delay(300);
    const riskResult = await executeAgentTool('calculate_risk_score', {
      user_id: dispute.user_id,
      transaction_id: dispute.transaction_id,
    });
    emitStep(
      'TOOL_COMPLETED',
      `✓ ${riskResult.label}`,
      'calculate_risk_score',
      { user_id: dispute.user_id },
      riskResult.data,
      160
    );

    if (tx?.shipping_tracking_no) {
      const courierResult = await executeAgentTool('verify_delivery_courier', {
        tracking_number: tx.shipping_tracking_no,
      });
      emitStep(
        'TOOL_COMPLETED',
        `✓ ${courierResult.label}`,
        'verify_delivery_courier',
        { tracking_number: tx.shipping_tracking_no },
        courierResult.data,
        140
      );
    }

    emitStep('EVALUATING', 'Evaluating fraud markers, proxy headers, and chargeback velocity...');
    await delay(350);

    run.final_verdict = 'ACCEPT_REFUND';
    run.confidence_score = 94;
    run.evaluation = {
      evidence_strength: 'HIGH',
      corroborating_signals: [
        `IP Geolocation mismatch: Transaction originated from foreign proxy / Tor node (${tx?.ip_country || 'Unknown'})`,
        `Account tenure anomaly: User account created <48h prior to high-value transaction`,
        `User profile has ${user?.chargeback_history_count || 3} prior unrepresented chargebacks`,
        `3D-Secure authentication was NOT enrolled / bypassed`,
        `Logistics returned shipment: Consignee address invalid / Return to Origin`,
      ],
      contradictory_signals: [],
      missing_evidence: [],
      operational_summary:
        'High probability Account Takeover (ATO) / Stolen Card fraud detected. Promptly accepting the dispute and issuing a full refund prevents severe card network dispute ratio penalties.',
    };
    run.representment_package = {
      recommended_action: 'ACCEPT_REFUND',
      rebuttal_letter: generateRebuttalLetter(dispute, tx, undefined, user, 'ACCEPT_REFUND'),
      key_exhibits: [
        {
          title: 'Risk Engine Threat Assessment',
          category: 'ACTIVITY_RECORDS',
          summary: 'Critical risk score (90/100) with proxy detection and 3DS bypass.',
        },
      ],
    };
  } else {
    // Case 4: Subscription / General
    emitStep('TOOL_INVOKED', 'Invoking tool: get_user_behavior_profile', 'get_user_behavior_profile', {
      email: dispute.customer_email,
    });
    await delay(250);
    const profileResult = await executeAgentTool('get_user_behavior_profile', { email: dispute.customer_email });
    emitStep(
      'TOOL_COMPLETED',
      `✓ ${profileResult.label}`,
      'get_user_behavior_profile',
      { email: dispute.customer_email },
      profileResult.data,
      120
    );

    emitStep('EVALUATING', 'Synthesizing subscription license logs and recurring authentication trace...');
    await delay(300);

    run.final_verdict = 'REPRESENT_DISPUTE';
    run.confidence_score = 91;
    run.evaluation = {
      evidence_strength: 'HIGH',
      corroborating_signals: [
        'Customer actively logged into the cloud console 18 times following the billing cycle',
        'Initial subscription terms explicitly outlined annual recurring billing consent',
        'Payment settled via verified 3DS 2.0 corporate card',
      ],
      contradictory_signals: [],
      missing_evidence: [],
      operational_summary:
        'Software license access actively utilized by the customer. Representment recommended with login audit exhibits.',
    };
    run.representment_package = {
      recommended_action: 'REPRESENT_DISPUTE',
      rebuttal_letter: generateRebuttalLetter(dispute, tx, undefined, user, 'REPRESENT_DISPUTE'),
      key_exhibits: [
        {
          title: 'Cloud Dashboard Session Logs',
          category: 'ACTIVITY_RECORDS',
          summary: '18 authenticated sessions recorded from the primary user IP post-settlement.',
        },
      ],
    };
  }

  // If operator provided guidance, adjust final package summary
  if (operatorGuidance && run.evaluation) {
    run.evaluation.operational_summary += ` [Incorporated Operator Guidance: "${operatorGuidance}"]`;
  }

  emitStep(
    'DECISION_READY',
    `✓ Decision package finalized: ${run.final_verdict} (${run.confidence_score}% Confidence)`,
    undefined,
    undefined,
    {
      verdict: run.final_verdict,
      confidence: run.confidence_score,
      strength: run.evaluation.evidence_strength,
    }
  );
}

// ========================================================
// Helper Utilities
// ========================================================

function extractJsonFromResponse(content: string): any {
  try {
    return JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function generateRebuttalLetter(
  dispute: Dispute,
  tx?: any,
  logistics?: any,
  user?: any,
  verdict?: AgentVerdict
): string {
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (verdict === 'ACCEPT_REFUND') {
    return `RAZORPAY DISPUTE RESOLUTION ADVICE - REFUND RECOMMENDED
Date: ${dateStr}
Dispute ID: ${dispute.id}
Transaction Reference: ${tx?.gateway_reference || dispute.transaction_id}
Acquirer Reference Number (ARN): ${dispute.arn}
Disputed Amount: ₹${dispute.amount.toLocaleString('en-IN')}

EXECUTIVE RECOMMENDATION:
Following autonomous investigation into gateway telemetry and customer behavioral risk profiles, Razorpay Agentic Resolver recommends accepting this dispute and initiating an immediate credit back to the cardholder.

INVESTIGATION FINDINGS:
1. Proxy & Geolocation Anomaly: Transaction originated from a flagged VPN / proxy connection (${tx?.ip_country || 'Foreign Node'}).
2. Risk Velocity: High velocity of unauthorized attempts and compromised device fingerprinting detected.
3. Merchant Protection Action: Immediate settlement refund recommended to preserve merchant chargeback thresholds.`;
  }

  return `FORMAL CHARGEBACK REPRESENTMENT REBUTTAL
Date: ${dateStr}
To: Dispute Processing Unit / Issuing Bank Review
Merchant: ${dispute.merchant_name}
Cardholder Name: ${dispute.customer_name}
Acquirer Reference Number (ARN): ${dispute.arn}
Transaction ID: ${tx?.gateway_reference || dispute.transaction_id}
Disputed Amount: ₹${dispute.amount.toLocaleString('en-IN')} ${dispute.currency}
Dispute Reason: ${dispute.reason}

STATEMENT OF REBUTTAL:
The merchant respectfully contests the chargeback claim initiated by the cardholder. Complete documentary evidence demonstrates that the purchased goods/services were legitimately authorized, authenticated, and fulfilled in full accordance with card network rules.

EVIDENCE OF FULFILLMENT & AUTHENTICATION:
1. Two-Factor Authentication: The transaction was verified via 3D-Secure 2.0 protocol (${tx?.three_ds_status || 'AUTHENTICATED'}) utilizing OTP delivered to the cardholder's verified mobile number.
${
  logistics
    ? `2. Physical Delivery Confirmation: Carrier (${logistics.carrier}) tracking record ${logistics.tracking_number} verifies successful delivery to the cardholder's designated address (${logistics.delivery_address}).
3. Proof of Delivery: E-signature recorded as "${logistics.signature_name || 'Verified'}" matching cardholder credentials.`
    : `2. Service Utilization: Customer authenticated and accessed digital platform resources following payment processing.`
}

CONCLUSION:
Based on the attached compelling exhibits, the merchant has satisfied all representment obligations. We request the immediate reversal of this dispute and credit back to the merchant account.

Submitted by: Razorpay Agentic Operations Team on behalf of ${dispute.merchant_name}`;
}
