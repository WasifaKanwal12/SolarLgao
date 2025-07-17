// src/app/customer/chat/[chatId]/page.js (Conceptual Refactor)
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth } from "@/lib/config";
import { onAuthStateChanged } from "firebase/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatInterface from "@/components/chatInterface"; // Import the reusable component

export default function CustomerChatPage() {
  const { chatId } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chat, setChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState(null);

  const customerNavItems = [
    { name: "Home", href: "/customer" },
    { name: "My Quotes", href: "/customer/quotes" },
    { name: "My Orders", href: "/customer/orders" },
    { name: "Request Quote", href: "/customer/request-quote" },
  ];

  // Memoize fetchChat to prevent unnecessary re-creation
  const fetchChat = useCallback(async (id, currentUserId) => {
    if (!id || !currentUserId) {
        setLoading(false);
        setError("Chat ID or User ID is missing.");
        return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/chats/${id}`);
      if (!res.ok) throw new Error("Failed to fetch chat data.");
      const data = await res.json();

      if (!data.chat.participantIds.includes(currentUserId)) {
        router.push("/unauthorized");
        return;
      }

      // Fetch other participant's name (provider's company name or customer's name)
      const otherParticipantId = data.chat.participantIds.find(pId => pId !== currentUserId);
      let otherParticipantName = "Unknown Provider"; // Default for customer view
      if (otherParticipantId) {
        try {
          const providerRes = await fetch(`/api/providers/${otherParticipantId}`);
          if (providerRes.ok) {
            const providerData = await providerRes.json();
            otherParticipantName = providerData.provider?.companyName || 'Unknown Provider';
          }
        } catch (e) {
          console.error("Error fetching other participant name (provider):", e);
          // Fallback to user if provider not found
          try {
            const userRes = await fetch(`/api/users/${otherParticipantId}`);
            if (userRes.ok) {
              const userData = await userRes.json();
              otherParticipantName = userData.user?.firstName + ' ' + userData.user?.lastName || 'Unknown User';
            }
          } catch (e2) {
            console.error("Error fetching other participant name (user fallback):", e2);
          }
        }
      }

      setChat({ ...data.chat, otherParticipantName });
      setError(null);
    } catch (err) {
      console.error("Error fetching chat data:", err);
      setError("Failed to load chat. " + err.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/signin");
        return;
      }
      setUser(currentUser);
      fetchChat(chatId, currentUser.uid);
    });

    return () => unsubscribe();
  }, [router, chatId, fetchChat]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !chat) return;

    const tempMessage = {
      senderId: user.uid,
      text: newMessage,
      type: 'text',
      timestamp: new Date().toISOString(),
    };
    setChat(prevChat => ({
      ...prevChat,
      messages: [...(prevChat.messages || []), tempMessage],
    }));
    setNewMessage("");

    try {
      const res = await fetch(`/api/chats/${chatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newMessage: { senderId: user.uid, text: tempMessage.text, type: tempMessage.type },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to send message.');
      }
      await fetchChat(chatId, user.uid);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message: " + err.message);
      setChat(prevChat => ({
        ...prevChat,
        messages: prevChat.messages.filter(msg => msg !== tempMessage),
      }));
    }
  };

  const handleOfferAction = async (offerDetails, actionType) => {
    if (actionType === 'accept') {
      if (!confirm("Are you sure you want to accept this offer? This will create an order.")) return;

      try {
        const providerId = chat.participantIds.find(pId => pId !== user.uid);
        const createOrderRes = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId: user.uid,
            providerId: providerId,
            serviceId: chat.quoteId, // Assuming quoteId is relevant
            quoteId: chat.quoteId,
            customOfferDetails: offerDetails,
            status: 'pending_acceptance',
          }),
        });

        if (!createOrderRes.ok) {
          const errorData = await createOrderRes.json();
          throw new Error(errorData.error || 'Failed to create order.');
        }

        const orderResult = await createOrderRes.json();
        const orderId = orderResult.orderId;

        // Update chat to link to the new order and update offer status
        const updateChatRes = await fetch(`/api/chats/${chatId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderId,
            newMessage: {
              senderId: user.uid,
              text: `I have accepted your offer! New order ID: ${orderId}`,
              type: 'text'
            },
            updateOfferStatus: {
              offerSenderId: offerDetails.senderId,
              offerTimestamp: offerDetails.timestamp,
              status: 'accepted'
            }
          }),
        });

        if (!updateChatRes.ok) {
          const errorData = await updateChatRes.json();
          throw new Error(errorData.error || 'Failed to update chat with order ID and message.');
        }

        alert("Offer accepted! An order has been created. You can now track it in My Orders.");
        router.push(`/customer/orders/${orderId}`);
      } catch (err) {
        console.error("Error accepting offer:", err);
        setError("Failed to accept offer: " + err.message);
      }
    } else if (actionType === 'decline') {
        if (!confirm("Are you sure you want to decline this offer?")) return;
        try {
            const updateChatRes = await fetch(`/api/chats/${chatId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    newMessage: {
                        senderId: user.uid,
                        text: `I have declined your offer.`,
                        type: 'text'
                    },
                    updateOfferStatus: {
                        offerSenderId: offerDetails.senderId,
                        offerTimestamp: offerDetails.timestamp,
                        status: 'declined'
                    }
                }),
            });

            if (!updateChatRes.ok) {
                const errorData = await updateChatRes.json();
                throw new Error(errorData.error || 'Failed to decline offer and update chat.');
            }
            alert("Offer declined.");
            await fetchChat(chatId, user.uid); // Re-fetch to update UI
        } catch (err) {
            console.error("Error declining offer:", err);
            setError("Failed to decline offer: " + err.message);
        }
    }
  };


  return (
    <div className="flex flex-col min-h-screen">
      <Header navItems={customerNavItems} userType="customer" />
      <main className="flex-1 pt-16 bg-gray-50 flex flex-col py-6">
        <ChatInterface
          user={user}
          chat={chat}
          loading={loading}
          error={error}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleSendMessage={handleSendMessage}
          handleOfferAction={handleOfferAction} // Pass the customer's specific offer handler
          userType="customer" // Indicate this is for the customer
          // No additionalChatActions for customer in this scenario
        />
      </main>
      <Footer />
    </div>
  );
}