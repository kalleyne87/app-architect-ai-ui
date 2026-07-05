import { AssessmentResponse } from "./assessmentResponse";

export interface AssessmentSessionResponse {
  sessionId: string;
  status: AssessmentSessionStatus;
  isReadyForAssessment: boolean;
  missingInformationAreas: string[];
  nextQuestions: string[];
  finalAssessment: AssessmentResponse | null;
}

export enum AssessmentSessionStatus {
    NeedsMoreInformation = 'NeedsMoreInformation',
    ReadyForAssessment = 'ReadyForAssessment',
    Queued = 'Queued',
    Completed = 'Completed',
    Failed = 'Failed'
}