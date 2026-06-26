import { Component, EventEmitter, Output } from "@angular/core";
import { SessionSummary } from "../../models/sessionSummary";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar-component.html',
  styleUrls: ['./sidebar-component.scss']
})
export class SidebarComponent {
  @Output() newAssessment = new EventEmitter<void>();
  @Output() sessionSelected = new EventEmitter<SessionSummary>();

  sessions: SessionSummary[] = [];
  activeSessionId: string | null = null;

  onNewAssessment(): void {
    this.newAssessment.emit();
  }

  onSelectSession(session: SessionSummary): void {
    this.activeSessionId = session.id;
    this.sessionSelected.emit(session);
  }
}
