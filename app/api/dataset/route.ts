import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '50';

    // Replace with your backend URL
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
    const DATASET_ENDPOINT = `${BACKEND_URL}/dataset?page=${page}&limit=${limit}`;

    const response = await fetch(DATASET_ENDPOINT, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend returned status ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetched dataset from backend:", JSON.stringify(data, null, 2));
    console.log("First data item:", JSON.stringify(data.data?.[0], null, 2));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Dataset fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dataset from backend' },
      { status: 500 }
    );
  }
}
