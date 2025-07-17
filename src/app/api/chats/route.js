// src/app/api/chats/route.js
import { dbAdmin } from '@/lib/firebase-admin'; // Keep this import
import { NextResponse } from 'next/server';

// POST: Create a new chat (e.g., when a provider initiates conversation on a quote)
export async function POST(request) {
    try {
        const { customerId, providerId, initialMessage, quoteId = null } = await request.json();

        if (!customerId || !providerId || !initialMessage) {
            return NextResponse.json({ error: 'Missing required chat fields.' }, { status: 400 });
        }

        const participantIdsSorted = [customerId, providerId].sort();

        let existingChatsQuery = dbAdmin.collection('chats')
            .where('participantIds', '==', participantIdsSorted);

        if (quoteId) {
            existingChatsQuery = existingChatsQuery.where('quoteId', '==', quoteId);
        }

        const existingChats = await existingChatsQuery.get();

        if (!existingChats.empty) {
            return NextResponse.json({ message: 'Chat already exists.', chatId: existingChats.docs[0].id }, { status: 200 });
        }

        const newChatRef = await dbAdmin.collection('chats').add({
            participantIds: participantIdsSorted,
            createdAt: new Date(),
            lastMessageAt: new Date(), // This will be updated by the first message
            messages: [{
                senderId: providerId,
                text: initialMessage,
                timestamp: new Date(),
                type: 'text',
            }],
            quoteId: quoteId,
            orderId: null,
        });

        if (quoteId) {
            await dbAdmin.collection('quotes').doc(quoteId).update({
                chatId: newChatRef.id,
                status: 'responded',
                updatedAt: new Date(),
            });
        }

        return NextResponse.json({ chatId: newChatRef.id, message: 'Chat created successfully!' }, { status: 201 });

    } catch (error) {
        console.error('Error creating chat:', error);
        return NextResponse.json({ error: 'Failed to create chat.' }, { status: 500 });
    }
}

// GET: Fetch a list of chats for a participant
// This is the new part for your chat list page
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const participantId = searchParams.get('participantId');

        if (!participantId) {
            return NextResponse.json({ error: 'Participant ID is required.' }, { status: 400 });
        }

        const chatsQuery = dbAdmin.collection('chats')
            .where('participantIds', 'array-contains', participantId)
            .orderBy('lastMessageAt', 'desc'); // Order by last message for recent chats first

        const querySnapshot = await chatsQuery.get();

        const chats = querySnapshot.docs.map(docSnap => {
            const data = docSnap.data();
            // Important: When fetching a list of chats, do NOT send the full messages array.
            // Only send the necessary info for the list view (like last message preview).
            const lastMessage = data.messages && data.messages.length > 0
                ? data.messages[data.messages.length - 1]
                : null;

            return {
                id: docSnap.id,
                participantIds: data.participantIds,
                quoteId: data.quoteId || null,
                orderId: data.orderId || null,
                createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
                updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : null, // Assuming you add an 'updatedAt' field
                lastMessage: lastMessage ? {
                    senderId: lastMessage.senderId,
                    text: lastMessage.text || (lastMessage.type === 'offer' ? 'Custom Offer' : 'Attachment'), // Show "Custom Offer" for offers
                    timestamp: lastMessage.timestamp ? lastMessage.timestamp.toDate().toISOString() : null,
                    type: lastMessage.type,
                } : null,
            };
        });

        return NextResponse.json({ chats }, { status: 200 });

    } catch (error) {
        console.error('Error fetching chat list:', error);
        return NextResponse.json({ error: 'Failed to fetch chat list.' }, { status: 500 });
    }
}