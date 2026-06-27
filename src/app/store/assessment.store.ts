import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, catchError, pipe, switchMap, tap } from 'rxjs';
import { AssessmentService } from '../services/assessment';
import { ChatMessage, MessageRole, MessageType } from '../models/chatMessage';
import { SessionStatus, SessionSummary } from '../models/sessionSummary';
import { AssessmentSessionResponse } from '../models/assessmentSessionResponse';
import { AssessmentRequest } from '../models/assessmentRequest';
import { QuestionAnswer } from '../models/questionAnswer';
import { tapResponse } from '@ngrx/operators';

// ─────────────────────────────────────────────
//  State shape
// ─────────────────────────────────────────────

export interface AssessmentState {
  activeSessionId:  number | null;
  sessionStatus:    string | null;
  isLoading:        boolean;
  error:            string | null;
  pendingQuestions: string[];
  messages:         ChatMessage[];
  sessionHistory:   SessionSummary[];
}

const initialState: AssessmentState = {
  activeSessionId:  null,
  sessionStatus:    null,
  isLoading:        false,
  error:            null,
  pendingQuestions: [],
  messages:         [],
  sessionHistory:   [],
};

export const AssessmentStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  // ── Computed ────────────────────────────────
  withComputed((store) => ({
    hasActiveSession: computed(() => store.activeSessionId() !== null),
    isSessionComplete: computed(() => store.sessionStatus() === SessionStatus.Completed),
    completedCount: computed(() =>
      store.sessionHistory().filter(s => s.status === SessionStatus.Completed).length
    ),
  })),

  // ── Methods ─────────────────────────────────
  withMethods((store, assessmentService = inject(AssessmentService)) => {

    // Private helpers
    function addMessage(message: ChatMessage): void {
      patchState(store, (state) => ({
        messages: [...state.messages, message],
      }));
    }

    function makeUserMessage(text: string): ChatMessage {
      return {
        id: crypto.randomUUID(),
        role: MessageRole.User,
        type: MessageType.Text,
        text,
        timestamp: new Date(),
      };
    }

    function makeErrorMessage(text: string): ChatMessage {
      return {
        id: crypto.randomUUID(),
        role: MessageRole.Assistant,
        type: MessageType.Error,
        text,
        timestamp: new Date(),
      };
    }

    return {
      startNewSession(): void {
        patchState(store, {
          activeSessionId:  null,
          sessionStatus:    null,
          isLoading:        false,
          error:            null,
          pendingQuestions: [],
          messages:         [],
        });
      },

      sendRequirements: rxMethod<AssessmentRequest>(
        pipe(
          tap((request) => {
            addMessage(makeUserMessage(request.requirements));
            patchState(store, { isLoading: true, error: null });
          }),
          switchMap((request) =>
            assessmentService.createAssessment(request).pipe(
              tapResponse({
                next: (response: AssessmentSessionResponse) => {
                  // Add to sidebar history
                  const summary: SessionSummary = {
                    id: String(response.sessionId),
                    title: request.requirements.slice(0, 50) +
                      (request.requirements.length > 50 ? '…' : ''),
                    status: response.status === 'Completed' 
                    ? SessionStatus.Completed : SessionStatus.Active,
                    createdAt: new Date(),
                  };

                  patchState(store, (state) => ({
                    activeSessionId:  response.sessionId,
                    sessionStatus:    response.status,
                    isLoading:        false,
                    pendingQuestions: response.isReadyForAssessment ? [] : response.nextQuestions,
                    sessionHistory:   [summary, ...state.sessionHistory],
                  }));

                  // Add AI message
                  const aiMessage: ChatMessage = response.isReadyForAssessment
                    ? {
                        id:         crypto.randomUUID(),
                        role:       MessageRole.Assistant,
                        type:       MessageType.Assessment,
                        assessment: response.finalAssessment!,
                        timestamp:  new Date(),
                      }
                    : {
                        id:        crypto.randomUUID(),
                        role:      MessageRole.Assistant,
                        type:      MessageType.Questions,
                        text:      'Great idea! I need a bit more detail. Please answer these:',
                        questions: response.nextQuestions,
                        timestamp: new Date(),
                      };

                  addMessage(aiMessage);
                },
                error: (err: Error) => {
                  addMessage(makeErrorMessage(
                    'Something went wrong reaching the server. Please try again.'
                  ));
                  patchState(store, {
                    isLoading: false,
                    error: err.message ?? 'Unknown error',
                  });
                },
              })
            )
          )
        )
      ),

      // POST /api/assessment/answers
      submitAnswers: rxMethod<{ sessionId: number; answers: QuestionAnswer[] }>(
        pipe(
          tap(({ answers }) => {
            const summary = answers
              .map(qa => `${qa.question}\n${qa.answer}`)
              .join('\n\n');
            addMessage(makeUserMessage(summary));
            patchState(store, { isLoading: true, error: null, pendingQuestions: [] });
          }),
          switchMap(({ sessionId, answers }) =>
            assessmentService.submitAnswers({ sessionId, answers }).pipe(
              tapResponse({
                next: (response: AssessmentSessionResponse) => {
                  patchState(store, (state) => ({
                    sessionStatus:    response.status,
                    isLoading:        false,
                    pendingQuestions: response.isReadyForAssessment ? [] : response.nextQuestions,
                    sessionHistory:   state.sessionHistory.map(s =>
                      s.id === String(response.sessionId)
                        ? { ...s, status: response.status === 'Completed' ? SessionStatus.Completed : SessionStatus.Active }
                        : s
                    ),
                  }));

                  const aiMessage: ChatMessage = response.isReadyForAssessment
                    ? {
                        id:         crypto.randomUUID(),
                        role:       MessageRole.Assistant,
                        type:       MessageType.Assessment,
                        assessment: response.finalAssessment!,
                        timestamp:  new Date(),
                      }
                    : {
                        id:        crypto.randomUUID(),
                        role:      MessageRole.Assistant,
                        type:      MessageType.Questions,
                        text:      'Thanks! Just a few more questions:',
                        questions: response.nextQuestions,
                        timestamp: new Date(),
                      };

                  addMessage(aiMessage);
                },
                error: (err: Error) => {
                  addMessage(makeErrorMessage(
                    'Something went wrong submitting your answers. Please try again.'
                  ));
                  patchState(store, {
                    isLoading: false,
                    error: err.message ?? 'Unknown error',
                  });
                },
              })
            )
          )
        )
      ),
    };
  })
);