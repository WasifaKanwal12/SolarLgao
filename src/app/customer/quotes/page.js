// src/app/customer/quotes/page.js
"use client";

import { useEffect, useState, useCallback } from "react"; // Add useCallback
import { auth } from "@/lib/config";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

// --- Loader Component (can be a shared component, like in CustomerOrdersPage) ---
const Loader = () => (
  <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
    <p className="ml-3 mt-3 text-lg text-gray-700">Loading your quote requests...</p>
  </div>
);

// --- Skeleton Loader for a Quote Item ---
const QuoteCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row justify-between items-start md:items-center animate-pulse border border-gray-200">
    <div className="flex-1 mb-4 md:mb-0 space-y-2">
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
    </div>
    <div className="flex flex-col items-start md:items-end space-y-3">
      <div className="h-6 bg-gray-200 rounded w-24"></div>
      <div className="h-10 bg-gray-200 rounded w-32"></div>
    </div>
  </div>
);

export default function CustomerQuotesPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();

  const customerNavItems = [
    { name: "Home", href: "/customer" },
    { name: "My Quotes", href: "/customer/quotes" },
    { name: "My Orders", href: "/customer/orders" },
    { name: "Request Quote", href: "/customer/request-quote" },
  ];

  // Memoize fetchQuotes to prevent unnecessary re-creation
  const fetchQuotes = useCallback(async (customerId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/quotes?userId=${customerId}&role=customer`);
      if (!res.ok) throw new Error("Failed to fetch quotes.");
      const data = await res.json();

      // OPTIMIZATION: Collect all unique provider and service IDs first
      const uniqueProviderIds = [...new Set(data.quotes.map(quote => quote.providerId))];
      const uniqueServiceIds = [...new Set(data.quotes.map(quote => quote.serviceId))];

      // Fetch all unique providers in parallel
      const providerPromises = uniqueProviderIds.map(id =>
        fetch(`/api/providers/${id}`)
          .then(res => res.ok ? res.json() : Promise.reject(`Failed provider ${id}`))
          .catch(e => {
            console.error(`Error fetching provider ${id}:`, e);
            return { provider: { id, companyName: 'Unknown Provider' } }; // Return fallback
          })
      );

      // Fetch all unique services in parallel
      const servicePromises = uniqueServiceIds.map(id =>
        fetch(`/api/services/${id}`)
          .then(res => res.ok ? res.json() : Promise.reject(`Failed service ${id}`))
          .catch(e => {
            console.error(`Error fetching service ${id}:`, e);
            return { service: { id, title: 'Unknown Service' } }; // Return fallback
          })
      );

      // Wait for all provider and service fetches to complete
      const [providersData, servicesData] = await Promise.all([
        Promise.all(providerPromises),
        Promise.all(servicePromises)
      ]);

      // Map IDs to their details for quick lookup
      const providerMap = new Map(providersData.map(item => [item.provider.id, item.provider.companyName]));
      const serviceMap = new Map(servicesData.map(item => [item.service.id, item.service.title]));

      // Now, enrich quotes using the maps
      const quotesWithDetails = data.quotes.map(quote => ({
        ...quote,
        providerName: providerMap.get(quote.providerId) || 'Unknown Provider',
        serviceTitle: serviceMap.get(quote.serviceId) || 'Unknown Service',
      }));

      setQuotes(quotesWithDetails);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error("Error fetching quotes:", err);
      setError("Failed to load your quote requests. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array as it only needs customerId, which comes from useEffect

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/signin");
        return;
      }
      setUser(currentUser);
      // Fetch quotes only after user is authenticated
      fetchQuotes(currentUser.uid);
    });

    return () => unsubscribe();
  }, [router, fetchQuotes]); // Add fetchQuotes to dependencies of useEffect

  const getStatusClasses = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'responded': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header navItems={customerNavItems} userType="customer" />
        <main className="flex-1 pt-16 bg-gray-50 flex flex-col justify-center items-center min-h-[calc(100vh-120px)]"> {/* Adjusted min-h */}
          <Loader />
          {/* Optionally show skeleton cards below the main loader if desired */}
          <div className="container mx-auto p-6 md:p-8 space-y-6 w-full max-w-4xl">
            {[...Array(3)].map((_, i) => <QuoteCardSkeleton key={i} />)} {/* Show a few skeletons */}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header navItems={customerNavItems} userType="customer" />
        <main className="flex-1 pt-16 bg-gray-50 p-8 text-center text-red-600 flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
          <p className="text-xl mb-4">{error}</p>
          <button onClick={() => {
              setError(null); // Clear error before retry
              if (user) { // If user exists, retry fetching everything
                  fetchQuotes(user.uid);
              } else { // If user doesn't exist, force re-auth check
                  router.push("/signin");
              }
          }} className="btn-primary mt-4">
            Retry
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header navItems={customerNavItems} userType="customer" />
      <main className="flex-1 pt-16 bg-gray-50 p-6 md:p-8 min-h-[calc(100vh-120px)]"> {/* Ensure minimum height */}
        <div className="container mx-auto">
          <h1 className="text-3xl font-semibold text-gray-800 mb-8 text-center">My Quote Requests</h1>

          {quotes.length === 0 ? (
            <div className="p-8 text-center text-gray-700 border-2 border-dashed border-gray-300 rounded-lg max-w-md mx-auto">
              <p className="text-lg mb-4">You haven't sent any quote requests yet.</p>
              <Link href="/customer" className="text-blue-600 hover:underline text-base font-medium">
                Find providers and send your first quote!
              </Link>
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto">
              {quotes.map((quote) => (
                <div key={quote.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div className="flex-1 mb-4 md:mb-0">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{quote.serviceTitle}</h2>
                    <p className="text-gray-700 mb-1">Provider: <span className="font-semibold">{quote.providerName}</span></p>
                    <p className="text-gray-500 text-sm mb-2 line-clamp-2">"{quote.message}"</p>
                    <p className="text-gray-500 text-xs">Requested on: {new Date(quote.createdAt.seconds * 1000).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-col items-start md:items-end space-y-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusClasses(quote.status)} capitalize`}>
                      Status: {quote.status.replace(/_/g, ' ')}
                    </span>
                    {quote.status === 'responded' && quote.chatId && (
                      <Link href={`/customer/chat/${quote.chatId}`} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm">
                        View Conversation
                      </Link>
                    )}
                    {/* Add other actions based on status, e.g., "Review Offer" button */}
                    {/* If quote.status is 'responded' and chat contains an offer, you'd show an "Review Offer" button */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}