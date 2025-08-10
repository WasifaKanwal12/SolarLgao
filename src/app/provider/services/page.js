"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/config";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export default function ProviderServicesPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/signin");
        return;
      }
      setUser(currentUser);
      await fetchProviderServices(currentUser.uid);
    });

    return () => unsubscribe();
  }, [router]);

  const fetchProviderServices = async (providerId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/services?providerId=${providerId}`);
      if (!res.ok) throw new Error("Failed to fetch services.");
      const data = await res.json();
      setServices(data.services);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching services:", err);
      setError("Failed to load services. Please try again.");
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      const res = await fetch(`/api/services/${serviceId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete service.");

      setServices(services.filter((service) => service.id !== serviceId));
      alert("Service deleted successfully!");
    } catch (err) {
      console.error("Error deleting service:", err);
      alert("Failed to delete service: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  const ServiceCard = ({ service, onDelete }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const nextImage = () => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % service.imageUrl.length);
    };

    const prevImage = () => {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + service.imageUrl.length) % service.imageUrl.length);
    };

    const hasMultipleImages = service.imageUrl && service.imageUrl.length > 1;

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden relative">
        <div className="relative w-full h-48">
          <img
            src={service.imageUrl[currentImageIndex] || "https://via.placeholder.com/400x250?text=Service+Image"}
            alt={service.title}
            className="w-full h-full object-cover"
          />
          {hasMultipleImages && (
            <>
              <button
                onClick={prevImage}
                className="absolute top-1/2 left-2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute top-1/2 right-2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
        <div className="p-5">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{service.title}</h2>
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">{service.description}</p>
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-bold text-green-700">
              Pkr{service.priceMin} {service.priceMax ? `- Pkr${service.priceMax}` : ''}
            </span>
            <span className={`text-sm px-3 py-1 rounded-full ${service.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {service.status}
            </span>
          </div>
          <div className="flex space-x-2">
            <Link href={`/provider/services/${service.id}`} className="flex-1 text-center bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors">
              Edit
            </Link>
            <button
              onClick={() => onDelete(service.id)}
              className="flex-1 text-center bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 p-6 md:p-8 bg-gray-100">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">Your Services</h1>
        <Link href="/provider/services/create" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          Add New Service
        </Link>
      </header>

      {services.length === 0 ? (
        <div className="p-8 text-center text-gray-700 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-lg mb-4">You haven't listed any services yet.</p>
          <Link href="/provider/services/create" className="text-blue-600 hover:underline">
            Click here to add your first service!
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} onDelete={handleDeleteService} />
          ))}
        </div>
      )}
    </div>
  );
}