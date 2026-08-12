-- =========================================================
-- RAZORPAY AGENTIC CHARGEBACK RESOLVER - SUPABASE DDL & SEED
-- =========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Drop existing tables if re-initializing (Clean Cascade)
-- ---------------------------------------------------------
drop table if exists agent_steps cascade;
drop table if exists agent_runs cascade;
drop table if exists disputes cascade;
drop table if exists transactions cascade;
drop table if exists user_profiles cascade;
drop table if exists logistics_records cascade;

-- 2. Create Tables
-- ---------------------------------------------------------

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
  customer_claim_statement text,
  merchant_fulfillment_note text,
  notes text,
  latest_run_id varchar(100),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table transactions (
  id varchar(100) primary key,
  user_id varchar(100) not null,
  amount numeric(12, 2) not null,
  currency varchar(3) default 'INR',
  payment_method varchar(50) not null,
  card_last4 varchar(4),
  card_network varchar(100),
  gateway_reference varchar(100) not null,
  gateway_response_code varchar(100) not null,
  three_ds_status varchar(50) not null,
  ip_address varchar(45) not null,
  ip_country varchar(100) not null,
  is_vpn_or_proxy boolean default false,
  shipping_carrier varchar(100),
  shipping_tracking_no varchar(100),
  billing_address text,
  shipping_address text,
  item_description text,
  item_type varchar(50) default 'PHYSICAL_GOODS',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table user_profiles (
  id varchar(100) primary key,
  email varchar(255) not null unique,
  full_name varchar(255) not null,
  account_created_at timestamp with time zone default now(),
  total_orders_count int default 0,
  total_spent_inr numeric(12, 2) default 0.00,
  chargeback_history_count int default 0,
  chargeback_ratio numeric(5, 4) default 0.0000,
  risk_flag varchar(50) default 'LOW',
  known_device_ids jsonb default '[]'::jsonb,
  last_known_ip varchar(45)
);

create table logistics_records (
  tracking_number varchar(100) primary key,
  carrier varchar(100) not null,
  status varchar(50) not null,
  estimated_delivery timestamp with time zone,
  delivered_at timestamp with time zone,
  delivery_address text not null,
  recipient_name varchar(255),
  signature_captured boolean default false,
  signature_name varchar(255),
  gps_coordinates varchar(100),
  delivery_proof_photo_url text,
  events jsonb default '[]'::jsonb
);

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

-- 3. Performance Indexes
-- ---------------------------------------------------------
create index if not exists idx_disputes_status on disputes(status);
create index if not exists idx_disputes_created_at on disputes(created_at desc);
create index if not exists idx_agent_runs_dispute_id on agent_runs(dispute_id);
create index if not exists idx_agent_steps_run_id on agent_steps(agent_run_id);
create index if not exists idx_transactions_user_id on transactions(user_id);
create index if not exists idx_user_profiles_email on user_profiles(email);

-- 4. Row Level Security (RLS) & Public Access Policies
-- ---------------------------------------------------------
alter table disputes enable row level security;
alter table transactions enable row level security;
alter table user_profiles enable row level security;
alter table logistics_records enable row level security;
alter table agent_runs enable row level security;
alter table agent_steps enable row level security;

-- Allow read/write policies for anon / authenticated roles
drop policy if exists "Allow all operations on disputes" on disputes;
create policy "Allow all operations on disputes" on disputes for all using (true) with check (true);

drop policy if exists "Allow all operations on transactions" on transactions;
create policy "Allow all operations on transactions" on transactions for all using (true) with check (true);

drop policy if exists "Allow all operations on user_profiles" on user_profiles;
create policy "Allow all operations on user_profiles" on user_profiles for all using (true) with check (true);

drop policy if exists "Allow all operations on logistics_records" on logistics_records;
create policy "Allow all operations on logistics_records" on logistics_records for all using (true) with check (true);

drop policy if exists "Allow all operations on agent_runs" on agent_runs;
create policy "Allow all operations on agent_runs" on agent_runs for all using (true) with check (true);

drop policy if exists "Allow all operations on agent_steps" on agent_steps;
create policy "Allow all operations on agent_steps" on agent_steps for all using (true) with check (true);

-- 5. Stored Procedure to Seed / Reset Data
-- ---------------------------------------------------------
create or replace function reset_dispute_seed_data()
returns void
language plpgsql
as $$
begin
  -- Clear existing data
  delete from agent_steps;
  delete from agent_runs;
  delete from disputes;
  delete from transactions;
  delete from user_profiles;
  delete from logistics_records;

  -- 5.1 Seed User Profiles
  insert into user_profiles (id, email, full_name, account_created_at, total_orders_count, total_spent_inr, chargeback_history_count, chargeback_ratio, risk_flag, known_device_ids, last_known_ip)
  values
    ('usr_rahul_sharma_99', 'rahul.sharma89@gmail.com', 'Rahul Sharma', '2022-04-10T08:00:00Z', 34, 284500.00, 0, 0.0000, 'LOW', '["dev_apple_iphone15_pro_blr", "dev_macbook_m2_blr"]'::jsonb, '49.36.128.45'),
    ('usr_flagged_ato_81', 'vikram.m.security@proton.me', 'Vikram Mehta', '2026-08-03T23:50:00Z', 2, 96000.00, 3, 1.0000, 'CRITICAL', '["dev_unknown_linux_proxy_vm"]'::jsonb, '185.220.101.4'),
    ('usr_priya_iyer_12', 'priya.iyer@fintechcorp.in', 'Priya Iyer', '2021-11-20T14:30:00Z', 19, 165000.00, 0, 0.0000, 'LOW', '["dev_pixel8_pro_noida"]'::jsonb, '103.21.144.92'),
    ('usr_ananya_das_44', 'ananya.das@cloudstudio.io', 'Ananya Das', '2023-01-15T10:00:00Z', 12, 88000.00, 0, 0.0000, 'LOW', '["dev_dell_xps15_blr"]'::jsonb, '122.161.49.201');

  -- 5.2 Seed Logistics Records
  insert into logistics_records (tracking_number, carrier, status, estimated_delivery, delivered_at, delivery_address, recipient_name, signature_captured, signature_name, gps_coordinates, delivery_proof_photo_url, events)
  values
    (
      'BD-884920192',
      'BlueDart Express',
      'DELIVERED',
      '2026-08-04T18:00:00Z',
      '2026-08-04T14:32:00Z',
      'Flat 402, Palm Heights, Indiranagar, Bengaluru, KA 560038',
      'Rahul Sharma',
      true,
      'R. Sharma (OTP Verified: 7892)',
      '12.9784° N, 77.6408° E (Matches Delivery Address Geofence)',
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400',
      '[
        {"timestamp": "2026-08-01T18:00:00Z", "location": "Bengaluru Hub", "status": "MANIFEST_CREATED", "description": "Shipment handed over by merchant"},
        {"timestamp": "2026-08-03T09:15:00Z", "location": "Indiranagar Delivery Center", "status": "OUT_FOR_DELIVERY", "description": "Assigned to courier agent Mahesh K (ID: BD-4029)"},
        {"timestamp": "2026-08-04T14:32:00Z", "location": "Indiranagar, Bengaluru", "status": "DELIVERED", "description": "Delivered directly to recipient. OTP 7892 verified and e-signature captured."}
      ]'::jsonb
    ),
    (
      'DL-991204859',
      'Delhivery',
      'RETURNED_TO_ORIGIN',
      null,
      null,
      'Abandoned Warehouse #4, GT Road Bypass, Ghaziabad, UP',
      null,
      false,
      null,
      null,
      null,
      '[
        {"timestamp": "2026-08-04T08:00:00Z", "location": "Delhi NCR Hub", "status": "IN_TRANSIT", "description": "Shipment dispatched to Ghaziabad center"},
        {"timestamp": "2026-08-05T11:20:00Z", "location": "Ghaziabad Hub", "status": "DELIVERY_FAILED", "description": "Consignee address premise locked / incomplete address. Receiver phone switched off."},
        {"timestamp": "2026-08-07T16:00:00Z", "location": "Ghaziabad Hub", "status": "RTO_INITIATED", "description": "Returning shipment to merchant origin warehouse"}
      ]'::jsonb
    ),
    (
      'DL-773019482',
      'Delhivery Surface',
      'IN_TRANSIT',
      '2026-07-22T18:00:00Z',
      null,
      'B-701, Lotus Boulevard, Sector 100, Noida, UP 201304',
      null,
      false,
      null,
      null,
      null,
      '[
        {"timestamp": "2026-07-17T14:00:00Z", "location": "Bengaluru Logistics Park", "status": "IN_TRANSIT", "description": "Dispatched to North Hub"},
        {"timestamp": "2026-07-20T03:30:00Z", "location": "Nagpur Transit Center", "status": "STALLED_IN_TRANSIT", "description": "Shipment scanned at transit sorting facility. No further departure scan recorded (Stalled >20 days)."}
      ]'::jsonb
    );

  -- 5.3 Seed Transactions
  insert into transactions (id, user_id, amount, currency, payment_method, card_last4, card_network, gateway_reference, gateway_response_code, three_ds_status, ip_address, ip_country, is_vpn_or_proxy, shipping_carrier, shipping_tracking_no, billing_address, shipping_address, item_description, item_type, created_at)
  values
    (
      'pay_982314_BLUEDART',
      'usr_rahul_sharma_99',
      14999.00,
      'INR',
      'card',
      '4192',
      'Visa Signature',
      'rzp_live_tx_9823148192',
      '200_SUCCESS_SETTLED',
      'AUTHENTICATED',
      '49.36.128.45',
      'IN',
      false,
      'BlueDart Express',
      'BD-884920192',
      'Flat 402, Palm Heights, Indiranagar, Bengaluru, KA 560038',
      'Flat 402, Palm Heights, Indiranagar, Bengaluru, KA 560038',
      'Sony WH-1000XM5 Wireless Noise-Canceling Headphones',
      'PHYSICAL_GOODS',
      '2026-08-01T15:20:00Z'
    ),
    (
      'pay_872109_PROXY_FRAUD',
      'usr_flagged_ato_81',
      48500.00,
      'INR',
      'card',
      '9012',
      'Mastercard World Elite',
      'rzp_live_tx_8721099012',
      '200_SUCCESS_SETTLED',
      'NOT_ENROLLED',
      '185.220.101.4',
      'DE (Tor Exit Node)',
      true,
      'Delhivery',
      'DL-991204859',
      'Plot 12, Defence Colony, New Delhi, DL 110024',
      'Abandoned Warehouse #4, GT Road Bypass, Ghaziabad, UP',
      'Swiss Automatic Heritage Watch (Ref #AX-9002)',
      'PHYSICAL_GOODS',
      '2026-08-04T02:14:00Z'
    ),
    (
      'pay_664192_DELAYED_DELHIVERY',
      'usr_priya_iyer_12',
      32000.00,
      'INR',
      'card',
      '8821',
      'RuPay Platinum',
      'rzp_live_tx_6641928821',
      '200_SUCCESS_SETTLED',
      'AUTHENTICATED',
      '103.21.144.92',
      'IN',
      false,
      'Delhivery Surface',
      'DL-773019482',
      'B-701, Lotus Boulevard, Sector 100, Noida, UP 201304',
      'B-701, Lotus Boulevard, Sector 100, Noida, UP 201304',
      'Pure Kanchipuram Gold Zari Bridal Silk Saree',
      'PHYSICAL_GOODS',
      '2026-07-16T11:00:00Z'
    ),
    (
      'pay_551029_SAAS_BILLING',
      'usr_ananya_das_44',
      4499.00,
      'INR',
      'card',
      '1098',
      'Visa Corporate',
      'rzp_live_tx_5510291098',
      '200_SUCCESS_SETTLED',
      'AUTHENTICATED',
      '122.161.49.201',
      'IN',
      false,
      null,
      null,
      '3rd Floor, Tech Park Alpha, Whitefield, Bengaluru, KA',
      'Digital Cloud Subscription License',
      'HyperCloud Enterprise Team Tier (Annual Billing License)',
      'SUBSCRIPTION',
      '2026-08-05T09:00:00Z'
    );

  -- 5.4 Seed Disputes
  insert into disputes (id, transaction_id, user_id, amount, currency, reason, status, customer_name, customer_email, merchant_name, arn, network, dispute_date, due_date, customer_claim_statement, merchant_fulfillment_note, created_at)
  values
    (
      'disp_01H9A_FRIENDLY',
      'pay_982314_BLUEDART',
      'usr_rahul_sharma_99',
      14999.00,
      'INR',
      'PRODUCT_NOT_RECEIVED',
      'PENDING',
      'Rahul Sharma',
      'rahul.sharma89@gmail.com',
      'UrbanVolt Consumer Electronics',
      '74523910293847561029384',
      'Visa',
      '2026-08-08T10:30:00Z',
      '2026-08-18T18:00:00Z',
      'Cardholder filed dispute alleging non-receipt: "I ordered Sony WH-1000XM5 headphones on Aug 1 for ₹14,999. The package never arrived at my Indiranagar address. The merchant did not issue an immediate refund, so I am requesting an unconditional bank chargeback."',
      'Merchant dispatched order on Aug 1 via BlueDart (AWB: BD-884920192). BlueDart telemetry confirms delivery on Aug 4 with recipient signature and OTP 7892 verification matching the geofence.',
      '2026-08-08T10:30:00Z'
    ),
    (
      'disp_02B8K_IDENTITY_FRAUD',
      'pay_872109_PROXY_FRAUD',
      'usr_flagged_ato_81',
      48500.00,
      'INR',
      'FRAUDULENT_TRANSACTION',
      'PENDING',
      'Vikram Mehta (Reported Unauthorized)',
      'vikram.m.security@proton.me',
      'Apex Luxury Timepieces',
      '84920192837465910293847',
      'Mastercard',
      '2026-08-10T14:15:00Z',
      '2026-08-20T18:00:00Z',
      'Cardholder filed unauthorized fraud dispute: "I discovered an unknown charge of ₹48,500 for a luxury watch on my statement. I did not make or authorize this purchase, never visited this store, and believe my card credentials were stolen in a phishing attack."',
      'Order placed at 2:14 AM from a German Tor exit node IP. Shipped via Delhivery (AWB: DL-991204859) to an abandoned warehouse; delivery failed (RTO initiated).',
      '2026-08-10T14:15:00Z'
    ),
    (
      'disp_03C4M_LOGISTICS_STALL',
      'pay_664192_DELAYED_DELHIVERY',
      'usr_priya_iyer_12',
      32000.00,
      'INR',
      'PRODUCT_NOT_RECEIVED',
      'PENDING',
      'Priya Iyer',
      'priya.iyer@fintechcorp.in',
      'Kavita Handcrafted Silks',
      '91029384756102938475610',
      'RuPay',
      '2026-08-11T09:00:00Z',
      '2026-08-21T18:00:00Z',
      'Cardholder filed non-delivery dispute: "I purchased a bridal gold zari silk saree for ₹32,000 on July 16th. Over 25 days have elapsed and the courier tracking has been stalled in transit since July 20th with no updates. I request a complete refund."',
      'Dispatched via Delhivery Surface (AWB: DL-773019482) on July 17. Telemetry shows package stalled at Nagpur sorting hub for >20 days without departure scan.',
      '2026-08-11T09:00:00Z'
    ),
    (
      'disp_04D9Z_SAAS_SUBSCRIPTION',
      'pay_551029_SAAS_BILLING',
      'usr_ananya_das_44',
      4499.00,
      'INR',
      'SUBSCRIPTION_UNRECOGNIZED',
      'PENDING',
      'Ananya Das',
      'ananya.das@cloudstudio.io',
      'HyperCloud Developer Tools',
      '49201928374651029384756',
      'Visa',
      '2026-08-12T11:45:00Z',
      '2026-08-22T18:00:00Z',
      'Cardholder filed unrecognized billing dispute: "My card was billed ₹4,499 for annual cloud team access. I believed I was on a trial and did not intend to renew. I dispute this charge."',
      'Cardholder verified payment via 3DS 2.0 corporate card and subsequently logged into the cloud developer console 18 times post-billing.',
      '2026-08-12T11:45:00Z'
    );

end;
$$;

-- 6. Automatically Run the Seed Initializer
-- ---------------------------------------------------------
select reset_dispute_seed_data();
