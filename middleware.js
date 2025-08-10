import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

// Define public paths that don't require authentication
const PUBLIC_PATHS = [
  '/', // Your home page
  '/signin',
  '/signup',
  '/signout',
  '/pendingVerification', // If you have a page for email verification status
  '/pending-approval', // If you have a page for provider pending approval
  '/api/auth/signup',
  '/api/auth/Login',       // CHANGED: /api/auth/Login
  '/api/auth/sessionLogout', // Allow logout API route
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow access to public paths without any checks
  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth/signup') ||
    pathname.startsWith('/api/auth/Login') ||    // CHANGED: /api/auth/Login
    pathname.startsWith('/api/auth/sessionLogout')
  ) {
    return NextResponse.next();
  }

  // Get the session cookie
  const sessionCookie = request.cookies.get('session')?.value || '';

  // If no session cookie, redirect to sign-in page
  if (!sessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/signin';
    return NextResponse.redirect(url);
  }

  try {
    // Verify the session cookie (checks validity and revocation status)
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true); // true to check revoked

    const uid = decodedClaims.uid;
    let userRole = decodedClaims.role; // Try to get role from custom claims

    // If role is not in custom claims or claims are old, fetch from Firestore and update
    // Firebase ID tokens (and thus custom claims in session cookies) are valid for 1 hour.
    // If the token is older than, say, 50 minutes, we should refresh claims.
    const ONE_HOUR_IN_MS = 60 * 60 * 1000;
    const TEN_MINUTES_IN_MS = 10 * 60 * 1000; // Time buffer for refreshing claims
    const tokenIssuedAtMs = decodedClaims.auth_time * 1000;

    if (!userRole || (Date.now() - tokenIssuedAtMs > ONE_HOUR_IN_MS - TEN_MINUTES_IN_MS)) {
      const userDocRef = adminDb.collection('Users').doc(uid);
      const userDoc = await userDocRef.get();

      if (!userDoc.exists) {
        console.error("User Firestore document not found for UID:", uid, ". Revoking session.");
        await adminAuth.revokeRefreshTokens(uid); // Revoke tokens for non-existent user
        const response = NextResponse.redirect(new URL('/signin', request.url));
        response.cookies.delete('session');
        return response;
      }

      const firestoreRole = userDoc.data().role;
      if (userRole !== firestoreRole) {
        userRole = firestoreRole; // Update userRole for current check
        await adminAuth.setCustomUserClaims(uid, { role: userRole });
        console.log(`Updated custom claims for user ${uid} to role: ${userRole}`);
        
      } else {
        userRole = firestoreRole; // Ensure userRole is set even if claims didn't change but needed refresh
      }
    }


    if (!userRole) {
      console.error("User role could not be determined for UID:", uid);
      const url = request.nextUrl.clone();
      url.pathname = '/signin';
      return NextResponse.redirect(url);
    }

    // Role-based authorization for the direct paths
    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/signin'; // Or a dedicated unauthorized page like /unauthorized
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith('/provider') && userRole !== 'provider') {
      const url = request.nextUrl.clone();
      url.pathname = '/signin';
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith('/customer') && userRole !== 'customer') {
      const url = request.nextUrl.clone();
      url.pathname = '/signin';
      return NextResponse.redirect(url);
    }

    // For any authenticated route (e.g., if you have /profile, ensure they have a role)
    if ((pathname.startsWith('/customer') || pathname.startsWith('/provider') || pathname.startsWith('/admin')) && !userRole) {
        const url = request.nextUrl.clone();
        url.pathname = '/signin';
        return NextResponse.redirect(url);
    }

    // If session is valid and authorized, proceed
    return NextResponse.next();

  } catch (error) {
    console.error("Session verification failed during middleware check:", error);
    // Clear the invalid cookie and redirect to sign-in
    const response = NextResponse.redirect(new URL('/signin', request.url));
    response.cookies.delete('session');
    return response;
  }
}

// Config to specify which paths the middleware should run on
export const config = {
  matcher: [
    
    '/((?!api|signin|signup|signout|pendingVerification|pending-approval|_next/static|_next/image|favicon.ico|google-logo.svg|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.css$|.*\\.js$).*)',
  ],
};