import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ChatComponent } from '../chat/chat-component';
import { SidebarComponent } from '../sidebar/sidebar-component';
import { SessionSummary } from '../../models/sessionSummary';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    ChatComponent, 
    SidebarComponent
  ],
  templateUrl: './home-component.html',
  styleUrls: ['./home-component.scss']
})
export class HomeComponent {
  chatStarted = false;
  firstMessage = '';
  inputControl = new FormControl('');

  suggestions = [
    'Design a messenger app similar to Facebook Messenger',
    'Design a video streaming platform like Netflix',
    'Design an e-commerce platform like Amazon',
    'Design a ride-sharing service like Uber',
  ];

  startChat(text: string): void {
    const trimmed = text?.trim();
    if (!trimmed) return;
    this.firstMessage = trimmed;
    this.chatStarted = true;
  }

  // add method:
  onSessionSelected(session: SessionSummary): void {
    // wire up later when store is connected
    console.log('selected session', session);
  }
  
  resetChat(): void {
    this.chatStarted = false;
    this.firstMessage = '';
    this.inputControl.reset();
  }

  onHomeKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.startChat(this.inputControl.value ?? '');
    }
  }
}