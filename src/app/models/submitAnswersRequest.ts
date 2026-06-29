import { QuestionAnswer } from "./questionAnswer";

export interface SubmitAnswersRequest {
  sessionId: string;
  answers: QuestionAnswer[];
}