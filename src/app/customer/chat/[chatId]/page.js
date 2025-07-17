// src/app/customer/chat/[chatId]/page.js
"use client";

import { useEffect, useState, useRef, useCallback } from "react"; // Add useCallback
import { useParams, useRouter } from "next/navigation";
import { auth } from "@/lib/config";
import { onAuthStateChanged } from "firebase/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

// --- Loader Component (can be shared) ---
const Loader = () => (
  <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
    <p className="ml-3 mt-3 text-lg text-gray-700">Loading chat...</p>
  </div>
);

// --- Skeleton Loader for a Chat Message ---
const MessageSkeleton = ({ isUser }) => (
  <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`max-w-[70%] p-3 rounded-lg shadow-sm animate-pulse ${
        isUser ? 'bg-blue-100 rounded-br-none' : 'bg-gray-200 rounded-bl-none'
      }`}
    >
      <div className="h-4 bg-gray-300 rounded w-full mb-1"></div>
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="h-3 bg-gray-300 rounded w-1/4 mt-1"></div>
    </div>
  </div>
);

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

  // Helper to format date for display (e.g., "July 14, 2025")
  const formatDateForDisplay = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Helper to format time for display (e.g., "10:02 PM")
  const formatTimeForDisplay = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Memoize fetchChat to prevent unnecessary re-creation
  const fetchChat = useCallback(async (id, currentUserId) => {
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

      // OPTIMIZATION: Fetch other participant's name efficiently
      const otherParticipantId = data.chat.participantIds.find(pId => pId !== currentUserId);
      let otherParticipantName = "Unknown";

      if (otherParticipantId) {
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
      }

      setChat({ ...data.chat, otherParticipantName });
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error("Error fetching chat data:", err);
      setError("Failed to load chat. " + err.message);
    } finally {
      setLoading(false);
    }
  }, [router]); // router is a dependency as it's used inside useCallback

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
        setLoading(false); // No chatId, stop loading
        setError("Chat ID is missing.");
      }
    });

    return () => unsubscribe();
  }, [router, chatId, fetchChat]); // Add fetchChat to dependencies

  useEffect(() => {
    // Only scroll to bottom if chat data has loaded and messages exist
    if (chat && chat.messages && messagesEndRef.current) {
      scrollToBottom();
    }
  }, [chat]); // Scroll to bottom when chat messages update

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !chat) return;

    // Client-side message object (without actual timestamp until sent)
    const tempMessage = {
      senderId: user.uid,
      text: newMessage,
      type: 'text',
      timestamp: new Date().toISOString(), // Use ISO string for client-side temp display
    };

    // Optimistic UI update: Add the message to chat immediately
    setChat(prevChat => ({
      ...prevChat,
      messages: [...(prevChat.messages || []), tempMessage],
    }));
    setNewMessage(""); // Clear input field immediately
    // Scroll to bottom for the new message
    setTimeout(scrollToBottom, 0);

    try {
      const res = await fetch(`/api/chats/${chatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newMessage: { // Send only necessary message fields
            senderId: user.uid,
            text: tempMessage.text,
            type: tempMessage.type,
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to send message.');
      }
      // Re-fetch chat to get the server-side timestamp and ensure consistency
      await fetchChat(chatId, user.uid);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message: " + err.message);
      // Revert optimistic update or show error state for the specific message
      setChat(prevChat => ({
        ...prevChat,
        messages: prevChat.messages.filter(msg => msg !== tempMessage), // Remove the temp message
      }));
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
          // Assuming serviceId is available in chat or from the offer.
          // If quoteId represents the service, use it here. Adjust as per your schema.
          serviceId: chat.quoteId,
          quoteId: chat.quoteId, // Link to the original quote
          customOfferDetails: offerDetails, // Pass the entire offer details
          status: 'pending_acceptance',
        }),
      });

      if (!createOrderRes.ok) {
        const errorData = await createOrderRes.json();
        throw new Error(errorData.error || 'Failed to create order.');
      }

      const orderResult = await createOrderRes.json();
      const orderId = orderResult.orderId;

      // Update chat to link to the new order and add a message
      const updateChatRes = await fetch(`/api/chats/${chatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId, // Link the order ID to the chat
          newMessage: {
            senderId: user.uid,
            text: `I have accepted your offer! New order ID: ${orderId}`,
            type: 'text'
          },
          updateOfferStatus: {
            offerSenderId: offerDetails.senderId,
            offerTimestamp: offerDetails.timestamp, // Use the ISO string timestamp from the message
            status: 'accepted'
          }
        }),
      });

      if (!updateChatRes.ok) {
        const errorData = await updateChatRes.json();
        throw new Error(errorData.error || 'Failed to update chat with order ID and message.');
      }

      alert("Offer accepted! An order has been created. You can now track it in My Orders.");
      router.push(`/customer/orders/${orderId}`); // Redirect to the new order page
    } catch (err) {
      console.error("Error accepting offer:", err);
      setError("Failed to accept offer: " + err.message);
    }
  };

  // Function to determine if a date separator should be shown
  const shouldShowDateSeparator = (currentMessage, previousMessage) => {
    if (!previousMessage) return true; // Show for the very first message

    const currentMsgDate = new Date(currentMessage.timestamp);
    const prevMsgDate = new Date(previousMessage.timestamp);

    // Compare only the date part (year, month, day)
    return currentMsgDate.toDateString() !== prevMsgDate.toDateString();
  };


  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header navItems={customerNavItems} userType="customer" />
        <main className="flex-1 pt-16 bg-gray-50 flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
          <Loader />
          {/* Skeleton for chat content */}
          <div className="container mx-auto p-6 flex flex-col bg-white rounded-lg shadow-md max-w-4xl h-full mt-4 w-full">
            <div className="border-b pb-4 mb-4">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            </div>
            <div className="flex-grow overflow-hidden pr-2 space-y-4">
              {[...Array(5)].map((_, i) => (
                <MessageSkeleton key={i} isUser={i % 2 === 0} />
              ))}
            </div>
            <div className="mt-4 flex gap-2 border-t pt-4">
              <div className="flex-grow h-12 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="w-24 h-12 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
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
            if (user && chatId) {
              fetchChat(chatId, user.uid);
            } else {
              router.push("/customer/quotes"); // Fallback if no user or chat ID
            }
          }} className="btn-primary mt-4">
            Retry
          </button>
          <Link href="/customer/quotes" className="btn-secondary mt-3">Back to Quotes</Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header navItems={customerNavItems} userType="customer" />
        <main className="flex-1 pt-16 bg-gray-50 p-8 text-center text-gray-700 flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
          <p className="text-lg mb-4">Chat not found or you do not have permission to view it.</p>
          <Link href="/customer/quotes" className="btn-primary mt-4">Back to Quotes</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header navItems={customerNavItems} userType="customer" />
      <main className="flex-1 pt-16 bg-gray-50 flex flex-col py-6"> {/* Add vertical padding to main */}
        <div className="flex-grow container mx-auto flex flex-col bg-white rounded-lg shadow-lg max-w-4xl h-[calc(100vh-200px)] lg:h-[calc(100vh-180px)]"> {/* Adjusted height */}
          <div className="border-b pb-4 pt-4 px-6"> {/* Added padding */}
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
            {chat.quoteId && !chat.orderId && ( // Show associated quote if no order yet
                <p className="text-sm text-gray-500 mt-1">
                    <Link href={`/customer/quotes/${chat.quoteId}`} className="text-blue-600 hover:underline">
                        View associated quote
                    </Link>
                </p>
            )}
          </div>

          <div className="flex-grow overflow-y-auto px-6 py-4 custom-scrollbar"> {/* Added padding */}
            {chat.messages && chat.messages.map((msg, index) => {
              const previousMessage = chat.messages[index - 1];
              const showDateSeparator = shouldShowDateSeparator(msg, previousMessage);

              return (
                <div key={index}>
                  {showDateSeparator && (
                    <div className="text-center my-4">
                      <span className="inline-block bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full">
                        {formatDateForDisplay(msg.timestamp)}
                      </span>
                    </div>
                  )}
                  <div
                    className={`flex mb-3 ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.type === 'text' && (
                      <div
                        className={`max-w-[75%] p-3 rounded-xl shadow-sm break-words ${
                          msg.senderId === user.uid
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-gray-200 text-gray-800 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p className="text-xs text-right mt-1 opacity-75">
                          {formatTimeForDisplay(msg.timestamp)}
                        </p>
                      </div>
                    )}
                    {msg.type === 'offer' && (
                      <div
                        className={`max-w-[75%] p-4 rounded-xl shadow-md border ${
                          msg.senderId === user.uid
                            ? 'bg-green-100 border-green-300 text-green-800 rounded-br-none'
                            : 'bg-purple-100 border-purple-300 text-purple-800 rounded-bl-none'
                        } ${msg.status === 'accepted' ? 'opacity-70 border-green-500' : ''} ${msg.status === 'declined' ? 'opacity-70 border-red-500' : ''}`}
                      >
                        <p className="font-bold mb-2 text-md">Custom Offer from {chat.otherParticipantName}:</p>
                        <p className="text-lg font-bold">Amount: ${msg.amount?.toFixed(2)}</p>
                        <p className="text-sm mt-1">{msg.description}</p>
                        {msg.expiryDate && <p className="text-xs text-gray-600 mt-1">Expires: {formatDateForDisplay(msg.expiryDate)}</p>}

                        {/* Offer status display */}
                        {msg.status && msg.status !== 'pending' && (
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-2 ${
                            msg.status === 'accepted' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                          }`}>
                            Status: {msg.status.replace(/_/g, ' ')}
                          </span>
                        )}

                        {msg.senderId !== user.uid && chat.orderId === null && msg.status === 'pending' && ( // Only show accept for recipient if no order yet and offer is pending
                          <div className="mt-3 flex space-x-2">
                            <button
                              onClick={() => handleAcceptOffer(msg)}
                              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors"
                            >
                              Accept Offer
                            </button>
                            {/* Add decline button if needed, which would update offer status to 'declined' */}
                          </div>
                        )}
                        <p className="text-xs text-right mt-2 opacity-75">
                          {formatTimeForDisplay(msg.timestamp)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="mt-4 flex gap-2 border-t pt-4 px-6 pb-4"> {/* Added padding */}
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow border border-gray-300 rounded-full py-2 px-4 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
              style={{ minHeight: '44px' }} // Ensure consistent height
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center text-lg font-semibold"
              disabled={!newMessage.trim()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.542 60.542 0 0 0 18.445-8.916.75.75 0 0 0 0-1.218A60.542 60.542 0 0 0 3.478 2.405Z" />
              </svg>
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}