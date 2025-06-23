// src/app/api/chats/route.js
import { dbAdmin } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

// POST: Create a new chat (e.g., when a provider initiates conversation on a quote)
export async function POST(request) {
  try {
    const { customerId, providerId, initialMessage, quoteId = null } = await request.json();

    if (!customerId || !providerId || !initialMessage) {
      return NextResponse.json({ error: 'Missing required chat fields.' }, { status: 400 });
    }

    // ⭐ KEY IMPROVEMENT: Ensure participantIds are always sorted for consistent querying.
    // This allows for a single, efficient Firestore '==' query on the array.
    const participantIdsSorted = [customerId, providerId].sort();

    // Build the query to check for an existing chat
    let existingChatsQuery = dbAdmin.collection('chats')
      .where('participantIds', '==', participantIdsSorted); // ⭐ Direct equality check on the sorted array

    // If a quoteId is provided, also filter by it to find a specific chat linked to that quote
    if (quoteId) {
      existingChatsQuery = existingChatsQuery.where('quoteId', '==', quoteId);
    }

    const existingChats = await existingChatsQuery.get();

    if (!existingChats.empty) {
      // If a chat exists, return its ID and a message
      return NextResponse.json({ message: 'Chat already exists.', chatId: existingChats.docs[0].id }, { status: 200 });
    }

    // If no existing chat, create a new one
    const newChatRef = await dbAdmin.collection('chats').add({
      participantIds: participantIdsSorted, // ⭐ Store the sorted array
      createdAt: new Date(),
      lastMessageAt: new Date(),
      messages: [{
        senderId: providerId, // Assuming provider initiates
        text: initialMessage,
        timestamp: new Date(),
        type: 'text',
      }],
      quoteId: quoteId, // Link to the quote that started it
      orderId: null, // No order linked yet
    });

    // Update the associated quote to link to this new chat (if applicable)
    if (quoteId) {
      await dbAdmin.collection('quotes').doc(quoteId).update({
        chatId: newChatRef.id,
        status: 'responded', // Mark quote as responded
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({ chatId: newChatRef.id, message: 'Chat created successfully!' }, { status: 201 });

  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json({ error: 'Failed to create chat.' }, { status: 500 });
  }
}