import {
  Dispute,
  Transaction,
  UserProfile,
  LogisticsRecord,
  AgentRun,
  AgentStep,
} from './types';

// ==========================================
// SEED DATA: Realistic Test Scenarios
// ==========================================

export const SEED_DISPUTES: Dispute[] = [
  {
    id: 'disp_01H9A_FRIENDLY',
    transaction_id: 'pay_982314_BLUEDART',
    user_id: 'usr_rahul_sharma_99',
    amount: 14999.0,
    currency: 'INR',
    reason: 'PRODUCT_NOT_RECEIVED',
    status: 'PENDING',
    customer_name: 'Rahul Sharma',
    customer_email: 'rahul.sharma89@gmail.com',
    merchant_name: 'UrbanVolt Consumer Electronics',
    arn: '74523910293847561029384',
    network: 'Visa',
    dispute_date: '2026-08-08T10:30:00Z',
    due_date: '2026-08-18T18:00:00Z',
    customer_claim_statement:
      'Cardholder filed dispute alleging non-receipt: "I ordered Sony WH-1000XM5 headphones on Aug 1 for ₹14,999. The package never arrived at my Indiranagar address. The merchant did not issue an immediate refund, so I am requesting an unconditional bank chargeback."',
    merchant_fulfillment_note:
      'Merchant dispatched order on Aug 1 via BlueDart (AWB: BD-884920192). BlueDart telemetry confirms delivery on Aug 4 with recipient signature and OTP 7892 verification matching the geofence.',
    created_at: '2026-08-08T10:30:00Z',
  },
  {
    id: 'disp_02B8K_IDENTITY_FRAUD',
    transaction_id: 'pay_872109_PROXY_FRAUD',
    user_id: 'usr_flagged_ato_81',
    amount: 48500.0,
    currency: 'INR',
    reason: 'FRAUDULENT_TRANSACTION',
    status: 'PENDING',
    customer_name: 'Vikram Mehta (Reported Unauthorized)',
    customer_email: 'vikram.m.security@proton.me',
    merchant_name: 'Apex Luxury Timepieces',
    arn: '84920192837465910293847',
    network: 'Mastercard',
    dispute_date: '2026-08-10T14:15:00Z',
    due_date: '2026-08-20T18:00:00Z',
    customer_claim_statement:
      'Cardholder filed unauthorized fraud dispute: "I discovered an unknown charge of ₹48,500 for a luxury watch on my statement. I did not make or authorize this purchase, never visited this store, and believe my card credentials were stolen in a phishing attack."',
    merchant_fulfillment_note:
      'Order placed at 2:14 AM from a German Tor exit node IP. Shipped via Delhivery (AWB: DL-991204859) to an abandoned warehouse; delivery failed (RTO initiated).',
    created_at: '2026-08-10T14:15:00Z',
  },
  {
    id: 'disp_03C4M_LOGISTICS_STALL',
    transaction_id: 'pay_664192_DELAYED_DELHIVERY',
    user_id: 'usr_priya_iyer_12',
    amount: 32000.0,
    currency: 'INR',
    reason: 'PRODUCT_NOT_RECEIVED',
    status: 'PENDING',
    customer_name: 'Priya Iyer',
    customer_email: 'priya.iyer@fintechcorp.in',
    merchant_name: 'Kavita Handcrafted Silks',
    arn: '91029384756102938475610',
    network: 'RuPay',
    dispute_date: '2026-08-11T09:00:00Z',
    due_date: '2026-08-21T18:00:00Z',
    customer_claim_statement:
      'Cardholder filed non-delivery dispute: "I purchased a bridal gold zari silk saree for ₹32,000 on July 16th. Over 25 days have elapsed and the courier tracking has been stalled in transit since July 20th with no updates. I request a complete refund."',
    merchant_fulfillment_note:
      'Dispatched via Delhivery Surface (AWB: DL-773019482) on July 17. Telemetry shows package stalled at Nagpur sorting hub for >20 days without departure scan.',
    created_at: '2026-08-11T09:00:00Z',
  },
  {
    id: 'disp_04D9Z_SAAS_SUBSCRIPTION',
    transaction_id: 'pay_551029_SAAS_BILLING',
    user_id: 'usr_ananya_das_44',
    amount: 4499.0,
    currency: 'INR',
    reason: 'SUBSCRIPTION_UNRECOGNIZED',
    status: 'PENDING',
    customer_name: 'Ananya Das',
    customer_email: 'ananya.das@cloudstudio.io',
    merchant_name: 'HyperCloud Developer Tools',
    arn: '49201928374651029384756',
    network: 'Visa',
    dispute_date: '2026-08-12T11:45:00Z',
    due_date: '2026-08-22T18:00:00Z',
    customer_claim_statement:
      'Cardholder filed unrecognized billing dispute: "My card was billed ₹4,499 for annual cloud team access. I believed I was on a trial and did not intend to renew. I dispute this charge."',
    merchant_fulfillment_note:
      'Cardholder verified payment via 3DS 2.0 corporate card and subsequently logged into the cloud developer console 18 times post-billing.',
    created_at: '2026-08-12T11:45:00Z',
  },
];

