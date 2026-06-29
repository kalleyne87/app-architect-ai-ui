import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
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
  activeSessionId: string | null;
  sessionStatus: string | null;
  isLoading: boolean;
  isLoadingSession: boolean;
  error: string | null;
  pendingQuestions: string[];
  messages: ChatMessage[];
  sessionHistory: SessionSummary[];
}

const initialState: AssessmentState = {
  activeSessionId: null,
  sessionStatus: null,
  isLoading: false,
  isLoadingSession: false,
  error: null,
  pendingQuestions: [],
  messages: [],
  sessionHistory: [],
};

export const AssessmentStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed((store) => ({
    hasActiveSession: computed(() => store.activeSessionId() !== null),
    isSessionComplete: computed(() => store.sessionStatus() === SessionStatus.Completed),
    completedCount: computed(() =>
      store.sessionHistory().filter(s => s.status === SessionStatus.Completed).length
    ),
  })),

  withMethods((store, assessmentService = inject(AssessmentService)) => {
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

      submitAnswers: rxMethod<{ sessionId: string; answers: QuestionAnswer[] }>(
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

      loadSessions: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap(() =>
            assessmentService.getSessions().pipe(
              tapResponse({
                next: (sessions) => {
                  const history: SessionSummary[] = sessions.map(s => ({
                    id: s.id,
                    title: s.originalRequest.slice(0, 50) +
                      (s.originalRequest.length > 50 ? '…' : ''),
                    status: s.status === SessionStatus.Completed ? SessionStatus.Completed :
                            s.status === SessionStatus.Failed ? SessionStatus.Failed : SessionStatus.Active,
                    createdAt: new Date(s.createdDateTime)
                  }));
                  patchState(store, { sessionHistory: history, isLoading: false });
                },
                error: (err: Error) => {
                  patchState(store, { isLoading: false, error: err.message });
                }
              })
            )
          )
        )
      ),

      loadSession: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isLoadingSession: true, messages: [] })),
          switchMap((id) =>
            assessmentService.getSession(id).pipe(
              tapResponse({
                next: (session) => {
                  const messages: ChatMessage[] = [];

                  // Add original request as user message
                  messages.push({
                    id: crypto.randomUUID(),
                    role: MessageRole.User,
                    type: MessageType.Text,
                    text: session.originalRequest,
                    timestamp: new Date(session.createdDateTime)
                  });

                  // Rebuild Q&A rounds from collected answers
                  if (session.collectedQuestionsAndAnswers.length > 0) {
                    // Group into rounds of questions (3 per round max)
                    const roundSize = 3;
                    const qna = session.collectedQuestionsAndAnswers;

                    for (let i = 0; i < qna.length; i += roundSize) {
                      const round = qna.slice(i, i + roundSize);

                      // AI question bubble
                      messages.push({
                        id: crypto.randomUUID(),
                        role: MessageRole.Assistant,
                        type: MessageType.Questions,
                        text: i === 0
                          ? 'Great idea! I needed a bit more detail. Here were my questions:'
                          : 'Thanks! I had a few more questions:',
                        questions: round.map((q: any) => q.question),
                        timestamp: new Date(round[0].createdDateTime)
                      });

                      // User answer bubble
                      const answerSummary = round
                        .map((qa: any) => `${qa.question}\n${qa.answer}`)
                        .join('\n\n');

                      messages.push({
                        id: crypto.randomUUID(),
                        role: MessageRole.User,
                        type: MessageType.Text,
                        text: answerSummary,
                        timestamp: new Date(round[0].createdDateTime)
                      });
                    }
                  }

                  // Add final assessment if completed
                  if (session.finalAssessment) {
                    messages.push({
                      id: crypto.randomUUID(),
                      role: MessageRole.Assistant,
                      type: MessageType.Assessment,
                      assessment: {
                        executiveSummary: session.finalAssessment.executiveSummary,
                        recommendedServices: session.finalAssessment.recommendedServices,
                        risks: session.finalAssessment.risks,
                        tradeoffs: session.finalAssessment.tradeoffs,
                        roadmap: session.finalAssessment.roadmap,
                      },
                      timestamp: new Date(session.finalAssessment.createdDateTime)
                    });
                  }

                  patchState(store, {
                    activeSessionId: session.id,
                    sessionStatus: session.status === 'Completed' 
                                    ? SessionStatus.Completed : session.status,
                    isLoadingSession: false,
                    messages
                  });
                },
                error: (err: Error) => {
                  patchState(store, {
                    isLoadingSession: false,
                    error: err.message
                  });
                }
              })
            )
          )
        )
      ),
    };
  })
);