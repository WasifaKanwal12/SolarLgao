// app/provider/profile/page.js
"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/config";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { convertToBase64 } from "@/lib/fileUtils";
import Image from "next/image";
// Corrected import path for public assets
const placeholderImage = "/placeholder-user.png"; // Assuming placeholder.svg is directly in your public folder

// Import Header and Footer components
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ProviderProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    companyName: "",
    registrationNumber: "",
    contactNumber: "",
    companyAddress: "",
    description: "",
    website: "",
    profileImageUrl: "", // Existing profile image URL
    certificateUrl: "", // Existing certificate URL
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [certificateFile, setCertificateFile] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const router = useRouter();

  // Define navigation items specific to the provider section
  const providerNavItems = [
    { name: "Dashboard", href: "/provider/dashboard" }, // Assuming you have a provider dashboard
    { name: "My Profile", href: "/provider/profile" },
    { name: "Quotes", href: "/provider/quotes" },
    { name: "Orders", href: "/provider/orders" },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/signin");
        return;
      }
      setUser(currentUser);
      await fetchProviderData(currentUser.uid);
    });
    return () => unsubscribe();
  }, [router]);

  const fetchProviderData = async (uid) => {
    try {
      const userRes = await fetch(`/api/users/${uid}`);
      if (!userRes.ok) throw new Error("Failed to fetch user data.");
      const userData = await userRes.json();
      if (userData.user.role !== "provider") {
        router.push("/unauthorized");
        return;
      }

      const providerRes = await fetch(`/api/providers/${uid}`);
      if (!providerRes.ok) throw new Error("Failed to fetch provider data.");
      const providerData = await providerRes.json();

      setFormData({
        companyName: providerData.provider.companyName || "",
        registrationNumber: providerData.provider.registrationNumber || "",
        contactNumber: providerData.provider.contactNumber || "",
        companyAddress: providerData.provider.companyAddress || "",
        description: providerData.provider.description || "",
        website: providerData.provider.website || "",
        profileImageUrl: providerData.provider.profileImageUrl || "",
        certificateUrl: providerData.provider.certificateUrl || "",
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching provider data:", err);
      setError("Failed to load profile data. Please try again.");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    let fileErrorMessage = "";
    if (file) {
      const validTypes = ["image/png", "image/jpeg"];
      if (!validTypes.includes(file.type)) {
        fileErrorMessage = "Only PNG and JPG images are allowed.";
        if (fileType === 'certificate') setCertificateFile(null);
        if (fileType === 'profileImage') setProfileImageFile(null);
      } else if (file.size > 1024 * 1024) { // 1MB in bytes
        fileErrorMessage = "Image must be 1MB or smaller.";
        if (fileType === 'certificate') setCertificateFile(null);
        if (fileType === 'profileImage') setProfileImageFile(null);
      } else {
        if (fileType === 'certificate') setCertificateFile(file);
        if (fileType === 'profileImage') setProfileImageFile(file);
      }
    } else {
      if (fileType === 'certificate') setCertificateFile(null);
      if (fileType === 'profileImage') setProfileImageFile(null);
    }
    setFieldErrors((prev) => ({ ...prev, [`${fileType}File`]: fileErrorMessage }));
    setError(fileErrorMessage); // Set general error if file is invalid
  };

  const validateField = (name, value) => {
    let message = "";
    if (["companyName", "registrationNumber", "contactNumber", "companyAddress"].includes(name) && value.trim() === "") {
      message = "This field is required.";
    }
    setFieldErrors((prev) => ({ ...prev, [name]: message }));
  };

  const validateAllFields = () => {
    const errors = {};
    if (formData.companyName.trim() === "") errors.companyName = "Company Name is required.";
    if (formData.registrationNumber.trim() === "") errors.registrationNumber = "Registration Number is required.";
    if (formData.contactNumber.trim() === "") errors.contactNumber = "Contact Number is required.";
    if (formData.companyAddress.trim() === "") errors.companyAddress = "Company Address is required.";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");
    setFieldErrors({});

    const currentErrors = validateAllFields();
    if (Object.keys(currentErrors).length > 0) {
      setFieldErrors(currentErrors);
      setError("Please correct the highlighted fields and fill all required information.");
      setLoading(false);
      return;
    }

    try {
      let profileImageBase64 = formData.profileImageUrl;
      if (profileImageFile) {
        profileImageBase64 = await convertToBase64(profileImageFile);
      }

      let certificateBase64 = formData.certificateUrl;
      if (certificateFile) {
        certificateBase64 = await convertToBase64(certificateFile);
      }

      const response = await fetch(`/api/users/${user.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'provider', // Explicitly state role for API to route correctly
          companyName: formData.companyName,
          registrationNumber: formData.registrationNumber,
          contactNumber: formData.contactNumber,
          companyAddress: formData.companyAddress,
          description: formData.description,
          website: formData.website,
          profileImageUrl: profileImageBase64,
          certificateUrl: certificateBase64,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }

      setSuccessMessage("Profile updated successfully!");
      setFormData((prev) => ({
        ...prev,
        profileImageUrl: profileImageBase64,
        certificateUrl: certificateBase64,
      }));
      setProfileImageFile(null); // Clear file input
      setCertificateFile(null); // Clear file input
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err.message || "An unexpected error occurred during profile update.");
    } finally {
      setLoading(false);
    }
  };

  const RequiredAsterisk = () => <span className="text-red-500">*</span>;

  // --- Common structure for all states (loading, error, content) ---
  // This ensures Header and Footer are always present

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header navItems={providerNavItems} userType="provider" />
        <main className="flex-1 pt-16 bg-gray-50 flex justify-center items-center">
          <div className="loader"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error && !successMessage) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header navItems={providerNavItems} userType="provider" />
        <main className="flex-1 pt-16 bg-gray-50 p-8 text-center text-red-600">
          <p>{error}</p>
          <button onClick={() => fetchProviderData(user.uid)} className="btn-primary mt-4">
            Retry
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header navItems={providerNavItems} userType="provider" />
      <main className="flex-1 pt-16 bg-gray-50 overflow-y-auto">
        <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>
          <p className="text-gray-600 mb-8">
            Update your company information, services, and contact details.
          </p>

          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Profile Image
              </label>
              <div className="mt-1 flex items-center">
                {formData.profileImageUrl ? (
                  <Image
                    src={profileImageFile ? URL.createObjectURL(profileImageFile) : formData.profileImageUrl}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="rounded-full object-cover h-24 w-24 border border-gray-300"
                  />
                ) : (
                  <Image
                    src={placeholderImage} // Use the corrected placeholder path
                    alt="Placeholder"
                    width={96}
                    height={96}
                    className="rounded-full object-cover h-24 w-24 border border-gray-300"
                  />
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(e) => handleFileChange(e, 'profileImage')}
                  className={`ml-5 block w-full text-sm text-gray-900 border ${
                    fieldErrors.profileImageFile ? "border-red-500" : "border-gray-300"
                  } rounded-lg cursor-pointer bg-gray-50 focus:outline-none`}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Upload a new profile image (PNG/JPG, ≤ 1MB).
              </p>
              {fieldErrors.profileImageFile && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.profileImageFile}</p>
              )}
            </div>

            {/* Certificate of Incorporation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Certificate of Incorporation
              </label>
              <div className="mt-1 flex items-center">
                {formData.certificateUrl ? (
                  // Display a preview if it's an image, otherwise a link or text
                  formData.certificateUrl.startsWith('data:image') || certificateFile ? (
                    <Image
                      src={certificateFile ? URL.createObjectURL(certificateFile) : formData.certificateUrl}
                      alt="Certificate"
                      width={150} // Adjust width as needed for certificate preview
                      height={100} // Adjust height as needed for certificate preview
                      className="object-contain h-24 w-auto border border-gray-300"
                    />
                  ) : (
                    // If it's a URL to an external certificate, provide a link
                    <a href={formData.certificateUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                      View Current Certificate
                    </a>
                  )
                ) : (
                  <p className="text-sm text-gray-600">No certificate uploaded</p>
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(e) => handleFileChange(e, 'certificate')}
                  className={`ml-5 block w-full text-sm text-gray-900 border ${
                    fieldErrors.certificateFile ? "border-red-500" : "border-gray-300"
                  } rounded-lg cursor-pointer bg-gray-50 focus:outline-none`}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Upload a new certificate (PNG/JPG, ≤ 1MB) if needed.
              </p>
              {fieldErrors.certificateFile && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.certificateFile}</p>
              )}
            </div>


            {/* Company Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name <RequiredAsterisk />
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md ${
                  fieldErrors.companyName ? "border-red-500" : "border-gray-300"
                }`}
              />
              {fieldErrors.companyName && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.companyName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Number/NTN <RequiredAsterisk />
              </label>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md ${
                  fieldErrors.registrationNumber ? "border-red-500" : "border-gray-300"
                }`}
              />
              {fieldErrors.registrationNumber && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.registrationNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number <RequiredAsterisk />
              </label>
              <input
                type="text"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md ${
                  fieldErrors.contactNumber ? "border-red-500" : "border-gray-300"
                }`}
              />
              {fieldErrors.contactNumber && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.contactNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Address <RequiredAsterisk />
              </label>
              <textarea
                name="companyAddress"
                value={formData.companyAddress}
                onChange={handleChange}
                rows="3"
                className={`w-full px-4 py-2 border rounded-md ${
                  fieldErrors.companyAddress ? "border-red-500" : "border-gray-300"
                }`}
              />
              {fieldErrors.companyAddress && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.companyAddress}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website (Optional)
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md text-white bg-primary-green hover:bg-green-700 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}