export const SEED_TRANSACTIONS: Record<string, Transaction> = {
  'pay_982314_BLUEDART': {
    id: 'pay_982314_BLUEDART',
    user_id: 'usr_rahul_sharma_99',
    amount: 14999.0,
    currency: 'INR',
    payment_method: 'card',
    card_last4: '4192',
    card_network: 'Visa Signature',
    gateway_reference: 'rzp_live_tx_9823148192',
    gateway_response_code: '200_SUCCESS_SETTLED',
    three_ds_status: 'AUTHENTICATED',
    ip_address: '49.36.128.45',
    ip_country: 'IN',
    is_vpn_or_proxy: false,
    shipping_carrier: 'BlueDart Express',
    shipping_tracking_no: 'BD-884920192',
    billing_address: 'Flat 402, Palm Heights, Indiranagar, Bengaluru, KA 560038',
    shipping_address: 'Flat 402, Palm Heights, Indiranagar, Bengaluru, KA 560038',
    item_description: 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones',
    item_type: 'PHYSICAL_GOODS',
    created_at: '2026-08-01T15:20:00Z',
  },
  'pay_872109_PROXY_FRAUD': {
    id: 'pay_872109_PROXY_FRAUD',
    user_id: 'usr_flagged_ato_81',
    amount: 48500.0,
    currency: 'INR',
    payment_method: 'card',
    card_last4: '9012',
    card_network: 'Mastercard World Elite',
    gateway_reference: 'rzp_live_tx_8721099012',
    gateway_response_code: '200_SUCCESS_SETTLED',
    three_ds_status: 'NOT_ENROLLED',
    ip_address: '185.220.101.4',
    ip_country: 'DE (Tor Exit Node)',
    is_vpn_or_proxy: true,
    shipping_carrier: 'Delhivery',
    shipping_tracking_no: 'DL-991204859',
    billing_address: 'Plot 12, Defence Colony, New Delhi, DL 110024',
    shipping_address: 'Abandoned Warehouse #4, GT Road Bypass, Ghaziabad, UP',
    item_description: 'Swiss Automatic Heritage Watch (Ref #AX-9002)',
    item_type: 'PHYSICAL_GOODS',
    created_at: '2026-08-04T02:14:00Z',
  },
  'pay_664192_DELAYED_DELHIVERY': {
    id: 'pay_664192_DELAYED_DELHIVERY',
    user_id: 'usr_priya_iyer_12',
    amount: 32000.0,
    currency: 'INR',
    payment_method: 'card',
    card_last4: '8821',
    card_network: 'RuPay Platinum',
    gateway_reference: 'rzp_live_tx_6641928821',
    gateway_response_code: '200_SUCCESS_SETTLED',
    three_ds_status: 'AUTHENTICATED',
    ip_address: '103.21.144.92',
    ip_country: 'IN',
    is_vpn_or_proxy: false,
    shipping_carrier: 'Delhivery Surface',
    shipping_tracking_no: 'DL-773019482',
    billing_address: 'B-701, Lotus Boulevard, Sector 100, Noida, UP 201304',
    shipping_address: 'B-701, Lotus Boulevard, Sector 100, Noida, UP 201304',
    item_description: 'Pure Kanchipuram Gold Zari Bridal Silk Saree',
    item_type: 'PHYSICAL_GOODS',
    created_at: '2026-07-16T11:00:00Z',
  },
  'pay_551029_SAAS_BILLING': {
    id: 'pay_551029_SAAS_BILLING',
    user_id: 'usr_ananya_das_44',
    amount: 4499.0,
    currency: 'INR',
    payment_method: 'card',
    card_last4: '1098',
    card_network: 'Visa Corporate',
    gateway_reference: 'rzp_live_tx_5510291098',
    gateway_response_code: '200_SUCCESS_SETTLED',
    three_ds_status: 'AUTHENTICATED',
    ip_address: '122.161.49.201',
    ip_country: 'IN',
    is_vpn_or_proxy: false,
    billing_address: '3rd Floor, Tech Park Alpha, Whitefield, Bengaluru, KA',
    shipping_address: 'Digital Cloud Subscription License',
    item_description: 'HyperCloud Enterprise Team Tier (Annual Billing License)',
    item_type: 'SUBSCRIPTION',
    created_at: '2026-08-05T09:00:00Z',
  },
};

