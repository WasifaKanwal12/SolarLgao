// src/app/customer/request-quote/page.js
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { auth } from "@/lib/config";
import { onAuthStateChanged } from "firebase/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export const dynamic = 'force-dynamic';
export default function RequestQuotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const providerId = searchParams.get('providerId');
  const serviceId = searchParams.get('serviceId');

  const [user, setUser] = useState(null);
  const [provider, setProvider] = useState(null);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerContact: "",
    customerAddress: "",
    propertyType: "",
    roofType: "",
    powerRequirement: "",
    message: "",
  });

  // Nav items for the header
  const customerNavItems = [
    { name: "Home", href: "/customer" },
    { name: "My Quotes", href: "/customer/quotes" },
    { name: "My Orders", href: "/customer/orders" },
    { name: "Request Quote", href: "/customer/request-quote" },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/signin");
        return;
      }
      setUser(currentUser);
      setFormData(prev => ({ ...prev, customerEmail: currentUser.email || "" }));

      if (!providerId || !serviceId) {
        setError("Missing provider or service information for the quote.");
        setLoading(false);
        return;
      }

      try {
        // Fetch provider data
        const providerRes = await fetch(`/api/providers/${providerId}`);
        if (!providerRes.ok) throw new Error("Failed to fetch provider data.");
        const providerData = await providerRes.json();
        setProvider(providerData.provider);

        // Fetch service data
        const serviceRes = await fetch(`/api/services/${serviceId}`);
        if (!serviceRes.ok) throw new Error("Failed to fetch service data.");
        const serviceData = await serviceRes.json();
        setService(serviceData.service);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data for quote form:", err);
        setError("Failed to load necessary data for the quote form. " + err.message);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, providerId, serviceId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !providerId || !serviceId) {
      alert("Error: Missing user or service/provider details.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const quotePayload = {
      customerId: user.uid,
      providerId: providerId,
      serviceId: serviceId,
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerContact: formData.customerContact,
      customerAddress: formData.customerAddress,
      propertyType: formData.propertyType,
      roofType: formData.roofType,
      powerRequirement: formData.powerRequirement,
      message: formData.message,
    };

    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quotePayload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to send quote request.");
      }

      alert("Quote request sent successfully! The provider will be in touch soon.");
      router.push("/customer/quotes"); // Redirect to My Quotes page
    } catch (err) {
      console.error("Error sending quote:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header navItems={customerNavItems} userType="customer" />
        <main className="flex-1 pt-16 bg-gray-50 flex justify-center items-center">
          <div className="loader"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header navItems={customerNavItems} userType="customer" />
        <main className="flex-1 pt-16 bg-gray-50 p-8 text-center text-red-600">
          <p>{error}</p>
          <Link href="/customer" className="btn-primary mt-4">Back to Providers</Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (!provider || !service) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header navItems={customerNavItems} userType="customer" />
        <main className="flex-1 pt-16 bg-gray-50 p-8 text-center text-gray-700">
          <p>Could not load provider or service details. Please try again from the home page.</p>
          <Link href="/customer" className="btn-primary mt-4">Back to Providers</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header navItems={customerNavItems} userType="customer" />
      <main className="flex-1 pt-16 bg-gray-50 p-6 md:p-8">
        <div className="container mx-auto max-w-3xl bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Request a Quote</h1>
          <p className="text-center text-gray-600 mb-6">
            Sending a quote request to <span className="font-bold">{provider.companyName}</span> for their service: <span className="font-bold">{service.title}</span>.
          </p>

          {error && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">Your Full Name</label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700">Your Email</label>
                <input
                  type="email"
                  id="customerEmail"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  required
                  readOnly // Email should be pre-filled and non-editable for logged-in users
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>
            <div>
              <label htmlFor="customerContact" className="block text-sm font-medium text-gray-700">Contact Number</label>
              <input
                type="tel"
                id="customerContact"
                name="customerContact"
                value={formData.customerContact}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="customerAddress" className="block text-sm font-medium text-gray-700">Property Address</label>
              <input
                type="text"
                id="customerAddress"
                name="customerAddress"
                value={formData.customerAddress}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700">Property Type</label>
                <select
                  id="propertyType"
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="roofType" className="block text-sm font-medium text-gray-700">Roof Type</label>
                <select
                  id="roofType"
                  name="roofType"
                  value={formData.roofType}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="Pitched">Pitched</option>
                  <option value="Flat">Flat</option>
                  <option value="Ground Mount">Ground Mount</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="powerRequirement" className="block text-sm font-medium text-gray-700">Estimated Power Requirement (kW)</label>
              <input
                type="text"
                id="powerRequirement"
                name="powerRequirement"
                value={formData.powerRequirement}
                onChange={handleChange}
                placeholder="e.g., 5kW, 10kW, Off-grid for cabin"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">Your Message / Specific Request</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                placeholder="Tell the provider more about your needs..."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending Quote..." : "Send Quote Request"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}