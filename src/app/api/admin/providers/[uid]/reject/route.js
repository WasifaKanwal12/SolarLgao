// app/api/admin/providers/[uid]/reject/route.js
import { dbAdmin } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';

/**
 * DELETE handler to reject and delete a provider's account.
 */
export async function DELETE(request, { params }) {
  const { uid } = params;

  if (!uid) {
    return NextResponse.json({ error: 'Provider UID is required' }, { status: 400 });
  }

  try {
    // Delete Firestore documents
    await dbAdmin.collection('providers').doc(uid).delete();
    await dbAdmin.collection('users').doc(uid).delete();

    // Delete Firebase Auth user
    await getAuth().deleteUser(uid);

    return NextResponse.json({ message: 'Provider account rejected and deleted successfully.' });
  } catch (error) {
    console.error(`Error rejecting provider ${uid}:`, error);
    return NextResponse.json({ error: 'Failed to reject and delete provider account.' }, { status: 500 });
  }
}