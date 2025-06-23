import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server'; 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function POST(req) {
  try {
    const { messages } = await req.json(); 

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty messages provided' }, { status: 400 });
    }

    // Format messages for Gemini API
    const parts = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    const result = await model.generateContent({ contents: parts });
    const responseText = result.response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (responseText) {
      return NextResponse.json({ response: responseText }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Failed to get a response from Gemini' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