export const SEED_USER_PROFILES: Record<string, UserProfile> = {
  'usr_rahul_sharma_99': {
    id: 'usr_rahul_sharma_99',
    email: 'rahul.sharma89@gmail.com',
    full_name: 'Rahul Sharma',
    account_created_at: '2022-04-10T08:00:00Z',
    total_orders_count: 34,
    total_spent_inr: 284500.0,
    chargeback_history_count: 0,
    chargeback_ratio: 0.0,
    risk_flag: 'LOW',
    known_device_ids: ['dev_apple_iphone15_pro_blr', 'dev_macbook_m2_blr'],
    last_known_ip: '49.36.128.45',
  },
  'usr_flagged_ato_81': {
    id: 'usr_flagged_ato_81',
    email: 'vikram.m.security@proton.me',
    full_name: 'Vikram Mehta',
    account_created_at: '2026-08-03T23:50:00Z', // Brand new account hours before purchase
    total_orders_count: 2,
    total_spent_inr: 96000.0,
    chargeback_history_count: 3,
    chargeback_ratio: 1.0,
    risk_flag: 'CRITICAL',
    known_device_ids: ['dev_unknown_linux_proxy_vm'],
    last_known_ip: '185.220.101.4',
  },
  'usr_priya_iyer_12': {
    id: 'usr_priya_iyer_12',
    email: 'priya.iyer@fintechcorp.in',
    full_name: 'Priya Iyer',
    account_created_at: '2021-11-20T14:30:00Z',
    total_orders_count: 19,
    total_spent_inr: 165000.0,
    chargeback_history_count: 0,
    chargeback_ratio: 0.0,
    risk_flag: 'LOW',
    known_device_ids: ['dev_pixel8_pro_noida'],
    last_known_ip: '103.21.144.92',
  },
  'usr_ananya_das_44': {
    id: 'usr_ananya_das_44',
    email: 'ananya.das@cloudstudio.io',
    full_name: 'Ananya Das',
    account_created_at: '2023-01-15T10:00:00Z',
    total_orders_count: 12,
    total_spent_inr: 88000.0,
    chargeback_history_count: 0,
    chargeback_ratio: 0.0,
    risk_flag: 'LOW',
    known_device_ids: ['dev_dell_xps15_blr'],
    last_known_ip: '122.161.49.201',
  },
};

