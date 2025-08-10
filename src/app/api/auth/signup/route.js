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
    registrationNumber, // This is now optional
    contactNumber,
    companyAddress,
    servicesOffered,
    serviceLocations,
    description,
    website,
    certificateBase64, // This is now optional
    profileImageBase64,
  } = await request.json(); // Access request body using await request.json()

  try {
    // Data for the 'users' collection (common fields for all users)
    const userData = {
      uid,
      email,
      firstName,
      lastName,
      role: userType,
      emailVerified: false,
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };

    await dbAdmin.collection('users').doc(uid).set(userData);

    
    if (userType === 'provider') {
      const providerData = {
        uid, 
        companyName,
        registrationNumber: registrationNumber || null, 
        contactNumber,
        companyAddress,
        servicesOffered: servicesOffered || [], 
        serviceLocations: serviceLocations || [], 
        description: description || null,
        website: website || null,
        certificateUrl: certificateBase64 || null, 
        profileImageUrl: profileImageBase64 || null,
        status: 'pending', 
        rating: 0, 
        totalReviews: 0, 
      };
      
      await dbAdmin.collection('providers').doc(uid).set(providerData);
    }

   
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