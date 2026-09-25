import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Dimension, CheckpointChoice, DimensionScores, IERAuditResult } from '@/types';
import { calculateDimensionScores, auditIER } from '@/lib/scoring';
import { ITEMS_DATA } from '@/lib/items';

export type AppPhase = 'landing' | 'consent' | 'test' | 'checkpoint' | 'report';

export const DIMENSIONS_ORDER: Dimension[] = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8'];

export function generateParticipantCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `MVAB-${rand}-${digits}`;
}

interface TestState {
  // Navigation & Phases
  phase: AppPhase;
  currentDimIndex: number; // 0 to 7
  
  // Participant & Study Norming
  participantCode: string;
  hasConsentedToStudy: boolean;

  // Responses & Latency
  responses: Record<string, number>; // itemId -> value (1-5)
  latencies: Record<string, number>; // itemId -> milliseconds
  currentQuestionStartTime: number;

  // Behavioral & Implicit Measures
  checkpointChoices: CheckpointChoice[];
  checkpointStartTime: number;
  delayedGratificationScore: number;

  // Actions
  setPhase: (phase: AppPhase) => void;
  setParticipantCode: (code: string) => void;
  setHasConsentedToStudy: (consented: boolean) => void;
  startAssessment: () => void;
  recordQuestionStart: () => void;
  answerQuestion: (itemId: string, value: number) => void;
  recordCheckpointChoice: (choice: 'read_detail' | 'skip_continue') => void;
  proceedToNextDimension: () => void;
  resetAll: () => void;

  // Computed Getters
  getCurrentDimension: () => Dimension;
  getItemsForCurrentDimension: () => typeof ITEMS_DATA;
  isCurrentDimensionComplete: () => boolean;
  getProgressPercent: () => number;
  getResults: () => {
    scores: DimensionScores;
    ierAudit: IERAuditResult;
  };
}

export const useTestStore = create<TestState>()(
  persist(
    (set, get) => ({
      phase: 'landing',
      currentDimIndex: 0,
      participantCode: '',
      hasConsentedToStudy: true,
      responses: {},
      latencies: {},
      currentQuestionStartTime: Date.now(),
      checkpointChoices: [],
      checkpointStartTime: 0,
      delayedGratificationScore: 0,

      setPhase: (phase) => set({ phase }),
      setParticipantCode: (code) => set({ participantCode: code }),
      setHasConsentedToStudy: (hasConsentedToStudy) => set({ hasConsentedToStudy }),

      startAssessment: () => {
        let code = get().participantCode;
        if (!code) {
          code = generateParticipantCode();
        }
        set({
          phase: 'test',
          currentDimIndex: 0,
          participantCode: code,
          currentQuestionStartTime: Date.now()
        });
      },

      recordQuestionStart: () => set({
        currentQuestionStartTime: Date.now()
      }),

      answerQuestion: (itemId, value) => {
        const now = Date.now();
        const duration = Math.max(200, now - (get().currentQuestionStartTime || now));
        
        set((state) => {
          const newResponses = { ...state.responses, [itemId]: value };
          const newLatencies = { ...state.latencies, [itemId]: duration };
          return {
            responses: newResponses,
            latencies: newLatencies,
            currentQuestionStartTime: now
          };
        });
      },

      recordCheckpointChoice: (choice) => {
        const dim = get().getCurrentDimension();
        const now = Date.now();
        const dwellTime = Math.max(100, now - (get().checkpointStartTime || now));

        set((state) => ({
          checkpointChoices: [
            ...state.checkpointChoices,
            {
              dimension: dim,
              choice,
              dwellTimeMs: dwellTime,
              timestamp: now
            }
          ],
          delayedGratificationScore: choice === 'skip_continue' 
            ? state.delayedGratificationScore + 1 
            : state.delayedGratificationScore
        }));
      },

      proceedToNextDimension: () => {
        const nextIndex = get().currentDimIndex + 1;
        if (nextIndex < DIMENSIONS_ORDER.length) {
          set({
            currentDimIndex: nextIndex,
            phase: 'test',
            currentQuestionStartTime: Date.now()
          });
        } else {
          // All 8 dimensions finished -> go to report
          set({ phase: 'report' });
        }
      },

      resetAll: () => set({
        phase: 'landing',
        currentDimIndex: 0,
        participantCode: '',
        responses: {},
        latencies: {},
        currentQuestionStartTime: Date.now(),
        checkpointChoices: [],
        checkpointStartTime: 0,
        delayedGratificationScore: 0
      }),

      getCurrentDimension: () => {
        const idx = get().currentDimIndex;
        return DIMENSIONS_ORDER[idx] || 'D1';
      },

      getItemsForCurrentDimension: () => {
        const dim = get().getCurrentDimension();
        // If D8 (last dimension), include D8 and IER items
        if (dim === 'D8') {
          return ITEMS_DATA.filter(item => item.dim === 'D8' || item.dim === 'IER');
        }
        return ITEMS_DATA.filter(item => item.dim === dim);
      },

      isCurrentDimensionComplete: () => {
        const items = get().getItemsForCurrentDimension();
        const res = get().responses;
        return items.every(item => res[item.id] !== undefined);
      },

      getProgressPercent: () => {
        const answered = Object.keys(get().responses).length;
        const total = ITEMS_DATA.length;
        return Math.round((answered / (total || 1)) * 100);
      },

      getResults: () => {
        const responses = get().responses;
        const scores = calculateDimensionScores(responses);
        const ierAudit = auditIER(responses);
        return { scores, ierAudit };
      }
    }),
    {
      name: 'mvab_v21_session_storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        phase: state.phase,
        currentDimIndex: state.currentDimIndex,
        participantCode: state.participantCode,
        hasConsentedToStudy: state.hasConsentedToStudy,
        responses: state.responses,
        latencies: state.latencies,
        checkpointChoices: state.checkpointChoices,
        delayedGratificationScore: state.delayedGratificationScore
      })
    }
  )
);
