// src/app/customer/review/page.js
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { auth } from "@/lib/config";
import { onAuthStateChanged } from "firebase/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function LeaveReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const providerId = searchParams.get('providerId');

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [providerName, setProviderName] = useState("the Provider");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const customerNavItems = [
    { name: "Home", href: "/customer" },
    { name: "My Quotes", href: "/customer/quotes" },
    { name: "My Orders", href: "/customer/orders" },
    { name: "Request Quote", href: "/customer/request-quote" },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/signin");
        return;
      }
      setUser(currentUser);

      if (!orderId || !providerId) {
        setError("Missing order or provider information for the review.");
        setLoading(false);
        return;
      }

      try {
        // Fetch provider name for display
        const providerRes = await fetch(`/api/providers/${providerId}`);
        if (providerRes.ok) {
          const providerData = await providerRes.json();
          setProviderName(providerData.provider?.companyName || "the Provider");
        } else {
          console.warn("Could not fetch provider name for review.");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching review data:", err);
        setError("Failed to load review page. " + err.message);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, orderId, providerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !orderId || !providerId || rating === 0 || !comment.trim()) {
      setError("Please provide a rating and comment.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const reviewPayload = {
      orderId,
      customerId: user.uid,
      providerId,
      rating,
      comment,
    };

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewPayload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit review.");
      }

      alert("Review submitted successfully! Thank you for your feedback.");
      router.push("/customer/orders"); // Redirect to My Orders page
    } catch (err) {
      console.error("Error submitting review:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header navItems={customerNavItems} userType="customer" />
        <main className="flex-1 pt-16 bg-gray-50 flex justify-center items-center">
          <div className="loader"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error && !isSubmitting) { // Only show error if not currently submitting
    return (
      <div className="flex flex-col min-h-screen">
        <Header navItems={customerNavItems} userType="customer" />
        <main className="flex-1 pt-16 bg-gray-50 p-8 text-center text-red-600">
          <p>{error}</p>
          <Link href="/customer/orders" className="btn-primary mt-4">Back to Orders</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header navItems={customerNavItems} userType="customer" />
      <main className="flex-1 pt-16 bg-gray-50 p-6 md:p-8">
        <div className="container mx-auto max-w-2xl bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Leave a Review</h1>
          <p className="text-center text-gray-600 mb-6">
            Share your experience with <span className="font-bold">{providerName}</span> for your recent order.
          </p>

          {error && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
              <div className="flex justify-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    onClick={() => setRating(star)}
                    className={`h-10 w-10 cursor-pointer ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Your Comment</label>
              <textarea
                id="comment"
                name="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="5"
                placeholder="Describe your experience with the service provider..."
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0 || !comment.trim()}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting Review..." : "Submit Review"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}