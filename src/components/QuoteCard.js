// components/QuoteCard.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
// Removed: import placeholderImage from "@/public/placeholder.svg"; // No longer needed, using external placeholder

export default function QuoteCard({ quote, onAccept, onReject, onSendQuote, onDecline, isCustomerView }) {
  const [providerData, setProviderData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [price, setPrice] = useState(quote.quotedPrice || "");
  const [proposalDetails, setProposalDetails] = useState(quote.proposalDetails || "");
  const [editMode, setEditMode] = useState(false);

  // Define a fallback placeholder image URL from an external service
  const externalPlaceholderImage = "https://placehold.co/48x48/e0e0e0/555555?text=Img";

  useEffect(() => {
    const fetchRelatedData = async () => {
      setLoadingDetails(true);
      try {
        if (isCustomerView && quote.providerUid) {
          const res = await fetch(`/api/providers/${quote.providerUid}`);
          if (res.ok) {
            const data = await res.json();
            setProviderData(data.provider);
          } else {
            console.error("Failed to fetch provider data for quote:", quote.providerUid);
            setProviderData(null); // Explicitly set to null on error
          }
        } else if (!isCustomerView && quote.customerUid) {
          const res = await fetch(`/api/users/${quote.customerUid}`);
          if (res.ok) {
            const data = await res.json();
            setCustomerData(data.user);
          } else {
            console.error("Failed to fetch customer data for quote request:", quote.customerUid);
            setCustomerData(null); // Explicitly set to null on error
          }
        }
      } catch (error) {
        console.error("Error fetching related data for quote:", error);
        setProviderData(null); // Ensure state is clean on any fetch error
        setCustomerData(null);
      } finally {
        setLoadingDetails(false);
      }
    };
    fetchRelatedData();
  }, [quote, isCustomerView]); // Added quote to dependencies as well

  const formattedDate = quote.createdAt
    ? new Date(quote.createdAt._seconds * 1000).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  const handlePriceChange = (e) => setPrice(e.target.value);
  const handleProposalDetailsChange = (e) => setProposalDetails(e.target.value);

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleSaveClick = () => {
    if (onSendQuote) {
      onSendQuote(quote.id, parseFloat(price), proposalDetails);
    }
    setEditMode(false);
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    quoted: "bg-blue-100 text-blue-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    declined: "bg-gray-100 text-gray-800",
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
              {quote.serviceType || "N/A"} Request
            </h3>
            <p className="text-sm text-gray-500">Date: {formattedDate}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[quote.status] || "bg-gray-200 text-gray-800"}`}>
            {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
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
              <p className="text-sm font-semibold text-gray-700">From: {providerData.companyName || "Unknown Provider"}</p>
              <p className="text-xs text-gray-500">Rating: {providerData.rating?.toFixed(1) || 'N/A'} ({providerData.totalReviews || 0} reviews)</p>
            </div>
          </div>
        )}

        {!isCustomerView && customerData && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm font-semibold text-gray-700">Customer: {customerData.firstName} {customerData.lastName}</p>
            <p className="text-sm text-gray-600">Email: {customerData.email}</p>
            {quote.customerPhone && <p className="text-sm text-gray-600">Phone: {quote.customerPhone}</p>}
          </div>
        )}

        <div className="text-sm text-gray-700 mb-4 space-y-2">
          <p><strong>Property Type:</strong> {quote.propertyType || "N/A"}</p>
          <p><strong>Roof Type:</strong> {quote.roofType || "N/A"}</p>
          <p><strong>Avg. Monthly Bill:</strong> PKR {quote.avgMonthlyBill ? quote.avgMonthlyBill.toLocaleString() : "N/A"}</p>
          <p><strong>Desired Panels:</strong> {quote.solarPanelCount || "Not specified"}</p>
          <p><strong>Preferred Date:</strong> {quote.installationDate || "Not specified"}</p>
          {quote.notes && <p><strong>Notes:</strong> {quote.notes}</p>}
        </div>

        {quote.status === 'quoted' || quote.status === 'accepted' || quote.status === 'completed' ? (
          <div className="mt-4 border-t pt-4">
            <h4 className="text-md font-semibold text-gray-800 mb-2">Quoted Price: <span className="text-primary-green">PKR {quote.quotedPrice ? quote.quotedPrice.toLocaleString() : "N/A"}</span></h4>
            <p className="text-sm text-gray-700"><strong>Proposal Details:</strong> {quote.proposalDetails || "No details provided."}</p>
          </div>
        ) : null}

        {isCustomerView && quote.status === 'quoted' && (
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => onAccept && onAccept(quote.id)}
              className="btn-primary"
            >
              Accept Quote
            </button>
            <button
              onClick={() => onReject && onReject(quote.id)}
              className="btn-secondary"
            >
              Reject Quote
            </button>
          </div>
        )}

        {!isCustomerView && quote.status === 'pending' && !editMode && (
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={handleEditClick}
              className="btn-primary"
            >
              Send Quote
            </button>
            <button
              onClick={() => onDecline && onDecline(quote.id)}
              className="btn-secondary"
            >
              Decline Request
            </button>
          </div>
        )}

        {!isCustomerView && quote.status === 'pending' && editMode && (
          <div className="mt-6 border-t pt-4">
            <h4 className="text-md font-semibold text-gray-800 mb-2">Your Quote:</h4>
            <div className="mb-3">
              <label htmlFor={`price-${quote.id}`} className="block text-sm font-medium text-gray-700 mb-1">Price (PKR)</label>
              <input
                type="number"
                id={`price-${quote.id}`}
                value={price}
                onChange={handlePriceChange}
                placeholder="Enter your quoted price"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>
            <div className="mb-3">
              <label htmlFor={`proposal-${quote.id}`} className="block text-sm font-medium text-gray-700 mb-1">Proposal Details</label>
              <textarea
                id={`proposal-${quote.id}`}
                value={proposalDetails}
                onChange={handleProposalDetailsChange}
                rows="4"
                placeholder="Describe your proposal, terms, and timeline."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
              ></textarea>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleSaveClick}
                className="btn-primary"
              >
                Save & Send Quote
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
