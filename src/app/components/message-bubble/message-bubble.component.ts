import { Component, Input } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ChatMessage } from "../../models/chatMessage";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-message-bubble",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./message-bubble.component.html",
  styleUrl: "./message-bubble.component.scss",
})
export class MessageBubbleComponent {
  @Input() message!: ChatMessage;

  answersForm!: FormGroup;
  submitted = false;
  expandedSection: string | null = 'summary';

  constructor(private fb: FormBuilder) {}

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
    if (this.answersForm.invalid) return;
    this.submitted = true;
    // wire to store later
    console.log('answers submitted', this.answersArray.value);
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
