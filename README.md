# ArchitectAI — Frontend UI

> The Angular 22 frontend for ArchitectAI — a chat-style interface that guides users through a multi-turn AI conversation to produce a full architecture assessment for their app idea.

[![Angular](https://img.shields.io/badge/Angular-19-DD0031?logo=angular)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![NgRx Signal Store](https://img.shields.io/badge/NgRx-Signal%20Store-BA2BD2?logo=reactivex)](https://ngrx.io/guide/signals)
[![SCSS](https://img.shields.io/badge/Styles-SCSS-CC6699?logo=sass)](https://sass-lang.com/)

---

## What It Does

ArchitectAI's frontend presents a conversational chat interface where users describe their app idea and are guided through a series of AI-generated follow-up questions. Once enough context has been gathered, the system returns a complete architecture assessment covering recommended services, requirements, tradeoffs, risks, and a roadmap.

**Backend repo:** [app-architect-ai-backend](https://github.com/kalleyne87/app-architect-ai-backend)

---

## UI Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        ArchitectAI                          │
├──────────────────┬──────────────────────────────────────────┤
│                  │                                          │
│   Sidebar        │   Chat                                   │
│                  │                                          │
│  Past Sessions   │  ┌──────────────────────────────────┐   │
│  ─────────────   │  │  Message Bubble (AI)             │   │
│  • Session 1     │  │  "Tell me about your app idea"   │   │
│  • Session 2     │  └──────────────────────────────────┘   │
│  • Session 3     │                                          │
│                  │  ┌──────────────────────────────────┐   │
│                  │  │  Message Bubble (User)           │   │
│                  │  │  "I want to build a..."          │   │
│                  │  └──────────────────────────────────┘   │
│                  │                                          │
│                  │  ┌──────────────────────────────────┐   │
│                  │  │  Message Bubble (AI)             │   │
│                  │  │  Follow-up questions...          │   │
│                  │  └──────────────────────────────────┘   │
│                  │                                          │
│                  │  [ User input field          ] [Send]   │
└──────────────────┴──────────────────────────────────────────┘
```

---

## Architecture

```
app/
├── components/
│   ├── home/               # Root layout — composes sidebar, chat, message bubble
│   ├── chat/               # Chat container — manages conversation flow and input
│   ├── message-bubble/     # Individual message rendering (user vs AI)
│   └── sidebar/            # Past assessment sessions list
├── models/                 # TypeScript interfaces matching backend contracts
│   ├── assessmentRequest.ts
│   ├── assessmentResponse.ts
│   ├── assessmentSessionResponse.ts
│   ├── chatMessage.ts
│   ├── questionAnswer.ts
│   ├── sessionSummary.ts
│   └── submitAnswersRequest.ts
├── services/
│   └── assessment.ts       # HTTP service — all API calls to the backend
└── store/
    └── assessment.store.ts # NgRx Signal Store — global assessment state
```

### Key Design Decisions

**NgRx Signal Store for state management**
Assessment sessions involve multiple async steps — submitting an idea, receiving questions, submitting answers, and eventually receiving the full assessment. NgRx Signal Store manages this state reactively, keeping the conversation flow in sync across components without prop drilling or manual subscriptions.

**Chat-style UX over a form-based flow**
Rather than a traditional multi-step form, the UI presents the assessment process as a conversation. The AI's questions and the user's answers appear as message bubbles, making the back-and-forth feel natural and keeping the user engaged through what could otherwise feel like a long intake form.

**Sidebar for session history**
Past assessment sessions are accessible from the sidebar, allowing users to revisit previous assessments without losing context. This also demonstrates real persistence — sessions aren't ephemeral, they're stored and retrievable.

**Typed models mirroring backend contracts**
Every API request and response has a corresponding TypeScript interface in the `models/` folder that mirrors the backend DTOs exactly. This keeps the integration tight and surfaces breaking changes at compile time rather than runtime.

---

## Component Breakdown

### `home`
Root layout component. Composes the sidebar, chat, and message bubble components into the full application shell. Handles overall page structure and layout.

### `chat`
The core interaction component. Manages the conversation flow — sending the initial app idea, displaying follow-up questions, collecting user answers, and rendering the final assessment when returned. Communicates with the backend via the assessment service.

### `message-bubble`
Presentational component for rendering individual messages in the conversation. Handles visual differentiation between AI messages and user messages.

### `sidebar`
Displays a list of past assessment sessions using `sessionSummary` models. Allows users to navigate to and review previous assessments.

---

## State Management

The `assessment.store.ts` (NgRx Signal Store) manages:

| State | Description |
|---|---|
| Current session | The active `AssessmentSessionResponse` including status and current questions |
| Conversation history | The list of `ChatMessage` objects rendered in the chat |
| Past sessions | The list of `SessionSummary` objects displayed in the sidebar |
| Loading states | Async indicators for API calls in progress |

---

## Models

| Model | Description |
|---|---|
| `AssessmentRequest` | The user's initial app idea submitted to start a session |
| `AssessmentSessionResponse` | The session state returned by the API including status and questions |
| `AssessmentResponse` | The final assessment output (summary, services, risks, roadmap) |
| `ChatMessage` | A single message in the conversation (role + content) |
| `QuestionAnswer` | A paired question and user answer |
| `SessionSummary` | A lightweight session object for sidebar display |
| `SubmitAnswersRequest` | The payload sent when the user answers follow-up questions |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 22 |
| Language | TypeScript 5.x |
| State Management | NgRx Signal Store |
| Styles | SCSS |
| HTTP | Angular HttpClient |
| Build | Angular CLI |

---

## Local Development

### Prerequisites
- Node.js 20+
- Angular CLI (`npm install -g @angular/cli`)
- Backend API running locally ([setup instructions](https://github.com/kalleyne87/app-achitect-ai-backend))

### Run Locally

```bash
git clone https://github.com/kalleyne87/app-architect-ai-ui.git
cd app-architect-ai-ui
npm install
ng serve
```

App will be available at `http://localhost:4200`.

The `proxy.conf.json` is configured to forward API requests to the backend at `http://localhost:5197` during local development.

### Environment Configuration

Update `src/environments/environment.ts` with your backend API URL if needed:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5197'
};
```

---

## Roadmap

- [x] Chat conversation flow
- [x] Message bubble rendering (user vs AI)
- [x] Session sidebar with past assessments
- [x] NgRx Signal Store state management
- [x] Typed models matching backend contracts
- [x] Full assessment results view
- [x] Session resume from sidebar
- [x] Loading and error states
- [ ] Deploy to Azure Static Web Apps

---

## About

Frontend companion to [app-architect-ai-backend](https://github.com/kalleyne87/app-architect-ai-backend). Built with Angular 22 and NgRx Signal Store to demonstrate modern reactive frontend architecture alongside a distributed .NET backend.