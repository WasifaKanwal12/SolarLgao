// src/app/api/orders/[orderId]/route.js
import { dbAdmin } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

// GET: Fetch a single order by ID
export async function GET(request, { params }) {
  const { orderId } = params;

  try {
    const orderDoc = await dbAdmin.collection('orders').doc(orderId).get();

    if (!orderDoc.exists) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json({ order: { id: orderDoc.id, ...orderDoc.data() } });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order.' }, { status: 500 });
  }
}

// PUT: Update an order (e.g., status, proof of completion)
export async function PUT(request, { params }) {
  const { orderId } = params;
  try {
    const updatedData = await request.json();

    // Ensure only allowed fields are updated and handle timestamps
    const allowedFields = ['status', 'proofOfCompletionUrl', 'customerReviewId', 'paymentStatus'];
    const updatePayload = {};
    for (const field of allowedFields) {
      if (updatedData[field] !== undefined) {
        updatePayload[field] = updatedData[field];
      }
    }
    updatePayload.updatedAt = new Date(); // Always update timestamp

    // If status is changed to 'completed', set completedAt
    if (updatedData.status === 'completed' && !updatedData.completedAt) {
      updatePayload.completedAt = new Date();
    }

    await dbAdmin.collection('orders').doc(orderId).update(updatePayload);

    return NextResponse.json({ message: 'Order updated successfully!' });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order.' }, { status: 500 });
  }
}