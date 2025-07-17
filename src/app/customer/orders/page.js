// src/app/customer/orders/page.js
"use client";

import { useEffect, useState, useCallback } from "react"; // Add useCallback
import { auth } from "@/lib/config";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

// --- Loader Component (can be a shared component) ---
const Loader = () => (
  <div className="flex flex-col items-center justify-center h-full min-h-[300px]"> {/* Added min-h for vertical centering */}
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
    <p className="ml-3 mt-3 text-lg text-gray-700">Loading your orders...</p>
  </div>
);

// --- Skeleton Loader for an Order Item ---
const OrderCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row justify-between items-start md:items-center animate-pulse border border-gray-200">
    <div className="flex-1 mb-4 md:mb-0 space-y-2">
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
    </div>
    <div className="flex flex-col items-start md:items-end space-y-3">
      <div className="h-6 bg-gray-200 rounded w-24"></div>
      <div className="h-10 bg-gray-200 rounded w-32"></div>
    </div>
  </div>
);


export default function CustomerOrdersPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();

  const customerNavItems = [
    { name: "Home", href: "/customer" },
    { name: "My Quotes", href: "/customer/quotes" },
    { name: "My Orders", href: "/customer/orders" },
    { name: "Request Quote", href: "/customer/request-quote" },
  ];

  // Memoize fetchOrders to prevent unnecessary re-creation
  const fetchOrders = useCallback(async (customerId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders?userId=${customerId}&role=customer`);
      if (!res.ok) throw new Error("Failed to fetch orders.");
      const data = await res.json();

      // OPTIMIZATION: Collect all unique provider and service IDs first
      const uniqueProviderIds = [...new Set(data.orders.map(order => order.providerId))];
      const uniqueServiceIds = [...new Set(data.orders.map(order => order.serviceId))];

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

      // Now, enrich orders using the maps
      const ordersWithDetails = data.orders.map(order => ({
        ...order,
        providerName: providerMap.get(order.providerId) || 'Unknown Provider',
        serviceTitle: serviceMap.get(order.serviceId) || 'Unknown Service',
      }));

      setOrders(ordersWithDetails);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load your orders. Please try again.");
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
      // Fetch orders only after user is authenticated
      fetchOrders(currentUser.uid);
    });

    return () => unsubscribe();
  }, [router, fetchOrders]); // Add fetchOrders to dependencies of useEffect

  const handleCompleteOrder = async (orderId) => {
    if (!confirm("Are you sure you want to mark this order as completed? This will trigger payment release.")) return;

    try {
      setLoading(true); // Show loading spinner during action
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed', paymentStatus: 'released_to_provider' })
      });

      if (!res.ok) throw new Error('Failed to complete order.');
      alert('Order marked as completed! Payment will be released to the provider.');
      if (user) { // Ensure user is not null before refetching
          fetchOrders(user.uid); // Refresh orders
      } else {
          router.reload(); // Fallback if user somehow becomes null
      }
    } catch (err) {
      console.error("Error completing order:", err);
      alert("Failed to complete order: " + err.message);
      setLoading(false); // Hide loading on error
    }
  };

  const handleLeaveReview = (orderId, providerId) => {
    router.push(`/customer/review?orderId=${orderId}&providerId=${providerId}`);
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending_acceptance': return 'bg-yellow-100 text-yellow-800';
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
             {[...Array(3)].map((_, i) => <OrderCardSkeleton key={i} />)} {/* Show a few skeletons */}
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
                  fetchOrders(user.uid);
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
          <h1 className="text-3xl font-semibold text-gray-800 mb-8 text-center">My Orders</h1>

          {orders.length === 0 ? (
            <div className="p-8 text-center text-gray-700 border-2 border-dashed border-gray-300 rounded-lg max-w-md mx-auto">
              <p className="text-lg mb-4">You don't have any active or completed orders yet.</p>
              <Link href="/customer" className="text-blue-600 hover:underline text-base font-medium">
                Start by requesting a quote from a service provider!
              </Link>
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div className="flex-1 mb-4 md:mb-0">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{order.serviceTitle}</h2>
                    <p className="text-gray-700 mb-1">Provider: <span className="font-semibold">{order.providerName}</span></p>
                    <p className="text-gray-500 text-sm mb-2">Offer Amount: <span className="font-semibold text-green-700">${order.customOfferDetails?.amount?.toFixed(2) || 'N/A'}</span></p>
                    <p className="text-gray-500 text-xs">Order Placed: {new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</p>
                    {order.status === 'completed' && order.completedAt && (
                      <p className="text-gray-500 text-xs">Completed On: {new Date(order.completedAt.seconds * 1000).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-start md:items-end space-y-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusClasses(order.status)} capitalize`}>
                      Status: {order.status.replace(/_/g, ' ')}
                    </span>
                    {order.chatId && (
                      <Link href={`/customer/chat/${order.chatId}`} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm">
                        View Conversation
                      </Link>
                    )}
                    {order.status === 'in_progress' && (
                      <button
                        onClick={() => handleCompleteOrder(order.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                      >
                        Mark as Completed
                      </button>
                    )}
                    {order.status === 'completed' && !order.customerReviewId && (
                      <button
                        onClick={() => handleLeaveReview(order.id, order.providerId)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm"
                      >
                        Leave a Review
                      </button>
                    )}
                     {order.status === 'completed' && order.customerReviewId && (
                      <span className="text-gray-500 text-sm">Review Submitted</span>
                    )}
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