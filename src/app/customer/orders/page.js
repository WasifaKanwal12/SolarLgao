// src/app/customer/orders/page.js
"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/config";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/signin");
        return;
      }
      setUser(currentUser);
      await fetchOrders(currentUser.uid);
    });

    return () => unsubscribe();
  }, [router]);

  const fetchOrders = async (customerId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders?userId=${customerId}&role=customer`);
      if (!res.ok) throw new Error("Failed to fetch orders.");
      const data = await res.json();

      const ordersWithDetails = await Promise.all(data.orders.map(async (order) => {
        let providerName = 'Unknown Provider';
        let serviceTitle = 'Unknown Service';

        // Fetch provider company name
        try {
          const providerRes = await fetch(`/api/providers/${order.providerId}`);
          if (providerRes.ok) {
            const providerData = await providerRes.json();
            providerName = providerData.provider?.companyName || 'Unknown Provider';
          }
        } catch (e) { console.error("Error fetching provider for order:", e); }

        // Fetch service title
        try {
          const serviceRes = await fetch(`/api/services/${order.serviceId}`);
          if (serviceRes.ok) {
            const serviceData = await serviceRes.json();
            serviceTitle = serviceData.service?.title || 'Unknown Service';
          }
        } catch (e) { console.error("Error fetching service for order:", e); }

        return { ...order, providerName, serviceTitle };
      }));

      setOrders(ordersWithDetails);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load your orders. Please try again.");
      setLoading(false);
    }
  };

  const handleCompleteOrder = async (orderId) => {
    if (!confirm("Are you sure you want to mark this order as completed? This will trigger payment release.")) return;

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed', paymentStatus: 'released_to_provider' }) // Assuming payment logic
      });

      if (!res.ok) throw new Error('Failed to complete order.');
      alert('Order marked as completed! Payment will be released to the provider.');
      fetchOrders(user.uid); // Refresh orders
    } catch (err) {
      console.error("Error completing order:", err);
      alert("Failed to complete order: " + err.message);
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
          <h1 className="text-3xl font-semibold text-gray-800 mb-8 text-center">My Orders</h1>

          {orders.length === 0 ? (
            <div className="p-8 text-center text-gray-700 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-lg mb-4">You don't have any active or completed orders yet.</p>
              <Link href="/customer" className="text-blue-600 hover:underline">
                Start by requesting a quote from a service provider!
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
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