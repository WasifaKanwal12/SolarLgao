// src/app/provider/orders/page.js
"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/config";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProviderOrdersPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();

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

  const fetchOrders = async (providerId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders?userId=${providerId}&role=provider`);
      if (!res.ok) throw new Error("Failed to fetch orders.");
      const data = await res.json();

      const ordersWithDetails = await Promise.all(data.orders.map(async (order) => {
        let customerName = 'Unknown Customer';
        let serviceTitle = 'Unknown Service';

        // Fetch customer name
        try {
          const customerRes = await fetch(`/api/users/${order.customerId}`);
          if (customerRes.ok) {
            const customerData = await customerRes.json();
            customerName = customerData.user?.firstName + ' ' + customerData.user?.lastName || 'Unknown Customer';
          }
        } catch (e) { console.error("Error fetching customer for order:", e); }

        // Fetch service title
        try {
          const serviceRes = await fetch(`/api/services/${order.serviceId}`);
          if (serviceRes.ok) {
            const serviceData = await serviceRes.json();
            serviceTitle = serviceData.service?.title || 'Unknown Service';
          }
        } catch (e) { console.error("Error fetching service for order:", e); }

        return { ...order, customerName, serviceTitle };
      }));

      setOrders(ordersWithDetails);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load your orders. Please try again.");
      setLoading(false);
    }
  };

  const handleUploadProofOfCompletion = async (orderId) => {
    // In a real app, you'd use a file input and upload to Firebase Storage, then get the URL.
    // For now, let's mock a URL.
    const proofUrl = prompt("Enter URL for proof of completion (e.g., photo of installation):");
    if (!proofUrl) return;

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofOfCompletionUrl: proofUrl })
      });

      if (!res.ok) throw new Error('Failed to upload proof.');
      alert('Proof of completion uploaded! Customer will be notified.');
      fetchOrders(user.uid); // Refresh orders
    } catch (err) {
      console.error("Error uploading proof:", err);
      alert("Failed to upload proof: " + err.message);
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case 'pending_acceptance': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
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
      <h1 className="text-3xl font-semibold text-gray-800 mb-8 text-center">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="p-8 text-center text-gray-700 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-lg mb-4">You don't have any active or completed orders yet.</p>
          <p className="text-gray-500">Respond to quotes to start new orders!</p>
          <Link href="/provider/quotes" className="text-blue-600 hover:underline mt-4 block">
            View incoming quotes
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex-1 mb-4 md:mb-0">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{order.serviceTitle}</h2>
                <p className="text-gray-700 mb-1">Customer: <span className="font-semibold">{order.customerName}</span></p>
                <p className="text-gray-500 text-sm mb-2">Offer Amount: <span className="font-semibold text-green-700">PKR{order.customOfferDetails?.amount?.toFixed(2) || 'N/A'}</span></p>
                <p className="text-gray-500 text-xs">Order Placed: {new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</p>
                {order.status === 'completed' && order.completedAt && (
                  <p className="text-gray-500 text-xs">Completed On: {new Date(order.completedAt.seconds * 1000).toLocaleDateString()}</p>
                )}
                 {order.paymentStatus === 'released_to_provider' && (
                  <p className="text-sm text-green-600 font-medium">Payment Released!</p>
                )}
              </div>
              <div className="flex flex-col items-start md:items-end space-y-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusClasses(order.status)} capitalize`}>
                  Status: {order.status.replace(/_/g, ' ')}
                </span>
                {order.chatId && (
                  <Link href={`/provider/chat/${order.chatId}`} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm">
                    View Conversation
                  </Link>
                )}
                {order.status === 'in_progress' && !order.proofOfCompletionUrl && (
                  <button
                    onClick={() => handleUploadProofOfCompletion(order.id)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm"
                  >
                    Upload Proof of Completion
                  </button>
                )}
                {order.proofOfCompletionUrl && order.status === 'in_progress' && (
                  <span className="text-gray-500 text-sm">Proof uploaded, awaiting customer acceptance.</span>
                )}
                 {order.customerReviewId && (
                    <span className="text-gray-500 text-sm">Customer reviewed.</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}