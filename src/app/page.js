"use client";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TestimonialCard from "@/components/TestimonialCard";
import ServiceCard from "@/components/ServiceCard";
import Chatbot from "@/components/chatbot";
import { CalendarDays, Clock, User, ArrowRight } from "lucide-react";

// Date formatting utility function
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// Reverted to your original articles data
const articles = [
  {
    id: 1,
    title: "How to Install a Solar System in Your Home in Pakistan",
    excerpt: "A comprehensive step-by-step guide to installing solar panels in Pakistan, including costs, system types, and professional installation services.",
    author: "Solar Lgao Team",
    date: "2025-04-15",
    readTime: "8 min read",
    category: "Solar Energy",
    featured: true,
    image: "/art1.jpg?height=600&width=300",
  },
  {
    id: 2,
    title: "How to Determine the Size and Cost of Your Solar System in Pakistan: The Complete Guide",
    excerpt: "Learn how to size your solar system and estimate costs in Pakistan: step-by-step calculations, 2025 panel and inverter prices, and a real 3.5 kW example.",
    author: "Solar Lgao Team",
    date: "2025-04-16",
    readTime: "9 min read",
    category: "Solar Energy",
    featured: false,
    image: "/art2.jpg?height=600&width=300",
  },
  {
    id: 3,
    title: "Getting the Best out of your Solar System: Ways to make it as benefit-taking as possible with regard to longevity.",
    excerpt: "Practical maintenance tips to maximize your solar system's efficiency and lifespan in Pakistan—cleaning, inspections, inverter care, shading prevention, battery upkeep, and monitoring.",
    author: "Solar Lgao Team",
    date: "2025-04-17",
    readTime: "7 min read",
    category: "Solar Energy",
    featured: false,
    image: "/art3.jpg?height=600&width=300",
  },
];

const featuredArticle = articles.find((article) => article.featured);

// Reusable Article Card Component with new styling
const ArticleCard = ({ article }) => {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="relative">
        <Image
          src={article.image}
          alt={article.title}
          width={800}
          height={400}
          className="w-full h-40 object-cover"
        />
        <div className="absolute top-2 right-2 flex items-center space-x-2">
          {/* Tags are removed as per your request */}
          <div className="bg-white p-2 rounded-full shadow-md text-gray-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-file-text"
            >
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              <path d="M10 9H8" />
              <path d="M16 13H8" />
              <path d="M16 17H8" />
            </svg>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <p className="text-sm text-gray-400 uppercase tracking-widest">{article.category}</p>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{article.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{article.excerpt}</p>
        
        {/* Combined Author and Date into a single row */}
        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <User className="h-4 w-4" />
            <span>{article.author}</span>
          </div>
          <div className="flex items-center space-x-1">
            <CalendarDays className="h-4 w-4" />
            <span>{formatDate(article.date)}</span>
          </div>
        </div>
        
        <Link
          href={`/articles/${article.id}`}
          className="w-full mt-4 py-2 px-4 rounded-full font-bold text-sm transition-colors duration-300 text-center block bg-primary-green hover:bg-green-700"
          style={{ color: "white" }}
        >
          Read Full Article
        </Link>
      </div>
    </article>
  );
};

