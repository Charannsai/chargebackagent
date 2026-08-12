export type DisputeReason =
  | 'PRODUCT_NOT_RECEIVED'
  | 'FRAUDULENT_TRANSACTION'
  | 'SUBSCRIPTION_UNRECOGNIZED'
  | 'DUPLICATE_CHARGE'
  | 'SERVICES_NOT_PROVIDED';

export type DisputeStatus =
  | 'PENDING'
  | 'UNDER_INVESTIGATION'
  | 'RESOLVED_REPRESENTED'
  | 'RESOLVED_REFUNDED'
  | 'ESCALATED';

export type RiskTier = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AgentVerdict =
  | 'REPRESENT_DISPUTE'
  | 'ACCEPT_REFUND'
  | 'ESCALATE_TO_HUMAN';

export interface Dispute {
  id: string;
  transaction_id: string;
  user_id: string;
  amount: number;
  currency: string;
  reason: DisputeReason;
  status: DisputeStatus;
  customer_name: string;
  customer_email: string;
  merchant_name: string;
  arn: string; // Acquirer Reference Number
  network: 'Visa' | 'Mastercard' | 'RuPay';
  dispute_date: string;
  due_date: string;
  notes?: string;
  latest_run_id?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_method: 'card' | 'upi' | 'netbanking';
  card_last4?: string;
  card_network?: string;
  gateway_reference: string;
  gateway_response_code: string;
  three_ds_status: 'AUTHENTICATED' | 'NOT_ENROLLED' | 'FAILED' | 'ATTEMPTED';
  ip_address: string;
  ip_country: string;
  is_vpn_or_proxy: boolean;
  shipping_carrier?: string;
  shipping_tracking_no?: string;
  billing_address: string;
  shipping_address: string;
  item_description: string;
  item_type: 'PHYSICAL_GOODS' | 'DIGITAL_SERVICES' | 'SUBSCRIPTION';
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  account_created_at: string;
  total_orders_count: number;
  total_spent_inr: number;
  chargeback_history_count: number;
  chargeback_ratio: number;
  risk_flag: RiskTier;
  known_device_ids: string[];
  last_known_ip: string;
}

export interface LogisticsRecord {
  tracking_number: string;
  carrier: string;
  status: 'DELIVERED' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'RETURNED_TO_ORIGIN' | 'EXCEPTION';
  estimated_delivery?: string;
  delivered_at?: string;
  delivery_address: string;
  recipient_name?: string;
  signature_captured: boolean;
  signature_name?: string;
  gps_coordinates?: string;
  delivery_proof_photo_url?: string;
  events: Array<{
    timestamp: string;
    location: string;
    status: string;
    description: string;
  }>;
}

export interface RiskAssessment {
  score: number; // 0 to 100
  tier: RiskTier;
  factors: {
    ip_mismatch: boolean;
    proxy_detected: boolean;
    velocity_anomaly: boolean;
    prior_disputes: number;
    account_trust_age_days: number;
    three_ds_valid: boolean;
  };
  summary: string;
}

export interface EvidenceEvaluation {
  evidence_strength: 'HIGH' | 'MODERATE' | 'LOW';
  corroborating_signals: string[];
  contradictory_signals: string[];
  missing_evidence: string[];
  operational_summary: string;
}

export interface RepresentmentPackage {
  rebuttal_letter: string;
  recommended_action: AgentVerdict;
  key_exhibits: Array<{
    title: string;
    category: 'DELIVERY_PROOF' | 'CUSTOMER_HISTORY' | 'AUTH_LOGS' | 'ACTIVITY_RECORDS';
    summary: string;
    raw_reference_id?: string;
  }>;
}

export type StepEventType =
  | 'INVESTIGATION_STARTED'
  | 'TOOL_INVOKED'
  | 'TOOL_COMPLETED'
  | 'EVALUATING'
  | 'DECISION_READY'
  | 'ERROR';

export interface AgentStep {
  id: string;
  agent_run_id: string;
  sequence: number;
  event_type: StepEventType;
  label: string;
  tool_name?: string;
  arguments?: Record<string, unknown>;
  result?: Record<string, unknown>;
  latency_ms: number;
  timestamp: string;
}

export interface AgentRun {
  id: string;
  dispute_id: string;
  started_at: string;
  completed_at?: string;
  model: string;
  engine_mode: 'groq' | 'demo';
  iterations: number;
  final_verdict?: AgentVerdict;
  confidence_score?: number; // 0 to 100
  evaluation?: EvidenceEvaluation;
  representment_package?: RepresentmentPackage;
  human_action?: 'APPROVED' | 'OVERRIDDEN' | 'PENDING';
  human_override_verdict?: AgentVerdict;
  human_notes?: string;
  reviewed_at?: string;
  steps: AgentStep[];
}
