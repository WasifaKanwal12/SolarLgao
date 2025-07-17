// src/app/provider/chat/page.js
"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/config"; // Assuming this gives you Firebase client-side auth
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProviderChatListPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/signin");
        return;
      }
      setUser(currentUser);
      await fetchChats(currentUser.uid); // Fetch chats using the API route
    });

    return () => unsubscribe();
  }, [router]);

  const fetchChats = async (userId) => {
    try {
      setLoading(true);
      // Call your new API route that handles fetching lists of chats
      const res = await fetch(`/api/chats?participantId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch chats.");
      const data = await res.json();

      // For each chat, fetch the name of the other participant
      const chatsWithDetails = await Promise.all(
        data.chats.map(async (chat) => {
          const otherParticipantId = chat.participantIds.find(
            (pId) => pId !== userId
          );
          let otherParticipantName = "Unknown User";

          if (otherParticipantId) {
            try {
              // Assuming you have an API route like /api/users/[userId] to get user data
              const userRes = await fetch(`/api/users/${otherParticipantId}`);
              if (userRes.ok) {
                const userData = await userRes.json();
                otherParticipantName =
                  userData.user?.firstName + " " + userData.user?.lastName ||
                  "Unknown User";
              }
            } catch (e) {
              console.error("Error fetching other participant name:", e);
            }
          }
          return { ...chat, otherParticipantName };
        })
      );
      setChats(chatsWithDetails);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching chats:", err);
      setError("Failed to load your conversations. Please try again.");
      setLoading(false);
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
        <button
          onClick={() => window.location.reload()}
          className="btn-primary mt-4"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 bg-gray-100">
      <h1 className="text-3xl font-semibold text-gray-800 mb-8 text-center">
        Your Conversations
      </h1>

      {chats.length === 0 ? (
        <div className="p-8 text-center text-gray-700 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-lg mb-4">You don't have any active chats yet.</p>
          <p className="text-gray-500">
            Initiate a chat from an incoming quote!
          </p>
          <Link
            href="/provider/quotes"
            className="text-blue-600 hover:underline mt-4 block"
          >
            View incoming quotes
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {chats.map((chat) => (
            <Link
              key={chat.id}
              href={`/provider/chat/${chat.id}`}
              className="block"
            >
              <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow duration-200">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Chat with {chat.otherParticipantName}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {chat.lastMessage?.timestamp
                      ? new Date(chat.lastMessage.timestamp).toLocaleDateString()
                      : chat.updatedAt ? new Date(chat.updatedAt).toLocaleDateString() : ''}
                  </span>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {chat.lastMessage?.text || "No messages yet."}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}