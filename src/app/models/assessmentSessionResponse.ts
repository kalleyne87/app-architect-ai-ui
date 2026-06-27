import { AssessmentResponse } from "./assessmentResponse";

export interface AssessmentSessionResponse {
  sessionId: number;
  status: AssessmentSessionStatus;
  isReadyForAssessment: boolean;
  missingInformationAreas: string[];
  nextQuestions: string[];
  finalAssessment: AssessmentResponse | null;
}

export enum AssessmentSessionStatus {
    NeedsMoreInformation = 'NeedsMoreInformation',
    ReadyForAssessment = 'ReadyForAssessment',
    Completed = 'Completed',
    Failed = 'Failed'
}