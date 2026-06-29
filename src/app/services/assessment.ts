import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AssessmentResponse } from '../models/assessmentResponse';
import { AssessmentSessionResponse } from '../models/assessmentSessionResponse';
import { AssessmentRequest } from '../models/assessmentRequest';
import { SubmitAnswersRequest } from '../models/submitAnswersRequest';
import { SessionSummaryResponse } from '../models/sessionSummaryResponse';
import { AssessmentSession } from '../models/assessmentSession';

@Injectable({ providedIn: 'root' })
export class AssessmentService {
  private readonly baseUrl = '/api/assessments';

  private readonly apiKey = 'architect-ai-2026-kb';

  private get headers() {
    return { headers: { 'X-Api-Key': this.apiKey } };
  }

  constructor(private http: HttpClient) {}

  createAssessment(request: AssessmentRequest): Observable<AssessmentSessionResponse> {
    return this.http.post<AssessmentSessionResponse>(this.baseUrl, request, this.headers);
  }

  submitAnswers(request: SubmitAnswersRequest): Observable<AssessmentSessionResponse> {
    return this.http.post<AssessmentSessionResponse>(
      `${this.baseUrl}/answers`, request, this.headers);
  }

  getSessions(): Observable<SessionSummaryResponse[]> {
    return this.http.get<SessionSummaryResponse[]>(
      `${this.baseUrl}/sessions`, this.headers);
  }

  getSession(id: string): Observable<AssessmentSession> {
    return this.http.get<AssessmentSession>(
      `${this.baseUrl}/sessions/${id}`, this.headers);
  }

  getAssessments(): Observable<AssessmentResponse[]> {
    return this.http.get<AssessmentResponse[]>(this.baseUrl, this.headers);
  }

  getAssessmentById(id: string): Observable<AssessmentResponse> {
    return this.http.get<AssessmentResponse>(
      `${this.baseUrl}/${id}`, this.headers);
  }
}

