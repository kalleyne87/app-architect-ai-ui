import { Component, Input, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { ChatMessage, MessageRole, MessageType } from '../../models/chatMessage';
import { MessageBubbleComponent } from '../message-bubble/message-bubble.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MessageBubbleComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements AfterViewChecked {
  @ViewChild('messageListEnd') messageListEnd!: ElementRef;

  inputControl = new FormControl('', [Validators.required, Validators.minLength(1)]);
  messages: ChatMessage[] = [];
  isLoading = false;
  private shouldScroll = false;

  @Input() set initialMessage(val: string) {
    if (val) setTimeout(() => this.sendMessageWithText(val), 0);
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.messageListEnd?.nativeElement.scrollIntoView({ behavior: 'smooth' });
      this.shouldScroll = false;
    }
  }

  sendMessage(): void {
    const text = this.inputControl.value?.trim();
    if (!text || this.isLoading) return;
    this.sendMessageWithText(text);
    this.inputControl.reset();
  }

  sendMessageWithText(text: string): void {
    this.messages.push({
      id: crypto.randomUUID(),
      role: MessageRole.User,
      type: MessageType.Text,
      text,
      timestamp: new Date()
    });
    this.isLoading = true;
    this.shouldScroll = true;

    // Replace with real API call later
    setTimeout(() => {
      this.messages.push({
        id: crypto.randomUUID(),
        role: MessageRole.Assistant,
        type: MessageType.Questions,
        text: 'Great idea! I need a bit more detail to give you the best recommendation.',
        timestamp: new Date()
      });
      this.isLoading = false;
      this.shouldScroll = true;
    }, 1200);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}