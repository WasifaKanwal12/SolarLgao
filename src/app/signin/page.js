"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthSuccess from "@/components/AuthSuccess";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { sendPasswordResetEmail, setPersistence, browserSessionPersistence, signInWithEmailAndPassword } from "firebase/auth"; // Removed GoogleAuthProvider, signInWithPopup
import { auth } from "@/lib/config"; // Import auth from client-side config

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");
  const router = useRouter();

  // Crucial: Set persistence to NONE as we are using httpOnly server-side cookies
  useEffect(() => {
    setPersistence(auth, browserSessionPersistence)
      .catch((error) => {
        console.error("Error setting persistence:", error);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Sign in user with Firebase Client SDK
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      // 2. Send ID token to your session login endpoint to create the session cookie
      const response = await fetch('/api/auth/Login', { // CHANGED: /api/auth/Login
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to establish session.");
      }

      // If successful, the server has set the httpOnly session cookie
      setSuccess(true);
      setRedirectUrl(data.redirectUrl); // Server provides the correct dashboard URL
    } catch (error) {
      console.error("Signin error:", error);
      let errorMessage = "Failed to sign in. Please try again.";
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "Invalid email or password.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === "auth/user-disabled") {
        errorMessage = "Your account has been disabled.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed login attempts. Please try again later.";
      }
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Removed handleGoogleSignIn function

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await sendPasswordResetEmail(auth, email);
      setError("Password reset email sent! Check your inbox.");
    } catch (error) {
      console.error("Password reset error:", error);
      let errorMessage = "Failed to send password reset email.";

      if (error.code === "auth/user-not-found") {
        errorMessage = "No user found with this email address.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many requests. Please try again later.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return <AuthSuccess message="Sign in successful! Redirecting to your dashboard..." redirectUrl={redirectUrl} />;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-primary-green p-6 text-center">
              <h2 className="text-2xl font-bold text-white">Sign In</h2>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green"
                    required
                    autoComplete="off"
                  />
                </div>

                <div className="relative">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green pr-10"
                    required
                    autoComplete="off"
                  />
                  <div
                    className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5 text-gray-500" />
                    ) : (
                      <FiEye className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <a
                      href="#"
                      className="text-primary-green hover:underline"
                      onClick={(e) => {
                        e.preventDefault();
                        handleForgotPassword();
                      }}
                    >
                      Forgot password?
                    </a>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              {/* The "Or continue with" divider and Google Sign-in button have been removed */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <a href="/signup" className="font-medium text-primary-green hover:underline">
                    Sign up
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}