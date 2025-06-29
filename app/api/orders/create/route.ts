import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Order } from '@/lib/models/Order';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const orderData = await req.json();
    
    // Validate order data
    if (!orderData.userId || !orderData.products || !orderData.totalAmount) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Create new order
    const order = await Order.create(orderData);

    return NextResponse.json({
      success: true,
      order
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
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