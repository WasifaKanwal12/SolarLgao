// src/components/ChatInterface.js
import React, { useRef, useEffect } from 'react';
import Link from 'next/link';

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

export default function ChatInterface({
  user,
  chat,
  loading,
  error,
  newMessage,
  setNewMessage,
  handleSendMessage,
  additionalChatActions, // For buttons like "Send Custom Offer"
  handleOfferAction, // For handling offer specific actions (accept/decline)
  userType // 'customer' or 'provider' to differentiate links/offer buttons
}) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Helper to format date for display (e.g., "July 14, 2025")
  const formatDateForDisplay = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    // Use the user's local timezone for display
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Helper to format time for display (e.g., "10:02 PM")
  const formatTimeForDisplay = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    // Use the user's local timezone for display
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Function to determine if a date separator should be shown
  const shouldShowDateSeparator = (currentMessage, previousMessage) => {
    if (!previousMessage) return true; // Show for the very first message

    const currentMsgDate = new Date(currentMessage.timestamp);
    const prevMsgDate = new Date(previousMessage.timestamp);

    // Compare only the date part (year, month, day)
    return currentMsgDate.toDateString() !== prevMsgDate.toDateString();
  };

  useEffect(() => {
    // Only scroll to bottom if chat data has loaded and messages exist
    if (chat && chat.messages && messagesEndRef.current) {
      scrollToBottom();
    }
  }, [chat?.messages]); // Scroll to bottom when chat messages update

  if (loading) {
    return (
      <div className="flex-1 pt-16 bg-gray-50 flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 pt-16 bg-gray-50 p-8 text-center text-red-600 flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
        <p className="text-xl mb-4">{error}</p>
        {/* The retry logic should be handled by the parent page which owns fetchChat */}
        <Link href={`/${userType}/dashboard`} className="btn-secondary mt-3">Go to Dashboard</Link>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex-1 pt-16 bg-gray-50 p-8 text-center text-gray-700 flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
        <p className="text-lg mb-4">Chat not found or you do not have permission to view it.</p>
        <Link href={`/${userType}/dashboard`} className="btn-primary mt-4">Go to Dashboard</Link>
      </div>
    );
  }

  const otherParticipantName = chat.otherParticipantName || "Unknown";

  return (
    <div className="flex-grow container mx-auto flex flex-col bg-white rounded-lg shadow-lg max-w-4xl h-[calc(100vh-200px)] lg:h-[calc(100vh-180px)]">
      <div className="border-b pb-4 pt-4 px-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Chat with {otherParticipantName}
        </h1>
        {chat.quoteId && (
          <p className="text-sm text-gray-500 mt-1">
            For Quote: <Link href={`/${userType}/quotes/${chat.quoteId}`} className="text-blue-600 hover:underline">
              View Quote Details
            </Link>
          </p>
        )}
        {chat.orderId && (
          <p className="text-sm text-gray-500 mt-1">
            Associated Order: <Link href={`/${userType}/orders/${chat.orderId}`} className="text-blue-600 hover:underline">
              View Order Details
            </Link>
          </p>
        )}
      </div>

      <div className="flex-grow overflow-y-auto px-6 py-4 custom-scrollbar">
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
                    <p className="font-bold mb-2 text-md">
                      Custom Offer {msg.senderId === user.uid ? '' : `from ${otherParticipantName}`}
                    </p>
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

                    {/* Offer action buttons (only for recipient, if offer is pending, and no order yet) */}
                    {msg.senderId !== user.uid && chat.orderId === null && msg.status === 'pending' && userType === 'customer' && (
                        <div className="mt-3 flex space-x-2">
                            <button
                                onClick={() => handleOfferAction(msg, 'accept')}
                                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors"
                            >
                                Accept Offer
                            </button>
                            <button
                                onClick={() => handleOfferAction(msg, 'decline')}
                                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
                            >
                                Decline Offer
                            </button>
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

      <form onSubmit={handleSendMessage} className="mt-4 flex gap-2 border-t pt-4 px-6 pb-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow border border-gray-300 rounded-full py-2 px-4 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
          style={{ minHeight: '44px' }}
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
        {/* Render additional actions passed as a prop */}
        {additionalChatActions}
      </form>
    </div>
  );
}