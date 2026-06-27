import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssessmentStore } from '../../store/assessment.store';
import { SessionStatus, SessionSummary } from '../../models/sessionSummary';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Output() newAssessment = new EventEmitter<void>();
  @Output() sessionSelected = new EventEmitter<SessionSummary>();

  protected readonly store = inject(AssessmentStore);

  onNewAssessment(): void {
    this.store.startNewSession();
    this.newAssessment.emit();
  }

  onSelectSession(session: SessionSummary): void {
    this.sessionSelected.emit(session);
  }

  sessionStatus = SessionStatus
}
