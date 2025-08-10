// app/api/admin/providers/[uid]/approve/route.js
import { dbAdmin } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

/**
 * PUT handler to approve a pending provider.
 * This also updates the user's status in the Users collection.
 */
export async function PUT(request, { params }) {
  const { uid } = params;

  if (!uid) {
    return NextResponse.json({ error: 'Provider UID is required' }, { status: 400 });
  }

  try {
    const providerRef = dbAdmin.collection('providers').doc(uid);
    await providerRef.update({ status: 'approved' });

    const userRef = dbAdmin.collection('users').doc(uid);
    await userRef.update({ status: 'approved' });

    return NextResponse.json({ message: 'Provider approved successfully.' });
  } catch (error) {
    console.error(`Error approving provider ${uid}:`, error);
    return NextResponse.json({ error: 'Failed to approve provider.' }, { status: 500 });
  }
}