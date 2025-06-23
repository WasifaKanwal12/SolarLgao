// src/app/help/page.js
import Link from 'next/link';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function HelpPage() {
    const publicNavItems = [
        { name: "Home", href: "/" },
        { name: "Sign In", href: "/signin" },
        { name: "Sign Up", href: "/signup" },
    ];
  return (
    <div className="flex flex-col min-h-screen">
      <Header navItems={publicNavItems} userType="public"/>
      <main className="flex-1 pt-16 bg-gray-50 p-6 md:p-8">
        <div className="container mx-auto max-w-3xl bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Help & Support</h1>
          <p className="text-gray-700 mb-4">
            Welcome to the SolarPro Connect Help Center. Here you can find answers to frequently asked questions and resources to assist you.
          </p>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-6">FAQs</h2>
          <div className="space-y-4">
            {/* Example FAQ Item */}
            <details className="border rounded-lg p-4 bg-gray-50">
              <summary className="font-medium text-lg text-gray-800 cursor-pointer">
                How do I get a quote for solar installation?
              </summary>
              <p className="text-gray-600 mt-2">
                As a customer, you can browse through our listed solar service providers on the homepage. Click on any provider you're interested in, select a specific service, and then click "Send Quote Request" to fill out a form detailing your needs. The provider will then review your request and may initiate a chat or send a custom offer.
              </p>
            </details>
            <details className="border rounded-lg p-4 bg-gray-50">
              <summary className="font-medium text-lg text-gray-800 cursor-pointer">
                How can I track my solar installation order?
              </summary>
              <p className="text-gray-600 mt-2">
                Once an offer is accepted and an order is created, you can track its progress from your "My Orders" page. All updates and communications regarding the order will happen through the chat thread associated with that order. The provider can also upload proof of completion, and you can mark the order as complete once satisfied.
              </p>
            </details>
            {/* Add more FAQ items */}
          </div>
          <p className="text-center text-gray-600 mt-8">
            Can't find what you're looking for? <Link href="/contact-us" className="text-blue-600 hover:underline">Contact our support team.</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}