// src/app/api/reviews/route.js
import { dbAdmin } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

// POST: Submit a new review
export async function POST(request) {
  try {
    const reviewData = await request.json();

    if (!reviewData.orderId || !reviewData.customerId || !reviewData.providerId || reviewData.rating === undefined || !reviewData.comment) {
      return NextResponse.json({ error: 'Missing required review fields.' }, { status: 400 });
    }

    const newReviewRef = await dbAdmin.collection('reviews').add({
      ...reviewData,
      createdAt: new Date(),
    });

    // Update the provider's overall rating and total reviews
    const providerRef = dbAdmin.collection('providers').doc(reviewData.providerId);
    const providerDoc = await providerRef.get();
    if (providerDoc.exists) {
      const currentProvider = providerDoc.data();
      const newTotalReviews = (currentProvider.totalReviews || 0) + 1;
      const newRating = ((currentProvider.rating * (currentProvider.totalReviews || 0)) + reviewData.rating) / newTotalReviews;

      await providerRef.update({
        rating: parseFloat(newRating.toFixed(1)), // Keep one decimal place
        totalReviews: newTotalReviews,
      });
    }

    // Link the review to the order
    await dbAdmin.collection('orders').doc(reviewData.orderId).update({
      customerReviewId: newReviewRef.id,
      updatedAt: new Date(),
    });

    return NextResponse.json({ message: 'Review submitted successfully!', reviewId: newReviewRef.id }, { status: 201 });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ error: 'Failed to submit review.' }, { status: 500 });
  }
}

// GET: Fetch reviews for a specific provider (optional, for provider profile page)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const providerId = searchParams.get('providerId');

  if (!providerId) {
    return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 });
  }

  try {
    const reviewsRef = dbAdmin.collection('reviews');
    const q = reviewsRef.where('providerId', '==', providerId).orderBy('createdAt', 'desc');
    const snapshot = await q.get();

    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Optionally fetch customer names for each review
    const reviewsWithCustomerNames = await Promise.all(reviews.map(async (review) => {
      let customerName = 'Anonymous';
      if (review.customerId) {
        const customerDoc = await dbAdmin.collection('users').doc(review.customerId).get();
        if (customerDoc.exists) {
          customerName = customerDoc.data().firstName + ' ' + customerDoc.data().lastName;
        }
      }
      return { ...review, customerName };
    }));

    return NextResponse.json({ reviews: reviewsWithCustomerNames });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews.' }, { status: 500 });
  }
}