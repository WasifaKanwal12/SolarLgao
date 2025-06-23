// app/api/auth/signup/route.js
import { dbAdmin, authAdmin } from '@/lib/firebase-admin'; // Import authAdmin for custom claims
import { NextResponse } from 'next/server'; // Import NextResponse for app router API responses

/**
 * Handles POST requests for user signup.
 * Creates a user entry in the 'users' collection and, if applicable,
 * a separate entry in the 'providers' collection.
 * It also sets custom Firebase Auth claims for the user's role.
 *
 * @param {Request} request - The incoming request object.
 */
export async function POST(request) {
  // Parse the JSON body from the request.
  const {
    uid,
    email,
    firstName,
    lastName,
    userType,
    companyName,
    registrationNumber,
    contactNumber,
    companyAddress,
    servicesOffered,
    serviceLocations,
    description,
    website,
    certificateBase64,
    profileImageBase64,
  } = await request.json(); // Access request body using await request.json()

  try {
    // Data for the 'users' collection (common fields for all users)
    const userData = {
      uid,
      email,
      firstName,
      lastName,
      role: userType, // Store userType as role
      emailVerified: false, // Initial state, will be updated by email verification process
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };

    // Set user data in the 'users' collection using their Firebase Auth UID as the document ID.
    await dbAdmin.collection('users').doc(uid).set(userData);

    // If the user is a provider, create a separate document in the 'providers' collection.
    if (userType === 'provider') {
      const providerData = {
        uid, // Link to the user's UID
        companyName,
        registrationNumber,
        contactNumber,
        companyAddress,
        servicesOffered: servicesOffered || [], // Ensure it's an array, even if empty
        serviceLocations: serviceLocations || [], // Ensure it's an array, even if empty
        description: description || null, // Ensure it's null if undefined
        website: website || null, // Ensure it's null if undefined
        certificateUrl: certificateBase64 || null, // Storing base64 string
        profileImageUrl: profileImageBase64 || null, // Storing base64 string
        status: 'pending', // Default status for new providers awaiting admin approval
        rating: 0, // Initialize rating
        totalReviews: 0, // Initialize review count
      };
      // Set provider data in the 'providers' collection using the same UID.
      await dbAdmin.collection('providers').doc(uid).set(providerData);
    }

    // Set custom claims for the user immediately after creating them.
    // This makes the user's role available in their ID token for client-side checks
    // and for Firebase Security Rules.
    await authAdmin.setCustomUserClaims(uid, { role: userType });

    // Return a success response.
    return NextResponse.json({
      message: 'Account created and user data saved successfully! Please check your email for verification.',
      redirectUrl: userType === 'provider' ? '/provider/pending' : '/customer',
    }, { status: 200 });

  } catch (error) {
    console.error('Error saving user data to Firestore:', error);
    // Return an error response.
    return NextResponse.json({ error: 'Failed to create account. ' + (error.message || 'An internal error occurred.') }, { status: 500 });
  }
}

// If you need to support other HTTP methods for this route, define them similarly:
/*
export async function GET(request) {
  // Logic for GET requests
}

export async function PUT(request) {
  // Logic for PUT requests
}

export async function DELETE(request) {
  // Logic for DELETE requests
}
*/
