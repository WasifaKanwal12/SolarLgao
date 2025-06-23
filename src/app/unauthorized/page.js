"use client";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

export default function Unauthorized() {
  const router = useRouter();

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="w-20 h-20 mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-full w-full text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Unauthorized Access</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Please sign in with the correct account.
          </p>
          <button
            onClick={() => router.push("/signin")}
            className="px-4 py-2 bg-primary-green text-white rounded hover:bg-green-700"
          >
            Sign In
          </button>
        </div>
      </div>
    </>
  );
}