export const SEED_LOGISTICS: Record<string, LogisticsRecord> = {
  'BD-884920192': {
    tracking_number: 'BD-884920192',
    carrier: 'BlueDart Express',
    status: 'DELIVERED',
    estimated_delivery: '2026-08-04T18:00:00Z',
    delivered_at: '2026-08-04T14:32:00Z',
    delivery_address: 'Flat 402, Palm Heights, Indiranagar, Bengaluru, KA 560038',
    recipient_name: 'Rahul Sharma',
    signature_captured: true,
    signature_name: 'R. Sharma (OTP Verified: 7892)',
    gps_coordinates: '12.9784° N, 77.6408° E (Matches Delivery Address Geofence)',
    delivery_proof_photo_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400',
    events: [
      {
        timestamp: '2026-08-01T18:00:00Z',
        location: 'Bengaluru Hub',
        status: 'MANIFEST_CREATED',
        description: 'Shipment handed over by merchant',
      },
      {
        timestamp: '2026-08-03T09:15:00Z',
        location: 'Indiranagar Delivery Center',
        status: 'OUT_FOR_DELIVERY',
        description: 'Assigned to courier agent Mahesh K (ID: BD-4029)',
      },
      {
        timestamp: '2026-08-04T14:32:00Z',
        location: 'Indiranagar, Bengaluru',
        status: 'DELIVERED',
        description: 'Delivered directly to recipient. OTP 7892 verified and e-signature captured.',
      },
    ],
  },
  'DL-991204859': {
    tracking_number: 'DL-991204859',
    carrier: 'Delhivery',
    status: 'RETURNED_TO_ORIGIN',
    delivered_at: undefined,
    delivery_address: 'Abandoned Warehouse #4, GT Road Bypass, Ghaziabad, UP',
    recipient_name: undefined,
    signature_captured: false,
    events: [
      {
        timestamp: '2026-08-04T08:00:00Z',
        location: 'Delhi NCR Hub',
        status: 'IN_TRANSIT',
        description: 'Shipment dispatched to Ghaziabad center',
      },
      {
        timestamp: '2026-08-05T11:20:00Z',
        location: 'Ghaziabad Hub',
        status: 'DELIVERY_FAILED',
        description: 'Consignee address premise locked / incomplete address. Receiver phone switched off.',
      },
      {
        timestamp: '2026-08-07T16:00:00Z',
        location: 'Ghaziabad Hub',
        status: 'RTO_INITIATED',
        description: 'Returning shipment to merchant origin warehouse',
      },
    ],
  },
  'DL-773019482': {
    tracking_number: 'DL-773019482',
    carrier: 'Delhivery Surface',
    status: 'IN_TRANSIT',
    estimated_delivery: '2026-07-22T18:00:00Z',
    delivered_at: undefined,
    delivery_address: 'B-701, Lotus Boulevard, Sector 100, Noida, UP 201304',
    signature_captured: false,
    events: [
      {
        timestamp: '2026-07-17T14:00:00Z',
        location: 'Bengaluru Logistics Park',
        status: 'IN_TRANSIT',
        description: 'Dispatched to North Hub',
      },
      {
        timestamp: '2026-07-20T03:30:00Z',
        location: 'Nagpur Transit Center',
        status: 'STALLED_IN_TRANSIT',
        description: 'Shipment scanned at transit sorting facility. No further departure scan recorded (Stalled >20 days).',
      },
    ],
  },
};

// ==========================================
// IN-MEMORY STATE STORE
// ==========================================

class MockStore {
  private disputes: Map<string, Dispute> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private userProfiles: Map<string, UserProfile> = new Map();
  private logistics: Map<string, LogisticsRecord> = new Map();
  private agentRuns: Map<string, AgentRun> = new Map();

  constructor() {
    this.resetToDefaults();
  }

  public resetToDefaults(): void {
    this.disputes.clear();
    this.transactions.clear();
    this.userProfiles.clear();
    this.logistics.clear();
    this.agentRuns.clear();

    SEED_DISPUTES.forEach((d) => this.disputes.set(d.id, { ...d }));
    Object.values(SEED_TRANSACTIONS).forEach((t) => this.transactions.set(t.id, { ...t }));
    Object.values(SEED_USER_PROFILES).forEach((u) => this.userProfiles.set(u.id, { ...u }));
    Object.values(SEED_LOGISTICS).forEach((l) => this.logistics.set(l.tracking_number, { ...l }));
  }

