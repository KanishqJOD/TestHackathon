import { NextRequest, NextResponse } from 'next/server';
import { InputType } from '@/lib/types';

const VALID_TYPES = ['text', 'image', 'audio'] as const;

// Mock responses for development/testing
const MOCK_RESPONSES: Record<InputType, string> = {
  text: "I understand you're looking for assistance. How can I help you today?",
  image: "I can see the image you've shared. It appears to be a product image. Would you like more information about similar items?",
  audio: "I've processed your audio message. Let me help you with your request."
};

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { type, message, base64Data } = data;

    console.log('Received request:', { 
      type, 
      messageLength: message?.length, 
      hasBase64: !!base64Data,
      timestamp: new Date().toISOString()
    });

    // Validate input type
    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: 'Invalid input type' }, { status: 400 });
    }

    // Validate message
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // For image and audio, validate base64Data
    if ((type === 'image' || type === 'audio') && !base64Data) {
      return NextResponse.json({ error: 'Base64 data is required for media messages' }, { status: 400 });
    }

    // Process the message
    // In a real implementation, this would send the data to your AI service
    // The base64Data is processed here but not saved
    if (base64Data) {
      console.log('Processing media data:', {
        type,
        dataSize: base64Data.length,
        timestamp: new Date().toISOString()
      });
    }

    // For development/testing, return mock responses
    const response = MOCK_RESPONSES[type as InputType];
    
    // Simulate a small delay to make the loading state visible
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('Error processing chat message:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
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