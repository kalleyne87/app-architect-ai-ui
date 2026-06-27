import { Component, inject, Input } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ChatMessage } from "../../models/chatMessage";
import { CommonModule } from "@angular/common";
import { AssessmentStore } from "../../store/assessment.store";

@Component({
  selector: "app-message-bubble",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./message-bubble.component.html",
  styleUrl: "./message-bubble.component.scss",
})
export class MessageBubbleComponent {
  @Input() message!: ChatMessage;

  protected readonly store = inject(AssessmentStore);
  private readonly fb = inject(FormBuilder);
  
  answersForm!: FormGroup;
  submitted = false;
  expandedSection: string | null = 'summary';

  
  ngOnInit(): void {
    if (this.message.type === 'questions' && this.message.questions) {
      this.answersForm = this.fb.group({
        answers: this.fb.array(
          this.message.questions.map(() => this.fb.control('', Validators.required))
        )
      });
    }
  }

  get answersArray(): FormArray {
    return this.answersForm?.get('answers') as FormArray;
  }

  submitAnswers(): void {
    const sessionId = this.store.activeSessionId();
    if (this.answersForm.invalid || !sessionId) return;

    const answers = (this.message.questions ?? []).map((question, i) => ({
      question,
      answer: this.answersArray.at(i).value
    }));

    this.submitted = true;
    this.store.submitAnswers({ sessionId, answers });
  }

  toggleSection(section: string): void {
    this.expandedSection = this.expandedSection === section ? null : section;
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  parseService(raw: string): { name: string; description: string } {
    const parts = raw.split(' — ');
    return { name: parts[0] ?? raw, description: parts[1] ?? '' };
  }
}
