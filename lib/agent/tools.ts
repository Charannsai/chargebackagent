import { mockStore } from '../mock-data';
import { RiskAssessment } from '../types';

// ==========================================
// Tool JSON Schemas for Groq Function Calling
// ==========================================

export const AGENT_TOOLS_SCHEMA = [
  {
    type: 'function' as const,
    function: {
      name: 'get_transaction_details',
      description:
        'Fetches transaction metadata, gateway response code, 3DS authentication status, IP address, billing/shipping address, and order items.',
      parameters: {
        type: 'object',
        properties: {
          transaction_id: {
            type: 'string',
            description: 'The unique Razorpay transaction identifier (e.g. pay_982314_BLUEDART)',
          },
        },
        required: ['transaction_id'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_user_behavior_profile',
      description:
        'Retrieves historical chargeback rates, total lifetime orders, account tenure, trusted device fingerprints, and risk flags for the customer.',
      parameters: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            description: 'The email address associated with the disputed transaction',
          },
        },
        required: ['email'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'verify_delivery_courier',
      description:
        'Queries integrated third-party logistics APIs (BlueDart, Delhivery, etc.) to verify shipment delivery status, recipient name, Proof of Delivery (POD) signature, and GPS geofence matching.',
      parameters: {
        type: 'object',
        properties: {
          tracking_number: {
            type: 'string',
            description: 'Logistics tracking/AWB number (e.g. BD-884920192)',
          },
          carrier: {
            type: 'string',
            description: 'Carrier name (e.g. BlueDart Express, Delhivery)',
          },
        },
        required: ['tracking_number'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'calculate_risk_score',
      description:
        'Computes a holistic risk score (0-100) based on IP-geolocation mismatch, VPN/Tor proxy detection, transaction velocity, and historical dispute anomalies.',
      parameters: {
        type: 'object',
        properties: {
          user_id: {
            type: 'string',
            description: 'The internal user ID of the account holder',
          },
          transaction_id: {
            type: 'string',
            description: 'The transaction identifier',
          },
        },
        required: ['user_id', 'transaction_id'],
      },
    },
  },
];

// ==========================================
// Tool Execution Dispatcher
// ==========================================

export async function executeAgentTool(
  toolName: string,
  args: Record<string, any>
): Promise<{ success: boolean; data: any; label: string }> {
  switch (toolName) {
    case 'get_transaction_details': {
      const txId = args.transaction_id || '';
      const tx = mockStore.getTransaction(txId);
      if (!tx) {
        return {
          success: false,
          data: { error: `Transaction ID '${txId}' not found in gateway records.` },
          label: `Transaction lookup failed: ${txId}`,
        };
      }
      return {
        success: true,
        data: {
          transaction_id: tx.id,
          amount: tx.amount,
          currency: tx.currency,
          payment_method: tx.payment_method,
          card_last4: tx.card_last4,
          card_network: tx.card_network,
          gateway_response: tx.gateway_response_code,
          three_ds_status: tx.three_ds_status,
          ip_address: tx.ip_address,
          ip_country: tx.ip_country,
          is_vpn_or_proxy: tx.is_vpn_or_proxy,
          shipping_carrier: tx.shipping_carrier,
          shipping_tracking_no: tx.shipping_tracking_no,
          billing_address: tx.billing_address,
          shipping_address: tx.shipping_address,
          item_description: tx.item_description,
          item_type: tx.item_type,
          created_at: tx.created_at,
        },
        label: `Transaction retrieved: ${tx.id} (${tx.gateway_response_code})`,
      };
    }

    case 'get_user_behavior_profile': {
      const email = args.email || '';
      const profile = mockStore.getUserProfileByEmail(email);
      if (!profile) {
        return {
          success: false,
          data: { error: `Customer profile for '${email}' not found.` },
          label: `Customer profile not found: ${email}`,
        };
      }
      return {
        success: true,
        data: {
          user_id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          account_created_at: profile.account_created_at,
          total_orders: profile.total_orders_count,
          total_spent_inr: profile.total_spent_inr,
          chargeback_count: profile.chargeback_history_count,
          chargeback_ratio: profile.chargeback_ratio,
          risk_flag: profile.risk_flag,
          trusted_devices_count: profile.known_device_ids.length,
          last_known_ip: profile.last_known_ip,
        },
        label: `Customer history checked: ${profile.email} (Risk: ${profile.risk_flag})`,
      };
    }

    case 'verify_delivery_courier': {
      const trackingNo = args.tracking_number || '';
      const logistics = mockStore.getLogisticsRecord(trackingNo);
      if (!logistics) {
        return {
          success: false,
          data: {
            tracking_number: trackingNo,
            carrier: args.carrier || 'Unknown',
            status: 'NOT_FOUND',
            message: 'No shipment record found with the carrier API.',
          },
          label: `Delivery lookup: No records for ${trackingNo}`,
        };
      }
      return {
        success: true,
        data: {
          tracking_number: logistics.tracking_number,
          carrier: logistics.carrier,
          status: logistics.status,
          delivered_at: logistics.delivered_at,
          delivery_address: logistics.delivery_address,
          signature_captured: logistics.signature_captured,
          signature_name: logistics.signature_name,
          gps_coordinates: logistics.gps_coordinates,
          events_count: logistics.events.length,
          latest_event: logistics.events[logistics.events.length - 1],
        },
        label: `Delivery evidence verified: ${logistics.carrier} (${logistics.status})`,
      };
    }

    case 'calculate_risk_score': {
      const userId = args.user_id || '';
      const txId = args.transaction_id || '';
      const tx = mockStore.getTransaction(txId);
      const user = mockStore.getUserProfileById(userId);

      let score = 15; // default baseline low risk
      let ipMismatch = false;
      let proxyDetected = false;
      let velocityAnomaly = false;
      let priorDisputes = 0;
      let trustDays = 365;

      if (user) {
        priorDisputes = user.chargeback_history_count;
        const createdDate = new Date(user.account_created_at).getTime();
        trustDays = Math.max(1, Math.round((Date.now() - createdDate) / (1000 * 60 * 60 * 24)));
        if (priorDisputes > 0) score += priorDisputes * 25;
        if (trustDays < 5) score += 30; // brand new account
      }

      if (tx) {
        if (tx.is_vpn_or_proxy) {
          proxyDetected = true;
          score += 35;
        }
        if (user && user.last_known_ip !== tx.ip_address) {
          ipMismatch = true;
          score += 15;
        }
        if (tx.three_ds_status !== 'AUTHENTICATED') {
          score += 25;
        }
      }

      score = Math.min(99, Math.max(5, score));
      let tier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
      if (score >= 75) tier = 'CRITICAL';
      else if (score >= 50) tier = 'HIGH';
      else if (score >= 30) tier = 'MEDIUM';

      const assessment: RiskAssessment = {
        score,
        tier,
        factors: {
          ip_mismatch: ipMismatch,
          proxy_detected: proxyDetected,
          velocity_anomaly: velocityAnomaly,
          prior_disputes: priorDisputes,
          account_trust_age_days: trustDays,
          three_ds_valid: tx?.three_ds_status === 'AUTHENTICATED',
        },
        summary:
          tier === 'CRITICAL' || tier === 'HIGH'
            ? `Elevated risk detected due to ${proxyDetected ? 'proxy/VPN connection, ' : ''}${priorDisputes > 0 ? 'prior chargeback frequency, ' : ''}${trustDays < 5 ? 'new account tenure.' : ''}`
            : `Low risk assessment with verified 3DS authentication and established customer profile.`,
      };

      return {
        success: true,
        data: assessment,
        label: `Risk calculated: Score ${score}/100 (${tier} Tier)`,
      };
    }

    default:
      return {
        success: false,
        data: { error: `Unknown tool: ${toolName}` },
        label: `Tool error: ${toolName}`,
      };
  }
}
