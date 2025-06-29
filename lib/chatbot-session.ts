import { InputType } from './types';

interface ChatMessage {
  content: string;
  type: InputType;
  base64Data?: string;
}

class ChatbotSession {
  private apiKey: string;
  private conversationHistory: ChatMessage[] = [];
  private apiEndpoint = 'https://api.gen-lang-client.com/v1';

  constructor() {
    this.apiKey = process.env.GEN_LANG_CLIENT_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('GEN_LANG_CLIENT_API_KEY is not set in environment variables');
    }
  }

  async processMessage(message: ChatMessage) {
    try {
      const response = await fetch(`${this.apiEndpoint}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          messages: [...this.conversationHistory, message],
          inputType: message.type,
          mediaData: message.base64Data
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();
      
      // Add the message and response to conversation history
      this.conversationHistory.push(message);
      this.conversationHistory.push({
        content: result.response,
        type: 'text'
      });

      return result;
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }

  async processImage(base64Image: string) {
    return this.processMessage({
      content: 'Analyzing image...',
      type: 'image',
      base64Data: base64Image
    });
  }

  async processAudio(base64Audio: string) {
    return this.processMessage({
      content: 'Processing audio...',
      type: 'audio',
      base64Data: base64Audio
    });
  }

  clearHistory() {
    this.conversationHistory = [];
  }
}

export default ChatbotSession; 