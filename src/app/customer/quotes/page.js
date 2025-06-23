// src/app/customer/quotes/page.js
"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/config";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/signin");
        return;
      }
      setUser(currentUser);
      await fetchQuotes(currentUser.uid);
    });

    return () => unsubscribe();
  }, [router]);

  const fetchQuotes = async (customerId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/quotes?userId=${customerId}&role=customer`);
      if (!res.ok) throw new Error("Failed to fetch quotes.");
      const data = await res.json();

      // For each quote, fetch provider name and service title for display
      const quotesWithDetails = await Promise.all(data.quotes.map(async (quote) => {
        let providerName = 'Unknown Provider';
        let serviceTitle = 'Unknown Service';

        // Fetch provider company name
        try {
          const providerRes = await fetch(`/api/providers/${quote.providerId}`);
          if (providerRes.ok) {
            const providerData = await providerRes.json();
            providerName = providerData.provider?.companyName || 'Unknown Provider';
          }
        } catch (e) { console.error("Error fetching provider for quote:", e); }

        // Fetch service title
        try {
          const serviceRes = await fetch(`/api/services/${quote.serviceId}`);
          if (serviceRes.ok) {
            const serviceData = await serviceRes.json();
            serviceTitle = serviceData.service?.title || 'Unknown Service';
          }
        } catch (e) { console.error("Error fetching service for quote:", e); }

        return { ...quote, providerName, serviceTitle };
      }));

      setQuotes(quotesWithDetails);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching quotes:", err);
      setError("Failed to load your quote requests. Please try again.");
      setLoading(false);
    }
  };

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
        <main className="flex-1 pt-16 bg-gray-50 flex justify-center items-center">
          <div className="loader"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header navItems={customerNavItems} userType="customer" />
        <main className="flex-1 pt-16 bg-gray-50 p-8 text-center text-red-600">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary mt-4">
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
      <main className="flex-1 pt-16 bg-gray-50 p-6 md:p-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-semibold text-gray-800 mb-8 text-center">My Quote Requests</h1>

          {quotes.length === 0 ? (
            <div className="p-8 text-center text-gray-700 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-lg mb-4">You haven't sent any quote requests yet.</p>
              <Link href="/customer" className="text-blue-600 hover:underline">
                Find providers and send your first quote!
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
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