export type InputType = 'text' | 'image' | 'audio';

export interface ChatMessage {
  type: InputType;
  content: string;
  base64Data?: string;
}

export interface ChatResponse {
  response: string;
  error?: string;
  metadata?: {
    confidence?: number;
    processingTime?: number;
  };
} 