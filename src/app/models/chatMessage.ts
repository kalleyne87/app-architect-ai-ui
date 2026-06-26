import { AssessmentResponse } from "./assessmentResponse";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  type: MessageType;
  text?: string;
  questions?: string[];
  assessment?: AssessmentResponse;
  timestamp: Date;
}

export enum MessageType {
 Text = 'text',
 Questions = 'questions',
 Assessment = 'assessment',
 Error = 'error'
}

export enum MessageRole {
  User = 'user',
  Assistant = 'assistant'
}