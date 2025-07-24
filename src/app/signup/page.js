// app/signup/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { convertToBase64 } from "@/lib/fileUtils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthSuccess from "@/components/AuthSuccess";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { auth } from "@/lib/config";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";

export default function SignUp() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "customer",
    companyName: "",
    registrationNumber: "",
    contactNumber: "",
    companyAddress: "",
    servicesOffered: "",
    serviceLocations: "",
    description: "", // Added description field
    website: "", // Added website field
  });
  const [certificateFile, setCertificateFile] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null); // New for profile image
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&()?.\\-])[A-Za-z\d@$!%*?&()?.\\-]{8,}$/;
  const personalDomains = ["gmail.com", "yahoo.com", "outlook.com"];
  const allowedTLDs = ["com", "net", "org", "pk", "edu", "gov", "co"];

  const validateField = (name, value, currentFormData) => {
    let message = "";

    switch (name) {
      case "firstName":
      case "lastName":
        if (value.trim() === "") message = "This field is required.";
        break;
      case "email":
        if (value.trim() === "") {
          message = "Email is required.";
        } else if (!emailRegex.test(value)) {
          message = "Please enter a valid email format.";
        } else {
          const email = value.toLowerCase();
          const [, domain] = email.split("@");
          const domainParts = domain ? domain.split(".") : [];
          const tld = domainParts.length > 0 ? domainParts[domainParts.length - 1] : "";

          if (!allowedTLDs.includes(tld)) {
            message = `Invalid domain extension ".${tld}".`;
          } else if (currentFormData.userType === "customer" && !personalDomains.includes(domain)) {
            message = "Customers must use a personal email like Gmail, Yahoo, or Outlook.";
          }
        }
        break;
      case "password":
        if (value.trim() === "") {
          message = "Password is required.";
        } else if (!passwordRegex.test(value)) {
          message = "Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character (@$!%*?&).";
        }
        break;
      case "confirmPassword":
        if (value.trim() === "") {
          message = "Confirm password is required.";
        } else if (value !== currentFormData.password) {
          message = "Passwords do not match.";
        }
        break;
      case "companyName":
      case "contactNumber":
      case "companyAddress":
      case "servicesOffered":
      case "serviceLocations":
        if (currentFormData.userType === "provider" && value.trim() === "") {
          message = "This company detail is required.";
        }
        break;
      // registrationNumber and certificateFile are no longer required for validation here
      default:
        break;
    }
    setFieldErrors((prev) => ({ ...prev, [name]: message }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedFormData = { ...prev, [name]: value };
      validateField(name, value, updatedFormData);
      return updatedFormData;
    });
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
      // If no file is selected, clear the file and any previous error for that file type
      if (fileType === 'certificate') setCertificateFile(null);
      if (fileType === 'profileImage') setProfileImageFile(null);
    }
    setFieldErrors((prev) => ({ ...prev, [`${fileType}File`]: fileErrorMessage }));
    setError(fileErrorMessage); // General error for file
  };

  const validateAllFields = (data) => {
    const errors = {};
    if (data.firstName.trim() === "") errors.firstName = "First Name is required.";
    if (data.lastName.trim() === "") errors.lastName = "Last Name is required.";

    if (data.email.trim() === "") {
      errors.email = "Email is required.";
    } else if (!emailRegex.test(data.email)) {
      errors.email = "Please enter a valid email format.";
    } else {
      const email = data.email.toLowerCase();
      const [, domain] = email.split("@");
      const domainParts = domain ? domain.split(".") : [];
      const tld = domainParts.length > 0 ? domainParts[domainParts.length - 1] : "";
      if (!allowedTLDs.includes(tld)) {
        errors.email = `Invalid domain extension ".${tld}". Please use a common TLD.`;
      } else if (data.userType === "customer" && !personalDomains.includes(domain)) {
        errors.email = "Customers must use a personal email like Gmail, Yahoo, or Outlook.";
      }
    }

    if (data.password.trim() === "") {
      errors.password = "Password is required.";
    } else if (!passwordRegex.test(data.password)) {
      errors.password = "Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character (@$!%*?&).";
    }

    if (data.confirmPassword.trim() === "") {
      errors.confirmPassword = "Confirm password is required.";
    } else if (data.confirmPassword !== data.password) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (data.userType === "provider") {
      if (data.companyName.trim() === "") errors.companyName = "Company Name is required.";
      // registrationNumber is now optional, no validation here
      if (data.contactNumber.trim() === "") errors.contactNumber = "Contact Number is required.";
      if (data.companyAddress.trim() === "") errors.companyAddress = "Company Address is required.";
      if (data.servicesOffered.trim() === "") errors.servicesOffered = "Services Offered are required.";
      if (data.serviceLocations.trim() === "") errors.serviceLocations = "Service Locations are required.";
      // certificateFile is now optional, no validation here for it being present

      // If a certificate file is provided but has an error (e.g., wrong type/size), keep that error
      if (certificateFile && fieldErrors.certificateFile) {
        errors.certificateFile = fieldErrors.certificateFile;
      }
      if (profileImageFile && fieldErrors.profileImageFile) {
        errors.profileImageFile = fieldErrors.profileImageFile;
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});

    const currentErrors = validateAllFields(formData);
    if (Object.keys(currentErrors).length > 0) {
      setFieldErrors(currentErrors);
      // Only set a general error message if there are actual validation errors, not just optional file warnings
      const hasRequiredFieldErrors = Object.keys(currentErrors).some(key =>
        !(key === 'certificateFile' || key === 'profileImageFile' || key === 'registrationNumber')
      );
      if (hasRequiredFieldErrors) {
        setError("Please correct the highlighted fields and fill all required information.");
      } else if (currentErrors.certificateFile || currentErrors.profileImageFile) {
        // If only file errors, display a specific message
        setError("Please correct file upload issues (e.g., file type or size).");
      }
      setLoading(false);
      return;
    }

    try {
      let certificateBase64 = null;
      if (formData.userType === "provider" && certificateFile) {
        certificateBase64 = await convertToBase64(certificateFile);
      }

      let profileImageBase64 = null;
      if (formData.userType === "provider" && profileImageFile) {
        profileImageBase64 = await convertToBase64(profileImageFile);
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      await sendEmailVerification(userCredential.user);

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: userCredential.user.uid,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          userType: formData.userType,
          companyName: formData.userType === "provider" ? formData.companyName : undefined,
          registrationNumber: formData.userType === "provider" ? formData.registrationNumber : undefined, // Now optional
          contactNumber: formData.userType === "provider" ? formData.contactNumber : undefined,
          companyAddress: formData.userType === "provider" ? formData.companyAddress : undefined,
          servicesOffered: formData.userType === "provider" ? formData.servicesOffered.split(',').map(s => s.trim()) : undefined,
          serviceLocations: formData.userType === "provider" ? formData.serviceLocations.split(',').map(l => l.trim()) : undefined,
          description: formData.userType === "provider" ? formData.description : undefined, // Include description
          website: formData.userType === "provider" ? formData.website : undefined, // Include website
          certificateBase64: formData.userType === "provider" ? certificateBase64 : undefined, // Now optional
          profileImageBase64: formData.userType === "provider" ? profileImageBase64 : undefined, // Include profile image base64
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        await userCredential.user.delete();
        throw new Error(data.error || "Failed to create account.");
      }

      setSuccessMessage(data.message || "Account created successfully! Please check your email for verification.");
      setRedirectUrl(data.redirectUrl || "/verify-email");
      setSuccess(true);
    } catch (error) {
      console.error("Signup error:", error);
      if (error.code && error.code === "auth/email-already-in-use") {
        setError("This email address is already in use. Please sign in or use a different email.");
        setFieldErrors(prev => ({ ...prev, email: "Email already registered." }));
      } else if (error.code && error.code === "auth/weak-password") {
        setError("The password provided is too weak. Please use a stronger password.");
        setFieldErrors(prev => ({ ...prev, password: "Password is too weak." }));
      } else {
        setError(error.message || "Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return <AuthSuccess message={successMessage} redirectUrl={redirectUrl} />;
  }

  const RequiredAsterisk = () => <span className="text-red-500">*</span>;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-primary-green p-6 text-center">
              <h2 className="text-2xl font-bold text-white">Create an Account</h2>
            </div>
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <RequiredAsterisk />
                  </label>
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    autoComplete="off"
                    className={`w-full px-4 py-2 border rounded-md text-black ${ // Added text-black
                      fieldErrors.firstName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {fieldErrors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <RequiredAsterisk />
                  </label>
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    autoComplete="off"
                    className={`w-full px-4 py-2 border rounded-md text-black ${ // Added text-black
                      fieldErrors.lastName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {fieldErrors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <RequiredAsterisk />
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="off"
                    className={`w-full px-4 py-2 border rounded-md text-black ${ // Added text-black
                      fieldErrors.email ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <RequiredAsterisk />
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="off"
                      className={`w-full px-4 py-2 border rounded-md text-black ${ // Added text-black
                        fieldErrors.password ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-2 text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password <RequiredAsterisk />
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      autoComplete="off"
                      className={`w-full px-4 py-2 border rounded-md text-black ${ // Added text-black
                        fieldErrors.confirmPassword ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-2 text-gray-500"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">I am a: <RequiredAsterisk /></label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="userType"
                        value="customer"
                        checked={formData.userType === "customer"}
                        onChange={handleChange}
                        autoComplete="off"
                        className="mr-2"
                      /> Customer
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="userType"
                        value="provider"
                        checked={formData.userType === "provider"}
                        onChange={handleChange}
                        autoComplete="off"
                        className="mr-2"
                      /> Service Provider
                    </label>
                  </div>
                </div>

                {formData.userType === "provider" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name <RequiredAsterisk />
                      </label>
                      <input
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        autoComplete="off"
                        className={`w-full px-4 py-2 border rounded-md text-black ${ // Added text-black
                          fieldErrors.companyName ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {fieldErrors.companyName && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.companyName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Registration Number/NTN (Optional)
                      </label>
                      <input
                        name="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={handleChange}
                        autoComplete="off"
                        className={`w-full px-4 py-2 border rounded-md text-black ${ // Added text-black
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
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        autoComplete="off"
                        className={`w-full px-4 py-2 border rounded-md text-black ${ // Added text-black
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
                        autoComplete="off"
                        rows="3"
                        className={`w-full px-4 py-2 border rounded-md text-black ${ // Added text-black
                          fieldErrors.companyAddress ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {fieldErrors.companyAddress && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.companyAddress}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Services Offered (comma-separated, e.g., Solar Panel Installation, Maintenance) <RequiredAsterisk />
                      </label>
                      <input
                        name="servicesOffered"
                        value={formData.servicesOffered}
                        onChange={handleChange}
                        autoComplete="off"
                        className={`w-full px-4 py-2 border rounded-md text-black ${ // Added text-black
                          fieldErrors.servicesOffered ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {fieldErrors.servicesOffered && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.servicesOffered}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Service Locations (comma-separated, e.g., Attock, Islamabad) <RequiredAsterisk />
                      </label>
                      <input
                        name="serviceLocations"
                        value={formData.serviceLocations}
                        onChange={handleChange}
                        autoComplete="off"
                        className={`w-full px-4 py-2 border rounded-md text-black ${ // Added text-black
                          fieldErrors.serviceLocations ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {fieldErrors.serviceLocations && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.serviceLocations}</p>
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
                        autoComplete="off"
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-black" // Added text-black
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
                        autoComplete="off"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-black" // Added text-black
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Certificate of Incorporation (PNG/JPG, ≤ 1MB) (Optional)
                      </label>
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={(e) => handleFileChange(e, 'certificate')}
                        autoComplete="off"
                        className={`w-full px-4 py-2 border rounded-md text-black ${ // Added text-black
                          fieldErrors.certificateFile ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Only PNG or JPG image. Max size: 1MB.
                      </p>
                      {fieldErrors.certificateFile && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.certificateFile}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Profile Image (PNG/JPG, ≤ 1MB) (Optional)
                      </label>
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={(e) => handleFileChange(e, 'profileImage')}
                        autoComplete="off"
                        className={`w-full px-4 py-2 border rounded-md text-black ${ // Added text-black
                          fieldErrors.profileImageFile ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Only PNG or JPG image. Max size: 1MB.
                      </p>
                      {fieldErrors.profileImageFile && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.profileImageFile}</p>
                      )}
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2 px-4 rounded-md text-white bg-primary-green hover:bg-green-700 ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Signing up..." : "Sign Up"}
                </button>
              </form>
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <a href="/signin" className="font-medium text-primary-green hover:underline">
                    Sign in
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