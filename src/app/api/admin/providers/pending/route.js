// app/api/admin/providers/pending/route.js
import { dbAdmin } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

/**
 * GET handler to fetch all pending service providers.
 */
export async function GET() {
  try {
    const providersSnapshot = await dbAdmin.collection('providers').where('status', '==', 'pending').get();
    const providers = providersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return NextResponse.json({ providers });
  } catch (error) {
    console.error('Error fetching pending providers:', error);
    return NextResponse.json({ error: 'Failed to fetch pending providers.' }, { status: 500 });
  }
}