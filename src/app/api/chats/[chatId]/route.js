// src/app/api/chats/[chatId]/route.js
import { dbAdmin } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';
import admin from 'firebase-admin'; // Import admin for Timestamp conversion

// Helper function to convert Firestore Timestamp or Date to ISO string safely
const toISOString = (dateField) => {
    if (!dateField) {
        return null; // Handle null or undefined
    }
    // Check if it's a Firestore Timestamp object
    if (dateField instanceof admin.firestore.Timestamp) {
        return dateField.toDate().toISOString();
    }
    // Check if it's a JavaScript Date object
    if (dateField instanceof Date) {
        return dateField.toISOString();
    }
    // If it's already a string, assume it's ISO and return it
    if (typeof dateField === 'string') {
        return dateField;
    }
    return null; // Fallback for any other unexpected type
};

// GET: Fetch a single chat by ID and its messages
export async function GET(request, { params }) {
    const { chatId } = params;

    try {
        const chatDoc = await dbAdmin.collection('chats').doc(chatId).get();

        if (!chatDoc.exists) {
            return NextResponse.json({ error: 'Chat not found.' }, { status: 404 });
        }

        const chatData = chatDoc.data();

        // Convert all Date-like objects to ISO strings for consistent client-side handling
        const serializedChatData = {
            id: chatDoc.id,
            ...chatData,
            createdAt: toISOString(chatData.createdAt),
            lastMessageAt: toISOString(chatData.lastMessageAt),
            messages: chatData.messages?.map(msg => ({
                ...msg,
                timestamp: toISOString(msg.timestamp),
                // Handle expiryDate for offers using the safe helper
                expiryDate: msg.type === 'offer' ? toISOString(msg.expiryDate) : null,
            })) || [],
        };

        return NextResponse.json({ chat: serializedChatData });
    } catch (error) {
        console.error('Error fetching chat:', error);
        return NextResponse.json({ error: 'Failed to fetch chat.' }, { status: 500 });
    }
}

// PUT: Add a new message, send an offer, update offer status, or link to an order
export async function PUT(request, { params }) {
    const { chatId } = params;
    try {
        const { newMessage, updateOfferStatus, orderId: newOrderId } = await request.json(); // Destructure incoming data

        const chatRef = dbAdmin.collection('chats').doc(chatId);
        const chatDoc = await chatRef.get();

        if (!chatDoc.exists) {
            return NextResponse.json({ error: 'Chat not found.' }, { status: 404 });
        }

        const currentChatData = chatDoc.data();
        let updatedMessages = currentChatData.messages || [];
        let updatePayload = {};

        if (newMessage) {
            const messageToAdd = {
                ...newMessage,
                // Ensure timestamp is always a Firestore Timestamp when writing to DB
                timestamp: admin.firestore.Timestamp.now(),
            };
            // If the newMessage is an offer and has an expiryDate, convert it to a Date object
            if (newMessage.type === 'offer' && newMessage.expiryDate) {
                messageToAdd.expiryDate = new Date(newMessage.expiryDate);
            }
            updatedMessages.push(messageToAdd);
            updatePayload.messages = updatedMessages;
            updatePayload.lastMessageAt = admin.firestore.Timestamp.now();
        }

        if (updateOfferStatus) {
            // updateOfferStatus should contain { offerSenderId, offerTimestamp, status }
            // offerTimestamp is already an ISO string from the client, so convert it to Date for comparison
            const targetTimestamp = new Date(updateOfferStatus.offerTimestamp);

            updatedMessages = updatedMessages.map(msg => {
                // Convert Firestore Timestamp to Date for direct comparison if necessary
                const msgTimestampAsDate = msg.timestamp instanceof admin.firestore.Timestamp ? msg.timestamp.toDate() : null;

                if (msg.type === 'offer' &&
                    msg.senderId === updateOfferStatus.offerSenderId &&
                    msgTimestampAsDate && msgTimestampAsDate.getTime() === targetTimestamp.getTime()) {
                    return { ...msg, status: updateOfferStatus.status };
                }
                return msg;
            });
            updatePayload.messages = updatedMessages;
            updatePayload.updatedAt = admin.firestore.Timestamp.now();
            updatePayload.lastMessageAt = admin.firestore.Timestamp.now(); // Update last message time if an offer status changes
        }

        if (newOrderId) {
            updatePayload.orderId = newOrderId;
            updatePayload.updatedAt = admin.firestore.Timestamp.now();
            updatePayload.lastMessageAt = admin.firestore.Timestamp.now(); // Update last message time if an order is created
        }

        if (Object.keys(updatePayload).length > 0) {
            await chatRef.update(updatePayload);
        }

        return NextResponse.json({ message: 'Chat updated successfully!' });
    } catch (error) {
        console.error('Error updating chat:', error);
        return NextResponse.json({ error: 'Failed to update chat.' }, { status: 500 });
    }
}