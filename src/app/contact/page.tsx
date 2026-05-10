"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const inquiryTypes = [
  "General Inquiry",
  "Product / Inventory Question",
  "Custom Order Request",
  "Wholesale Account Help",
  "Order Status",
  "Shipping / Delivery Question",
  "Returns & Warranty",
  "Partnership Opportunity",
];

const contactCards = [
  {
    title: "Sales & Inquiries",
    lines: ["info@lachairs.com", "800-531-9968"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="8" y="10" width="32" height="28" rx="4" />
        <path d="M8 14 L24 26 L40 14" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="16" y1="32" x2="32" y2="32" strokeLinecap="round" />
        <line x1="16" y1="36" x2="24" y2="36" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Account Support",
    lines: ["accounts@lachairs.com", "800-531-9968"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="24" cy="16" r="8" />
        <path d="M8 42 C8 32 16 28 24 28 C32 28 40 32 40 42" strokeLinecap="round" />
        <circle cx="24" cy="16" r="3" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Headquarters",
    lines: ["628 Shoppers Ln", "Covina, CA 91723"],
    icon: (
      <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M24 4 C16 12 8 18 8 28 C8 36 16 42 24 42 C32 42 40 36 40 28 C40 18 32 12 24 4Z" />
        <circle cx="24" cy="24" r="6" />
        <circle cx="24" cy="24" r="2" fill="currentColor" />
      </svg>
    ),
  },
];

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function ContactPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    inquiryType: "",
    message: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      {/* Hero Banner */}
      <section className="bg-[#F5F5F5] py-14 md:py-20">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-heading mb-4">Contact Us</h1>
          <p className="text-base text-body max-w-xl mx-auto leading-relaxed">
            Have a question about our products or need help with your account? We&apos;re here to
            help — reach out and our team will get back to you within one business day.
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-12 md:py-16">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactCards.map((card) => (
              <div key={card.title} className="border border-gray-200 rounded-lg p-6 flex flex-col items-center text-center">
                <div className="text-brand mb-4">{card.icon}</div>
                <h3 className="text-sm font-bold text-heading mb-2">{card.title}</h3>
                {card.lines.map((line) => (
                  <p key={line} className="text-sm text-body leading-relaxed">{line}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form + Map/Info */}
      <section className="pb-20">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            {/* Form */}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-heading mb-6">Send Us a Message</h2>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-heading mb-1.5">
                      First Name <span className="text-brand">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-heading placeholder-gray-400 outline-none focus:border-brand transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-heading mb-1.5">
                      Last Name <span className="text-brand">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-heading placeholder-gray-400 outline-none focus:border-brand transition-colors"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-heading mb-1.5">
                      Email Address <span className="text-brand">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="you@company.com"
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-heading placeholder-gray-400 outline-none focus:border-brand transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-heading mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="(555) 000-0000"
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-heading placeholder-gray-400 outline-none focus:border-brand transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-heading mb-1.5">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => handleChange("company", e.target.value)}
                    placeholder="Your company"
                    className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-heading placeholder-gray-400 outline-none focus:border-brand transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-heading mb-1.5">
                    Inquiry Type <span className="text-brand">*</span>
                  </label>
                  <select
                    value={form.inquiryType}
                    onChange={(e) => handleChange("inquiryType", e.target.value)}
                    className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-heading outline-none focus:border-brand transition-colors bg-white"
                    required
                  >
                    <option value="">Select inquiry type...</option>
                    {inquiryTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-heading mb-1.5">
                    Message <span className="text-brand">*</span>
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    rows={6}
                    placeholder="Tell us how we can help..."
                    className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-heading placeholder-gray-400 outline-none focus:border-brand transition-colors resize-y"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-brand hover:bg-brand-dark text-white font-semibold text-sm px-10 py-3 rounded transition-colors tracking-wide"
                >
                  SEND MESSAGE
                </button>
              </form>
            </div>

            {/* Sidebar */}
            <div className="lg:w-[380px] shrink-0">
              <h2 className="text-xl font-bold text-heading mb-6">Our Location</h2>
              <div className="space-y-5">
                <div className="bg-[#F5F5F5] rounded-lg p-6">
                  <h3 className="font-bold text-heading mb-2">Covina, CA</h3>
                  <p className="text-sm text-body leading-relaxed">
                    628 Shoppers Ln<br />
                    Covina, CA 91723<br />
                    800-531-9968
                  </p>
                </div>
              </div>

              <div className="mt-8 bg-brand/5 border border-brand/20 rounded-lg p-6">
                <h3 className="font-bold text-heading mb-2">Business Hours</h3>
                <p className="text-sm text-body leading-relaxed">
                  M-F 9am - 5pm PST
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
