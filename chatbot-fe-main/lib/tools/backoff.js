import { tool } from '@openai/agents';
import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const getBackOffTool = async () => {
	return tool({
		name: 'token_back_off',
		parameters: z.object({
			model: z.string().optional().default('gpt-4.1')
		}),
		description: 'Back off for a specified time to avoid hitting the rate limit of the OpenAI API.',
		execute: async (input) => {

			const apiUrl = 'https://api.openai.com/v1/responses';
			const apiKey = process.env.OPENAI_API_KEY;
			console.log('Executing token_back_off tool...');
			if (!apiKey) {
				return {
					success: false,
					error: 'OPENAI_API_KEY environment variable is not set'
				};
			}

			try {
				const response = await fetch(apiUrl, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${apiKey}`
					},
					body: JSON.stringify({
						model: input.model || 'gpt-4.1',
						input: 'Hello OpenAI'
					})
				});

				// Check rate limit headers
				const remainingTokens = parseInt(response.headers.get('x-ratelimit-remaining-tokens') || '0');
				const maxTokensFromHeader = parseInt(response.headers.get('x-ratelimit-limit-tokens') || '0');

				if (remainingTokens && maxTokensFromHeader) {
					const remainingPercentage = (remainingTokens / maxTokensFromHeader) * 100;

					if (remainingPercentage < 50) {
						console.log(`Rate limit below 50% (${remainingPercentage.toFixed(2)}%). Waiting 40 seconds...`);
						await new Promise((resolve) => setTimeout(resolve, 40000));
					}
				}

				const data = await response.json();

				if (!response.ok) {
					throw new Error(`API request failed: ${response.status} ${response.statusText}`);
				}

				return {
					success: true,
					data,
					remainingTokens,
					maxTokens: maxTokensFromHeader,
					waitTime: remainingTokens && maxTokensFromHeader && (remainingTokens / maxTokensFromHeader) * 100 < 50 ? 40 : 0
				};
			} catch (error) {
				console.error('Error executing API request:', error);
				return {
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error occurred'
				};
			}
		}
	});
};