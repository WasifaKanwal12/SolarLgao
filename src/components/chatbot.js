'use client';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Constants
const INITIAL_MESSAGE = {
  sender: 'bot',
  text: "Hello! I'm your solar energy assistant. How can I help you today?",
  timestamp: new Date().toLocaleTimeString(),
};

// Components
const BotAvatar = () => (
  <div className="flex-shrink-0 bg-primary-green text-white p-2 rounded-full self-start">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  </div>
);

const LoadingIndicator = () => (
  <div className="flex justify-start space-x-2">
    <BotAvatar />
    <div className="bg-white text-gray-800 p-3 rounded-2xl rounded-bl-none shadow-sm max-w-xs flex items-center justify-center">
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-green" aria-label="Loading" />
    </div>
  </div>
);

const MessageBubble = ({ message }) => {
  const sanitizedHtml = useMemo(() => {
    if (message.sender === 'bot' && message.text) {
      return DOMPurify.sanitize(marked(message.text));
    }
    return null;
  }, [message.text, message.sender]);

  return (
    <div
      className={`${
        message.sender === 'user'
          ? 'bg-primary-green text-white rounded-br-none'
          : 'bg-white text-gray-800 rounded-bl-none'
      } p-3 rounded-2xl shadow-sm max-w-xs`}
    >
      {sanitizedHtml ? (
        <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      ) : (
        <p>{message.text}</p>
      )}
      <span
        className={`text-xs ${
          message.sender === 'user' ? 'text-white opacity-70' : 'text-gray-500'
        } mt-1 block text-right`}
      >
        {message.timestamp}
      </span>
    </div>
  );
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);
  const isInitialMount = useRef(true);
  const abortControllerRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (!isInitialMount.current) {
      scrollToBottom();
    }
    isInitialMount.current = false;
  }, [messages, scrollToBottom]);

  const generateGeminiResponse = useCallback(async (messages) => {
    abortControllerRef.current = new AbortController();
    const timeoutId = setTimeout(() => abortControllerRef.current.abort(), 40000);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
        signal: abortControllerRef.current.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        return { error: 'Failed to get response. Please try again.' };
      }

      return await response.json();
    } catch (error) {
      console.error('Network Error:', error);
      return { error: error.message || 'Network error occurred' };
    }
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || loading) return;

    const newUserMessage = {
      sender: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    setLoading(true);

    try {
      const geminiResult = await generateGeminiResponse([...messages, newUserMessage]);

      const newBotMessage = {
        sender: 'bot',
        text: geminiResult.response || geminiResult.error || 'Sorry, something went wrong.',
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages(prev => [...prev, newBotMessage]);
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  }, [inputText, loading, messages, generateGeminiResponse]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !loading && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage, loading]);

  const toggleChat = useCallback(() => setIsOpen(prev => !prev), []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.button
        onClick={toggleChat}
        className="bg-primary-green text-white rounded-full p-4 shadow-xl hover:bg-green-600 transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          )}
        </svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-xl flex flex-col rounded-l-2xl overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Chat window"
          >
            <div className="bg-primary-green text-white p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">Solar Lagao Assistant</h3>
                <p className="text-sm opacity-90">We're online and ready to help!</p>
              </div>
              <button
                onClick={toggleChat}
                className="text-white hover:text-gray-200 p-1"
                aria-label="Close chat"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div 
              ref={chatContainerRef} 
              className="flex-1 p-4 overflow-y-auto bg-gray-50"
              aria-live="polite"
            >
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} space-x-2`}
                  >
                    {message.sender === 'bot' && <BotAvatar />}
                    <MessageBubble message={message} />
                  </div>
                ))}
                {loading && <LoadingIndicator />}
              </div>
            </div>

            <div className="border-t p-4 bg-white">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  aria-label="Type your message"
                />
                <button
                  className={`p-2 rounded-lg transition-colors ${
                    loading || !inputText.trim()
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-primary-green text-white hover:bg-green-600'
                  }`}
                  onClick={handleSendMessage}
                  disabled={loading || !inputText.trim()}
                  aria-label="Send message"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}