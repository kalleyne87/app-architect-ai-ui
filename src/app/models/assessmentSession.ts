import { Assessment } from "./assessment";
import { QuestionAnswer } from "./questionAnswer";

export interface AssessmentSession {
  id: string;
  originalRequest: string;
  collectedQuestionsAndAnswers: QuestionAnswer[];
  currentQuestions: string[];
  consolidatedPrompt?: string;
  finalAssessment?: Assessment;
  status: string;
  createdDateTime: Date;
  updatedDateTime: Date;
}
