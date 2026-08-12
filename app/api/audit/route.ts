import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const disputeId = searchParams.get('disputeId');
    const runId = searchParams.get('runId');

    if (runId) {
      const run = mockStore.getAgentRun(runId);
      if (!run) {
        return NextResponse.json({ error: 'Run not found' }, { status: 404 });
      }
      return NextResponse.json({ run });
    }

    if (disputeId) {
      const runs = mockStore.getAgentRunsForDispute(disputeId);
      return NextResponse.json({ runs });
    }

    return NextResponse.json({ error: 'disputeId or runId required' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
