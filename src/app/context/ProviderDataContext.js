// context/ProviderDataContext.js
"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from "@/lib/config";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

const ProviderDataContext = createContext(null);

export function ProviderDataWrapper({ children }) {
  const [user, setUser] = useState(null);
  const [providerData, setProviderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/signin");
        setLoading(false);
        return;
      }
      setUser(currentUser);
      await fetchProviderInfo(currentUser.uid);
    });

    return () => unsubscribe();
  }, [router]);

  const fetchProviderInfo = async (uid) => {
    try {
      setLoading(true);
      const userRes = await fetch(`/api/users/${uid}`);
      if (!userRes.ok) throw new Error("Failed to fetch user data.");
      const userData = await userRes.json();

      if (userData.user.role !== "provider") {
        router.push("/unauthorized");
        setLoading(false);
        return;
      }

      const providerRes = await fetch(`/api/providers/${uid}`);
      if (!providerRes.ok) throw new Error("Failed to fetch provider data.");
      const providerInfo = await providerRes.json();

      if (providerInfo.provider.status === "pending") {
        router.push("/provider/pending");
        setLoading(false);
        return;
      }
      if (providerInfo.provider.status === "rejected") {
        setError("Your provider application has been rejected. Please contact support.");
        setLoading(false);
        return;
      }

      setProviderData(providerInfo.provider);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching provider info for context:", err);
      setError("Failed to load provider data for layout. Please try again.");
      setLoading(false);
    }
  };

  return (
    <ProviderDataContext.Provider value={{ user, providerData, loading, error }}>
      {children}
    </ProviderDataContext.Provider>
  );
}

export function useProviderData() {
  return useContext(ProviderDataContext);
}