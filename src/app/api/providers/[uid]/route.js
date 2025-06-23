// src/app/api/providers/[uid]/route.js
import { dbAdmin } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

/**
 * GET handler to fetch a provider's data by UID.
 *
 * @param {Request} request - The incoming request object.
 * @param {Object} context - The context object containing route parameters.
 * @param {Object} context.params - Route parameters.
 * @param {string} context.params.uid - The provider's UID.
 */
export async function GET(request, { params }) {
  const { uid } = params;

  if (!uid) {
    return NextResponse.json({ error: 'Provider UID is required' }, { status: 400 });
  }

  try {
    const providerDocRef = dbAdmin.collection('providers').doc(uid);
    const providerDoc = await providerDocRef.get();

    if (!providerDoc.exists) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    const providerData = providerDoc.data();
    // Fetch associated services for the provider
    const servicesSnapshot = await dbAdmin.collection('services')
      .where('providerId', '==', uid)
      .where('status', '==', 'active') // Only fetch active services for public view
      .get();
    const services = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));


    return NextResponse.json({ provider: { id: providerDoc.id, ...providerData, services } });
  } catch (error) {
    console.error(`Error fetching provider data for UID ${uid}:`, error);
    return NextResponse.json({ error: 'Failed to fetch provider data' }, { status: 500 });
  }
}

// You can add PUT/DELETE handlers for provider profile updates here as well.