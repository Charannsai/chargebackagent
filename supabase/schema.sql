-- =========================================================
-- RAZORPAY AGENTIC CHARGEBACK RESOLVER - SUPABASE SCHEMA
-- =========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Disputes Table
create table if not exists disputes (
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

-- 2. Transactions Table
create table if not exists transactions (
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

-- 3. User Profiles (Risk Profile)
create table if not exists user_profiles (
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

-- 4. Logistics Records
create table if not exists logistics_records (
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

-- 5. Enterprise Audit Trail: Agent Runs
create table if not exists agent_runs (
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

-- 6. Enterprise Audit Trail: Agent Steps
create table if not exists agent_steps (
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

-- Indexes for lightning fast operations lookup
create index if not exists idx_disputes_status on disputes(status);
create index if not exists idx_agent_runs_dispute_id on agent_runs(dispute_id);
create index if not exists idx_agent_steps_run_id on agent_steps(agent_run_id);