export default function Home() {
  // Sample testimonials data
  const testimonials = [
    {
      rating: 5,
      text: "Solar Lgao helped me find the perfect solar solution for my home. The installation was smooth and the system has been working flawlessly.",
      image: "/user1.jpg?height=100&width=100",
      name: "Amaan Haider",
      organization: "Homeowner",
    },
    {
      rating: 5,
      text: "I've seen a significant drop in my electricity bills since installing solar panels with Solar Lgao. Highly recommended!",
      image: "/user2.jpg?height=100&width=100",
      name: "Haseeb Khan",
      organization: "Business Owner",
    },
    {
      rating: 4,
      text: "The team was professional and the process was very transparent. The after-sales support is great too.",
      image: "/user3.jpg?height=100&width=100",
      name: "Usman Ahmed",
      organization: "Homeowner",
    },
  ];

  // Services data
  const services = [
    {
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Reserve Energy",
      description: "Store excess energy for use during peak hours or outages.",
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      title: "Personalized Recommendations",
      description: "Get tailored solar solutions based on your energy needs and location.",
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      title: "Verified Providers",
      description: "Connect with trusted and certified solar installation professionals.",
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: "Maintenance Support",
      description: "Ongoing support and maintenance services for your solar installation.",
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      title: "Quality Assurance",
      description: "High-quality solar products with warranties and performance guarantees.",
    },
  ];

  const otherArticles = articles.filter((article) => !article.featured);

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="relative h-[600px]">
        <div className="absolute inset-0 z-0">
          <Image src="/homesection2.jpeg" alt="Solar Panel Background" fill style={{ objectFit: "cover" }} priority />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        <div className="container-custom relative z-10 h-full flex items-center">
          <div className="max-w-lg text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Solar Energy Solutions</h1>
            <p className="text-lg mb-6">
              Harness the power of the sun with our innovative solar solutions. Reduce your carbon footprint and save on
              energy costs.
            </p>
            <div className="flex gap-4">
              <Link href="/signup" className="btn-primary">
                Join Us
              </Link>
              <Link href="/recommendation" className="btn-primary">
                Get Recommendation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              <Image
                src="/about-image.jpeg"
                alt="Solar Energy"
                fill
                style={{ objectFit: "cover" }}
                className="rounded-lg"
              />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Embrace renewable energy to
                <br />
                nurture a greener planet
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                At Solar Lgao, we're committed to making solar energy accessible to everyone. Our mission is to
                accelerate the transition to sustainable energy through innovative solutions and exceptional service. We
                connect you with verified providers who offer high-quality solar installations tailored to your specific
                needs.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 md:gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-primary-green">8000KW+</p>
                  <p className="text-gray-600 dark:text-gray-400">Energy Saved</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary-green">10K+</p>
                  <p className="text-gray-600 dark:text-gray-400">Global Clients</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary-green">98%</p>
                  <p className="text-gray-600 dark:text-gray-400">Client Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
        <div className="container-custom">
          <h2 className="section-title">Our Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {services.map((service, index) => (
              <ServiceCard key={index} icon={service.icon} title={service.title} description={service.description} />
            ))}
          </div>
        </div>
      </section>

      {/* Articles Section Main Header */}
      <section className="text-center py-16 bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
        <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6">
          <span className="text-primary-green block">Articles</span>
        </h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8">
          Expert guides, tips, and insights on solar energy installation and maintenance in Pakistan. Make informed
          decisions about your solar journey.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#featured"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary-green text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Start Reading
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
          <a
            href="#articles"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Browse All Articles
          </a>
        </div>
      </section>

      {/* Featured Articles Section */}
      <section id="featured" className="mb-16 bg-white dark:bg-slate-900 text-gray-900 dark:text-white container-custom">
        <div className="mb-8 text-center">
          <h2 className="font-serif text-3xl font-bold mb-2">Featured Article</h2>
          <p className="text-muted-foreground text-gray-500 dark:text-gray-400">Our top pick for this week</p>
        </div>
        {featuredArticle && (
          <article className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row">
            <div className="relative w-full h-64 md:h-auto md:w-1/2">
              <Image
                src={featuredArticle.image}
                alt={featuredArticle.title}
                fill
                style={{ objectFit: "cover" }}
                className="rounded-l-xl"
              />
            </div>
            <div className="p-8 md:w-1/2 flex flex-col justify-center">
              <div className="inline-block px-3 py-1 bg-primary-green/10 text-primary-green text-sm font-medium rounded-full mb-4">
                {featuredArticle.category}
              </div>
              <h3 className="font-serif text-2xl font-bold text-foreground mb-4">{featuredArticle.title}</h3>
              <p className="text-muted-foreground mb-6 text-gray-600 dark:text-gray-400">{featuredArticle.excerpt}</p>
              <div className="flex items-center justify-center md:justify-start space-x-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{featuredArticle.author}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CalendarDays className="h-4 w-4" />
                  <span>{formatDate(featuredArticle.date)}</span>
                </div>
              </div>
              <Link
                href={`/articles/${featuredArticle.id}`}
                className="btn-primary inline-flex items-center justify-center"
              >
                Read Full Article
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </article>
        )}
      </section>

      {/* All Articles Section */}
      <section id="articles" className="mb-16 bg-white dark:bg-slate-900 text-gray-900 dark:text-white container-custom">
        <div className="mb-8 text-center">
          <h2 className="font-serif text-3xl font-bold mb-2">All Articles</h2>
          <p className="text-muted-foreground text-gray-500 dark:text-gray-400">
            Explore our complete collection of solar energy guides
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>

      {/* Clients Section */}
      <section id="clients" className="py-16 bg-gray-50 dark:bg-slate-800">
        <div className="container-custom">
          <h2 className="section-title text-gray-900 dark:text-white">Words of Our Clients</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            See what our customers say about our company & the product
          </p>
          <div className="grid grid-cols-1 text-gray-900 dark:text-white md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                rating={testimonial.rating}
                text={testimonial.text}
                image={testimonial.image}
                name={testimonial.name}
                organization={testimonial.organization}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">Get In Touch</h2>
              <div className="mb-6">
                <p className="flex items-center mb-2">
                  <svg
                    className="h-5 w-5 mr-2 text-primary-green"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  +92-314-549-6606
                </p>
                <p className="flex items-center">
                  <svg
                    className="h-5 w-5 mr-2 text-primary-green"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  solarlgao@gmail.com
                </p>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="bg-primary-green text-white p-2 rounded-full hover:bg-green-600 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="bg-primary-green text-white p-2 rounded-full hover:bg-green-600 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="bg-primary-green text-white p-2 rounded-full hover:bg-green-600 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-6">Send Us a Message</h2>
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-white md:text-black mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-primary-green"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-white md:text-black mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-primary-green"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white md:text-black mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-primary-green"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-white md:text-black mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-primary-green"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-white md:text-black mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-primary-green"
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn-primary w-full">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Chatbot />
      <Footer />
    </>
  );
}