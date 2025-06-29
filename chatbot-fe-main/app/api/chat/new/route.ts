import { NextResponse } from 'next/server';
import ChatbotSession from '@/lib/chatbot-session';

export async function POST() {
  try {
    const session = new ChatbotSession();
    await session.initialize();

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: 'Chat session initialized successfully'
      }),
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  } catch (error: any) {
    console.error('Error initializing chat session:', error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: 'Failed to initialize chat session',
        details: error.message
      }),
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }
}

// Handle preflight OPTIONS request
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
