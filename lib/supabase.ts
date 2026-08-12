import { createClient } from '@supabase/supabase-js';
import {
  Dispute,
  Transaction,
  UserProfile,
  LogisticsRecord,
  AgentRun,
  AgentStep,
  AgentVerdict,
} from './types';
import { mockStore } from './mock-data';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.trim().length > 0 &&
  supabaseAnonKey.trim().length > 0 &&
  !supabaseUrl.includes('your-project')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// =========================================================
// UNIFIED DATABASE SERVICE (Supabase + Graceful Mock Fallback)
// =========================================================

export const dbService = {
  async getDisputes(): Promise<Dispute[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('disputes')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as Dispute[];
        }
      } catch (err) {
        console.warn('Supabase getDisputes query error, using local fallback:', err);
      }
    }
    return mockStore.getDisputes();
  },

  async getDispute(id: string): Promise<Dispute | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('disputes')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) {
          return data as Dispute;
        }
      } catch (err) {
        console.warn(`Supabase getDispute(${id}) query error:`, err);
      }
    }
    return mockStore.getDispute(id) || null;
  },

  async getTransaction(id: string): Promise<Transaction | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) {
          return data as Transaction;
        }
      } catch (err) {
        console.warn(`Supabase getTransaction(${id}) error:`, err);
      }
    }
    return mockStore.getTransaction(id) || null;
  },

  async getUserProfileById(id: string): Promise<UserProfile | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) {
          return data as UserProfile;
        }
      } catch (err) {
        console.warn(`Supabase getUserProfileById(${id}) error:`, err);
      }
    }
    return mockStore.getUserProfileById(id) || null;
  },

  async getUserProfileByEmail(email: string): Promise<UserProfile | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('email', email)
          .single();

        if (!error && data) {
          return data as UserProfile;
        }
      } catch (err) {
        console.warn(`Supabase getUserProfileByEmail(${email}) error:`, err);
      }
    }
    return mockStore.getUserProfileByEmail(email) || null;
  },

  async getLogisticsRecord(trackingNumber: string): Promise<LogisticsRecord | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('logistics_records')
          .select('*')
          .eq('tracking_number', trackingNumber)
          .single();

        if (!error && data) {
          return data as LogisticsRecord;
        }
      } catch (err) {
        console.warn(`Supabase getLogisticsRecord(${trackingNumber}) error:`, err);
      }
    }
    return mockStore.getLogisticsRecord(trackingNumber) || null;
  },

  async saveAgentRun(run: AgentRun): Promise<void> {
    // Keep local store in sync
    mockStore.saveAgentRun(run);

    if (supabase) {
      try {
        // Insert or update run
        await supabase.from('agent_runs').upsert({
          id: run.id,
          dispute_id: run.dispute_id,
          started_at: run.started_at,
          completed_at: run.completed_at,
          model: run.model,
          engine_mode: run.engine_mode,
          iterations: run.iterations,
          final_verdict: run.final_verdict,
          confidence_score: run.confidence_score,
          evaluation: run.evaluation,
          representment_package: run.representment_package,
          human_action: run.human_action || 'PENDING',
          human_override_verdict: run.human_override_verdict,
          human_notes: run.human_notes,
          reviewed_at: run.reviewed_at,
        });

        // Update latest_run_id on dispute
        await supabase
          .from('disputes')
          .update({
            latest_run_id: run.id,
            status:
              run.final_verdict === 'REPRESENT_DISPUTE'
                ? 'RESOLVED_REPRESENTED'
                : run.final_verdict === 'ACCEPT_REFUND'
                ? 'RESOLVED_REFUNDED'
                : run.final_verdict === 'ESCALATE_TO_HUMAN'
                ? 'ESCALATED'
                : 'UNDER_INVESTIGATION',
          })
          .eq('id', run.dispute_id);

        // Insert steps
        if (run.steps && run.steps.length > 0) {
          const stepRows = run.steps.map((s) => ({
            id: s.id,
            agent_run_id: run.id,
            sequence: s.sequence,
            event_type: s.event_type,
            label: s.label,
            tool_name: s.tool_name,
            arguments: s.arguments,
            result: s.result,
            latency_ms: s.latency_ms,
            timestamp: s.timestamp,
          }));
          await supabase.from('agent_steps').upsert(stepRows);
        }
      } catch (err) {
        console.warn('Supabase saveAgentRun error:', err);
      }
    }
  },

  async saveAgentStep(step: AgentStep): Promise<void> {
    if (supabase) {
      try {
        await supabase.from('agent_steps').upsert({
          id: step.id,
          agent_run_id: step.agent_run_id,
          sequence: step.sequence,
          event_type: step.event_type,
          label: step.label,
          tool_name: step.tool_name,
          arguments: step.arguments,
          result: step.result,
          latency_ms: step.latency_ms,
          timestamp: step.timestamp,
        });
      } catch (err) {
        console.warn('Supabase saveAgentStep error:', err);
      }
    }
  },

  async getAgentRunsForDispute(disputeId: string): Promise<AgentRun[]> {
    if (supabase) {
      try {
        const { data: runsData, error: runsError } = await supabase
          .from('agent_runs')
          .select('*')
          .eq('dispute_id', disputeId)
          .order('started_at', { ascending: false });

        if (!runsError && runsData) {
          const runs: AgentRun[] = [];
          for (const r of runsData) {
            const { data: stepsData } = await supabase
              .from('agent_steps')
              .select('*')
              .eq('agent_run_id', r.id)
              .order('sequence', { ascending: true });

            runs.push({
              id: r.id,
              dispute_id: r.dispute_id,
              started_at: r.started_at,
              completed_at: r.completed_at,
              model: r.model,
              engine_mode: r.engine_mode,
              iterations: r.iterations,
              final_verdict: r.final_verdict,
              confidence_score: r.confidence_score,
              evaluation: r.evaluation,
              representment_package: r.representment_package,
              human_action: r.human_action,
              human_override_verdict: r.human_override_verdict,
              human_notes: r.human_notes,
              reviewed_at: r.reviewed_at,
              steps: (stepsData as AgentStep[]) || [],
            });
          }
          if (runs.length > 0) return runs;
        }
      } catch (err) {
        console.warn(`Supabase getAgentRunsForDispute(${disputeId}) error:`, err);
      }
    }
    return mockStore.getAgentRunsForDispute(disputeId);
  },

  async getAgentRun(runId: string): Promise<AgentRun | null> {
    if (supabase) {
      try {
        const { data: r, error } = await supabase
          .from('agent_runs')
          .select('*')
          .eq('id', runId)
          .single();

        if (!error && r) {
          const { data: stepsData } = await supabase
            .from('agent_steps')
            .select('*')
            .eq('agent_run_id', runId)
            .order('sequence', { ascending: true });

          return {
            id: r.id,
            dispute_id: r.dispute_id,
            started_at: r.started_at,
            completed_at: r.completed_at,
            model: r.model,
            engine_mode: r.engine_mode,
            iterations: r.iterations,
            final_verdict: r.final_verdict,
            confidence_score: r.confidence_score,
            evaluation: r.evaluation,
            representment_package: r.representment_package,
            human_action: r.human_action,
            human_override_verdict: r.human_override_verdict,
            human_notes: r.human_notes,
            reviewed_at: r.reviewed_at,
            steps: (stepsData as AgentStep[]) || [],
          };
        }
      } catch (err) {
        console.warn(`Supabase getAgentRun(${runId}) error:`, err);
      }
    }
    return mockStore.getAgentRun(runId) || null;
  },

  async applyHumanReview(
    disputeId: string,
    runId: string,
    action: string,
    overrideVerdict?: AgentVerdict,
    notes?: string
  ): Promise<AgentRun | null> {
    const localRun = mockStore.applyHumanReview(
      disputeId,
      runId,
      action as 'APPROVED' | 'OVERRIDDEN',
      overrideVerdict,
      notes
    );

    if (supabase) {
      try {
        const reviewedAt = new Date().toISOString();
        let disputeStatus = 'RESOLVED_REPRESENTED';

        const finalDecision = overrideVerdict || localRun?.final_verdict;
        if (action === 'OVERRIDDEN' && overrideVerdict) {
          if (overrideVerdict === 'ACCEPT_REFUND') disputeStatus = 'RESOLVED_REFUNDED';
          else if (overrideVerdict === 'ESCALATE_TO_HUMAN') disputeStatus = 'ESCALATED';
          else disputeStatus = 'RESOLVED_REPRESENTED';
        } else if (finalDecision === 'ACCEPT_REFUND') {
          disputeStatus = 'RESOLVED_REFUNDED';
        } else if (finalDecision === 'ESCALATE_TO_HUMAN') {
          disputeStatus = 'ESCALATED';
        }

        await supabase
          .from('agent_runs')
          .update({
            human_action: action,
            human_override_verdict: overrideVerdict || null,
            human_notes: notes || null,
            reviewed_at: reviewedAt,
          })
          .eq('id', runId);

        await supabase
          .from('disputes')
          .update({
            status: disputeStatus,
            notes: notes || null,
          })
          .eq('id', disputeId);
      } catch (err) {
        console.warn('Supabase applyHumanReview error:', err);
      }
    }

    return localRun || null;
  },

  async createCustomDispute(payload: {
    dispute: Dispute;
    transaction: Transaction;
    userProfile: UserProfile;
    logisticsRecord?: LogisticsRecord;
  }): Promise<Dispute> {
    mockStore.createCustomDispute(payload);

    if (supabase) {
      try {
        await supabase.from('transactions').insert(payload.transaction);
        await supabase.from('user_profiles').upsert(payload.userProfile);
        if (payload.logisticsRecord) {
          await supabase.from('logistics_records').insert(payload.logisticsRecord);
        }
        await supabase.from('disputes').insert(payload.dispute);
      } catch (err) {
        console.warn('Supabase createCustomDispute error:', err);
      }
    }

    return payload.dispute;
  },

  async resetToDefaults(): Promise<void> {
    mockStore.resetToDefaults();

    if (supabase) {
      try {
        // Call stored procedure if it exists
        const { error } = await supabase.rpc('reset_dispute_seed_data');
        if (error) {
          console.warn('RPC reset_dispute_seed_data failed, resetting tables manually:', error.message);
        }
      } catch (err) {
        console.warn('Supabase resetToDefaults error:', err);
      }
    }
  },
};
