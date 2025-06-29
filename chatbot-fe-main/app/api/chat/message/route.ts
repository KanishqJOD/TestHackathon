import { NextRequest, NextResponse } from 'next/server';
import ChatbotSession from '@/lib/chatbot-session';

// Global session management
let globalSession: ChatbotSession | null = null;
let sessionInitialized = false;
let isSessionActive = false;
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests
const sessionQueue: Array<{
  resolve: (value: any) => void;
  reject: (error: any) => void;
  message: string;
  conversationHistory: string;
}> = [];

const acquireSessionLock = (): Promise<void> => {
  return new Promise((resolve) => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (!isSessionActive && timeSinceLastRequest >= MIN_REQUEST_INTERVAL) {
      isSessionActive = true;
      lastRequestTime = now;
      resolve();
    } else {
      const waitTime = Math.max(0, MIN_REQUEST_INTERVAL - timeSinceLastRequest);
      setTimeout(() => {
        isSessionActive = true;
        lastRequestTime = Date.now();
        resolve();
      }, waitTime);
    }
  });
};

const releaseSessionLock = () => {
  isSessionActive = false;
};

const getOrCreateSession = async (): Promise<ChatbotSession> => {
  if (globalSession && sessionInitialized) {
    return globalSession;
  }

  if (globalSession) {
    try {
      globalSession.close();
    } catch (error) {
      console.warn('Error closing existing session:', error);
    }
  }

  globalSession = new ChatbotSession();
  console.log('Initializing new chatbot session...');
  
  const initPromise = globalSession.initialize();
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Session initialization timeout')), 30000);
  });
  
  await Promise.race([initPromise, timeoutPromise]);
  sessionInitialized = true;
  console.log('Chatbot session initialized successfully');
  
  return globalSession;
};

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory } = await req.json();
    if (!message) {
      return NextResponse.json({
        success: false,
        error: 'message is required'
      }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    // Wait for session lock with rate limiting
    await acquireSessionLock();
    
    try {
      const session = await getOrCreateSession();
      
      // Add a small delay to ensure MCP connection is stable
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = await session.sendMessage(message, conversationHistory);
      
      return NextResponse.json({
      success: true,
      response: result.finalOutput,
      updatedHistory: result.updatedHistory
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
    } finally {
      releaseSessionLock();
    }
  } catch (error: any) {
    console.error('Error sending message:', error);
    
    // Reset session on error
    if (globalSession) {
      try {
        globalSession.close();
      } catch (closeError) {
        console.error('Error closing session after error:', closeError);
      }
      globalSession = null;
      sessionInitialized = false;
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to send message',
      details: error.message
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Cleanup on process exit
process.on('beforeExit', () => {
  if (globalSession) {
    try {
      globalSession.close();
    } catch (error) {
      console.error('Error closing session on exit:', error);
    }
  }
});