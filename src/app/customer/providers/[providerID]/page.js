"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/config";

// Loader component (can be a shared component)
const Loader = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
    <p className="ml-3 text-lg text-gray-700">Loading details...</p>
  </div>
);

export default function ProviderDetailsPage({ params }) {
  const { providerId } = params;
  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const customerNavItems = [
    { name: "Home", href: "/customer" },
    { name: "My Quotes", href: "/customer/quotes" },
    { name: "My Orders", href: "/customer/orders" },
    { name: "Request Quote", href: "/customer/request-quote" },
  ];

  useEffect(() => {
    // We only proceed if both the providerId and a user are present.
    // This handles the initial render where providerId might be undefined.
    if (!providerId) {
      setLoading(false);
      setError("No provider ID found. Please go back and try again.");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/signin");
        return;
      }
      
      const fetchData = async () => {
        try {
          // Fetch provider details
          const providerRes = await fetch(`/api/providers/${providerId}`);
          if (!providerRes.ok) {
            throw new Error("Failed to fetch provider details.");
          }
          const providerData = await providerRes.json();
          setProvider(providerData.provider);
  
          // Fetch services for the provider
          const servicesRes = await fetch(`/api/services?providerId=${providerId}`);
          if (!servicesRes.ok) {
            throw new Error("Failed to fetch services.");
          }
          const servicesData = await servicesRes.json();
          setServices(servicesData.services);
  
        } catch (err) {
          console.error("Error fetching data:", err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    });

    return () => unsubscribe();
  }, [providerId, router]);

  const handleSendQuoteClick = (serviceId) => {
    router.push(`/customer/request-quote?providerId=${providerId}&serviceId=${serviceId}`);
  };

  // The rendering logic is crucial. First check for a persistent error, then for loading.
  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header navItems={customerNavItems} userType="customer" />
        <main className="flex-1 pt-16 bg-gray-50 p-8 text-center text-red-600 flex flex-col items-center justify-center">
          <p className="text-xl mb-4">{error}</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header navItems={customerNavItems} userType="customer" />
        <main className="flex-1 pt-16 bg-gray-50 flex flex-col justify-center items-center">
          <Loader />
        </main>
        <Footer />
      </div>
    );
  }

  // The rest of your JSX renders only when not loading and there's no error.
  return (
    <div className="flex flex-col min-h-screen">
      <Header navItems={customerNavItems} userType="customer" />
      <main className="flex-1 pt-16 bg-gray-50 overflow-y-auto">
        <div className="container mx-auto p-6 bg-gray-50">
          <Link href="/customer" className="text-blue-600 hover:underline mb-4 inline-block">
            &larr; Back to all providers
          </Link>
          
          {provider && (
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <div className="flex items-center mb-6">
                <img
                  src={provider.profileImageUrl || "https://placehold.co/100x100/E0E0E0/757575?text=Logo"}
                  alt={provider.companyName}
                  className="w-24 h-24 rounded-full mr-6 object-cover"
                />
                <div>
                  <h1 className="text-4xl font-extrabold text-gray-900">{provider.companyName}</h1>
                  <p className="text-gray-600 text-lg">{provider.description}</p>
                </div>
              </div>
              <div className="flex items-center text-gray-700 text-sm mb-4">
                <span className="bg-yellow-500 text-white text-sm font-bold px-2 py-1 rounded-full mr-2">
                  {provider.rating.toFixed(1)} ★
                </span>
                <span>({provider.totalReviews} reviews)</span>
              </div>
              <p className="text-gray-600">
                <span className="font-semibold">Locations:</span> {provider.serviceLocations?.join(', ')}
              </p>
              {provider.website && (
                <Link href={provider.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mt-2 inline-block">
                  Visit Website
                </Link>
              )}
            </div>
          )}

          <h2 className="text-3xl font-bold text-gray-900 mb-6">Services Offered</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.length > 0 ? (
              services.map((service) => (
                <div key={service.id} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <p className="text-lg font-semibold text-green-700 mb-4">
                    Est. Price: ${service.priceMin}
                    {service.priceMax && service.priceMax !== service.priceMin ? ` - $${service.priceMax}` : ''}
                  </p>
                  <button
                    onClick={() => handleSendQuoteClick(service.id)}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-md text-sm font-semibold hover:bg-green-700 transition duration-200"
                  >
                    Send Quote for This Service
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-600 col-span-full">This provider has not listed any services yet.</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}