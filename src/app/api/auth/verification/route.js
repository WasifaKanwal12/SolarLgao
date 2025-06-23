import { NextResponse } from 'next/server';
import { auth } from '@/lib/config';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/config';

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    // Get user from Firebase Auth
    const user = auth.currentUser;
    
    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Check if email is verified
    await user.reload(); // Refresh user data
    const isVerified = user.emailVerified;

    if (!isVerified) {
      return NextResponse.json(
        { error: "Email not verified", requiresVerification: true },
        { status: 403 }
      );
    }

    // Update Firestore with verification status
    await setDoc(doc(db, "Users", user.uid), {
      emailVerified: true
    }, { merge: true });

    return NextResponse.json(
      { message: "Email verified", verified: true },
      { status: 200 }
    );

  } catch (error) {
    console.error("Verification check error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check verification status" },
      { status: 500 }
    );
  }
}