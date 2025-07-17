"use client";

import { useState } from 'react';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Define a list of common appliances with average wattage (for display in dropdown)
const commonAppliances = [
  { name: "SELECT AN APPLIANCE (Optional)", watts: 0 },
  { name: "AC (Window/Split)", watts: 1500 }, // Average for a common AC unit
  { name: "Refrigerator (Standard)", watts: 200 },
  { name: "Television (LED 40-50 inch)", watts: 100 },
  { name: "Washing Machine", watts: 2000 }, // Peak during wash cycle
  { name: "Water Heater", watts: 3000 },
  { name: "Microwave Oven", watts: 1200 },
  { name: "Oven (Electric)", watts: 2500 },
  { name: "Desktop Computer", watts: 250 },
  { name: "Laptop Computer", watts: 60 },
  { name: "Light Bulb (LED)", watts: 10 },
  { name: "Ceiling Fan", watts: 75 },
  { name: "Electric Iron", watts: 1000 },
  { name: "Hair Dryer", watts: 1800 },
  { name: "Dishwasher", watts: 1800 },
  { name: "Vacuum Cleaner", watts: 1400 },
  { name: "Toaster", watts: 1000 },
  { name: "Blender", watts: 500 },
  { name: "Coffee Maker", watts: 1000 },
  { name: "Heater (Portable)", watts: 1500 },
  { name: "Electric Kettle", watts: 2000 },
];

export default function RecommendationPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    systemType: '',
    location: '',
    electricity_kwh_per_month: '',
    appliances: [], // For selectable appliances from the list
  });
  const [customAppliances, setCustomAppliances] = useState([{ name: '', quantity: '', hoursPerDay: '' }]); // For custom appliances, start with one empty row
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

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setApiError(null);
    setRecommendations([]);

    try {
      // Combine both lists of appliances, filtering out incomplete entries
      const allAppliances = [
        ...formData.appliances.filter(app => app.name && app.quantity && app.hoursPerDay),
        ...customAppliances.filter(app => app.name && app.quantity && app.hoursPerDay)
      ];

      const payload = {
        location: formData.location,
        electricity_kwh_per_month: formData.electricity_kwh_per_month,
        system_type: formData.systemType,
        appliances: allAppliances, // Send combined and filtered appliances
      };

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
      if (Array.isArray(data) && data.every(item => item && typeof item.metrics !== 'undefined')) {
        setRecommendations(data);
      } else if (data && typeof data.metrics !== 'undefined') {
        setRecommendations([data]);
      } else {
        throw new Error("Received unexpected data format from the recommendation API.");
      }
      setStep(5); // Move to the results step
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
      // Add the dummy values for Daily Consumption and Peak Sun Hours first
      rows.push(['Daily Consumption', `${rec.daily_consumption || 'XXX'} ${rec.daily_consumption_unit || 'kWh/day'}`]);
      rows.push(['Peak Sun Hours', `${rec.solar_hours || 'YYY'} ${rec.solar_hours_unit || 'hours/day'}`]);

      Object.entries(rec).forEach(([key, value]) => {
        // Skip unit keys, daily_consumption, solar_hours, and system_type
        if (!key.endsWith('_unit') && key !== 'daily_consumption' && key !== 'solar_hours' && key !== 'system_type') {
          const unitKey = `${key}_unit`;
          const displayValue = rec[unitKey] ? `${value} ${rec[unitKey]}` : value;
          rows.push([key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()), displayValue]);
        }
      });
      // Add a separator for multiple recommendations
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

  const transformedRecommendations = recommendations.map(rec => {
    const result = {
      daily_consumption: '25', // Dummy value
      daily_consumption_unit: 'kWh/day', // Dummy unit
      solar_hours: '5', // Dummy value
      solar_hours_unit: 'hours/day', // Dummy unit
    };
    if (rec && Array.isArray(rec.metrics)) {
      rec.metrics.forEach(metric => {
        // Exclude system_type here if you don't want it in the transformed data at all for the table
        if (metric.name !== 'system_type') {
          result[metric.name] = metric.value;
          result[`${metric.name}_unit`] = metric.unit;
        }
      });
    }
    return result;
  });

  // Determine if the submit button should be disabled
  const isSubmitDisabled = isLoading || (
    formData.appliances.filter(app => app.name && app.quantity && app.hoursPerDay).length === 0 &&
    customAppliances.filter(app => app.name && app.quantity && app.hoursPerDay).length === 0
  );

  return (
    <>
      <Header />
      {/* Background image directly from public folder */}
      <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/solar-panel.jpg')" }}>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center">
          <div className="max-w-4xl w-full bg-white rounded-lg shadow-md p-6 bg-opacity-90">
            <h1 className="text-3xl font-bold text-center mb-8 text-green-700">Solar System Recommendation</h1>

            {/* Progress Bar */}
            <div className="flex justify-between mb-8">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className={`flex-1 text-center ${s <= step ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                  Step {s}
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

            {/* Step 3: Monthly Electricity Consumption */}
            {step === 3 && (
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
                    disabled={!formData.electricity_kwh_per_month}
                    className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-green-200"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Appliances */}
            {step === 4 && (
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
                          disabled={formData.appliances.length === 0}
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
                          disabled={customAppliances.length === 1}
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

            {/* Step 5: Recommendations */}
            {step === 5 && (
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
                              {/* Always show Daily Consumption and Peak Sun Hours first */}
                              <tr className="border-b">
                                <td className="p-2 text-left font-semibold text-black">Daily Consumption</td>
                                <td className="p-2 text-right text-black">
                                  {rec.daily_consumption} {rec.daily_consumption_unit}
                                </td>
                              </tr>
                              <tr className="border-b">
                                <td className="p-2 text-left font-semibold text-black">Peak Sun Hours</td>
                                <td className="p-2 text-right text-black">
                                  {rec.solar_hours} {rec.solar_hours_unit}
                                </td>
                              </tr>
                              {Object.entries(rec).map(([key, value]) => {
                                // Skip unit keys, and the newly added dummy values, and system_type
                                if (key.endsWith('_unit') || key === 'daily_consumption' || key === 'solar_hours' || key === 'system_type') {
                                  return null;
                                }
                                const unitKey = `${key}_unit`;
                                const displayValue = rec[unitKey] ? `${value} ${rec[unitKey]}` : value;
                                return (
                                  <tr key={key} className="border-b last:border-b-0">
                                    <td className="p-2 text-left font-semibold text-black capitalize">
                                      {key.replace(/_/g, ' ')}
                                    </td>
                                    <td className="p-2 text-right text-black">
                                      {displayValue}
                                    </td>
                                  </tr>
                                );
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