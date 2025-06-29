import { Agent, run, withTrace } from '@openai/agents';
import { agentInstructions } from './instructions/agentInstructions';
import { getBackOffTool } from './tools/backoff';
import { createMcpServer } from '../mcps/mcp';
import 'dotenv/config';
import { encoding_for_model } from "tiktoken";
import { TOKEN_LIMIT } from './constants';

class ChatbotSession {
  agent: any = null;
  mcpServer: any = null;
  conversationHistory: string | null = null;

  constructor() {
    this.mcpServer = createMcpServer();
  }

  async initialize() {
    try {
      const backOffTool = await getBackOffTool();

      this.agent = new Agent({
        name: 'Main Agent',
        instructions: agentInstructions,
        model: 'gpt-4.1-2025-04-14',
        mcpServers: [this.mcpServer],
        tools: [backOffTool],
      });

      await this.mcpServer.connect();
      console.log('MCP Server connected successfully');
    } catch (error) {
      console.error('Failed to connect MCP Server:', error);
      throw error;
    }
  }

  async sendMessage(userMessage: string, conversationHistory?: string) {
    try {
      if (!this.mcpServer) {
        throw new Error('MCP server is not initialized');
      }

      // Always connect before sending a message
      console.log('Connecting to MCP server before sending message...');
      await this.mcpServer.connect();
      console.log('MCP server (re)connected.');

      // Compose the conversation
      let conversation: string;
      if (!conversationHistory) {
        conversation = `User: ${userMessage}`;
      } else {
        conversation = `${conversationHistory}\n\nUser: ${userMessage}`;
      }

      // Token limit logic
      const encoder = encoding_for_model("gpt-4.1-2025-04-14");
      let tokens = encoder.encode(conversation);
      if (tokens.length > TOKEN_LIMIT) {
        tokens = tokens.slice(tokens.length - TOKEN_LIMIT);
        conversation = encoder.decode(tokens).toString();
      }
      encoder.free();

      console.log('About to send message to agent (MCP should be used if needed)...');
      const result = await withTrace('Chatbot Session', async () => {
        return await run(this.agent, conversation);
      });

      const updatedHistory = `${conversation}\n\nAssistant: ${result.finalOutput}`;
      return { finalOutput: result.finalOutput, updatedHistory };
    } catch (error) {
      console.error('Error in chat session:', error);
      throw error;
    }
  }

  resetChat() {
    this.conversationHistory = null;
  }

  async close() {
    try {
      if (this.mcpServer) {
        await this.mcpServer.close();
        console.log('MCP Server closed successfully');
      }
    } catch (error) {
      console.error('Error closing MCP Server:', error);
    }
  }
}

export default ChatbotSession;
