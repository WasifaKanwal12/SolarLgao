// app/api/recommendation/route.js
import { NextResponse } from 'next/server'; // Changed Response to NextResponse for consistency in Next.js App Router

export async function POST(request) {
  const { location, electricity_kwh_per_month, usage_prompt } = await request.json();

  try {
    // Correct the FastAPI endpoint URL to include the protocol
    // Double-check this URL: It should be a publicly accessible endpoint.
    const fastApiUrl = 'https://solar-lgao-api-c2hygdgah7e2f3b4.centralindia-01.azurewebsites.net/recommend';

    const fastApiResponse = await fetch(fastApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location,
        electricity_kwh_per_month: electricity_kwh_per_month ? parseInt(electricity_kwh_per_month) : null,
        usage_prompt: usage_prompt || null
      }),
    });

    if (!fastApiResponse.ok) {
      const errorText = await fastApiResponse.text(); // Get raw text to help debug external API issues
      console.error(`FastAPI responded with status ${fastApiResponse.status}: ${errorText}`);
      // Try to parse as JSON, but fall back to text if it's not valid JSON
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { detail: errorText }; // If not JSON, use the raw text as detail
      }
      throw new Error(errorData.detail || `FastAPI call failed with status ${fastApiResponse.status}`);
    }

    const data = await fastApiResponse.json();

    // It's good practice to validate the shape of the data received from external APIs
    // before sending it to the client.
    if (!data || (Array.isArray(data) && data.some(item => typeof item.metrics === 'undefined')) || (!Array.isArray(data) && typeof data.metrics === 'undefined')) {
      console.error("FastAPI returned data in an unexpected format:", data);
      throw new Error("FastAPI returned data in an unexpected format.");
    }
    
    // Return the data as is (the frontend will transform it)
    return NextResponse.json(data); // Use NextResponse for consistency

  } catch (error) {
    console.error('Recommendation API route error:', error);
    return NextResponse.json( // Use NextResponse for consistency
      { error: error.message || 'Failed to generate recommendation due to an internal server error.' },
      { status: 500 }
    );
  }
}