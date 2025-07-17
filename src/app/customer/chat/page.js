// src/app/customer/chats/page.js
"use client";

import { useEffect, useState, useCallback } from "react"; // Add useCallback
import { useRouter } from "next/navigation";
import { auth } from "@/lib/config";
import { onAuthStateChanged } from "firebase/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

// --- Loader Component (can be a shared component) ---
const Loader = () => (
  <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
    <p className="ml-3 mt-3 text-lg text-gray-700">Loading your chats...</p>
  </div>
);

// --- Skeleton Loader for a Chat Item ---
const ChatCardSkeleton = () => (
  <div className="block bg-white hover:bg-gray-100 p-4 rounded-lg border border-gray-200 transition-colors animate-pulse">
    <div className="flex justify-between items-center mb-2">
      <div className="h-6 bg-gray-200 rounded w-2/3"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
    </div>
    <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
  </div>
);


export default function CustomerChatsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();

  const customerNavItems = [
    { name: "Home", href: "/customer" },
    { name: "My Quotes", href: "/customer/quotes" },
    { name: "My Orders", href: "/customer/orders" },
    { name: "Request Quote", href: "/customer/request-quote" },
  ];

  // Memoize fetchChats to prevent unnecessary re-creation
  const fetchChats = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/chats?participantId=${userId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch chats.");
      }
      const data = await res.json();

      // Collect all unique participant IDs (excluding the current user's ID)
      const otherParticipantIds = new Set();
      data.chats.forEach(chat => {
        chat.participantIds.forEach(pId => {
          if (pId !== userId) {
            otherParticipantIds.add(pId);
          }
        });
      });

      // Fetch all unique participant names in parallel
      const participantNamePromises = Array.from(otherParticipantIds).map(async (pId) => {
        try {
          // First try to fetch as a user
          const userRes = await fetch(`/api/users/${pId}`);
          if (userRes.ok) {
            const userData = await userRes.json();
            return {
              id: pId,
              name: userData.user?.firstName + " " + userData.user?.lastName || "Unknown User",
            };
          }

          // If not a user, try to fetch as a provider
          const providerRes = await fetch(`/api/providers/${pId}`);
          if (providerRes.ok) {
            const providerData = await providerRes.json();
            return {
              id: pId,
              name: providerData.provider?.companyName || "Unknown Provider",
            };
          }
          // If neither, return unknown
          return { id: pId, name: "Unknown" };
        } catch (e) {
          console.error(`Error fetching participant ${pId}:`, e);
          return { id: pId, name: "Unknown" };
        }
      });

      const participantNames = await Promise.all(participantNamePromises);
      const participantNameMap = new Map(participantNames.map(p => [p.id, p.name]));

      // Enrich chats with participant names
      const chatsWithNames = data.chats.map(chat => {
        const otherParticipantId = chat.participantIds.find(pId => pId !== userId);
        const otherParticipantName = participantNameMap.get(otherParticipantId) || 'Unknown';
        return { ...chat, otherParticipantName };
      });

      setChats(chatsWithNames);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching chats:", err);
      setError("Failed to load chats: " + err.message);
      setLoading(false);
    }
  }, []); // Empty dependency array because userId is passed as an argument

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/signin");
        return;
      }
      setUser(currentUser);
      // Fetch chats only after user is authenticated
      fetchChats(currentUser.uid);
    });

    return () => unsubscribe();
  }, [router, fetchChats]); // Add fetchChats to dependencies of useEffect

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header navItems={customerNavItems} userType="customer" />
        <main className="flex-1 pt-16 bg-gray-50 flex flex-col justify-center items-center min-h-[calc(100vh-120px)]"> {/* Adjusted min-h */}
          <Loader />
          {/* Show skeleton cards below the main loader */}
          <div className="container mx-auto p-6 md:p-8 space-y-6 w-full max-w-4xl">
            {[...Array(3)].map((_, i) => <ChatCardSkeleton key={i} />)} {/* Show a few skeletons */}
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
                fetchChats(user.uid);
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
          <h1 className="text-3xl font-semibold text-gray-800 mb-8 text-center">My Chats</h1>

          {chats.length === 0 ? (
            <div className="p-8 text-center text-gray-700 border-2 border-dashed border-gray-300 rounded-lg max-w-md mx-auto">
              <p className="text-lg mb-4">
                You don't have any active chats yet.{" "}
                <Link href="/customer/request-quote" className="text-blue-600 hover:underline text-base font-medium">
                  Request a quote
                </Link>{" "}
                to start a conversation!
              </p>
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto">
              {chats.map((chat) => (
                <Link
                  key={chat.id}
                  href={`/customer/chat/${chat.id}`}
                  className="block bg-white hover:bg-gray-100 p-4 rounded-lg border border-gray-200 transition-colors"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Chat with {chat.otherParticipantName}
                    </h2>
                    {chat.lastMessage && chat.lastMessage.timestamp && (
                      <span className="text-sm text-gray-500">
                        {new Date(chat.lastMessage.timestamp).toLocaleString()}
                      </span>
                    )}
                  </div>
                  {chat.lastMessage && chat.lastMessage.text && (
                    <p className="text-gray-600 text-base"> {/* Added text-base for better readability */}
                      <span className="font-medium">
                        {chat.lastMessage.senderId === user?.uid ? "You" : chat.otherParticipantName}:{" "}
                      </span>
                      {chat.lastMessage.text}
                    </p>
                  )}
                  {chat.quoteId && (
                    <p className="text-sm text-gray-500 mt-2"> {/* Increased mt for better spacing */}
                      Associated with Quote ID: <span className="font-medium">{chat.quoteId}</span>
                    </p>
                  )}
                  {chat.orderId && (
                    <p className="text-sm text-blue-600 mt-1">
                      Associated with Order ID: <span className="font-medium">{chat.orderId}</span>
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}