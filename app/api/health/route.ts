import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const hasGroq = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim().length > 0);
  return NextResponse.json({
    status: 'ok',
    service: 'Razorpay Agentic Chargeback Resolver',
    groq_configured: hasGroq,
    supabase_configured: isSupabaseConfigured,
    timestamp: new Date().toISOString(),
  });
}
