import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/mock-data';
import { Dispute, Transaction, UserProfile, LogisticsRecord, AgentVerdict } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const dispute = mockStore.getDispute(id);
      if (!dispute) {
        return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
      }
      const transaction = mockStore.getTransaction(dispute.transaction_id);
      const userProfile = mockStore.getUserProfileById(dispute.user_id);
      const runs = mockStore.getAgentRunsForDispute(id);

      return NextResponse.json({
        dispute,
        transaction,
        userProfile,
        runs,
      });
    }

    const disputes = mockStore.getDisputes();
    return NextResponse.json({ disputes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { disputeId, runId, action, overrideVerdict, notes } = body;

    if (!disputeId || !runId || !action) {
      return NextResponse.json(
        { error: 'disputeId, runId, and action are required' },
        { status: 400 }
      );
    }

    const updatedRun = mockStore.applyHumanReview(
      disputeId,
      runId,
      action,
      overrideVerdict as AgentVerdict | undefined,
      notes
    );

    if (!updatedRun) {
      return NextResponse.json({ error: 'Dispute or Run not found' }, { status: 404 });
    }

    const dispute = mockStore.getDispute(disputeId);
    return NextResponse.json({ success: true, run: updatedRun, dispute });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === 'reset') {
      mockStore.resetToDefaults();
      return NextResponse.json({ success: true, message: 'Store reset to seed data' });
    }

    // Create custom dispute simulation
    const timestamp = new Date().toISOString();
    const disputeId = `disp_${Date.now()}_CUSTOM`;
    const txId = `pay_${Date.now()}_SIM`;
    const userId = `usr_${Date.now()}_SIM`;

    const newDispute: Dispute = {
      id: disputeId,
      transaction_id: txId,
      user_id: userId,
      amount: Number(body.amount) || 19999.0,
      currency: 'INR',
      reason: body.reason || 'PRODUCT_NOT_RECEIVED',
      status: 'PENDING',
      customer_name: body.customer_name || 'Alok Verma',
      customer_email: body.customer_email || 'alok.verma@example.com',
      merchant_name: body.merchant_name || 'Apex Store India',
      arn: `7452${Math.floor(Math.random() * 1000000000000000000)}`,
      network: body.network || 'Visa',
      dispute_date: timestamp,
      due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: timestamp,
    };

    const newTx: Transaction = {
      id: txId,
      user_id: userId,
      amount: newDispute.amount,
      currency: 'INR',
      payment_method: 'card',
      card_last4: '3829',
      card_network: 'Visa Gold',
      gateway_reference: `rzp_live_${Date.now()}`,
      gateway_response_code: '200_SUCCESS_SETTLED',
      three_ds_status: body.three_ds_status || 'AUTHENTICATED',
      ip_address: body.ip_address || '115.240.90.12',
      ip_country: body.ip_country || 'IN',
      is_vpn_or_proxy: Boolean(body.is_vpn_or_proxy),
      shipping_carrier: body.shipping_carrier || 'BlueDart Express',
      shipping_tracking_no: body.shipping_tracking_no || `BD-${Math.floor(Math.random() * 1000000000)}`,
      billing_address: body.address || 'Flat 101, Green Meadows, Pune, MH',
      shipping_address: body.address || 'Flat 101, Green Meadows, Pune, MH',
      item_description: body.item_description || 'Custom Consumer Electronics Order',
      item_type: 'PHYSICAL_GOODS',
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const newUser: UserProfile = {
      id: userId,
      email: newDispute.customer_email,
      full_name: newDispute.customer_name,
      account_created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
      total_orders_count: 8,
      total_spent_inr: 74000.0,
      chargeback_history_count: body.prior_chargebacks || 0,
      chargeback_ratio: 0.0,
      risk_flag: body.risk_flag || 'LOW',
      known_device_ids: ['dev_android_pune_01'],
      last_known_ip: newTx.ip_address,
    };

    let newLogistics: LogisticsRecord | undefined = undefined;
    if (newTx.shipping_tracking_no) {
      newLogistics = {
        tracking_number: newTx.shipping_tracking_no,
        carrier: newTx.shipping_carrier || 'BlueDart Express',
        status: body.delivery_status || 'DELIVERED',
        delivered_at:
          body.delivery_status === 'DELIVERED'
            ? new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            : undefined,
        delivery_address: newTx.shipping_address,
        recipient_name: newDispute.customer_name,
        signature_captured: body.delivery_status === 'DELIVERED',
        signature_name: body.delivery_status === 'DELIVERED' ? `${newDispute.customer_name} (OTP Verified)` : undefined,
        gps_coordinates: '18.5204° N, 73.8567° E',
        events: [
          {
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            location: 'Origin Center',
            status: 'IN_TRANSIT',
            description: 'Package in transit',
          },
          {
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            location: 'Destination Hub',
            status: body.delivery_status || 'DELIVERED',
            description:
              body.delivery_status === 'DELIVERED'
                ? 'Delivered to recipient with OTP verification'
                : 'In transit to sorting center',
          },
        ],
      };
    }

    const created = mockStore.createCustomDispute({
      dispute: newDispute,
      transaction: newTx,
      userProfile: newUser,
      logisticsRecord: newLogistics,
    });

    return NextResponse.json({ success: true, dispute: created });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
