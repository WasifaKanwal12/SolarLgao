// app/recommendation/page.js
"use client";

import { useState } from 'react';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function RecommendationPage() {
  const [formData, setFormData] = useState({
    location: '',
    electricity_kwh_per_month: '',
    usage_prompt: ''
  });
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null); // New state for API errors

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setApiError(null); // Clear previous errors
    setRecommendations([]); // Clear previous recommendations

    try {
      const response = await fetch('/api/recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get solar recommendation from server.');
      }

      const data = await response.json();
      // Ensure data is always an array of objects that have a 'metrics' property
      if (Array.isArray(data) && data.every(item => item && typeof item.metrics !== 'undefined')) {
        setRecommendations(data);
      } else if (data && typeof data.metrics !== 'undefined') {
        setRecommendations([data]); // If a single object with metrics is returned
      } else {
        // If data is not in the expected format, set an error
        throw new Error("Received unexpected data format from the recommendation API.");
      }

    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setApiError(error.message); // Set the error message to display
      setRecommendations([]); // Ensure recommendations are cleared on error
    } finally {
      setIsLoading(false);
    }
  };

  const downloadRecommendationsAsCsv = () => {
    if (!transformedRecommendations.length) {
      alert('No recommendations to download!');
      return;
    }

    const headers = ['System Size', 'Panels', 'Inverter', 'Battery', 'System Type', 'Panel Type', 'Backup Hours', 'Payback Period'];
    const rows = transformedRecommendations.map((rec) => [
      `${rec.system_size} ${rec.system_size_unit}`,
      `${rec.solar_panels} ${rec.solar_panels_unit}`,
      `${rec.inverter_size} ${rec.inverter_size_unit}`,
      `${rec.battery_storage} ${rec.battery_storage_unit}`,
      rec.system_type,
      rec.panel_type,
      `${rec.backup_hours} ${rec.backup_hours_unit}`,
      `${rec.payback_period} ${rec.payback_period_unit}`
    ]);

    // Format data into CSV string
    const csvContent = [
      headers.join(','), // Join headers with comma
      ...rows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')) // Join fields with comma, handle commas in data
    ].join('\n'); // Join rows with newline

    // Create a Blob and initiate download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Solar_Recommendations_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`); // Filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the object URL
  };

  // Transform metrics into a more usable format
  // This will now only run if 'recommendations' is a valid array of objects with 'metrics'
  const transformedRecommendations = recommendations.map(rec => {
    const result = {};
    // Safely check if rec.metrics exists before calling forEach
    if (rec && Array.isArray(rec.metrics)) {
      rec.metrics.forEach(metric => {
        if (metric.name !== 'daily_consumption' && metric.name !== 'solar_hours') {
          result[metric.name] = metric.value;
          result[`${metric.name}_unit`] = metric.unit;
        }
      });
    }
    return result;
  });

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Solar System Recommendation</h1>
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="location"
              placeholder="Location (e.g. Lahore, Pakistan)"
              value={formData.location}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded text-black"
              required
            />
            <input
              name="electricity_kwh_per_month"
              placeholder="Monthly Electricity Consumption (kWh)"
              type="number"
              value={formData.electricity_kwh_per_month}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded text-black"
            />
            <textarea
              name="usage_prompt"
              placeholder="OR describe your electricity usage (e.g. 'I use 2 ACs for 8 hours daily')"
              value={formData.usage_prompt}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded text-black"
              rows={3}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-green-200"
            >
              {isLoading ? 'Calculating...' : 'Get Recommendations'}
            </button>
          </form>

          {apiError && ( // Display API error message
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
                  // Added responsive class to change button text
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-200 mobile-download-btn"
                >
                  <span className="hidden sm:inline">Download Recommendations (CSV)</span>
                  <span className="sm:hidden">Download</span>
                </button>
              </div>
              {/* Added overflow-x-auto wrapper for table responsiveness */}
              <div className="overflow-x-auto">
                <table className="w-full table-auto border min-w-full"> {/* Added min-w-full */}
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-2 whitespace-nowrap text-black">System Size</th>
                      <th className="p-2 whitespace-nowrap text-black">Panels</th>
                      <th className="p-2 whitespace-nowrap text-black">Inverter</th>
                      <th className="p-2 whitespace-nowrap text-black">Battery</th>
                      <th className="p-2 whitespace-nowrap text-black">System Type</th>
                      <th className="p-2 whitespace-nowrap text-black">Panel Type</th>
                      <th className="p-2 whitespace-nowrap text-black">Backup</th>
                      <th className="p-2 whitespace-nowrap text-black">Payback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transformedRecommendations.map((rec, i) => (
                      <tr key={i} className="text-center border-t">
                        <td className="p-2 whitespace-nowrap text-black">{rec.system_size} {rec.system_size_unit}</td>
                        <td className="p-2 whitespace-nowrap text-black">{rec.solar_panels} {rec.solar_panels_unit}</td>
                        <td className="p-2 whitespace-nowrap text-black">{rec.inverter_size} {rec.inverter_size_unit}</td>
                        <td className="p-2 whitespace-nowrap text-black">{rec.battery_storage} {rec.battery_storage_unit}</td>
                        <td className="p-2 whitespace-nowrap text-black">{rec.system_type}</td>
                        <td className="p-2 whitespace-nowrap text-black">{rec.panel_type}</td>
                        <td className="p-2 whitespace-nowrap text-black">{rec.backup_hours} {rec.backup_hours_unit}</td>
                        <td className="p-2 whitespace-nowrap text-black">{rec.payback_period} {rec.payback_period_unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}