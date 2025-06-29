import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Product } from '@/lib/models/Product';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { category, tags, priceRange } = await req.json();
    
    // Build query based on filters
    const query: any = {};
    
    if (category) {
      query.category = category;
    }
    
    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }
    
    if (priceRange) {
      query.price = {
        $gte: priceRange.min || 0,
        $lte: priceRange.max || Number.MAX_VALUE
      };
    }

    // Get recommendations
    const recommendations = await Product.find(query)
      .limit(10)
      .sort({ stock: -1 }); // Prioritize in-stock items

    return NextResponse.json({
      success: true,
      recommendations
    });
  } catch (error: any) {
    console.error('Error getting recommendations:', error);
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