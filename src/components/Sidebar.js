// components/Sidebar.jsx
"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/config';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState } from "react";

export default function Sidebar({ navItems, userType, providerData }) {
  
  
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/signin');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const getNavItems = (type) => {
    switch (type) {
      case 'provider':
        return [
          { name: 'Dashboard', href: '/provider' },
          { name: 'My Services', href: '/provider/services' },
          { name: 'Quotes', href: '/provider/quotes' },
          { name: 'Orders', href: '/provider/orders' },
          { name: 'Chat', href: '/provider/chat' },
        ];
      case 'customer':
        return [
          { name: 'Home', href: '/customer' },
          { name: 'My Quotes', href: '/customer/quotes' },
          { name: 'My Orders', href: '/customer/orders' },
          { name: 'Chat', href: '/customer/chat' },
        ];
      case 'admin':
        return [
          { name: 'Admin Dashboard', href: '/admin' },
          { name: 'Manage Providers', href: '/admin/providers' },
          { name: 'Manage Customers', href: '/admin/customers' },
        ];
      default:
        return [];
    }
  };

  const currentNavItems = getNavItems(userType);

  // Determine the display name for the sidebar
  // This console log will now show the correct data after the parent re-renders
  console.log("Sidebar - Provider Data received:", providerData);
  const displayName = providerData?.companyName || "Your Company";

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-primary-green text-white p-2 rounded-md shadow-lg"
        onClick={toggleSidebar}
        aria-label="Toggle navigation"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-gray-900 text-gray-300 w-64 transform transition-transform duration-300 ease-in-out z-40 md:relative md:translate-x-0 md:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center mb-4">
            <p className="text-xl font-bold text-white">@ {displayName}</p>
          </div>
        </div>

        <nav className="mt-4 flex-1 overflow-y-auto">
          <ul>
            {currentNavItems.map((item) => (
              <li key={item.name} className="mb-1">
                <Link
                  href={item.href}
                  className={`flex items-center p-3 mx-2 rounded-lg transition-colors duration-200
                    ${pathname === item.href ? 'bg-gray-700 text-white' : 'hover:bg-gray-700 hover:text-white'}
                  `}
                  onClick={() => setIsOpen(false)}
                >
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
            <li className="mt-auto pt-4">
              <button
                onClick={handleSignOut}
                className="flex items-center p-3 mx-2 rounded-lg w-full text-left text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                <span>Log out</span>
              </button>
            </li>
            <li className="mt-2 mb-4">
              <Link href="/help" className="flex items-center p-3 mx-2 rounded-lg transition-colors duration-200 text-gray-400 hover:bg-gray-700 hover:text-white">
                Help
              </Link>
            </li>
            <li className="mb-4">
              <Link href="/contact-us" className="flex items-center p-3 mx-2 rounded-lg transition-colors duration-200 text-gray-400 hover:bg-gray-700 hover:text-white">
                Contact us
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
}