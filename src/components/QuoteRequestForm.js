// components/QuoteRequestForm.jsx
"use client";

import { useState } from "react";

export default function QuoteRequestForm({ onSubmit, showContactFields = false }) {
  const [formData, setFormData] = useState({
    serviceType: "",
    propertyType: "",
    roofType: "",
    avgMonthlyBill: "",
    solarPanelCount: "",
    installationDate: "",
    notes: "",
    customerName: "", // For anonymous requests
    customerEmail: "", // For anonymous requests
    customerPhone: "", // For anonymous requests
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let message = "";
    if (["serviceType", "propertyType", "roofType", "avgMonthlyBill", "installationDate"].includes(name) && value.trim() === "") {
      message = "This field is required.";
    }
    if (name === "solarPanelCount" && value.trim() !== "" && (isNaN(value) || parseInt(value) <= 0)) {
        message = "Please enter a valid number of panels.";
    }
    if (showContactFields) {
        if (name === "customerName" && value.trim() === "") message = "Your name is required.";
        if (name === "customerEmail" && value.trim() === "") message = "Your email is required.";
        if (name === "customerEmail" && value.trim() !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = "Invalid email format.";
        if (name === "customerPhone" && value.trim() === "") message = "Your phone number is required.";
    }
    setFieldErrors((prev) => ({ ...prev, [name]: message }));
  };

  const validateAllFields = () => {
    const errors = {};
    const requiredFields = ["serviceType", "propertyType", "roofType", "avgMonthlyBill", "installationDate"];
    requiredFields.forEach(field => {
      if (formData[field].trim() === "") {
        errors[field] = "This field is required.";
      }
    });
    if (formData.solarPanelCount.trim() !== "" && (isNaN(formData.solarPanelCount) || parseInt(formData.solarPanelCount) <= 0)) {
        errors.solarPanelCount = "Please enter a valid number of panels.";
    }
    if (showContactFields) {
        if (formData.customerName.trim() === "") errors.customerName = "Your name is required.";
        if (formData.customerEmail.trim() === "") errors.customerEmail = "Your email is required.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) errors.customerEmail = "Invalid email format.";
        if (formData.customerPhone.trim() === "") errors.customerPhone = "Your phone number is required.";
    }
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateAllFields();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      alert("Please correct the errors in the form.");
      return;
    }
    onSubmit(formData);
  };

  const RequiredAsterisk = () => <span className="text-red-500">*</span>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {showContactFields && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name <RequiredAsterisk />
            </label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md ${
                fieldErrors.customerName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {fieldErrors.customerName && <p className="text-red-500 text-xs mt-1">{fieldErrors.customerName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Email <RequiredAsterisk />
            </label>
            <input
              type="email"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md ${
                fieldErrors.customerEmail ? "border-red-500" : "border-gray-300"
              }`}
            />
            {fieldErrors.customerEmail && <p className="text-red-500 text-xs mt-1">{fieldErrors.customerEmail}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Phone Number <RequiredAsterisk />
            </label>
            <input
              type="tel"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md ${
                fieldErrors.customerPhone ? "border-red-500" : "border-gray-300"
              }`}
            />
            {fieldErrors.customerPhone && <p className="text-red-500 text-xs mt-1">{fieldErrors.customerPhone}</p>}
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Service Type <RequiredAsterisk />
        </label>
        <select
          name="serviceType"
          value={formData.serviceType}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md ${
            fieldErrors.serviceType ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Select service type</option>
          <option value="Solar Panel Installation">Solar Panel Installation</option>
          <option value="Solar Panel Maintenance">Solar Panel Maintenance</option>
          <option value="Inverter Repair">Inverter Repair</option>
          <option value="Battery Storage Installation">Battery Storage Installation</option>
          <option value="Consultation">Consultation</option>
        </select>
        {fieldErrors.serviceType && <p className="text-red-500 text-xs mt-1">{fieldErrors.serviceType}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Property Type <RequiredAsterisk />
        </label>
        <select
          name="propertyType"
          value={formData.propertyType}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md ${
            fieldErrors.propertyType ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Select property type</option>
          <option value="Residential">Residential</option>
          <option value="Commercial">Commercial</option>
          <option value="Industrial">Industrial</option>
        </select>
        {fieldErrors.propertyType && <p className="text-red-500 text-xs mt-1">{fieldErrors.propertyType}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Roof Type <RequiredAsterisk />
        </label>
        <select
          name="roofType"
          value={formData.roofType}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md ${
            fieldErrors.roofType ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Select roof type</option>
          <option value="Flat">Flat</option>
          <option value="Pitched">Pitched</option>
          <option value="Tiled">Tiled</option>
          <option value="Metal">Metal</option>
          <option value="Other">Other</option>
        </select>
        {fieldErrors.roofType && <p className="text-red-500 text-xs mt-1">{fieldErrors.roofType}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Average Monthly Electricity Bill (PKR) <RequiredAsterisk />
        </label>
        <input
          type="number"
          name="avgMonthlyBill"
          value={formData.avgMonthlyBill}
          onChange={handleChange}
          placeholder="e.g., 15000"
          className={`w-full px-4 py-2 border rounded-md ${
            fieldErrors.avgMonthlyBill ? "border-red-500" : "border-gray-300"
          }`}
        />
        {fieldErrors.avgMonthlyBill && <p className="text-red-500 text-xs mt-1">{fieldErrors.avgMonthlyBill}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Desired Number of Solar Panels (Optional)
        </label>
        <input
          type="number"
          name="solarPanelCount"
          value={formData.solarPanelCount}
          onChange={handleChange}
          placeholder="e.g., 10"
          className={`w-full px-4 py-2 border rounded-md ${
            fieldErrors.solarPanelCount ? "border-red-500" : "border-gray-300"
          }`}
        />
        {fieldErrors.solarPanelCount && <p className="text-red-500 text-xs mt-1">{fieldErrors.solarPanelCount}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Preferred Installation Date (Optional)
        </label>
        <input
          type="date"
          name="installationDate"
          value={formData.installationDate}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md ${
            fieldErrors.installationDate ? "border-red-500" : "border-gray-300"
          }`}
        />
        {fieldErrors.installationDate && <p className="text-red-500 text-xs mt-1">{fieldErrors.installationDate}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Additional Notes (Optional)
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="4"
          placeholder="Any specific requirements, concerns, or details about your property..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        ></textarea>
      </div>

      <button
        type="submit"
        className="w-full py-3 px-4 rounded-md text-white bg-primary-green hover:bg-green-700 transition-colors duration-300"
      >
        Submit Quote Request
      </button>
    </form>
  );
}