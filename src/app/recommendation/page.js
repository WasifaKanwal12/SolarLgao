"use client";

import { useState } from 'react';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Define a list of common appliances with average wattage (for display in dropdown)
const commonAppliances = [
  {name: "LED Bulb", watts: 10},
  {name: "Tube Light", watts: 40},
  {name: "Ceiling Fan", watts: 70},
  {name: "Table Fan", watts: 60},
  {name: "Inverter AC (1.5 Ton)", watts: 1200},
  {name: "Refrigerator (200 L)", watts: 725},
  {name: "Deep Freezer (200 L)", watts: 1080},
  {name: "Washing Machine", watts: 500},
  {name: "Clothes Iron", watts: 1400},
  {name: "Vacuum Cleaner", watts: 1000},
  {name: "Dishwasher", watts: 1800},
  {name: "Microwave Oven", watts: 1000},
  {name: "Electric Kettle", watts: 1500},
  {name: "Rice Cooker", watts: 700},
  {name: "Mixer Grinder", watts: 300},
  {name: "Electric Stove", watts: 1500},
  {name: "Deep-Well Pump", watts: 400},
  {name: "Water Dispenser", watts: 100},
  {name: "Electric Water Heater", watts: 4500},
  {name: "LED TV (32\")", watts: 60},
  {name: "Projector", watts: 170},
  {name: "Clock Radio", watts: 10},
  {name: "Set-Top Box", watts: 15},
  {name: "Desktop Computer", watts: 300},
  {name: "Laptop", watts: 60},
  {name: "Wi-Fi Router", watts: 15},
  {name: "UPS (Home Backup)", watts: 300},
  {name: "Sewing Machine", watts: 100},
  {name: "Smartphone Charger", watts: 5},
];