  public getDisputes(): Dispute[] {
    return Array.from(this.disputes.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public getDispute(id: string): Dispute | undefined {
    return this.disputes.get(id);
  }

  public getTransaction(id: string): Transaction | undefined {
    return this.transactions.get(id);
  }

  public getUserProfileByEmail(email: string): UserProfile | undefined {
    return Array.from(this.userProfiles.values()).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
  }

  public getUserProfileById(id: string): UserProfile | undefined {
    return this.userProfiles.get(id);
  }

  public getLogisticsRecord(trackingNo: string): LogisticsRecord | undefined {
    return this.logistics.get(trackingNo);
  }

  public saveAgentRun(run: AgentRun): void {
    this.agentRuns.set(run.id, run);
    const dispute = this.disputes.get(run.dispute_id);
    if (dispute) {
      dispute.latest_run_id = run.id;
      if (run.final_verdict) {
        if (run.final_verdict === 'REPRESENT_DISPUTE') {
          dispute.status = 'RESOLVED_REPRESENTED';
        } else if (run.final_verdict === 'ACCEPT_REFUND') {
          dispute.status = 'RESOLVED_REFUNDED';
        } else if (run.final_verdict === 'ESCALATE_TO_HUMAN') {
          dispute.status = 'ESCALATED';
        }
      }
    }
  }

  public getAgentRun(id: string): AgentRun | undefined {
    return this.agentRuns.get(id);
  }

  public getAgentRunsForDispute(disputeId: string): AgentRun[] {
    return Array.from(this.agentRuns.values())
      .filter((r) => r.dispute_id === disputeId)
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
  }

  public updateDisputeStatus(id: string, status: Dispute['status'], notes?: string): void {
    const dispute = this.disputes.get(id);
    if (dispute) {
      dispute.status = status;
      if (notes) dispute.notes = notes;
    }
  }

  public applyHumanReview(
    disputeId: string,
    runId: string,
    action: 'APPROVED' | 'OVERRIDDEN',
    overrideVerdict?: AgentRun['final_verdict'],
    notes?: string
  ): AgentRun | undefined {
    const run = this.agentRuns.get(runId);
    const dispute = this.disputes.get(disputeId);
    if (!run || !dispute) return undefined;

    run.human_action = action;
    run.human_override_verdict = overrideVerdict;
    run.human_notes = notes;
    run.reviewed_at = new Date().toISOString();

    const effectiveVerdict = action === 'OVERRIDDEN' && overrideVerdict ? overrideVerdict : run.final_verdict;
    if (effectiveVerdict === 'REPRESENT_DISPUTE') {
      dispute.status = 'RESOLVED_REPRESENTED';
    } else if (effectiveVerdict === 'ACCEPT_REFUND') {
      dispute.status = 'RESOLVED_REFUNDED';
    } else if (effectiveVerdict === 'ESCALATE_TO_HUMAN') {
      dispute.status = 'ESCALATED';
    }

    return run;
  }

  public createCustomDispute(data: {
    dispute: Dispute;
    transaction: Transaction;
    userProfile: UserProfile;
    logisticsRecord?: LogisticsRecord;
  }): Dispute {
    this.disputes.set(data.dispute.id, data.dispute);
    this.transactions.set(data.transaction.id, data.transaction);
    this.userProfiles.set(data.userProfile.id, data.userProfile);
    if (data.logisticsRecord) {
      this.logistics.set(data.logisticsRecord.tracking_number, data.logisticsRecord);
    }
    return data.dispute;
  }
}

// Global singleton for the in-memory store in dev / server runtime
declare global {
  var __chargebackMockStore: MockStore | undefined;
}

export const mockStore = global.__chargebackMockStore || new MockStore();
if (process.env.NODE_ENV !== 'production') {
  global.__chargebackMockStore = mockStore;
}
