// src/app/customer/page.js
"use client";

import { useEffect, useState, useCallback } from "react";
import { auth } from "@/lib/config";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import ProviderCard from "@/components/ProviderCard";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Icon components (you'll need to create these or use a library like react-icons)
// For simplicity, I'll use inline SVGs or simple text for now.
// Example: import { ChatIcon, OrderIcon, QuoteIcon } from '@/components/Icons';

export default function CustomerHomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // States for customer activities count
  const [quotesCount, setQuotesCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [chatsCount, setChatsCount] = useState(0);
  const [activityLoading, setActivityLoading] = useState(true);

  // Blinking Button State
  const [recommendationBlink, setRecommendationBlink] = useState(false);
  const router = useRouter();

  // Define navigation items for the Header (NO COUNTS HERE)
  const customerNavItems = [
    { name: "Home", href: "/customer" },
    { name: "My Quotes", href: "/customer/quotes" },
    { name: "My Orders", href: "/customer/orders" },
    { name: "Request Quote", href: "/customer/request-quote" },
  ];

  // Function to fetch providers
  const fetchProviders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/providers?search=${encodeURIComponent(searchTerm)}`);
      if (!res.ok) {
        throw new Error("Failed to fetch service providers.");
      }
      const data = await res.json();
      setProviders(data.providers || []);
    } catch (err) {
      console.error("Error fetching providers:", err);
      setError("Failed to load service providers. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  // Function to fetch customer's activities COUNTS
  const fetchCustomerActivityCounts = useCallback(async (userId) => {
    setActivityLoading(true);
    try {
      // Fetch Quotes Count
      const quotesRes = await fetch(`/api/quotes?userId=${userId}&role=customer`);
      if (quotesRes.ok) {
        const quotesData = await quotesRes.json();
        setQuotesCount(quotesData.quotes?.length || 0);
      } else {
        console.error("Failed to fetch customer quotes count.");
      }

      // Fetch Orders Count
      const ordersRes = await fetch(`/api/orders?userId=${userId}&role=customer`);
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrdersCount(ordersData.orders?.length || 0);
      } else {
        console.error("Failed to fetch customer orders count.");
      }

      // Fetch Chats Count
      const chatsRes = await fetch(`/api/chats?userId=${userId}`);
      if (chatsRes.ok) {
        const chatsData = await chatsRes.json();
        setChatsCount(chatsData.chats?.length || 0);
      } else {
        console.error("Failed to fetch customer chats count.");
      }

    } catch (err) {
      console.error("Error fetching customer activity counts:", err);
    } finally {
      setActivityLoading(false);
    }
  }, []);

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
        if (data.user.role !== "customer") {
          router.push("/unauthorized");
          return;
        }
      } catch (err) {
        console.error("Error verifying user role:", err);
        setError("Failed to verify your account role. Please try again.");
        setLoading(false);
        return;
      }

      fetchProviders();
      fetchCustomerActivityCounts(currentUser.uid); // Fetch counts for activities
    });

    const blinkInterval = setInterval(() => {
      setRecommendationBlink(prev => !prev);
    }, 800);

    return () => {
      unsubscribe();
      clearInterval(blinkInterval);
    };
  }, [router, fetchProviders, fetchCustomerActivityCounts]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProviders();
  };

  const handleRecommendationClick = () => {
    router.push("/recommendation");
  };

  const handleSendQuoteClick = (providerId, serviceId) => {
    router.push(`/customer/request-quote?providerId=${providerId}&serviceId=${serviceId}`);
  };

  // Conditionally render based on loading/error states
  if (loading || activityLoading) {
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
          <button onClick={fetchProviders} className="btn-primary mt-4">
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

      <main className="flex-1 pt-16 bg-gray-50 overflow-y-auto">
        <div className="container mx-auto p-6 bg-gray-50">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
            Find Your Perfect Solar Solution
          </h1>

          {/* NEW: Compact Customer Activity Indicators */}
          <div className="flex justify-center mb-8 gap-x-6 text-gray-700 font-medium">
            <Link href="/customer/chats" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-200 transition-colors">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.244-1.106l-.956-.34A4.957 4.957 0 003 16.5V15a3 3 0 013-3h12a3 3 0 013 3v1.5c0 1.933-2.03 3.5-5 3.5z"></path></svg>
              <span>Chats</span>
              {chatsCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center -ml-1">
                  {chatsCount}
                </span>
              )}
            </Link>

            <Link href="/customer/quotes" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-200 transition-colors">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M18 10l-3 3.5L12 10"></path></svg>
              <span>Quotes</span>
              {quotesCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center -ml-1">
                  {quotesCount}
                </span>
              )}
            </Link>

            <Link href="/customer/orders" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-200 transition-colors">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17h6m-6 4h6m-6-8h.01M12 11h.01M12 7h.01M7 7h.01M17 7h.01M5 19V6a2 2 0 012-2h10a2 2 0 012 2v13a2 2 0 01-2 2H7a2 2 0 01-2-2z"></path></svg>
              <span>Orders</span>
              {ordersCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center -ml-1">
                  {ordersCount}
                </span>
              )}
            </Link>
          </div>

          {/* Recommendation Button (remains prominent) */}
          <div className="flex justify-center mb-8">
            <button
              onClick={handleRecommendationClick}
              className={`px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 ease-in-out
                ${recommendationBlink ? 'bg-yellow-400 text-gray-900 shadow-lg animate-pulse' : 'bg-green-600 text-white'}
                hover:scale-105 transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-green-300`}
            >
              {recommendationBlink ? "⚡ Get Your Personalized Recommendations! ⚡" : "Get Personalized Recommendations"}
            </button>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Explore Solar Service Providers
          </h2>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mb-8 max-w-2xl mx-auto">
            <div className="flex border border-gray-300 rounded-full overflow-hidden shadow-sm">
              <input
                type="text"
                placeholder="Search providers or services..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="flex-grow p-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-300 rounded-l-full"
              />
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-4 hover:bg-green-700 transition duration-200 ease-in-out rounded-r-full"
              >
                Search
              </button>
            </div>
          </form>

          {providers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-xl mb-4">No service providers found.</p>
              <p className="text-gray-500">Try adjusting your search or check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {providers.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  onSendQuoteClick={handleSendQuoteClick}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}