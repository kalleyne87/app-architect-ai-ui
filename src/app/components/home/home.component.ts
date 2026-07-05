import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { AssessmentStore } from '../../store/assessment.store';
import { ChatComponent } from '../chat/chat.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { SessionSummary } from '../../models/sessionSummary';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ChatComponent, SidebarComponent, SkeletonLoaderComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  protected readonly store = inject(AssessmentStore);
  private hasAutoSelected = false;
  isSidebarOpen = signal(false);

  constructor() {
    this.store.loadSessions();

    effect(() => {
      const history = this.store.sessionHistory();
      const isLoading = this.store.isLoading();    
      
      // Once sessions are loaded, auto-select the most recent one
      if (!this.hasAutoSelected && history.length > 0 && !this.store.hasActiveSession()) {
        this.hasAutoSelected = true;
        this.store.loadSession(history[0].id);
      }
    });

    this.store.loadSessions();
  }

  inputControl = new FormControl('');
  lastInput = "";

  suggestions = [
    'Design a messenger app similar to Facebook Messenger',
    'Design a video streaming platform like Netflix',
    'Design an e-commerce platform like Amazon',
    'Design a ride-sharing service like Uber',
  ];

  startChat(text: string): void {
    const trimmed = text?.trim();
    if (!trimmed) return;
    this.lastInput = trimmed;
    this.store.sendRequirements({ requirements: trimmed });
    this.inputControl.reset();
  }

  onHomeKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.startChat(this.inputControl.value ?? '');
    }
  }

  onSessionSelected(session: SessionSummary): void {
    this.store.loadSession(session.id);
  }
}