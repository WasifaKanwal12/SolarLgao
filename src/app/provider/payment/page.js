// app/provider/payments/page.js
"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/config";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ProviderPaymentsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();

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
        if (data.user.role !== "provider") {
          router.push("/unauthorized");
          return;
        }
      } catch (err) {
        console.error("Error verifying user role:", err);
        setError("Failed to verify your account role. Please try again.");
        setLoading(false);
        return;
      }

      fetchPayments(currentUser.uid);
    });

    return () => unsubscribe();
  }, [router]);

  const fetchPayments = async (uid) => {
    try {
      // In a real application, you would fetch payments from your backend,
      // possibly integrating with a payment gateway (e.g., Stripe, PayPal).
      // For this example, we'll simulate some payment data or link to orders.

      const res = await fetch(`/api/orders?providerUid=${uid}`); // Fetch orders to derive payments
      if (!res.ok) {
        throw new Error("Failed to fetch orders for payment data.");
      }
      const data = await res.json();
      const completedOrders = data.orders.filter(order => order.status === 'completed');

      // Simulate payments from completed orders
      const simulatedPayments = completedOrders.map(order => ({
        id: `pay_${order.id}`,
        orderId: order.id,
        amount: order.quotedPrice,
        currency: 'PKR', // Assuming PKR as per context
        status: 'received', // Or 'processed', 'pending_payout'
        paymentDate: order.completedAt || order.lastUpdatedAt || order.createdAt, // Use completion date if available
        description: `Payment for Order #${order.id} - ${order.serviceType}`,
      }));

      setPayments(simulatedPayments || []);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError("Failed to load your payment history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>{error}</p>
        <button onClick={() => fetchPayments(user.uid)} className="btn-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Payments</h1>
      {payments.length === 0 ? (
        <p className="text-gray-600">No payment records found yet. Payments will appear here once orders are completed.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">Payment ID</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">Order ID</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">Amount</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">Status</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">Date</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">Description</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-800">{payment.id}</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-800">
                    <Link href={`/provider/orders?orderId=${payment.orderId}`} className="text-primary-green hover:underline">
                      {payment.orderId}
                    </Link>
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-800 font-medium">
                    {payment.amount ? `${payment.currency} ${payment.amount.toLocaleString()}` : 'N/A'}
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      payment.status === 'received' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-800">
                    {payment.paymentDate ? new Date(payment.paymentDate._seconds * 1000).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-800">{payment.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}