import { NextResponse } from 'next/server';
import { authAdmin } from '@/lib/firebase-admin';

export async function POST(request) {
  try {
    const sessionCookie = request.cookies.get('session')?.value || '';

    // Clear the session cookie immediately
    const response = NextResponse.json(
      { message: "Successfully logged out." },
      { status: 200 }
    );
    response.cookies.delete('session');

    // Verify the session cookie (if it exists) to get the UID for revocation
    if (sessionCookie) {
      try {
        const decodedClaims = await authAdmin.verifySessionCookie(sessionCookie);
        // Revoke all refresh tokens for the user, invalidating all their sessions
        await authAdmin.revokeRefreshTokens(decodedClaims.sub);
        console.log(`Revoked refresh tokens for user: ${decodedClaims.sub}`);
      } catch (error) {
        console.warn("Failed to verify session cookie for revocation (might already be invalid or cleared):", error);
        // Continue even if verification fails, as the cookie is already cleared on the client
      }
    }

    return response;

  } catch (error) {
    console.error("Error during server-side logout:", error);
    return NextResponse.json(
      { message: error.message || "Failed to log out." },
      { status: 500 }
    );
  }
}