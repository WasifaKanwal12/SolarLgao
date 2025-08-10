import { dbAdmin } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

// GET: Fetch a single service by ID (No changes needed)
export async function GET(request, { params }) {
  const { serviceId } = params;

  try {
    const serviceDoc = await dbAdmin.collection('services').doc(serviceId).get();

    if (!serviceDoc.exists) {
      return NextResponse.json({ error: 'Service not found.' }, { status: 404 });
    }

    return NextResponse.json({ service: { id: serviceDoc.id, ...serviceDoc.data() } });
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json({ error: 'Failed to fetch service.' }, { status: 500 });
  }
}

// PUT: Update an existing service (Modified)
export async function PUT(request, { params }) {
  const { serviceId } = params;
  try {
    const updatedData = await request.json();

    // Remove immutable fields if present, and add updatedAt
    delete updatedData.id;
    delete updatedData.providerId; // providerId should not be changed via update
    updatedData.updatedAt = new Date();

    // MODIFIED VALIDATION: Check if imageUrl is a valid array of Base64 strings.
    if (updatedData.imageUrl && (!Array.isArray(updatedData.imageUrl) || updatedData.imageUrl.some(url => typeof url !== 'string' || !url.startsWith('data:image/')))) {
        return NextResponse.json({ error: 'Invalid image format. imageUrl must be an array of Base64 image data URLs.' }, { status: 400 });
    }

    await dbAdmin.collection('services').doc(serviceId).update(updatedData);

    return NextResponse.json({ message: 'Service updated successfully!' });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json({ error: 'Failed to update service.' }, { status: 500 });
  }
}

// DELETE: Delete a service (No changes needed)
export async function DELETE(request, { params }) {
  const { serviceId } = params;

  try {
    await dbAdmin.collection('services').doc(serviceId).delete();
    return NextResponse.json({ message: 'Service deleted successfully!' });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json({ error: 'Failed to delete service.' }, { status: 500 });
  }
}