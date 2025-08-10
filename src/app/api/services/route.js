import { dbAdmin } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

// GET: Fetch all services for a specific provider
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const providerId = searchParams.get('providerId');

  if (!providerId) {
    return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 });
  }

  try {
    const servicesRef = dbAdmin.collection('services');
    const q = servicesRef.where('providerId', '==', providerId);
    const snapshot = await q.get();

    const services = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ services });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Failed to fetch services.' }, { status: 500 });
  }
}

// POST: Create a new service
export async function POST(request) {
  try {
    const serviceData = await request.json();

    // Basic validation for required fields
    if (!serviceData.providerId || !serviceData.title || !serviceData.description || serviceData.priceMin === undefined) {
      return NextResponse.json({ error: 'Missing required service fields.' }, { status: 400 });
    }

    // UPDATED VALIDATION: Check if imageUrl is an array and if all items are valid Base64 strings.
    if (serviceData.imageUrl && (!Array.isArray(serviceData.imageUrl) || serviceData.imageUrl.some(url => typeof url !== 'string' || !url.startsWith('data:image/')))) {
      return NextResponse.json({ error: 'Invalid image format. imageUrl must be an array of Base64 image data URLs.' }, { status: 400 });
    }

    const newServiceRef = await dbAdmin.collection('services').add({
      ...serviceData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ message: 'Service created successfully!', serviceId: newServiceRef.id }, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: 'Failed to create service.' }, { status: 500 });
  }
}