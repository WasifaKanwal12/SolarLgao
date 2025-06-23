// src/app/provider/layout.js
"use client"; // Keep this here!

import { Inter } from "next/font/google";
import "../../app/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import { ProviderDataWrapper, useProviderData } from "@/app/context/ProviderDataContext"; // Import context

const inter = Inter({ subsets: ["latin"] });

// REMOVE THE METADATA EXPORT FROM HERE
// export const metadata = {
//   title: "Provider Dashboard - Solar Marketplace",
//   description: "Manage your solar services, quotes, and orders.",
// };

function LayoutContent({ children }) {
  const { user, providerData, loading, error } = useProviderData();

  const providerNavItems = [
    { name: "Dashboard", href: "/provider" },
    { name: "My Services", href: "/provider/services" },
    { name: "Quotes Received", href: "/provider/quotes" },
    { name: "My Orders", href: "/provider/orders" },
    { name: "Payments", href: "/provider/payments" },
    { name: "Reviews", href: "/provider/reviews" },
    { name: "My Profile", href: "/provider/profile" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600 w-full">
        <p>{error}</p>
      </div>
    );
  }

  if (!providerData && !loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex flex-1 pt-16 justify-center items-center">
            <p className="text-gray-700">No provider data found. Please ensure your account is approved.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 pt-16">
        <Sidebar navItems={providerNavItems} userType="provider" providerData={providerData} />
        <main className="flex-1 p-8 bg-gray-50 overflow-y-auto">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default function ProviderLayout({ children }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <ProviderDataWrapper>
                    <LayoutContent>{children}</LayoutContent>
                </ProviderDataWrapper>
            </body>
        </html>
    );
}