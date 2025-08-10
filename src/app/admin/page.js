// app/admin/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/config";
import Sidebar from "@/components/Sidebar";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [pendingProviders, setPendingProviders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const router = useRouter();

  const sidebarLinks = [
    { label: "Dashboard", href: "#", onClick: () => setActiveTab("dashboard"), icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> },
    { label: "Provider Approvals", href: "#", onClick: () => setActiveTab("provider-approvals"), icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.01 12.01 0 003 21c0 .47.018.94.054 1.408l.004.053.012.115a.75.75 0 00.916.634l.024-.002.043-.004c.34-.02.68-.04.99-.06H21c.32 0 .64.01.95.03.02 0 .04.01.06.01.21 0 .42-.02.62-.05.01-.01.01-.01.01-.01.35-.02.68-.05.99-.07l.04-.004c.26-.02.51-.05.76-.08.01 0 .02-.01.03-.01.44-.04.87-.08 1.29-.14l.05-.01.05-.01c.42-.07.83-.15 1.24-.23l.05-.01.05-.01c.39-.08.78-.17 1.16-.27.01-.01.01-.01.02-.01l.05-.01c.39-.1.77-.21 1.15-.32l.05-.01.05-.01c.37-.11.74-.23 1.1-.35.01-.01.01-.01.02-.01a.75.75 0 00.5-1.12l-.01-.01c-.1-.13-.21-.26-.32-.39l-.01-.01c-.2-.25-.4-.49-.61-.74-.01-.01-.01-.01-.01-.01c-.2-.25-.41-.5-.61-.75l-.01-.01c-.2-.25-.41-.5-.61-.75l-.01-.01c-.2-.25-.4-.49-.61-.74l-.01-.01c-.2-.25-.41-.5-.61-.75-.01-.01-.01-.01-.01-.01a.75.75 0 00-.5-1.12l-.01-.01c-.1-.13-.21-.26-.32-.39l-.01-.01c-.2-.25-.4-.49-.61-.74l-.01-.01z" fill="none"/></svg>},
    { label: "Users", href: "#", onClick: () => setActiveTab("users"), icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg> },
    { label: "Reviews", href: "#", onClick: () => setActiveTab("reviews"), icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg> },
    { label: "Analytics", href: "#", onClick: () => setActiveTab("analytics"), icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg> },
  ];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setIsLoading(true);
      if (!user) {
        router.push('/signin');
        return;
      }
      if (user.email !== ADMIN_EMAIL) {
        router.push('/unauthorized');
        return;
      }
      setIsAuthorized(true);
      await fetchData();
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const fetchData = async () => {
    try {
      // We are no longer fetching from /api/admin/providers because it returned a 404.
      // We will rely on /api/admin/users and /api/admin/providers/pending to determine status.
      const [usersRes, pendingRes, reviewsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/providers/pending'),
        fetch('/api/admin/reviews'),
      ]);

      if (!usersRes.ok || !pendingRes.ok || !reviewsRes.ok) {
        throw new Error("Failed to fetch dashboard data from one or more endpoints.");
      }

      const usersData = await usersRes.json();
      const pendingData = await pendingRes.json();
      const reviewsData = await reviewsRes.json();

      const allUsers = usersData.users || [];
      const pendingProvidersData = pendingData.providers || [];
      const reviewsDataArray = reviewsData.reviews || [];

      // Combine and normalize user data with correct statuses.
      // A provider is "approved" if their role is 'provider' and they are NOT in the pending list.
      const combinedUsers = allUsers.map(user => {
        const isPending = pendingProvidersData.some(p => p.uid === user.uid);
        
        let status = 'active'; // Default status
        if (user.role === 'provider') {
          status = isPending ? 'pending' : 'approved';
        }

        return { ...user, status };
      });
      
      const displayUsers = combinedUsers.filter(user => user.email !== ADMIN_EMAIL);

      const approvedProvidersCount = displayUsers.filter(user => user.role === 'provider' && user.status === 'approved').length;
      const pendingProvidersCount = pendingProvidersData.length;

      setUsers(displayUsers);
      setPendingProviders(pendingProvidersData);
      setReviews(reviewsDataArray);
      
      // Update stats based on the new logic
      setStats([
        { label: "Total Users", value: displayUsers.length, icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>},
        { label: "Approved Providers", value: approvedProvidersCount, icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>},
        { label: "Pending Approvals", value: pendingProvidersCount, icon: <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>},
        { label: "Total Reviews", value: reviewsDataArray.length, icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>},
      ]);
      
      // Since we don't have a separate approved providers endpoint, we can't set this state.
      // We will remove this line to avoid confusion.
      // setProviders(approvedProvidersData); 
    
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  };

  const handleApprove = async (uid) => {
    if (window.confirm("Are you sure you want to approve this provider?")) {
      try {
        const res = await fetch(`/api/admin/providers/${uid}/approve`, { method: 'PUT' });
        if (res.ok) {
          console.log(`Provider ${uid} approved successfully.`);
          fetchData();
          setSelectedProvider(null);
        } else {
          console.error("Failed to approve provider.");
        }
      } catch (error) {
        console.error("Error approving provider:", error);
      }
    }
  };

  const handleReject = async (uid) => {
    if (window.confirm("Are you sure you want to reject this provider? This will delete their account.")) {
      try {
        const res = await fetch(`/api/admin/providers/${uid}/reject`, { method: 'DELETE' });
        if (res.ok) {
          console.log(`Provider ${uid} rejected and deleted.`);
          fetchData();
          setSelectedProvider(null);
        } else {
          console.error("Failed to reject provider.");
        }
      } catch (error) {
        console.error("Error rejecting provider:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <div className="m-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-green"></div>
          <p className="mt-4 text-center">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <div className="m-auto text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="mb-6">You don't have permission to access this page.</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-primary-green text-white rounded-md hover:bg-green-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (selectedProvider) {
        return (
          <div className="p-4">
              <button onClick={() => setSelectedProvider(null)} className="mb-4 text-blue-600 hover:text-blue-800">
                  &larr; Back to Pending Approvals
              </button>
              <h3 className="text-lg font-medium mb-4">Provider Details: {selectedProvider.companyName}</h3>
              <div className="bg-white rounded-lg shadow p-6">
                  <p><strong>Company Name:</strong> {selectedProvider.companyName}</p>
                  <p><strong>Email:</strong> {selectedProvider.email}</p>
                  <p><strong>Services Offered:</strong> {selectedProvider.servicesOffered?.join(', ')}</p>
                  <p><strong>Status:</strong> <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">{selectedProvider.status}</span></p>
                  <div className="mt-6">
                      <button onClick={() => handleApprove(selectedProvider.id)} className="px-4 py-2 bg-green-600 text-white rounded-md mr-4 hover:bg-green-700">Approve</button>
                      <button onClick={() => handleReject(selectedProvider.id)} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Reject</button>
                  </div>
              </div>
          </div>
        );
    }

    switch (activeTab) {
      case "dashboard":
        return (
          <div>
            <div className="mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white rounded-lg shadow p-4 flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-primary-green mr-4">{stat.icon}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-semibold">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Monthly Sales Overview</h3>
              <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                <p className="text-gray-500">Sales Chart Placeholder</p>
              </div>
            </div>
          </div>
        );
      case "provider-approvals":
        return (
          <div>
            <h3 className="text-lg font-medium mb-4">Pending Provider Approvals</h3>
            {pendingProviders.length === 0 ? (
              <p className="text-gray-500">No new providers to approve. 😌</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Services</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingProviders.map((provider) => (
                      <tr key={provider.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedProvider(provider)}>
                        <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{provider.companyName}</div></td>
                        <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{provider.email}</div></td>
                        <td className="px-6 py-4"><div className="text-sm text-gray-900">{provider.servicesOffered?.join(', ')}</div></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button onClick={(e) => { e.stopPropagation(); handleApprove(provider.id); }} className="text-primary-green hover:text-green-700 mr-3">Approve</button>
                          <button onClick={(e) => { e.stopPropagation(); handleReject(provider.id); }} className="text-red-600 hover:text-red-900">Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      case "users":
        return (
          <div>
            <h3 className="text-lg font-medium mb-4">User Management</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.uid}>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{user.email}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === "provider" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
                          {user.role || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === "approved" ? "bg-green-100 text-green-800" : user.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
                          {user.status || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "reviews":
        return (
          <div>
            <h3 className="text-lg font-medium mb-4">Recent Reviews</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reviews.map((review) => (
                    <tr key={review.id}>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{review.user}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{review.provider}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="flex">{[...Array(5)].map((_, i) => (<svg key={i} className={`w-4 h-4 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>))}</div></td>
                      <td className="px-6 py-4"><div className="text-sm text-gray-900">{review.comment}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "analytics":
        return <div className="h-64 bg-gray-100 rounded flex items-center justify-center"><p className="text-gray-500">Analytics content will go here.</p></div>;
      default:
        return null;
    }
  };

  const filteredSidebarLinks = sidebarLinks.filter(link => link.label !== "Providers");

  return (
    <div className="grid grid-cols-1 md:grid-cols-[256px_1fr] min-h-screen bg-gray-100">
      <Sidebar userType="admin" links={filteredSidebarLinks} />

      <div className="flex-1">
        <header className="bg-white shadow-sm">
          <div className="px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center">
              <span className="mr-2 text-sm text-gray-600">admin@solarlagao.com</span>
              <div className="h-8 w-8 rounded-full bg-primary-green flex items-center justify-center text-white">A</div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {filteredSidebarLinks.map(link => (
                  <button
                    key={link.label}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === link.label.toLowerCase().replace(' ', '-') ? "border-primary-green text-primary-green" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                    onClick={() => setActiveTab(link.label.toLowerCase().replace(' ', '-'))}
                  >
                    {link.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-4">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}