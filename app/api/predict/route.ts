import { NextRequest, NextResponse } from 'next/server';

interface BackendPredictionResponse {
  energy_consumption?: number;
  unit?: string;

  factors?: {
    building_type?: number;
    square_footage?: number;
    number_of_occupants?: number;
    appliances_used?: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { building_type, square_footage, number_of_occupants, appliances_used } = body;

    if (
      !building_type ||
      square_footage === undefined ||
      number_of_occupants === undefined ||
      appliances_used === undefined
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Replace with your backend URL
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const PREDICT_ENDPOINT = `${BACKEND_URL}/predict`;
    console.log("Sending request to backend:", PREDICT_ENDPOINT);
    const response = await fetch(PREDICT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        building_type,
        square_footage,
        number_of_occupants,
        appliances_used,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend returned status ${response.status}`);
    }

    const data: BackendPredictionResponse = await response.json();
    console.log("Raw backend response:", JSON.stringify(data, null, 2));

    // Normalize the response to snake_case format
    const normalizedResponse = {
      energy_consumption: data.energy_consumption ?? 0,
      unit: data.unit ?? 'kWh',
      factors: {
        building_type: data.factors?.building_type ?? 0,
        square_footage: data.factors?.square_footage ?? 0,
        number_of_occupants: data.factors?.number_of_occupants ?? 0,
        appliances_used: data.factors?.appliances_used ?? 0,
      },
    };
    console.log("Received prediction from backend:", JSON.stringify(normalizedResponse, null, 2));

    return NextResponse.json(normalizedResponse);
  } catch (error) {
    console.error('Prediction error:', error);
    return NextResponse.json(
      { error: 'Failed to get prediction from backend' },
      { status: 500 }
    );
  }
}
