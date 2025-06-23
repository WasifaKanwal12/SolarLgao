// src/app/api/chats/[chatId]/route.js
import { dbAdmin } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

// GET: Fetch a single chat by ID and its messages
export async function GET(request, { params }) {
  const { chatId } = params;

  try {
    const chatDoc = await dbAdmin.collection('chats').doc(chatId).get();

    if (!chatDoc.exists) {
      return NextResponse.json({ error: 'Chat not found.' }, { status: 404 });
    }

    return NextResponse.json({ chat: { id: chatDoc.id, ...chatDoc.data() } });
  } catch (error) {
    console.error('Error fetching chat:', error);
    return NextResponse.json({ error: 'Failed to fetch chat.' }, { status: 500 });
  }
}

// PUT: Add a new message or update chat details (e.g., link to an order)
export async function PUT(request, { params }) {
  const { chatId } = params;
  try {
    const updatedData = await request.json(); // Can contain { newMessage: {senderId, text, type}, orderId }

    const chatRef = dbAdmin.collection('chats').doc(chatId);
    const chatDoc = await chatRef.get();

    if (!chatDoc.exists) {
        return NextResponse.json({ error: 'Chat not found.' }, { status: 404 });
    }

    const currentChat = chatDoc.data();
    const updatePayload = {
        updatedAt: new Date(),
        lastMessageAt: new Date(),
    };

    if (updatedData.newMessage) {
        const newMessage = {
            ...updatedData.newMessage,
            timestamp: new Date(),
        };
        updatePayload.messages = [...(currentChat.messages || []), newMessage];
    }

    if (updatedData.orderId) {
        updatePayload.orderId = updatedData.orderId;
    }
    // Add other fields to update as needed

    await chatRef.update(updatePayload);

    return NextResponse.json({ message: 'Chat updated successfully!' });
  } catch (error) {
    console.error('Error updating chat:', error);
    return NextResponse.json({ error: 'Failed to update chat.' }, { status: 500 });
  }
}