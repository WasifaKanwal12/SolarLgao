// app/api/recommendation/route.js
import { NextResponse } from 'next/server'; // Changed Response to NextResponse for consistency in Next.js App Router

export async function POST(request) {
  const { location, electricity_kwh_per_month, appliances, system_type } = await request.json(); // Destructure all expected fields

  try {
    // Correct the FastAPI endpoint URL to include the protocol
    // Double-check this URL: It should be a publicly accessible endpoint.
    const fastApiUrl = 'https://solar-lgao-cgfwewawh6a5fnem.southindia-01.azurewebsites.net/recommend';

    // Construct the payload exactly as the FastAPI backend expects it
    const payload = {
      location: location,
      system_type: system_type, // This will now receive the mapped value from the frontend
    };

    if (electricity_kwh_per_month !== null) {
      payload.electricity_kwh_per_month = parseInt(electricity_kwh_per_month);
      payload.appliances = null; // Ensure mutual exclusivity
    } else {
      payload.appliances = appliances; // This will be the array of {name, quantity, hours}
      payload.electricity_kwh_per_month = null; // Ensure mutual exclusivity
    }

    // --- LOGGING THE PAYLOAD ---
    console.log('Payload being sent to FastAPI:', JSON.stringify(payload, null, 2));

    const fastApiResponse = await fetch(fastApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload), // Send the constructed payload
    });

    if (!fastApiResponse.ok) {
      const errorText = await fastApiResponse.text(); // Get raw text to help debug external API issues
      console.error(`FastAPI responded with status ${fastApiResponse.status}: ${errorText}`);
      // Try to parse as JSON, but fall back to text if it's not valid JSON
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        // If JSON parsing fails, log the parsing error as well
        console.error('Error parsing FastAPI error response as JSON:', e);
        errorData = { detail: errorText }; // If not JSON, use the raw text as detail
      }
      // Throw a new Error with a clearer message
      throw new Error(errorData.detail || `FastAPI call failed with status ${fastApiResponse.status}: ${errorText}`);
    }

    const data = await fastApiResponse.json();
    // --- LOGGING THE RESPONSE ---
    console.log('Response received from FastAPI:', JSON.stringify(data, null, 2));


    // It's good practice to validate the shape of the data received from external APIs
    // before sending it to the client.
    if (!data || !Array.isArray(data.metrics)) { // Expecting an object with a 'metrics' array
      console.error("FastAPI returned data in an unexpected format:", data);
      throw new Error("FastAPI returned data in an unexpected format. Expected an object with a 'metrics' array.");
    }

    // Return the data as is (the frontend will transform it)
    return NextResponse.json(data); // Use NextResponse for consistency

  } catch (error) {
    // IMPORTANT: Log the full error object here to see its properties
    console.error('Recommendation API route error:', error);
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error))); // Log full error details

    let errorMessage = 'Failed to generate recommendation due to an internal server error.';
    if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null && 'detail' in error) {
        // Handle cases where the error might be a plain object with a 'detail' field
        errorMessage = error.detail;
    } else if (typeof error === 'string') {
        errorMessage = error;
    }
    // Fallback if none of the above matches or error.message is still [object Object]
    if (errorMessage === '[object Object]') {
        errorMessage = 'An unknown error occurred. Please check server logs for more details.';
    }


    return NextResponse.json( // Use NextResponse for consistency
      { error: errorMessage },
      { status: 500 }
    );
  }
}