export interface Assessment {
  id: string;
  requirements: string;
  executiveSummary: string;
  recommendedServices: string[];
  risks: string[];
  tradeoffs: string[];
  roadmap: string[];
  sessionId: string;
  createdDateTime: Date;
}
