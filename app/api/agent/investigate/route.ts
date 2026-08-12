import { NextRequest } from 'next/server';
import { runAgentInvestigation } from '@/lib/agent/engine';
import { AgentStep, AgentRun } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { disputeId, engineMode = 'groq', operatorGuidance } = body;

    if (!disputeId) {
      return new Response(JSON.stringify({ error: 'disputeId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: any) => {
          const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        };

        try {
          const run: AgentRun = await runAgentInvestigation({
            disputeId,
            engineMode,
            operatorGuidance,
            onStep: (step: AgentStep) => {
              sendEvent('step', step);
            },
          });

          sendEvent('complete', run);
          controller.close();
        } catch (error: any) {
          sendEvent('error', { message: error.message || 'Investigation failed' });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
