import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AssessmentResponse } from '../models/assessmentResponse';
import { AssessmentSessionResponse } from '../models/assessmentSessionResponse';
import { AssessmentRequest } from '../models/assessmentRequest';
import { SubmitAnswersRequest } from '../models/submitAnswersRequest';

@Injectable({ providedIn: 'root' })
export class AssessmentService {
  private readonly baseUrl = '/api/assessments';

  private readonly apiKey = 'architect-ai-2026-kb';

  constructor(private http: HttpClient) {}

  createAssessment(request: AssessmentRequest): Observable<AssessmentSessionResponse> {
    return this.http.post<AssessmentSessionResponse>(
      this.baseUrl, 
      request,
      { headers: { 'X-Api-Key': this.apiKey } }
    );
  }

  submitAnswers(request: SubmitAnswersRequest): Observable<AssessmentSessionResponse> {
    return this.http.post<AssessmentSessionResponse>(
      `${this.baseUrl}/answers`,
      request,
      { headers: { 'X-Api-Key': this.apiKey } }
    );
  }

  getAssessments(): Observable<AssessmentResponse[]> {
    return this.http.get<AssessmentResponse[]>(this.baseUrl);
  }

  getAssessmentById(id: number): Observable<AssessmentResponse> {
    return this.http.get<AssessmentResponse>(`${this.baseUrl}/${id}`);
  }
}

