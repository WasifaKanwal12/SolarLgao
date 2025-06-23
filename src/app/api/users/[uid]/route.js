// src/app/api/users/[uid]/route.js
import { dbAdmin } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

/**
 * GET handler to fetch a user's data by UID.
 * This is used by the client-side to verify role or fetch user details.
 *
 * @param {Request} request - The incoming request object.
 * @param {Object} context - The context object containing route parameters.
 * @param {Object} context.params - Route parameters.
 * @param {string} context.params.uid - The user's UID.
 */
export async function GET(request, { params }) {
  const { uid } = params;

  if (!uid) {
    return NextResponse.json({ error: 'User UID is required' }, { status: 400 });
  }

  try {
    const userDocRef = dbAdmin.collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    return NextResponse.json({ user: { id: userDoc.id, ...userData } });
  } catch (error) {
    console.error(`Error fetching user data for UID ${uid}:`, error);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
}

// You can add PUT/DELETE handlers here if you need to update/delete user profiles
// For example:
/*
export async function PUT(request, { params }) {
  const { uid } = params;
  try {
    const updatedData = await request.json();
    await dbAdmin.collection('users').doc(uid).update(updatedData);
    return NextResponse.json({ message: 'User data updated successfully!' });
  } catch (error) {
    console.error(`Error updating user data for UID ${uid}:`, error);
    return NextResponse.json({ error: 'Failed to update user data' }, { status: 500 });
  }
}
*/