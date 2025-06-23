// app/provider/reviews/page.js
"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/config";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import ReviewCard from "@/components/ReviewCard";

export default function ProviderReviewsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/signin");
        return;
      }
      setUser(currentUser);

      // Verify user role
      try {
        const res = await fetch(`/api/users/${currentUser.uid}`);
        if (!res.ok) {
          throw new Error("Failed to fetch user data.");
        }
        const data = await res.json();
        if (data.user.role !== "provider") {
          router.push("/unauthorized");
          return;
        }
      } catch (err) {
        console.error("Error verifying user role:", err);
        setError("Failed to verify your account role. Please try again.");
        setLoading(false);
        return;
      }

      fetchReviews(currentUser.uid);
    });

    return () => unsubscribe();
  }, [router]);

  const fetchReviews = async (uid) => {
    try {
      // In a real application, you would fetch reviews specifically for this provider.
      // For now, we'll assume reviews are part of order data or a separate reviews collection.
      // For demonstration, let's fetch all orders and filter for those with reviews for this provider.
      const res = await fetch(`/api/orders?providerUid=${uid}`);
      if (!res.ok) {
        throw new Error("Failed to fetch orders to get reviews.");
      }
      const data = await res.json();
      
      // Filter for orders that are 'completed' and have a review
      const providerReviews = data.orders
        .filter(order => order.status === 'completed' && order.review && order.review.rating)
        .map(order => ({
          id: order.id, // Use order ID as review ID for simplicity
          customerName: order.customerName, // Assuming customer name is part of order, or fetch from customerUid
          rating: order.review.rating,
          comment: order.review.comment,
          date: order.review.createdAt || order.completedAt, // Use review creation date or order completion date
          serviceType: order.serviceType,
        }));

      setReviews(providerReviews || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Failed to load your reviews. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>{error}</p>
        <button onClick={() => fetchReviews(user.uid)} className="btn-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Customer Reviews</h1>
      {reviews.length === 0 ? (
        <p className="text-gray-600">No reviews have been left for your services yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}