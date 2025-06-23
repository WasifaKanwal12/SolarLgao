// src/components/ProviderCard.jsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function ProviderCard({ provider, onSendQuoteClick }) {
  const [showAllServices, setShowAllServices] = useState(false);
  const displayedServices = showAllServices ? provider.services : provider.services?.slice(0, 2); // Show first 2 by default

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="relative h-48 bg-gray-200 flex items-center justify-center">
        <img
          src={provider.profileImageUrl || "https://placehold.co/400x250/E0E0E0/757575?text=Provider+Logo"}
          alt={provider.companyName}
          className="object-cover w-full h-full"
          onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x250/E0E0E0/757575?text=Provider+Logo"; }}
        />
        <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          {provider.rating.toFixed(1)} ★ ({provider.totalReviews} reviews)
        </div>
      </div>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{provider.companyName}</h2>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{provider.description}</p>

        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Services Offered:</h3>
          {displayedServices && displayedServices.length > 0 ? (
            <ul className="space-y-2">
              {displayedServices.map((service) => (
                <li key={service.id} className="flex flex-col border border-gray-200 p-3 rounded-md bg-gray-50">
                  <span className="font-medium text-gray-700">{service.title}</span>
                  <span className="text-sm text-gray-500">
                    Est. Price: ${service.priceMin}
                    {service.priceMax && service.priceMax !== service.priceMin ? ` - $${service.priceMax}` : ''}
                  </span>
                  <button
                    onClick={() => onSendQuoteClick(provider.id, service.id)}
                    className="mt-2 w-full bg-green-500 text-white py-2 px-4 rounded-md text-sm font-semibold hover:bg-green-600 transition duration-200"
                  >
                    Send Quote for This Service
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No services listed yet.</p>
          )}
          {provider.services && provider.services.length > 2 && (
            <button
              onClick={() => setShowAllServices(!showAllServices)}
              className="mt-3 text-blue-600 hover:underline text-sm"
            >
              {showAllServices ? "Show Less" : `Show All (${provider.services.length})`}
            </button>
          )}
        </div>

        <div className="flex items-center text-gray-600 text-sm mb-2">
          <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path>
          </svg>
          {provider.serviceLocations.join(', ')}
        </div>
        {provider.website && (
          <Link href={provider.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
            Visit Website
          </Link>
        )}
      </div>
    </div>
  );
}