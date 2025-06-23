// app/provider/page.js
"use client";

import { useEffect, useState } from "react";
// Removed auth and onAuthStateChanged as context handles it
import { useRouter } from "next/navigation";
import Link from "next/link";
import SalesChart from "@/components/charts/SalesChart";
import CategoryDoughnutChart from "@/components/charts/CategoryDoughnutChart";
// Removed Sidebar import
import { useProviderData } from "@/app/context/ProviderDataContext"; // Import context hook

export default function ProviderDashboard() {
  const { user, providerData, loading, error } = useProviderData(); // Consume data from context
  const [dashboardStats, setDashboardStats] = useState({
    totalSales: 0,
    totalVisitors: 0,
    totalRefunds: 0,
    salesData: [],
    topCategories: [],
  });
  const [dashboardError, setDashboardError] = useState(null); // Use a different state for dashboard-specific errors
  const router = useRouter();

  // Fetch dashboard stats only when providerData is available and not loading
  useEffect(() => {
    if (providerData && !loading) {
      fetchDashboardStats(user.uid);
    }
  }, [providerData, user, loading]); // Depend on providerData, user, and loading from context

  const fetchDashboardStats = async (uid) => {
    try {
      // setLoading(true); // Loading is now managed by context for initial data
      const statsRes = await fetch(`/api/providers/dashboard-stats?providerId=${uid}`);
      if (!statsRes.ok) throw new Error("Failed to fetch dashboard stats.");
      const statsData = await statsRes.json();

      setDashboardStats({
        totalSales: statsData.totalSales,
        totalVisitors: statsData.totalVisitors,
        totalRefunds: statsData.totalRefunds,
        salesData: statsData.salesData,
        topCategories: statsData.topCategories,
      });
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setDashboardError("Failed to load dashboard statistics. Please try again.");
    } finally {
      // setLoading(false); // No longer needed here
    }
  };

  // Use loading and error from context for initial checks
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) { // Error from context (e.g., not a provider, rejected status)
    return (
      <div className="p-8 text-center text-red-600">
        <p>{error}</p>
        {error.includes("rejected") && (
            <Link href="/contact-us" className="btn-primary mt-4">
                Contact Support
            </Link>
        )}
      </div>
    );
  }

  if (!providerData) { // This case should largely be handled by the context redirecting if user is not a provider
    return (
      <div className="p-8 text-center text-gray-700">
        <p>No provider data found. Please ensure your account is approved.</p>
        <Link href="/signin" className="btn-primary mt-4">
          Sign In
        </Link>
      </div>
    );
  }

  // Dashboard-specific error
  if (dashboardError) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>{dashboardError}</p>
        <button onClick={() => window.location.reload()} className="btn-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 bg-gray-100">
      {/* Top Header Section */}
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">Welcome back, {providerData.companyName.split(' ')[0]}</h1>
          <p className="text-sm text-gray-500 mt-1">Here are today's stats from your services!</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 rounded-lg bg-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
          {/* User Profile Info */}
          <div className="flex items-center space-x-2 bg-white p-2 rounded-full shadow-sm cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-white font-bold text-sm">
              {user?.firstName ? user.firstName.charAt(0) : ''}{user?.lastName ? user.lastName.charAt(0) : ''}
            </div>
            <span className="text-gray-700 text-sm hidden sm:block">{user?.firstName} {user?.lastName}</span>
            <svg
              className="h-4 w-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
      </header>

      {/* Statistic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Sales Card */}
        <div className="bg-gray-800 text-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <div className="flex items-center mb-2">
              <svg
                className="w-6 h-6 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                ></path>
              </svg>
              <h2 className="text-lg font-medium">Total Orders</h2>
            </div>
            <p className="text-4xl font-bold mb-1">{dashboardStats.totalSales}</p>
            <p className="text-gray-400 text-sm">Completed</p>
            <div className="flex items-center text-sm mt-2">
              <span className="text-green-400 flex items-center mr-2">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                +X%
              </span>
              <span className="text-gray-400">+Y this week</span>
            </div>
          </div>
          <svg
            className="w-6 h-6 text-gray-400 cursor-pointer"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </div>

        {/* Visitors Card */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <div className="flex items-center mb-2">
              <svg
                className="w-6 h-6 mr-2 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h-4v-2a4 4 0 014-4h2a4 4 0 014 4v2zM7 10h10a4 4 0 004-4V6a4 4 0 00-4-4H7a4 4 0 00-4 4v4a4 4 0 004 4z"
                ></path>
              </svg>
              <h2 className="text-lg font-medium text-gray-800">Quotes Received</h2>
            </div>
            <p className="text-4xl font-bold text-gray-800 mb-1">{dashboardStats.totalVisitors}</p>
            <p className="text-gray-500 text-sm">New this week</p>
            <div className="flex items-center text-sm mt-2">
              <span className="text-green-500 flex items-center mr-2">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                +X%
              </span>
              <span className="text-gray-500">+Y this week</span>
            </div>
          </div>
          <svg
            className="w-6 h-6 text-gray-400 cursor-pointer"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </div>

        {/* Refunds Card */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <div className="flex items-center mb-2">
              <svg
                className="w-6 h-6 mr-2 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2m-6 0h.01M12 16L9 13.5M12 16L15 13.5"
                ></path>
              </svg>
              <h2 className="text-lg font-medium text-gray-800">Active Orders</h2>
            </div>
            <p className="text-4xl font-bold text-gray-800 mb-1">{dashboardStats.totalRefunds}</p>
            <p className="text-gray-500 text-sm">In Progress</p>
            <div className="flex items-center text-sm mt-2">
              <span className="text-green-500 flex items-center mr-2">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                +X%
              </span>
              <span className="text-gray-500">+Y new</span>
            </div>
          </div>
          <svg
            className="w-6 h-6 text-gray-400 cursor-pointer"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </div>
      </div>

      {/* Sales Performance and Top Categories Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Performance Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Order Value Performance</h2>
            <div className="flex space-x-2">
              <button className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100">
                Export data
              </button>
              <select className="px-4 py-2 text-sm rounded-md border border-gray-300 bg-white text-gray-700 focus:outline-none">
                <option>Last 30 Days</option>
                <option>Last 60 Days</option>
                <option>Last 90 Days</option>
              </select>
            </div>
          </div>
          <div className="h-64">
            <SalesChart data={dashboardStats.salesData} />
          </div>
        </div>

        {/* Top Categories (Services) */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Services</h2>
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-32 h-32 mb-4">
              <CategoryDoughnutChart data={dashboardStats.topCategories} />
            </div>
          </div>
          <ul className="space-y-3">
            {dashboardStats.topCategories.map((cat, index) => (
              <li key={cat.name} className="flex items-center justify-between text-gray-700">
                <span className="flex items-center">
                  <span className={`w-3 h-3 rounded-full ${['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500'][index % 4]} mr-2`}></span>
                  {cat.name}
                </span>
                <span className="font-medium">{cat.value}%</span>
              </li>
            ))}
          </ul>
          <Link href="/provider/services" className="flex items-center justify-center w-full mt-4 py-2 text-sm text-gray-600 hover:text-gray-900">
            View All Services
            <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}