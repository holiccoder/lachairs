"use client";

import { useState } from "react";
import Link from "next/link";

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const footerProductLinks = [
  { label: "Catalog", href: "/products" },
  { label: "Warranty", href: "/warranty" },
  { label: "Return Policy", href: "/return-policy" },
  { label: "FAQ", href: "/faq" },
];

const footerSupportLinks = [
  { label: "About Us", href: "/about" },
  { label: "Trade Account Registration", href: "/register" },
  { label: "Contact Us", href: "/contact" },
  { label: "Shipping Info", href: "/shipping" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
];

const footerIndustryLinks = [
  { label: "Party Rental Customers", href: "/party-rental" },
  { label: "Hospitality Customers", href: "/hospitality" },
  { label: "Resale Partners", href: "/resale-partners" },
  { label: "Venue Customers", href: "/venue" },
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalSuccess, setModalSuccess] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      setModalMessage("Please enter a valid email address.");
      setModalSuccess(false);
      setShowModal(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setModalMessage(data.message || "Successfully subscribed to newsletter!");
        setModalSuccess(true);
        setEmail("");
      } else {
        setModalMessage(data.message || "Failed to subscribe. Please try again.");
        setModalSuccess(false);
      }
    } catch (error) {
      setModalMessage("Failed to subscribe. Please try again.");
      setModalSuccess(false);
    } finally {
      setIsLoading(false);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage("");
    setModalSuccess(false);
  };
  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8 px-6 lg:px-12">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] gap-10 mb-12">
          {/* Column 1 — Brand */}
          <div>
            <div className="mb-4">
              <img src="/logo.jpg" alt="Lachairs" className="h-16 w-auto object-contain" />
            </div>
            <div className="text-sm text-body leading-relaxed space-y-2">
              <p>
                <span className="font-semibold text-heading">Warehouse:</span><br />
                960 W Brooks St, Ontario, CA 91762
              </p>
              <p>
                <span className="font-semibold text-heading">Open:</span> 7 days, 9AM - 5PM
              </p>
              <p>
                <span className="font-semibold text-heading">Office:</span> 628 Shoppers Ln, Covina, CA 91732
              </p>
              <p>
                <span className="font-semibold text-heading">Phone:</span> 972-835-1856
              </p>
            </div>
          </div>

          {/* Column 2 — Product Information */}
          <div>
            <h4 className="text-sm font-bold text-heading mb-4 uppercase tracking-wide">
              Product Information
            </h4>
            <ul className="space-y-2">
              {footerProductLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-body hover:text-brand transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Customer Support */}
          <div>
            <h4 className="text-sm font-bold text-heading mb-4 uppercase tracking-wide">
              Customer Support
            </h4>
            <ul className="space-y-2">
              {footerSupportLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-body hover:text-brand transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Industries */}
          <div>
            <h4 className="text-sm font-bold text-heading mb-4 uppercase tracking-wide">
              Industries
            </h4>
            <ul className="space-y-2">
              {footerIndustryLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-body hover:text-brand transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Newsletter */}
          <div>
            <h4 className="text-sm font-bold text-heading mb-4 uppercase tracking-wide">
              Get Social
            </h4>
            <p className="text-sm text-body leading-relaxed mb-4">
              Sign up for our newsletter to get updates on new arrivals, special offers and our
              latest news.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 sm:gap-0 max-w-xs sm:max-w-none mx-auto sm:mx-0">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email..."
                required
                className="w-full sm:flex-1 border border-gray-300 rounded px-3 py-2.5 text-sm text-body placeholder-gray-400 outline-none focus:border-brand transition-colors sm:rounded-l sm:rounded-r-none"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto bg-brand hover:bg-brand-dark text-white text-xs font-semibold px-4 py-2.5 rounded transition-colors tracking-wide disabled:opacity-50 disabled:cursor-not-allowed sm:rounded-r sm:rounded-l-none"
              >
                {isLoading ? "SUBSCRIBING..." : "SUBSCRIBE"}
              </button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-200 mb-6" />

        {/* Copyright */}
        <p className="text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Lachairs Commercial Products. All rights reserved.
        </p>
      </div>

      {/* Success/Error Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative animate-fade-in">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="text-center">
              <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${
                modalSuccess ? "bg-brand/10" : "bg-red-100"
              }`}>
                {modalSuccess ? (
                  <svg className="h-10 w-10 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              
              <h3 className={`text-xl font-bold mb-2 ${
                modalSuccess ? "text-heading" : "text-red-800"
              }`}>
                {modalSuccess ? "Success!" : "Oops!"}
              </h3>
              
              <p className="text-sm text-body mb-6">
                {modalMessage}
              </p>
              
              <button
                onClick={closeModal}
                className={`w-full px-4 py-2.5 rounded font-semibold text-white transition-colors ${
                  modalSuccess
                    ? "bg-brand hover:bg-brand-dark"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {modalSuccess ? "Great!" : "Try Again"}
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
