// src/app/api/orders/route.js
import { dbAdmin } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

// POST: Create a new order (when a custom offer is accepted)
export async function POST(request) {
  try {
    const orderData = await request.json();

    // Basic validation: ensure essential links are present
    if (!orderData.customerId || !orderData.providerId || !orderData.serviceId || !orderData.quoteId || !orderData.customOfferDetails) {
      return NextResponse.json({ error: 'Missing required order fields.' }, { status: 400 });
    }

    const newOrderRef = await dbAdmin.collection('orders').add({
      ...orderData,
      status: 'in_progress', // Or 'pending_acceptance' if customer still needs to click 'accept'
      paymentStatus: 'pending', // Initial payment status
      proofOfCompletionUrl: null,
      customerReviewId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
    });

    // Optionally update the associated quote to indicate it led to an order
    await dbAdmin.collection('quotes').doc(orderData.quoteId).update({
      status: 'accepted',
      updatedAt: new Date(),
    });

    return NextResponse.json({ message: 'Order created successfully!', orderId: newOrderRef.id }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order.' }, { status: 500 });
  }
}

// GET: Fetch orders for a specific user (customer or provider)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const role = searchParams.get('role');

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
    const ordersRef = dbAdmin.collection('orders');
    const q = ordersRef.where(queryField, '==', userId).orderBy('createdAt', 'desc');
    const snapshot = await q.get();

    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders.' }, { status: 500 });
  }
}