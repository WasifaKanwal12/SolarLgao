"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/config";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditServicePage({ params }) {
  const { serviceId } = params;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priceMin: "",
    priceMax: "",
    features: "",
    estimatedCompletionTime: "",
    status: "active",
    imageUrl: [], // Holds existing image URLs
  });
  const [newImageFiles, setNewImageFiles] = useState([]); // Holds newly uploaded files
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/signin");
        return;
      }
      setUser(currentUser);
      await fetchService(currentUser.uid, serviceId);
    });
    return () => unsubscribe();
  }, [router, serviceId]);

  const fetchService = async (providerId, id) => {
    try {
      const res = await fetch(`/api/services/${id}`);
      if (!res.ok) throw new Error("Failed to fetch service.");
      const data = await res.json();
      const service = data.service;
      if (service.providerId !== providerId) {
        throw new Error("You do not have permission to edit this service.");
      }
      setFormData({
        title: service.title || "",
        description: service.description || "",
        priceMin: service.priceMin !== undefined ? service.priceMin.toString() : "",
        priceMax: service.priceMax !== undefined ? service.priceMax.toString() : "",
        features: service.features ? service.features.join(", ") : "",
        estimatedCompletionTime: service.estimatedCompletionTime || "",
        status: service.status || "active",
        imageUrl: service.imageUrl || [], // Initialize with existing images
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching service:", err);
      setError(err.message);
      setLoading(false);
    }
  };

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

  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImageFiles((prevFiles) => [...prevFiles, ...files]);
  };

  const handleRemoveExistingImage = (indexToRemove) => {
    setFormData((prevData) => ({
      ...prevData,
      imageUrl: prevData.imageUrl.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleRemoveNewImage = (indexToRemove) => {
    setNewImageFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to update a service.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    let base64NewImages = [];
    if (newImageFiles.length > 0) {
      try {
        base64NewImages = await Promise.all(newImageFiles.map(file => convertToBase64(file)));
      } catch (err) {
        setError("Failed to convert new images to Base64.");
        setIsSubmitting(false);
        return;
      }
    }

    const updatedServiceData = {
      ...formData,
      priceMin: parseFloat(formData.priceMin),
      priceMax: formData.priceMax ? parseFloat(formData.priceMax) : null,
      features: formData.features.split(",").map((f) => f.trim()).filter((f) => f),
      imageUrl: [...formData.imageUrl, ...base64NewImages], // Combine old and new images
      updatedAt: new Date(),
    };

    try {
      const res = await fetch(`/api/services/${serviceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedServiceData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update service.");
      }

      alert("Service updated successfully!");
      router.push("/provider/services");
    } catch (err) {
      console.error("Error updating service:", err);
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

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="flex-1 p-6 md:p-8 bg-gray-100">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">Edit Service</h1>
        <Link href="/provider/services" className="text-blue-600 hover:underline">
          Back to Services
        </Link>
      </header>

      <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
        {error && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ... (form fields like title, description, price, etc. remain the same) */}
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

          {/* New Image Handling Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Images</label>
            {formData.imageUrl && formData.imageUrl.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {formData.imageUrl.map((imageUrl, index) => (
                  <div key={index} className="relative w-24 h-24">
                    <img
                      src={imageUrl}
                      alt={`Service Image ${index + 1}`}
                      className="w-full h-full object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs -mt-1 -mr-1"
                    >
                      &#x2715;
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No images currently saved.</p>
            )}
          </div>

          <div>
            <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700 mt-4">Add New Images</label>
            <input
              type="file"
              id="imageUpload"
              name="imageUpload"
              accept="image/*"
              multiple
              onChange={handleNewImageChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {newImageFiles.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                <p className="font-medium">New files to be added:</p>
                <ul className="list-disc list-inside">
                  {newImageFiles.map((file, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span>{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(index)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        &#x2715;
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {/* ... (remaining form fields) */}
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
            {isSubmitting ? "Updating Service..." : "Update Service"}
          </button>
        </form>
      </div>
    </div>
  );
}