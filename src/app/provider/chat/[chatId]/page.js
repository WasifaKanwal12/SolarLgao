// src/app/provider/chat/[chatId]/page.js
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth } from "@/lib/config";
import { onAuthStateChanged } from "firebase/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function ProviderChatPage() {
  const { chatId } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chat, setChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Offer modal state
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerDetails, setOfferDetails] = useState({
    amount: '',
    description: '',
    expiryDate: '',
  });
  const [offerError, setOfferError] = useState(null);

  // Nav items for the header (you'd ideally use a layout for the sidebar/header and pass current user type)
  const providerNavItems = [
    { name: 'Dashboard', href: '/provider' },
    { name: 'My Services', href: '/provider/services' },
    { name: 'Quotes', href: '/provider/quotes' },
    { name: 'Orders', href: '/provider/orders' },
    { name: 'Chat', href: '/provider/chat' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/signin");
        return;
      }
      setUser(currentUser);
      if (chatId) {
        await fetchChat(chatId, currentUser.uid);
      } else {
        setLoading(false);
      }
    });
    // In a real app, implement client-side Firestore onSnapshot for real-time updates.
    return () => unsubscribe();
  }, [router, chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const fetchChat = async (id, currentUserId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/chats/${id}`);
      if (!res.ok) throw new Error("Failed to fetch chat data.");
      const data = await res.json();

      // Ensure the logged-in user is a participant of this chat
      if (!data.chat.participantIds.includes(currentUserId)) {
        router.push("/unauthorized");
        return;
      }

      // Fetch other participant's name (customer's name)
      const otherParticipantId = data.chat.participantIds.find(pId => pId !== currentUserId);
      let otherParticipantName = "Unknown Customer";
      try {
        const userRes = await fetch(`/api/users/${otherParticipantId}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          otherParticipantName = userData.user?.firstName + ' ' + userData.user?.lastName || 'Unknown Customer';
        }
      } catch (e) {
        console.error("Error fetching other participant name:", e);
      }

      setChat({ ...data.chat, otherParticipantName });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching chat data:", err);
      setError("Failed to load chat. " + err.message);
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !chat) return;

    const messagePayload = {
      newMessage: {
        senderId: user.uid,
        text: newMessage,
        type: 'text',
      },
    };

    try {
      const res = await fetch(`/api/chats/${chatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messagePayload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to send message.');
      }
      setNewMessage("");
      await fetchChat(chatId, user.uid); // Re-fetch chat to update messages
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message: " + err.message);
    }
  };

  const handleSendOffer = async (e) => {
    e.preventDefault();
    setOfferError(null);

    if (!offerDetails.amount || !offerDetails.description) {
      setOfferError("Amount and description are required for the offer.");
      return;
    }
    if (isNaN(parseFloat(offerDetails.amount)) || parseFloat(offerDetails.amount) <= 0) {
      setOfferError("Please enter a valid amount.");
      return;
    }

    const offerPayload = {
      newMessage: {
        senderId: user.uid,
        type: 'offer',
        amount: parseFloat(offerDetails.amount),
        description: offerDetails.description,
        expiryDate: offerDetails.expiryDate ? new Date(offerDetails.expiryDate) : null,
      },
    };

    try {
      const res = await fetch(`/api/chats/${chatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerPayload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to send offer.');
      }
      alert("Offer sent successfully!");
      setShowOfferModal(false);
      setOfferDetails({ amount: '', description: '', expiryDate: '' });
      await fetchChat(chatId, user.uid); // Re-fetch chat to update messages
    } catch (err) {
      console.error("Error sending offer:", err);
      setOfferError(err.message);
    }
  };

  const hasSentOffer = chat?.messages?.some(msg => msg.type === 'offer' && msg.senderId === user.uid);
  const isOrderCreated = chat?.orderId !== null;

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
        <Link href="/provider/quotes" className="btn-primary mt-4">Back to Quotes</Link>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex-1 p-8 text-center text-gray-700 bg-gray-100">
        <p>Chat not found or you do not have permission to view it.</p>
        <Link href="/provider/quotes" className="btn-primary mt-4">Back to Quotes</Link>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 bg-gray-100 flex flex-col">
      <div className="flex-grow container mx-auto p-6 flex flex-col bg-white rounded-lg shadow-md max-w-4xl h-full">
        <div className="border-b pb-4 mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">
            Chat with {chat.otherParticipantName}
          </h1>
          {chat.quoteId && (
            <p className="text-sm text-gray-500 mt-1">
              For Quote: <Link href={`/provider/quotes?quoteId=${chat.quoteId}`} className="text-blue-600 hover:underline">
                View Quote Details
              </Link>
            </p>
          )}
          {chat.orderId && (
            <p className="text-sm text-gray-500 mt-1">
              Associated Order: <Link href={`/provider/orders/${chat.orderId}`} className="text-blue-600 hover:underline">
                View Order Details
              </Link>
            </p>
          )}
        </div>

        <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
          {chat.messages && chat.messages.map((msg, index) => (
            <div
              key={index}
              className={`flex mb-4 ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}
            >
              {msg.type === 'text' && (
                  <div
                    className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                      msg.senderId === user.uid
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p className="text-xs opacity-75 mt-1">
                      {msg.timestamp ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString() : ''}
                    </p>
                  </div>
              )}
              {msg.type === 'offer' && (
                  <div
                      className={`max-w-[70%] p-4 rounded-lg shadow-md border ${
                        msg.senderId === user.uid
                          ? 'bg-green-100 border-green-300 text-green-800 rounded-br-none'
                          : 'bg-purple-100 border-purple-300 text-purple-800 rounded-bl-none'
                      }`}
                  >
                      <p className="font-bold mb-2">Custom Offer:</p>
                      <p className="text-lg font-semibold">Amount: ${msg.amount?.toFixed(2)}</p>
                      <p className="text-sm mt-1">{msg.description}</p>
                      {msg.expiryDate && <p className="text-xs text-gray-600 mt-1">Expires: {new Date(msg.expiryDate.seconds * 1000).toLocaleDateString()}</p>}
                      {msg.status === 'accepted' && <p className="text-sm font-bold text-green-600 mt-2">Accepted by Customer!</p>}
                      {msg.status === 'declined' && <p className="text-sm font-bold text-red-600 mt-2">Declined by Customer.</p>}
                      <p className="text-xs opacity-75 mt-2 text-right">
                        {msg.timestamp ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString() : ''}
                      </p>
                  </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="mt-4 flex gap-2 border-t pt-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-3 rounded-md hover:bg-blue-700 transition-colors"
            disabled={!newMessage.trim()}
          >
            Send
          </button>
          {!isOrderCreated && ( // Only allow sending offer if no order is created yet
            <button
              type="button"
              onClick={() => setShowOfferModal(true)}
              className="bg-green-600 text-white px-5 py-3 rounded-md hover:bg-green-700 transition-colors"
            >
              Send Custom Offer
            </button>
          )}
        </form>

        {/* Offer Modal */}
        {showOfferModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Custom Offer</h2>
              {offerError && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md">{offerError}</div>}
              <form onSubmit={handleSendOffer} className="space-y-4">
                <div>
                  <label htmlFor="offerAmount" className="block text-sm font-medium text-gray-700">Amount ($)</label>
                  <input
                    type="number"
                    id="offerAmount"
                    name="amount"
                    value={offerDetails.amount}
                    onChange={(e) => setOfferDetails({ ...offerDetails, amount: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="offerDescription" className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    id="offerDescription"
                    name="description"
                    value={offerDetails.description}
                    onChange={(e) => setOfferDetails({ ...offerDetails, description: e.target.value })}
                    rows="3"
                    placeholder="Details about the offer, scope of work, etc."
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="offerExpiry" className="block text-sm font-medium text-gray-700">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    id="offerExpiry"
                    name="expiryDate"
                    value={offerDetails.expiryDate}
                    onChange={(e) => setOfferDetails({ ...offerDetails, expiryDate: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowOfferModal(false)}
                    className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Send Offer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}