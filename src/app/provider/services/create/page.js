"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/config";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateServicePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priceMin: "",
    priceMax: "",
    imageUrl: "", // This will now store the Base64 string
    features: "",
    estimatedCompletionTime: "",
    status: "active",
  });
  const [imageFile, setImageFile] = useState(null); // New state for the image file
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/signin");
        return;
      }
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to create a service.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    let base64Image = "";
    if (imageFile) {
      try {
        base64Image = await convertToBase64(imageFile);
      } catch (err) {
        setError("Failed to convert image to Base64.");
        setIsSubmitting(false);
        return;
      }
    }

    const serviceData = {
      ...formData,
      providerId: user.uid,
      priceMin: parseFloat(formData.priceMin),
      priceMax: formData.priceMax ? parseFloat(formData.priceMax) : null,
      features: formData.features.split(",").map((f) => f.trim()).filter((f) => f),
      imageUrl: base64Image, // Use the Base64 string here
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(serviceData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create service.");
      }

      alert("Service created successfully!");
      router.push("/provider/services");
    } catch (err) {
      console.error("Error creating service:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 bg-gray-100">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">Create New Service</h1>
        <Link href="/provider/services" className="text-blue-600 hover:underline">
          Back to Services
        </Link>
      </header>

      <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
        {error && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Service Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="priceMin" className="block text-sm font-medium text-gray-700">Min Price ($)</label>
              <input
                type="number"
                id="priceMin"
                name="priceMin"
                value={formData.priceMin}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="priceMax" className="block text-sm font-medium text-gray-700">Max Price ($) (Optional)</label>
              <input
                type="number"
                id="priceMax"
                name="priceMax"
                value={formData.priceMax}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700">Upload Image</label>
            <input
              type="file"
              id="imageUpload"
              name="imageUpload"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {imageFile && (
              <p className="mt-2 text-sm text-gray-600">Selected file: {imageFile.name}</p>
            )}
             {/* Optional: Display a preview of the image if it's already a base64 string or an object URL from file */}
            {formData.imageUrl && !imageFile && (
              <img src={formData.imageUrl} alt="Service Preview" className="mt-4 max-h-48 object-contain" />
            )}
          </div>
          <div>
            <label htmlFor="features" className="block text-sm font-medium text-gray-700">Features (comma-separated)</label>
            <input
              type="text"
              id="features"
              name="features"
              value={formData.features}
              onChange={handleChange}
              placeholder="e.g., On-site consultation, 5-year warranty"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="estimatedCompletionTime" className="block text-sm font-medium text-gray-700">Estimated Completion Time</label>
            <input
              type="text"
              id="estimatedCompletionTime"
              name="estimatedCompletionTime"
              value={formData.estimatedCompletionTime}
              onChange={handleChange}
              placeholder="e.g., 3-5 days, 2 weeks"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating Service..." : "Create Service"}
          </button>
        </form>
      </div>
    </div>
  );
}