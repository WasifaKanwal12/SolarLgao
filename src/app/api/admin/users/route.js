// app/api/admin/users/route.js
import { dbAdmin } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

/**
 * GET handler to fetch all users (customers and providers).
 */
export async function GET() {
  try {
    const usersSnapshot = await dbAdmin.collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching all users:', error);
    return NextResponse.json({ error: 'Failed to fetch users.' }, { status: 500 });
  }
}