import { MCP_URL } from '@/lib/constants';
import { MCPServerStreamableHttp } from '@openai/agents';
export function createMcpServer() {
  return new MCPServerStreamableHttp({
    url: MCP_URL,
    name: 'Success Rate MCP Server',
  });
}