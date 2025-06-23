// src/app/api/quotes/[quoteId]/route.js
import { dbAdmin } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

// GET: Fetch a single quote by ID
export async function GET(request, { params }) {
  const { quoteId } = params;

  try {
    const quoteDoc = await dbAdmin.collection('quotes').doc(quoteId).get();

    if (!quoteDoc.exists) {
      return NextResponse.json({ error: 'Quote not found.' }, { status: 404 });
    }

    return NextResponse.json({ quote: { id: quoteDoc.id, ...quoteDoc.data() } });
  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json({ error: 'Failed to fetch quote.' }, { status: 500 });
  }
}

// PUT: Update quote status or add chatId
export async function PUT(request, { params }) {
  const { quoteId } = params;
  try {
    const updatedData = await request.json();

    // Ensure only allowed fields are updated
    const allowedFields = ['status', 'chatId', 'updatedAt'];
    const updatePayload = {};
    for (const field of allowedFields) {
      if (updatedData[field] !== undefined) {
        updatePayload[field] = updatedData[field];
      }
    }
    updatePayload.updatedAt = new Date(); // Always update timestamp

    await dbAdmin.collection('quotes').doc(quoteId).update(updatePayload);

    return NextResponse.json({ message: 'Quote updated successfully!' });
  } catch (error) {
    console.error('Error updating quote:', error);
    return NextResponse.json({ error: 'Failed to update quote.' }, { status: 500 });
  }
}

// DELETE: (Optional) Allow deleting quotes, but typically they persist for history
/*
export async function DELETE(request, { params }) {
  const { quoteId } = params;
  try {
    await dbAdmin.collection('quotes').doc(quoteId).delete();
    return NextResponse.json({ message: 'Quote deleted successfully!' });
  } catch (error) {
    console.error('Error deleting quote:', error);
    return NextResponse.json({ error: 'Failed to delete quote.' }, { status: 500 });
  }
}
*/