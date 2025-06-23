// src/app/customer/chat/[chatId]/page.js
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth } from "@/lib/config";
import { onAuthStateChanged } from "firebase/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function CustomerChatPage() {
  const { chatId } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chat, setChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const customerNavItems = [
    { name: "Home", href: "/customer" },
    { name: "My Quotes", href: "/customer/quotes" },
    { name: "My Orders", href: "/customer/orders" },
    { name: "Request Quote", href: "/customer/request-quote" },
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

    // Implement real-time listener for chat messages if using Firestore client SDK
    // For this example, we're using REST API for simplicity, so fetch periodically or on action.
    // If you integrate client-side Firestore:
    /*
    const chatDocRef = doc(db, "chats", chatId);
    const unsubscribeChat = onSnapshot(chatDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const chatData = docSnap.data();
        if (!chatData.participantIds.includes(user.uid)) { // Ensure user is a participant
          router.push("/unauthorized");
          return;
        }
        setChat({ id: docSnap.id, ...chatData });
        scrollToBottom();
      } else {
        setError("Chat not found.");
      }
      setLoading(false);
    }, (err) => {
      console.error("Error listening to chat:", err);
      setError("Failed to load chat in real-time.");
      setLoading(false);
    });
    return () => { unsubscribe(); unsubscribeChat(); };
    */
    return () => unsubscribe();
  }, [router, chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [chat]); // Scroll to bottom when chat messages update

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

      // Fetch other participant's name (provider's company name or customer's name)
      const otherParticipantId = data.chat.participantIds.find(pId => pId !== currentUserId);
      let otherParticipantName = "Unknown";
      try {
        const userRes = await fetch(`/api/users/${otherParticipantId}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          otherParticipantName = userData.user?.firstName + ' ' + userData.user?.lastName || 'Unknown User';
        } else {
          const providerRes = await fetch(`/api/providers/${otherParticipantId}`);
          if (providerRes.ok) {
            const providerData = await providerRes.json();
            otherParticipantName = providerData.provider?.companyName || 'Unknown Provider';
          }
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

  const handleAcceptOffer = async (offerDetails) => {
    if (!confirm("Are you sure you want to accept this offer? This will create an order.")) return;

    try {
        const createOrderRes = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerId: user.uid,
                providerId: chat.participantIds.find(pId => pId !== user.uid),
                serviceId: chat.quoteId, // Assuming quoteId is available in chat
                quoteId: chat.quoteId, // Link to the original quote
                customOfferDetails: offerDetails,
                status: 'pending_acceptance', // Initial status for customer to confirm again if needed before payment
            }),
        });

        if (!createOrderRes.ok) {
            const errorData = await createOrderRes.json();
            throw new Error(errorData.error || 'Failed to create order.');
        }

        const orderResult = await createOrderRes.json();
        const orderId = orderResult.orderId;

        // Update chat to link to the new order
        await fetch(`/api/chats/${chatId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orderId: orderId,
                newMessage: {
                    senderId: user.uid,
                    text: "I have accepted your offer!",
                    type: 'text'
                }
            }),
        });

        alert("Offer accepted! An order has been created. You can now track it in My Orders.");
        router.push(`/customer/orders`);
    } catch (err) {
        console.error("Error accepting offer:", err);
        setError("Failed to accept offer: " + err.message);
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
          <Link href="/customer/quotes" className="btn-primary mt-4">Back to Quotes</Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header navItems={customerNavItems} userType="customer" />
        <main className="flex-1 pt-16 bg-gray-50 p-8 text-center text-gray-700">
          <p>Chat not found or you do not have permission to view it.</p>
          <Link href="/customer/quotes" className="btn-primary mt-4">Back to Quotes</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header navItems={customerNavItems} userType="customer" />
      <main className="flex-1 pt-16 bg-gray-50 flex flex-col">
        <div className="flex-grow container mx-auto p-6 flex flex-col bg-white rounded-lg shadow-md max-w-4xl h-full">
          <div className="border-b pb-4 mb-4">
            <h1 className="text-2xl font-semibold text-gray-800">
              Chat with {chat.otherParticipantName}
            </h1>
            {chat.orderId && (
                <p className="text-sm text-gray-500 mt-1">
                    <Link href={`/customer/orders/${chat.orderId}`} className="text-blue-600 hover:underline">
                        View associated order
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
                        {new Date(msg.timestamp.seconds * 1000).toLocaleTimeString()}
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
                        <p className="font-bold mb-2">Custom Offer from {chat.otherParticipantName}:</p>
                        <p className="text-lg font-semibold">Amount: ${msg.amount?.toFixed(2)}</p>
                        <p className="text-sm mt-1">{msg.description}</p>
                        {msg.expiryDate && <p className="text-xs text-gray-600 mt-1">Expires: {new Date(msg.expiryDate.seconds * 1000).toLocaleDateString()}</p>}

                        {msg.senderId !== user.uid && chat.orderId === null && ( // Only show accept for recipient if no order yet
                            <div className="mt-3 flex space-x-2">
                                <button
                                    onClick={() => handleAcceptOffer(msg)}
                                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors"
                                >
                                    Accept Offer
                                </button>
                                {/* Add decline button if needed */}
                            </div>
                        )}
                        <p className="text-xs opacity-75 mt-2 text-right">
                          {new Date(msg.timestamp.seconds * 1000).toLocaleTimeString()}
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
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}