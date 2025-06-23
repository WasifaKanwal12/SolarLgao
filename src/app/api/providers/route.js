// src/app/api/providers/route.js
import { dbAdmin } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

/**
 * GET handler to fetch a list of approved service providers.
 * Supports searching by company name, services offered, or service locations.
 *
 * @param {Request} request - The incoming request object.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get('search') || '';

  try {
    let providersRef = dbAdmin.collection('providers').where('status', '==', 'approved');
    let snapshot = await providersRef.get();

    let providers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      providers = providers.filter(provider => {
        const companyMatch = provider.companyName?.toLowerCase().includes(lowerCaseSearchTerm);
        const servicesMatch = provider.servicesOffered?.some(service =>
          service.toLowerCase().includes(lowerCaseSearchTerm)
        );
        const locationsMatch = provider.serviceLocations?.some(location =>
          location.toLowerCase().includes(lowerCaseSearchTerm)
        );
        return companyMatch || servicesMatch || locationsMatch;
      });
    }

    // Optionally, fetch services for each provider and attach them
    // This can be heavy if many providers/services; consider fetching services client-side
    // or as a separate API call per provider for detailed views.
    const providersWithServices = await Promise.all(providers.map(async (provider) => {
        const servicesSnapshot = await dbAdmin.collection('services')
            .where('providerId', '==', provider.uid)
            .where('status', '==', 'active')
            .get();
        const services = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { ...provider, services };
    }));

    return NextResponse.json({ providers: providersWithServices });
  } catch (error) {
    console.error('Error fetching approved providers:', error);
    return NextResponse.json({ error: 'Failed to fetch service providers.' }, { status: 500 });
  }
}