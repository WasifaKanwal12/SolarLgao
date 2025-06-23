// src/app/api/quotes/route.js
import { dbAdmin } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

// POST: Create a new quote request
export async function POST(request) {
  try {
    const quoteData = await request.json();

    // Basic validation
    if (!quoteData.customerId || !quoteData.providerId || !quoteData.serviceId || !quoteData.customerName) {
      return NextResponse.json({ error: 'Missing required quote fields.' }, { status: 400 });
    }

    const newQuoteRef = await dbAdmin.collection('quotes').add({
      ...quoteData,
      status: 'pending', // Initial status
      createdAt: new Date(),
      updatedAt: new Date(),
      chatId: null, // No chat initiated yet
    });

    return NextResponse.json({ message: 'Quote request sent successfully!', quoteId: newQuoteRef.id }, { status: 201 });
  } catch (error) {
    console.error('Error sending quote request:', error);
    return NextResponse.json({ error: 'Failed to send quote request.' }, { status: 500 });
  }
}

// GET: Fetch quotes for a specific user (either customer or provider)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId'); // Either customerId or providerId
  const role = searchParams.get('role'); // 'customer' or 'provider'

  if (!userId || !role) {
    return NextResponse.json({ error: 'User ID and role are required' }, { status: 400 });
  }

  let queryField;
  if (role === 'customer') {
    queryField = 'customerId';
  } else if (role === 'provider') {
    queryField = 'providerId';
  } else {
    return NextResponse.json({ error: 'Invalid role provided.' }, { status: 400 });
  }

  try {
    const quotesRef = dbAdmin.collection('quotes');
    const q = quotesRef.where(queryField, '==', userId).orderBy('createdAt', 'desc');
    const snapshot = await q.get();

    const quotes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ quotes });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json({ error: 'Failed to fetch quotes.' }, { status: 500 });
  }
}