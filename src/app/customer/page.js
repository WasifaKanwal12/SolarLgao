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

// You might create a dedicated Loader component in components/Loader.js
// For now, we'll keep the inline loader for demonstration.
const Loader = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
    <p className="ml-3 text-lg text-gray-700">Loading your dashboard...</p>
  </div>
);

// Optional: Skeleton loader for provider cards
const ProviderCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-6 animate-pulse border border-gray-200">
    <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-gray-300 rounded w-full mb-4"></div>
    <div className="h-10 bg-gray-300 rounded w-full"></div>
  </div>
);


export default function CustomerHomePage() {
  const [user, setUser] = useState(null);
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false); // New state
  const [loadingProviders, setLoadingProviders] = useState(true); // Specific loading for providers
  const [loadingActivityCounts, setLoadingActivityCounts] = useState(true); // Specific loading for counts
  const [providers, setProviders] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [quotesCount, setQuotesCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [chatsCount, setChatsCount] = useState(0);

  const [recommendationBlink, setRecommendationBlink] = useState(false);
  const router = useRouter();

  const customerNavItems = [
    { name: "Home", href: "/customer" },
    { name: "My Quotes", href: "/customer/quotes" },
    { name: "My Orders", href: "/customer/orders" },
    { name: "Request Quote", href: "/customer/request-quote" },
  ];

  const fetchProviders = useCallback(async (currentSearchTerm) => {
    setLoadingProviders(true); // Start loading providers
    try {
      const res = await fetch(`/api/providers?search=${encodeURIComponent(currentSearchTerm)}`);
      if (!res.ok) {
        throw new Error("Failed to fetch service providers.");
      }
      const data = await res.json();
      setProviders(data.providers || []);
      setError(null); // Clear any previous error
    } catch (err) {
      console.error("Error fetching providers:", err);
      setError("Failed to load service providers. Please try again.");
    } finally {
      setLoadingProviders(false); // End loading providers
    }
  }, []); // Dependencies include searchTerm (if you want this to re-run on search change)
           // Currently searchTerm is passed as argument, so no dep here.

  const fetchCustomerActivityCounts = useCallback(async (userId) => {
    setLoadingActivityCounts(true); // Start loading activity counts
    try {
      const [quotesRes, ordersRes, chatsRes] = await Promise.all([
        fetch(`/api/quotes?userId=${userId}&role=customer`),
        fetch(`/api/orders?userId=${userId}&role=customer`),
        fetch(`/api/chat?participantId=${userId}`), // Corrected: use participantId
      ]);

      if (quotesRes.ok) {
        const quotesData = await quotesRes.json();
        setQuotesCount(quotesData.quotes?.length || 0);
      } else {
        console.error("Failed to fetch customer quotes count.");
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrdersCount(ordersData.orders?.length || 0);
      } else {
        console.error("Failed to fetch customer orders count.");
      }

      if (chatsRes.ok) {
        const chatsData = await chatsRes.json();
        setChatsCount(chatsData.chats?.length || 0);
      } else {
        console.error("Failed to fetch customer chats count.");
      }
    } catch (err) {
      console.error("Error fetching customer activity counts:", err);
      // Don't set a global error for this, as the page can still render.
      // You might show individual error messages for each count if critical.
    } finally {
      setLoadingActivityCounts(false); // End loading activity counts
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/signin");
        return;
      }
      setUser(currentUser);

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
        // Set initial auth check complete even on error to allow main render
        setInitialAuthCheckComplete(true);
        return;
      }

      // Start fetching providers and activity counts concurrently
      fetchProviders(searchTerm); // Pass initial searchTerm
      fetchCustomerActivityCounts(currentUser.uid);
      setInitialAuthCheckComplete(true); // Auth check is complete
    });

    const blinkInterval = setInterval(() => {
      setRecommendationBlink((prev) => !prev);
    }, 800);

    return () => {
      unsubscribe();
      clearInterval(blinkInterval);
    };
  }, [router, fetchProviders, fetchCustomerActivityCounts, searchTerm]); // Add searchTerm to dependency array for automatic re-fetch on search change

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProviders(searchTerm); // Trigger fetch with current searchTerm
  };

  const handleRecommendationClick = () => {
    router.push("/recommendation");
  };

  const handleSendQuoteClick = (providerId, serviceId) => {
    router.push(`/customer/request-quote?providerId=${providerId}&serviceId=${serviceId}`);
  };

  // Overall loading state depends on initial auth check and specific data loadings
  const overallLoading = !initialAuthCheckComplete || loadingProviders || loadingActivityCounts;

  if (error) { // Show global error if user role verification or initial provider fetch fails
    return (
      <div className="flex flex-col min-h-screen">
        <Header navItems={customerNavItems} userType="customer" />
        <main className="flex-1 pt-16 bg-gray-50 p-8 text-center text-red-600 flex flex-col items-center justify-center">
          <p className="text-xl mb-4">{error}</p>
          <button onClick={() => {
            setError(null); // Clear error before retry
            if (user) { // If user exists, retry fetching everything
                fetchProviders(searchTerm);
                fetchCustomerActivityCounts(user.uid);
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

  // Use a full-page loader if initial authentication check is not complete
  // or if all data fetching is still in progress (initial load only).
  // This ensures the header/footer appear along with a central loader.
  if (!initialAuthCheckComplete || (loadingProviders && loadingActivityCounts)) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header navItems={customerNavItems} userType="customer" />
        <main className="flex-1 pt-16 bg-gray-50 flex flex-col justify-center items-center min-h-[calc(100vh-120px)]">
          <Loader />
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

          {/* Customer Activity Indicators */}
          <div className="flex justify-center mb-8 gap-x-6 text-gray-700 font-medium">
            {/* Chats Link */}
            <Link href="/customer/chat" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-200 transition-colors">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.244-1.106l-.956-.34A4.957 4.957 0 003 16.5V15a3 3 0 013-3h12a3 3 0 013 3v1.5c0 1.933-2.03 3.5-5 3.5z"></path></svg>
              <span>Chats</span>
              {!loadingActivityCounts && chatsCount > 0 && ( // Only show if not loading and count > 0
                <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center -ml-1">
                  {chatsCount}
                </span>
              )}
               {loadingActivityCounts && ( // Show skeleton for counts while loading
                    <span className="h-5 w-5 bg-gray-300 rounded-full animate-pulse -ml-1"></span>
               )}
            </Link>

            {/* Quotes Link */}
            <Link href="/customer/quotes" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-200 transition-colors">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M18 10l-3 3.5L12 10"></path></svg>
              <span>Quotes</span>
              {!loadingActivityCounts && quotesCount > 0 && ( // Only show if not loading and count > 0
                <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center -ml-1">
                  {quotesCount}
                </span>
              )}
               {loadingActivityCounts && (
                    <span className="h-5 w-5 bg-gray-300 rounded-full animate-pulse -ml-1"></span>
               )}
            </Link>

            {/* Orders Link */}
            <Link href="/customer/orders" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-200 transition-colors">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17h6m-6 4h6m-6-8h.01M12 11h.01M12 7h.01M7 7h.01M17 7h.01M5 19V6a2 2 0 012-2h10a2 2 0 012 2v13a2 2 0 01-2 2H7a2 2 0 01-2-2z"></path></svg>
              <span>Orders</span>
              {!loadingActivityCounts && ordersCount > 0 && ( // Only show if not loading and count > 0
                <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center -ml-1">
                  {ordersCount}
                </span>
              )}
              {loadingActivityCounts && (
                    <span className="h-5 w-5 bg-gray-300 rounded-full animate-pulse -ml-1"></span>
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

          {loadingProviders ? ( // Show skeletons while providers are loading
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => ( // Render 8 skeleton cards
                <ProviderCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            providers.length === 0 ? (
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
            )
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}