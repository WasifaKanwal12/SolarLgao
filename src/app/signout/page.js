"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SignOut() {
  const router = useRouter();
  const [message, setMessage] = useState("Signing out...");

  useEffect(() => {
    const performSignOut = async () => {
      try {
        const response = await fetch('/api/auth/sessionLogout', {
          method: 'POST',
        });

        if (response.ok) {
          setMessage("You have been signed out successfully.");
          router.push('/signin'); // Redirect to login page after successful logout
        } else {
          const data = await response.json();
          setMessage(data.message || "Failed to sign out. Please try again.");
          // Still redirect to signin even if logout failed on server (e.g., cookie already gone)
          router.push('/signin');
        }
      } catch (error) {
        console.error("Signout error:", error);
        setMessage("An error occurred during sign out. Please try again.");
        router.push('/signin');
      }
    };

    performSignOut();
  }, [router]);

  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Signing Out</h2>
          <p className="text-gray-700">{message}</p>
        </div>
      </main>
      <Footer />
    </>
  );
}