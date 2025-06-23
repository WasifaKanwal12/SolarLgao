// app/provider/pending/page.js
"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/config";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProviderPendingPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [providerStatus, setProviderStatus] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/signin");
        return;
      }
      setUser(currentUser);
      await fetchProviderStatus(currentUser.uid);
    });

    return () => unsubscribe();
  }, [router]);

  const fetchProviderStatus = async (uid) => {
    try {
      const userRes = await fetch(`/api/users/${uid}`);
      if (!userRes.ok) throw new Error("Failed to fetch user data.");
      const userData = await userRes.json();

      if (userData.user.role !== "provider") {
        router.push("/unauthorized"); // Redirect if not a provider
        return;
      }

      const providerRes = await fetch(`/api/providers/${uid}`);
      if (!providerRes.ok) throw new Error("Failed to fetch provider data.");
      const providerData = await providerRes.json();

      setProviderStatus(providerData.provider.status);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching provider status:", err);
      setError("Failed to load your provider status. Please try again.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  if (providerStatus === 'approved') {
    router.push("/provider"); // If approved, redirect to dashboard
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center p-6 bg-white rounded-lg shadow-lg">
        {providerStatus === 'pending' && (
          <>
            <h2 className="mt-6 text-3xl font-extrabold text-primary-green">
              Application Under Review
            </h2>
            <p className="mt-4 text-lg text-gray-700">
              Thank you for registering as a service provider!
            </p>
            <p className="mt-2 text-gray-600">
              Your application is currently under review by our administration team. We are verifying your details and credentials.
            </p>
            <p className="mt-2 text-gray-600 font-medium">
              You will receive an email notification once your application has been approved or if more information is required.
            </p>
            <div className="mt-6">
              <button
                onClick={() => auth.signOut().then(() => router.push('/signin'))}
                className="btn-secondary"
              >
                Sign Out
              </button>
            </div>
          </>
        )}
        {providerStatus === 'rejected' && (
          <>
            <h2 className="mt-6 text-3xl font-extrabold text-red-600">
              Application Rejected
            </h2>
            <p className="mt-4 text-lg text-gray-700">
              We regret to inform you that your service provider application has been rejected.
            </p>
            <p className="mt-2 text-gray-600">
              This could be due to various reasons, including incomplete documentation or not meeting our eligibility criteria.
            </p>
            <p className="mt-2 text-gray-600 font-medium">
              Please contact support for more details or if you believe this is an error.
            </p>
            <div className="mt-6">
              <Link href="/contact-support" className="btn-primary mr-4">
                Contact Support
              </Link>
              <button
                onClick={() => auth.signOut().then(() => router.push('/signin'))}
                className="btn-secondary"
              >
                Sign Out
              </button>
            </div>
          </>
        )}
        {!providerStatus && !error && (
          <p className="text-gray-600">Loading status...</p>
        )}
      </div>
    </div>
  );
}