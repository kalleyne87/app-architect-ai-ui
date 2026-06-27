import { QuestionAnswer } from "./questionAnswer";

export interface SubmitAnswersRequest {
  sessionId: number;
  answers: QuestionAnswer[];
}