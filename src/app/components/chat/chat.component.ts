import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { AssessmentStore } from '../../store/assessment.store';
import { MessageBubbleComponent } from '../message-bubble/message-bubble.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MessageBubbleComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements AfterViewChecked, OnInit {
  @ViewChild('messageListEnd') messageListEnd!: ElementRef;

  protected readonly store = inject(AssessmentStore);

  inputControl = new FormControl('', [Validators.required, Validators.minLength(1)]);
  private shouldScroll = false;

  constructor() {
    effect(() => {
      this.store.messages();
      this.shouldScroll = true;
    });
  }

  ngOnInit(): void {}

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.messageListEnd?.nativeElement.scrollIntoView({ behavior: 'smooth' });
      this.shouldScroll = false;
    }
  }

  sendMessage(): void {
    const text = this.inputControl.value?.trim();
    if (!text || this.store.isLoading()) return;
    this.store.sendRequirements({ requirements: text });
    this.inputControl.reset();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}