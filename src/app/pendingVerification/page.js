"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/config';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PendingVerification() {
  const [email, setEmail] = useState('');
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (auth.currentUser?.email) {
      setEmail(auth.currentUser.email);
    }
  }, []);

  const handleResendVerification = async () => {
    setLoading(true);
    setError('');
    
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not found");
      }
      
      await sendEmailVerification(user);
      setResent(true);
    } catch (error) {
      console.error("Resend error:", error);
      setError(error.message || "Failed to resend verification email");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification check failed");
      }

      if (data.verified) {
        router.push(data.redirectUrl || '/dashboard');
      }
    } catch (error) {
      console.error("Verification check error:", error);
      setError(error.message || "Failed to check verification status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-primary-green p-6 text-center">
              <h2 className="text-2xl font-bold text-white">Verify Your Email</h2>
            </div>
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <p className="text-gray-700">
                  We've sent a verification email to <span className="font-semibold">{email}</span>. 
                  Please check your inbox and click the verification link.
                </p>
                
                <p className="text-gray-700">
                  Didn't receive the email? Check your spam folder or click below to resend.
                </p>
                
                <button
                  onClick={handleResendVerification}
                  disabled={loading || resent}
                  className={`w-full py-2 px-4 rounded-md text-white bg-primary-green hover:bg-green-700 ${loading || resent ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {loading ? "Sending..." : resent ? "Email Resent!" : "Resend Verification Email"}
                </button>
                
                <button
                  onClick={handleCheckVerification}
                  disabled={loading}
                  className={`w-full py-2 px-4 rounded-md text-primary-green border border-primary-green hover:bg-green-50 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {loading ? "Checking..." : "I've Verified My Email"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}