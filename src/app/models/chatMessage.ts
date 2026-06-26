
export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: Date;
}

export enum MessageRole {
  User = 'user',
  Assistant = 'assistant'
}