export default function RecommendationPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    systemType: '', // Will store 'On-Grid Solar', 'Hybrid Solar', 'Off-Grid Solar'
    location: '',
    electricity_kwh_per_month: '',
    appliances: [], // For selectable appliances from the list
  });
  const [customAppliances, setCustomAppliances] = useState([{ name: '', quantity: '', hoursPerDay: '' }]); // For custom appliances, start with one empty row
  const [inputMethod, setInputMethod] = useState(''); // 'kwh' or 'appliances'
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for appliances added from the predefined list
  const handleApplianceChange = (index, e) => {
    const { name, value } = e.target;
    const newAppliances = [...formData.appliances];
    newAppliances[index][name] = value;
    setFormData((prev) => ({ ...prev, appliances: newAppliances }));
  };

  // Handler for custom appliance inputs
  const handleCustomApplianceChange = (index, e) => {
    const { name, value } = e.target;
    const newCustomAppliances = [...customAppliances];
    newCustomAppliances[index][name] = value;
    setCustomAppliances(newCustomAppliances);
  };

  // Add a new row for predefined appliances
  const addAppliance = () => {
    setFormData((prev) => ({
      ...prev,
      appliances: [...prev.appliances, { name: '', quantity: '', hoursPerDay: '' }],
    }));
  };

  // Add a new row for custom appliances
  const addCustomApplianceRow = () => {
    setCustomAppliances((prev) => ([
      ...prev,
      { name: '', quantity: '', hoursPerDay: '' }
    ]));
  };

  // Remove a row from predefined appliances
  const removeAppliance = (index) => {
    const newAppliances = formData.appliances.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, appliances: newAppliances }));
  };

  // Remove a row from custom appliances
  const removeCustomAppliance = (index) => {
    const newCustomAppliances = customAppliances.filter((_, i) => i !== index);
    setCustomAppliances(newCustomAppliances);
  };

  const nextStep = () => {
    // Special handling for step 3 (input method selection)
    if (step === 3) {
      if (!inputMethod) return; // Prevent moving forward if no method is selected
      if (inputMethod === 'kwh') {
        setStep(4); // Skip appliance step
      } else if (inputMethod === 'appliances') {
        setStep(5); // Go to appliance step
      }
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (step === 6) { // If currently on the recommendations step
      if (inputMethod === 'kwh') {
        setStep(4); // Go back to KWH input if that was the method
      } else { // inputMethod === 'appliances'
        setStep(5); // Go back to appliances input if that was the method
      }
    } else if (step === 5 || step === 4) { // If on KWH input or Appliances input
      setStep(3); // Always go back to input method selection (Step 3)
    } else { // For all other steps (1, 2, 3)
      setStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setApiError(null);
    setRecommendations([]);

    try {
      // Map frontend systemType to backend expected values
      let backendSystemType;
      if (formData.systemType === 'On-Grid Solar') {
        backendSystemType = 'Grid-Tie';
      } else if (formData.systemType === 'Hybrid Solar') {
        backendSystemType = 'Grid-Tie + Batteries';
      } else if (formData.systemType === 'Off-Grid Solar') {
        backendSystemType = 'Off-Grid';
      } else {
        throw new Error("Invalid system type selected.");
      }

      let payload = {
        location: formData.location,
        system_type: backendSystemType, // Use the mapped system type
      };

      if (inputMethod === 'kwh') {
        payload.electricity_kwh_per_month = parseInt(formData.electricity_kwh_per_month);
        payload.appliances = null; // Ensure appliances array is null if not used
      } else { // inputMethod === 'appliances'
        const allAppliances = [
          ...formData.appliances.filter(app => app.name && app.quantity && app.hoursPerDay),
          ...customAppliances.filter(app => app.name && app.quantity && app.hoursPerDay)
        ].map(app => ({
          name: app.name,
          quantity: parseInt(app.quantity),
          hours: parseFloat(app.hoursPerDay)
          // wattage field is optional, so we omit it if not explicitly set by user.
          // The backend will handle its resolution.
        }));
        payload.appliances = allAppliances;
        payload.electricity_kwh_per_month = null; // Ensure this is null if not used
      }

      const response = await fetch('/api/recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get solar recommendation from server.');
      }

      const data = await response.json();
      // The backend now always returns a single object with a 'metrics' array,
      // so we can directly set it.
      if (data && Array.isArray(data.metrics)) {
        setRecommendations([data]); // Wrap it in an array to maintain consistency with previous state usage
      } else {
        throw new Error("Received unexpected data format from the recommendation API.");
      }
      setStep(6); // Move to the results step
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setApiError(error.message);
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadRecommendationsAsCsv = () => {
    if (!transformedRecommendations.length) {
      alert('No recommendations to download!');
      return;
    }

    const headers = ['Metric', 'Value'];
    const rows = [];
    transformedRecommendations.forEach((rec) => {
      Object.entries(rec).forEach(([key, metric]) => {
        // Only include actual metrics with description and unit
        if (metric && typeof metric.value !== 'undefined' && metric.description && metric.unit !== undefined) {
          const displayValue = metric.unit ? `${metric.value} ${metric.unit}` : metric.value;
          rows.push([metric.description, displayValue]);
        }
      });
      // Add a separator for multiple recommendations (though currently only one is expected)
      rows.push(['---', '---']);
    });
    // Remove the last separator
    if (rows.length > 0) {
      rows.pop();
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Solar_Recommendations_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Transform recommendations for display, extracting description and unit
  const transformedRecommendations = recommendations.map(rec => {
    const result = {};
    if (rec && Array.isArray(rec.metrics)) {
      rec.metrics.forEach(metric => {
        // Store the metric object with its description and unit
        result[metric.name] = {
          value: metric.value,
          unit: metric.unit,
          description: metric.description
        };
      });
    }
    return result;
  });


  // Determine if the submit button should be disabled
  const isSubmitDisabled = isLoading || (
    (inputMethod === 'appliances' &&
      formData.appliances.filter(app => app.name && app.quantity && app.hoursPerDay).length === 0 &&
      customAppliances.filter(app => app.name && app.quantity && app.hoursPerDay).length === 0) ||
    (inputMethod === 'kwh' && !formData.electricity_kwh_per_month) ||
    !formData.location || // Location must be filled for both methods
    !formData.systemType // System type must be selected
  );


  // Define total steps for progress bar
  const totalSteps = 6;
  const progressSteps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <>
      <Header />
      {/* Background image directly from public folder */}
      <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/homesection2.jpeg')" }}>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center">
          <div className="max-w-4xl w-full bg-white rounded-lg shadow-md p-6 bg-opacity-90">
            <h1 className="text-3xl font-bold text-center mb-8 text-green-700">Solar System Recommendation</h1>

            {/* Progress Bar */}
            <div className="flex justify-between mb-8">
              {progressSteps.map((s) => (
                <div key={s} className={`flex-1 text-center ${s <= step ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                   {s}
                  {s <= step && (
                    <div className="h-1 bg-green-600 mt-2 rounded-full mx-auto" style={{ width: '50%' }}></div>
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: System Type */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-black">Which type of system are you buying?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    type="button"
                    className={`p-4 border rounded-lg text-center ${formData.systemType === 'On-Grid Solar' ? 'bg-green-600 text-white' : 'bg-gray-100 text-black hover:bg-green-100'}`}
                    onClick={() => setFormData({ ...formData, systemType: 'On-Grid Solar' })}
                  >
                    <h3 className="font-semibold">On-Grid Solar</h3>
                    <p className="text-sm">Ideal for properties connected to the utility grid. It allows you to reduce your electricity bill by feeding excess power back into the grid.</p>
                  </button>
                  <button
                    type="button"
                    className={`p-4 border rounded-lg text-center ${formData.systemType === 'Hybrid Solar' ? 'bg-green-600 text-white' : 'bg-gray-100 text-black hover:bg-green-100'}`}
                    onClick={() => setFormData({ ...formData, systemType: 'Hybrid Solar' })}
                  >
                    <h3 className="font-semibold">Hybrid Solar</h3>
                    <p className="text-sm">Combines grid-tie benefits with battery storage. This system provides energy independence and backup power during grid outages, offering the best of both worlds.</p>
                  </button>
                  <button
                    type="button"
                    className={`p-4 border rounded-lg text-center ${formData.systemType === 'Off-Grid Solar' ? 'bg-green-600 text-white' : 'bg-gray-100 text-black hover:bg-green-100'}`}
                    onClick={() => setFormData({ ...formData, systemType: 'Off-Grid Solar' })}
                  >
                    <h3 className="font-semibold">Off-Grid Solar</h3>
                    <p className="text-sm">Designed for locations without access to the utility grid. It relies entirely on solar power and battery storage to meet all electricity demands, providing complete energy self-sufficiency.</p>
                  </button>
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!formData.systemType}
                    className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-green-200"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-black">Enter your location.</h2>
                <p className="text-gray-700 mb-4">Enter your location to get started. We'll look up the cost of electricity, average sun hours, and average energy usage in your area, and use those to calculate your system size.</p>
                <input
                  name="location"
                  placeholder="Location (e.g. Lahore, Pakistan)"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full border px-4 py-2 rounded text-black"
                  required
                />
                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!formData.location}
                    className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-green-200"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Input Method Selection */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-black">How would you like to calculate your energy needs?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    className={`p-4 border rounded-lg text-center ${inputMethod === 'kwh' ? 'bg-green-600 text-white' : 'bg-gray-100 text-black hover:bg-green-100'}`}
                    onClick={() => setInputMethod('kwh')}
                  >
                    <h3 className="font-semibold">By Monthly Electricity Consumption</h3>
                    <p className="text-sm">Provide your average monthly electricity bill in kWh.</p>
                  </button>
                  <button
                    type="button"
                    className={`p-4 border rounded-lg text-center ${inputMethod === 'appliances' ? 'bg-green-600 text-white' : 'bg-gray-100 text-black hover:bg-green-100'}`}
                    onClick={() => setInputMethod('appliances')}
                  >
                    <h3 className="font-semibold">By Listing Appliances</h3>
                    <p className="text-sm">List the appliances you use, their quantity, and hours of operation.</p>
                  </button>
                </div>
                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!inputMethod}
                    className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-green-200"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Monthly Electricity Consumption (Conditional) */}
            {step === 4 && inputMethod === 'kwh' && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-black">Enter your average monthly electricity consumption.</h2>
                <p className="text-gray-700 mb-4">Please provide your average monthly electricity consumption in kWh.</p>
                <input
                  name="electricity_kwh_per_month"
                  placeholder="Monthly Electricity Consumption (kWh)"
                  type="number"
                  value={formData.electricity_kwh_per_month}
                  onChange={handleChange}
                  className="w-full border px-4 py-2 rounded text-black"
                  required
                />
                <div className="flex flex-col sm:flex-row justify-between mt-6 sm:gap-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400 mb-4 sm:mb-0"
                  >
                    Previous
                  </button>
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isSubmitDisabled}
                    className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-green-200"
                  >
                    {isLoading ? 'Calculating...' : 'Get Recommendations'}
                  </button>
                </div>
              </div>
            )}


            {/* Step 5: Appliances (Conditional) */}
            {step === 5 && inputMethod === 'appliances' && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-black">Tell us about your appliances.</h2>
                <p className="text-gray-700 mb-4">Add the appliances you use, their quantity, and how many hours per day they are on. This helps us calculate your load. You can select from common appliances or add your own below.</p>

                {/* Predefined Appliances Section */}
                <h3 className="text-lg font-semibold mb-2 text-black">Common Appliances:</h3>
                <div className="space-y-4">
                  {formData.appliances.map((appliance, index) => (
                    // Use flexbox for desktop, and grid for mobile to control row wrapping
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                      {/* Appliance Name (Dropdown) - Full width on mobile, spans 2 on sm+ */}
                      <div className="col-span-full sm:col-span-2">
                        <select
                          name="name"
                          value={appliance.name}
                          onChange={(e) => handleApplianceChange(index, e)}
                          className="w-full border px-2 py-1 rounded text-black"
                        >
                          <option value="">Select an appliance</option> {/* Added a default empty option */}
                          {commonAppliances.map((item, idx) => (
                            <option key={idx} value={item.name}>
                              {item.name} {item.watts > 0 ? `(${item.watts}W avg)` : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity, Hours Per Day, Delete Button - New row on mobile, 3 columns */}
                      {/* On small screens, this div will be on the next row (due to col-span-full above) */}
                      {/* For small screens (mobile), create an inner 3-column grid for Qty, Hrs, Delete */}
                      <div className="col-span-full sm:col-span-3 grid grid-cols-3 gap-2 items-center">
                        {/* Quantity */}
                        <input
                          name="quantity"
                          placeholder="Qty"
                          type="number"
                          value={appliance.quantity}
                          onChange={(e) => handleApplianceChange(index, e)}
                          className="w-full border px-2 py-1 rounded text-black col-span-1" // Equal width
                        />
                        {/* Hours Per Day */}
                        <input
                          name="hoursPerDay"
                          placeholder="Hrs/Day"
                          type="number"
                          step="0.1"
                          value={appliance.hoursPerDay}
                          onChange={(e) => handleApplianceChange(index, e)}
                          className="w-full border px-2 py-1 rounded text-black col-span-1" // Equal width
                        />
                        {/* Red Cross Delete Button */}
                        <button
                          type="button"
                          onClick={() => removeAppliance(index)}
                          className="text-red-500 hover:text-red-700 disabled:text-gray-300 col-span-1 flex justify-center items-center" // Take 1 col, center content
                          disabled={formData.appliances.length === 0 && customAppliances.length === 1} // Disable if no predefined and only one custom
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2A9 9 0 111 10a9 9 0 0118 0z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addAppliance}
                    className="text-green-600 hover:underline mt-2"
                  >
                    + Add Appliance (from list)
                  </button>
                </div>

                {/* Separator */}
                <div className="my-6 border-t border-gray-300"></div>

                {/* Add Your Own Appliance Section */}
                <h3 className="text-lg font-semibold mb-2 text-black">Add Your Own Appliance:</h3>
                <div className="space-y-4">
                  {customAppliances.map((appliance, index) => (
                    // Use flexbox for desktop, and grid for mobile to control row wrapping
                    <div key={`custom-${index}`} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                      {/* Appliance Name (Input) - Full width on mobile, spans 2 on sm+ */}
                      <div className="col-span-full sm:col-span-2">
                        <input
                          name="name"
                          placeholder="Appliance Name (e.g., Gaming PC)"
                          value={appliance.name}
                          onChange={(e) => handleCustomApplianceChange(index, e)}
                          className="w-full border px-2 py-1 rounded text-black"
                          autoComplete='off'
                        />
                      </div>

                      {/* Quantity, Hours Per Day, Delete Button - New row on mobile, 3 columns */}
                      <div className="col-span-full sm:col-span-3 grid grid-cols-3 gap-2 items-center">
                        <input
                          name="quantity"
                          placeholder="Qty"
                          type="number"
                          value={appliance.quantity}
                          onChange={(e) => handleCustomApplianceChange(index, e)}
                          className="w-full border px-2 py-1 rounded text-black col-span-1" // Equal width
                        />
                        <input
                          name="hoursPerDay"
                          placeholder="Hrs/Day"
                          type="number"
                          step="0.1"
                          value={appliance.hoursPerDay}
                          onChange={(e) => handleCustomApplianceChange(index, e)}
                          className="w-full border px-2 py-1 rounded text-black col-span-1" // Equal width
                        />
                        <button
                          type="button"
                          onClick={() => removeCustomAppliance(index)}
                          className="text-red-500 hover:text-red-700 disabled:text-gray-300 col-span-1 flex justify-center items-center" // Take 1 col, center content
                          disabled={customAppliances.length === 1 && formData.appliances.length === 0} // Disable if only one custom and no predefined
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2A9 9 0 111 10a9 9 0 0118 0z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addCustomApplianceRow} // Now adds a new row within custom section
                  className="text-green-600 hover:underline mt-2"
                >
                  + Add Another Custom Appliance
                </button>

                <div className="flex justify-end gap-4 mt-6"> {/* Added gap-4 for consistent spacing */}
                  <button
                    type="button"
                    onClick={prevStep}
                    className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400"
                  >
                    Previous
                  </button>
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isSubmitDisabled}
                    className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-green-200"
                  >
                    {isLoading ? 'Calculating...' : 'Get Recommendations'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 6: Recommendations */}
            {step === 6 && (
              <div>
                {apiError && (
                  <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                    Error: {apiError}
                  </div>
                )}

                {transformedRecommendations.length > 0 && (
                  <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl text-black font-semibold">Recommended Solar System</h2>
                      <button
                        onClick={downloadRecommendationsAsCsv}
                        disabled={isLoading}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-200 mobile-download-btn"
                      >
                        <span className="hidden sm:inline">Download Recommendations (CSV)</span>
                        <span className="sm:hidden">Download</span>
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      {transformedRecommendations.map((rec, i) => (
                        <div key={i} className="mb-6 last:mb-0">
                          {transformedRecommendations.length > 1 && (
                            <h3 className="text-lg font-medium mb-2 text-black">Recommendation {i + 1}</h3>
                          )}
                          <table className="w-full table-auto border min-w-full">
                            <tbody>
                              {/* Display all metrics from the backend */}
                              {Object.entries(rec).map(([key, metric]) => {
                                // Only display if the metric object has a value, description, and unit
                                if (metric && typeof metric.value !== 'undefined' && metric.description && metric.unit !== undefined) {
                                  // Determine if battery storage should be shown
                                  const showBattery = (key === 'battery_storage' && (formData.systemType === 'Hybrid Solar' || formData.systemType === 'Off-Grid Solar'));
                                  // Always show other metrics
                                  const showOtherMetric = (key !== 'battery_storage');

                                  if (showBattery || showOtherMetric) {
                                    const displayValue = metric.unit ? `${metric.value} ${metric.unit}` : metric.value;
                                    return (
                                      <tr key={key} className="border-b last:border-b-0">
                                        <td className="p-2 text-left font-semibold text-black">
                                          {metric.description}
                                        </td>
                                        <td className="p-2 text-right text-black">
                                          {displayValue}
                                        </td>
                                      </tr>
                                    );
                                  }
                                }
                                return null;
                              })}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-start mt-6">
                      <button
                        type="button"
                        onClick={() => setStep(1)} // Go back to the first step to restart
                        className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400"
                      >
                        Start Over
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}