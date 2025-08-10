// app/api/admin/reviews/route.js
import { dbAdmin } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

/**
 * GET handler to fetch all reviews.
 */
export async function GET() {
  try {
    const reviewsSnapshot = await dbAdmin.collection('Reviews').get();
    const reviews = reviewsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews.' }, { status: 500 });
  }
}