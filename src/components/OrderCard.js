// components/OrderCard.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
// Removed: import placeholderImage from "@/public/placeholder.svg"; // No longer needed, using external placeholder

export default function OrderCard({ order, isCustomerView, onComplete, onUpdateStatus }) {
  const [providerData, setProviderData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [reviewFormData, setReviewFormData] = useState({ rating: 0, comment: "" });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Define a fallback placeholder image URL from an external service
  const externalPlaceholderImage = "https://placehold.co/48x48/e0e0e0/555555?text=Img";

  useEffect(() => {
    const fetchRelatedData = async () => {
      setLoadingDetails(true);
      try {
        if (order.providerUid) {
          const res = await fetch(`/api/providers/${order.providerUid}`);
          if (res.ok) {
            const data = await res.json();
            setProviderData(data.provider);
          } else {
            console.error("Failed to fetch provider data for order:", order.providerUid);
            setProviderData(null); // Explicitly set to null on error
          }
        }
        if (order.customerUid) {
          const res = await fetch(`/api/users/${order.customerUid}`);
          if (res.ok) {
            const data = await res.json();
            setCustomerData(data.user);
          } else {
            console.error("Failed to fetch customer data for order:", order.customerUid);
            setCustomerData(null); // Explicitly set to null on error
          }
        }
      } catch (error) {
        console.error("Error fetching related data for order:", error);
        setProviderData(null); // Ensure state is clean on any fetch error
        setCustomerData(null);
      } finally {
        setLoadingDetails(false);
      }
    };
    fetchRelatedData();
  }, [order]); // Added order to dependencies as well

  const formattedDate = order.createdAt
    ? new Date(order.createdAt._seconds * 1000).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStarClick = (rating) => {
    setReviewFormData((prev) => ({ ...prev, rating }));
  };

  const submitReview = async () => {
    if (reviewFormData.rating === 0) {
      setReviewError("Please select a star rating.");
      return;
    }
    setReviewError("");
    setReviewSubmitting(true);

    try {
      const response = await fetch(`/api/orders`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          review: {
            rating: reviewFormData.rating,
            comment: reviewFormData.comment,
            createdAt: new Date(),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit review.');
      }

      // Instead of alert, you might want to use a state variable to show a success message
      // alert("Review submitted successfully!");
      setShowReviewForm(false);
      // Update the local order state to reflect the new review
      // This helps avoid re-fetching the entire list if not needed
      order.review = { ...reviewFormData, createdAt: new Date() };
      order.status = 'reviewed'; // Or keep 'completed' based on your workflow, 'reviewed' is good for distinction
    } catch (err) {
      console.error("Error submitting review:", err);
      setReviewError(err.message || "Failed to submit review. Please try again.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    reviewed: "bg-purple-100 text-purple-800", // Added color for 'reviewed' status
  };

  if (loadingDetails) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Order #{order.id?.substring(0, 8) || "N/A"} - {order.serviceType || "N/A"}
            </h3>
            <p className="text-sm text-gray-500">Created: {formattedDate}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[order.status] || "bg-gray-200 text-gray-800"}`}>
            {order.status.replace(/_/g, ' ').charAt(0).toUpperCase() + order.status.replace(/_/g, ' ').slice(1)}
          </span>
        </div>

        {isCustomerView && providerData && (
          <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-md">
            <Image
              // Use profileImageUrl from providerData, fallback to external placeholder
              src={providerData.profileImageUrl || externalPlaceholderImage}
              alt={providerData.companyName || "Provider"}
              width={48}
              height={48}
              className="rounded-full object-cover mr-3 border border-gray-200"
              onError={(e) => {
                // Fallback for when providerData.profileImageUrl itself might be broken
                if (e.target.src !== externalPlaceholderImage) {
                  e.target.src = externalPlaceholderImage;
                }
              }}
            />
            <div>
              <p className="text-sm font-semibold text-gray-700">Provider: {providerData.companyName || "Unknown Provider"}</p>
              <Link href={`/provider/${providerData.uid}`} className="text-primary-green text-sm hover:underline">
                View Provider Profile
              </Link>
            </div>
          </div>
        )}

        {!isCustomerView && customerData && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm font-semibold text-gray-700">Customer: {customerData.firstName} {customerData.lastName}</p>
            <p className="text-sm text-gray-600">Email: {customerData.email}</p>
            {order.customerPhone && <p className="text-sm text-gray-600">Phone: {order.customerPhone}</p>}
          </div>
        )}

        <div className="text-sm text-gray-700 mb-4 space-y-2">
          <p><strong>Quoted Price:</strong> PKR {order.quotedPrice ? order.quotedPrice.toLocaleString() : "N/A"}</p>
          <p><strong>Property Type:</strong> {order.propertyType || "N/A"}</p>
          <p><strong>Roof Type:</strong> {order.roofType || "N/A"}</p>
          <p><strong>Avg. Monthly Bill:</strong> PKR {order.avgMonthlyBill ? order.avgMonthlyBill.toLocaleString() : "N/A"}</p>
          <p><strong>Desired Panels:</strong> {order.solarPanelCount || "Not specified"}</p>
          <p><strong>Preferred Date:</strong> {order.installationDate || "Not specified"}</p>
          {order.notes && <p><strong>Notes:</strong> {order.notes}</p>}
          {order.proposalDetails && <p><strong>Provider's Proposal:</strong> {order.proposalDetails}</p>}
        </div>

        {/* Customer Actions */}
        {isCustomerView && order.status === 'completed' && !order.review && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="btn-primary"
            >
              {showReviewForm ? "Hide Review Form" : "Leave a Review"}
            </button>
          </div>
        )}

        {isCustomerView && order.status === 'completed' && order.review && (
          <div className="mt-6 border-t pt-4">
            <h4 className="text-md font-semibold text-gray-800 mb-2">Your Review:</h4>
            <div className="flex items-center text-yellow-500 mb-2">
              {'★'.repeat(order.review.rating)}
              {'☆'.repeat(5 - order.review.rating)}
              <span className="ml-2 text-gray-700">({order.review.rating} / 5)</span>
            </div>
            <p className="text-gray-700 text-sm">{order.review.comment}</p>
            <p className="text-gray-500 text-xs mt-1">Reviewed on: {new Date(order.review.createdAt?._seconds * 1000 || order.completedAt?._seconds * 1000).toLocaleDateString()}</p>
          </div>
        )}

        {/* Provider Actions */}
        {!isCustomerView && (order.status === 'pending' || order.status === 'in_progress') && (
          <div className="mt-6 flex justify-end gap-3">
            <select
              onChange={(e) => onUpdateStatus && onUpdateStatus(order.id, e.target.value)}
              value={order.status}
              className="px-4 py-2 border rounded-md"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        )}
      </div>

      {showReviewForm && (
        <div className="mt-6 border-t pt-4">
          <h4 className="text-md font-semibold text-gray-800 mb-2">Leave Your Review</h4>
          {reviewError && <p className="text-red-500 text-sm mb-3">{reviewError}</p>}
          <div className="flex items-center mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                onClick={() => handleStarClick(star)}
                className={`w-8 h-8 cursor-pointer ${
                  star <= reviewFormData.rating ? 'text-yellow-500' : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.683-1.539 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.565-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
              </svg>
            ))}
          </div>
          <textarea
            name="comment"
            value={reviewFormData.comment}
            onChange={handleReviewChange}
            rows="3"
            placeholder="Share your experience..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300 mb-3"
          ></textarea>
          <button
            onClick={submitReview}
            disabled={reviewSubmitting}
            className={`btn-primary w-full ${reviewSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {reviewSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      )}
    </div>
  );
}
