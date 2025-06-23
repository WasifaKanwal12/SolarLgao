import { NextResponse } from 'next/server';
import { authAdmin, dbAdmin } from '@/lib/firebase-admin';

export async function POST(request) {
  try {
    const { idToken } = await request.json();

    // Verify the ID token
    let decodedToken;
    try {
      decodedToken = await authAdmin.verifyIdToken(idToken);
    } catch (error) {
      console.error("Error verifying ID token:", error);
      return NextResponse.json({ message: "Invalid ID token." }, { status: 401 });
    }

    const uid = decodedToken.uid;

    // Check user in Firestore to determine role and approval status
    const userDoc = await dbAdmin.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      console.warn(`User Firestore document not found for UID: ${uid}. Forcing logout.`);
      const response = NextResponse.json(
        { message: "User data not found. Please complete signup or contact support." },
        { status: 404 }
      );
      response.cookies.delete('session');
      return response;
    }

    const userData = userDoc.data();
    const userRole = userData.role;
    const userStatus = userData.status;

    // Sync Firebase Custom Claims with Firestore role
    if (decodedToken.role !== userRole) {
      await authAdmin.setCustomUserClaims(uid, { role: userRole });
    }

    // Handle redirect for unapproved providers
    if (userRole === "provider" && userStatus !== "approved") {
      return NextResponse.json({
        message: "Your provider account is pending approval.",
        redirectUrl: "/provider/pending"
      }, { status: 200 });
    }

    let dashboardUrl;
    switch (userRole) {
      case "admin":
        dashboardUrl = "/admin";
        break;
      case "provider":
        dashboardUrl = "/provider";
        break;
      case "customer":
      default:
        dashboardUrl = "/customer";
    }

    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

    const sessionCookie = await authAdmin.createSessionCookie(idToken, { expiresIn });

    const options = {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'Lax',
    };

    const response = NextResponse.json({
      success: true,
      redirectUrl: dashboardUrl
    }, { status: 200 });

    response.cookies.set('session', sessionCookie, options);
    return response;

  } catch (error) {
    console.error("Error creating session cookie:", error);
    return NextResponse.json(
      { message: error.message || "Failed to create session. Please try again." },
      { status: 500 }
    );
  }
}
