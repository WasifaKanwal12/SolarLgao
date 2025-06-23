// src/app/provider/quotes/page.js
"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/config";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProviderQuotesPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/signin");
        return;
      }
      setUser(currentUser);
      await fetchQuotes(currentUser.uid, 'provider');
    });

    return () => unsubscribe();
  }, [router]);

const fetchQuotes = async (userId, role) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/quotes?userId=${userId}&role=${role}`);
      if (!res.ok) throw new Error("Failed to fetch quotes.");
      const data = await res.json();

      // For each quote, fetch customer name and service title for display
      const quotesWithDetails = await Promise.all(data.quotes.map(async (quote) => {
        let customerName = 'Unknown Customer';
        let serviceTitle = 'Unknown Service';

        // Fetch customer name
        try {
          const customerRes = await fetch(`/api/users/${quote.customerId}`);
          if (customerRes.ok) {
            const customerData = await customerRes.json();
            customerName = customerData.user?.firstName + ' ' + customerData.user?.lastName || 'Unknown Customer';
          }
        } catch (e) { console.error("Error fetching customer for quote:", e); }

        // Fetch service title
        try {
          const serviceRes = await fetch(`/api/services/${quote.serviceId}`);
          if (serviceRes.ok) {
            const serviceData = await serviceRes.json();
            serviceTitle = serviceData.service?.title || 'Unknown Service';
          }
        } catch (e) { console.error("Error fetching service for quote:", e); }

        return { ...quote, customerName, serviceTitle };
      }));

      setQuotes(quotesWithDetails);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching quotes:", err);
      setError("Failed to load your quote requests. Please try again.");
      setLoading(false);
    }
  };

  const handleInitiateChat = async (quote) => {
    // Navigate to chat, passing necessary details or directly initiating chat if needed
    // For now, let's just go to the chat page and the chat component can handle initiation.
    if (quote.chatId) {
        router.push(`/provider/chat/${quote.chatId}`);
    } else {
        // If no existing chat, you might want to create one on the fly here
        // or guide the provider to a "new chat" interface linked to this quote.
        // For simplicity, we'll auto-create if chat is needed but doesn't exist
        try {
            const res = await fetch('/api/chats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: quote.customerId,
                    providerId: user.uid,
                    initialMessage: `Hello ${quote.customerName}, thanks for your interest in "${quote.serviceTitle}"! How can I help you?`,
                    quoteId: quote.id
                })
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to initiate chat.');
            }
            const data = await res.json();
            alert("Chat initiated!");
            router.push(`/provider/chat/${data.chatId}`);
        } catch (err) {
            console.error("Error initiating chat from quote:", err);
            alert("Failed to initiate chat: " + err.message);
        }
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
      <div className="flex-1 p-6 md:p-8 bg-gray-100 flex justify-center items-center h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 text-center text-red-600 bg-gray-100">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 bg-gray-100">
      <h1 className="text-3xl font-semibold text-gray-800 mb-8 text-center">Incoming Quotes</h1>

      {quotes.length === 0 ? (
        <div className="p-8 text-center text-gray-700 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-lg mb-4">No new quote requests at the moment.</p>
          <p className="text-gray-500">Check back later or ensure your services are active!</p>
          <Link href="/provider/services" className="text-blue-600 hover:underline mt-4 block">
            Manage your services
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {quotes.map((quote) => (
            <div key={quote.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex-1 mb-4 md:mb-0">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{quote.serviceTitle}</h2>
                <p className="text-gray-700 mb-1">From: <span className="font-semibold">{quote.customerName}</span></p>
                <p className="text-gray-500 text-sm mb-2 line-clamp-2">"{quote.message}"</p>
                <p className="text-gray-500 text-xs">Requested on: {new Date(quote.createdAt.seconds * 1000).toLocaleDateString()}</p>
                <p className="text-gray-500 text-xs">Address: {quote.customerAddress}</p>
                <p className="text-gray-500 text-xs">Contact: {quote.customerContact}</p>
              </div>
              <div className="flex flex-col items-start md:items-end space-y-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusClasses(quote.status)} capitalize`}>
                  Status: {quote.status.replace(/_/g, ' ')}
                </span>
                <button
                  onClick={() => handleInitiateChat(quote)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  {quote.chatId ? 'Continue Chat' : 'Initiate Chat'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}