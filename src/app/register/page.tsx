"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { registerCompany, loginCustomer } from "@/lib/magento";
import { useAuth, setAuthData } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const businessTypes = [
  "Event Rental Company",
  "Hospitality / Hotel",
  "Venue / Convention Center",
  "Interior Design Firm",
  "Restaurant / Catering",
  "Educational Institution",
  "Government / Military",
  "Religious Organization",
  "Reseller / Distributor",
  "Other",
];

const usStates = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

const passwordMinLength = 8;

const whyRegisterItems = [
  {
    title: "Wholesale Pricing",
    text: "Get instant access to bulk discounts and exclusive B2B rates not available to the public.",
    icon: (
      <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 16 L24 4 L42 16 L42 40 L6 40 Z" />
        <path d="M20 40 L20 26 L28 26 L28 40" strokeLinejoin="round" />
        <rect x="18" y="10" width="12" height="4" rx="1" />
      </svg>
    ),
  },
  {
    title: "Fast Re-Ordering",
    text: "Use Quick Order tools to reorder from your purchase history in just a few clicks.",
    icon: (
      <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="24" cy="24" r="20" />
        <path d="M24 12 L24 24 L32 28" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 24 C10 24 8 28 8 32 C8 36 10 40 14 40" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Quote Management",
    text: "Request, view, and manage quotes directly from your account dashboard.",
    icon: (
      <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="20" cy="20" r="6" />
        <path d="M30 20 C34 20 38 24 38 30 C38 36 34 40 30 40" strokeLinecap="round" />
        <rect x="14" y="28" width="12" height="3" rx="1.5" />
        <rect x="14" y="33" width="16" height="3" rx="1.5" />
        <rect x="16" y="38" width="8" height="3" rx="1.5" />
      </svg>
    ),
  },
  {
    title: "Smart Tracking",
    text: "Track your full order history — online and offline — all in one place.",
    icon: (
      <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="6" y="8" width="28" height="20" rx="3" />
        <rect x="10" y="12" width="20" height="12" rx="1" />
        <path d="M34 20 L42 16 L42 36 L34 32" strokeLinejoin="round" />
        <circle cx="24" cy="34" r="3" />
        <path d="M24 37 L24 44 M20 42 L28 42" strokeLinecap="round" />
      </svg>
    ),
  },
];

const howItWorksSteps = [
  {
    step: "1",
    title: "Fill out the form",
    text: "Complete the registration form with your company details and administrator information.",
  },
  {
    step: "2",
    title: "Review",
    text: "Our team reviews your application within 1 business day to verify your business credentials.",
  },
  {
    step: "3",
    title: "Save",
    text: "Once approved, you'll receive access to your B2B dashboard with wholesale pricing and tools.",
  },
];

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function RegisterPage() {
  const router = useRouter();
  const auth = useAuth();

  const [form, setForm] = useState({
    companyName: "",
    companyLegalName: "",
    companyEmail: "",
    businessType: "",
    vatTaxId: "",
    resellerId: "",
    streetAddress: "",
    streetAddress2: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
    phone: "",
    jobTitle: "",
    adminEmail: "",
    firstName: "",
    lastName: "",
    password: "",
    passwordConfirm: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (auth.hydrated && auth.isLoggedIn) {
      router.replace("/dashboard");
    }
  }, [auth.hydrated, auth.isLoggedIn, router]);

  if (!auth.hydrated) return null;
  if (auth.isLoggedIn) return null;

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await registerCompany(form);

    setSubmitting(false);
    if (result.success && typeof result.customerId === "number") {
      setCustomerId(result.customerId);
      const loginResult = await loginCustomer(form.adminEmail, form.password);
      if (loginResult.success) {
        setAuthData(loginResult.token!, form.adminEmail, form.firstName, form.lastName);
        router.push("/dashboard");
      } else {
        setSuccess(true);
      }
    } else {
      setCustomerId(null);
      setError(result.error ?? "Registration failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      {/* Page Title */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 w-full pt-8 pb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-heading">
          Apply for a Wholesale Account
        </h1>
      </div>

      {/* Two-Column Layout */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 w-full pb-20">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* ============================================================== */}
          {/*  Left Column — Marketing & Instructions                          */}
          {/* ============================================================== */}
          <div className="lg:w-[420px] shrink-0">
            <p className="text-base text-body leading-relaxed mb-8">
              Create an account to access wholesale pricing, bulk tools, and priority support.
            </p>

            {/* Why Register */}
            <h2 className="text-lg font-bold text-heading mb-5">Why Register?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {whyRegisterItems.map((item) => (
                <div key={item.title} className="flex flex-col gap-2">
                  <div className="text-gray-400">{item.icon}</div>
                  <div>
                    <h3 className="text-sm font-semibold text-heading mb-0.5">{item.title}</h3>
                    <p className="text-xs text-body leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* How it works */}
            <div className="bg-[#F5F5F5] rounded-lg p-6">
              <h3 className="text-sm font-bold text-heading mb-4">How it works:</h3>
              <div className="space-y-4">
                {howItWorksSteps.map((s) => (
                  <div key={s.step} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {s.step}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-heading">{s.title}</p>
                      <p className="text-xs text-body leading-relaxed">{s.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/*  Right Column — Registration Form                               */}
          {/* ============================================================== */}
          <div className="flex-1 min-w-0">
            {success ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
                <svg viewBox="0 0 48 48" className="w-12 h-12 mx-auto mb-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="24" cy="24" r="20" />
                  <path d="M14 24 L21 31 L34 17" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h2 className="text-xl font-bold text-heading mb-2">Application Submitted!</h2>
                <p className="text-sm text-body">
                  Thank you, {form.firstName}. Our team will review your application and reach out to{" "}
                  <strong>{form.adminEmail}</strong> within 1 business day.
                </p>
                {customerId !== null ? (
                  <p className="text-xs text-gray-500 mt-3">Customer ID: {customerId}</p>
                ) : null}
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Company Information */}
              <fieldset>
                <legend className="text-base font-bold text-heading mb-5">
                  Company Information
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-heading mb-1.5">
                      Company Name <span className="text-brand">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.companyName}
                      onChange={(e) => handleChange("companyName", e.target.value)}
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-heading placeholder-gray-400 outline-none focus:border-brand transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-heading mb-1.5">
                      Company Legal Name
                    </label>
                    <input
                      type="text"
                      value={form.companyLegalName}
                      onChange={(e) => handleChange("companyLegalName", e.target.value)}
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-heading placeholder-gray-400 outline-none focus:border-brand transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-heading mb-1.5">
                      Company Email <span className="text-brand">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.companyEmail}
                      onChange={(e) => handleChange("companyEmail", e.target.value)}
                      placeholder="info@yourcompany.com"
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-heading placeholder-gray-400 outline-none focus:border-brand transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-heading mb-1.5">
                      Business Type <span className="text-brand">*</span>
                    </label>
                    <select
                      value={form.businessType}
                      onChange={(e) => handleChange("businessType", e.target.value)}
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-heading outline-none focus:border-brand transition-colors bg-white"
                      required
                    >
                      <option value="">Select business type...</option>
                      {businessTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-heading mb-1.5">
                      VAT / TAX ID
                    </label>
                    <input
                      type="text"
                      value={form.vatTaxId}
                      onChange={(e) => handleChange("vatTaxId", e.target.value)}
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-heading placeholder-gray-400 outline-none focus:border-brand transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-heading mb-1.5">
                      Re-seller ID
                    </label>
                    <input
                      type="text"
                      value={form.resellerId}
                      onChange={(e) => handleChange("resellerId", e.target.value)}
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-heading placeholder-gray-400 outline-none focus:border-brand transition-colors"
                    />
                  </div>
                </div>
              </fieldset>

              {/* Legal Address */}
              <fieldset>
                <legend className="text-base font-bold text-heading mb-5">
                  Legal Address
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-heading mb-1.5">
                      Street Address <span className="text-brand">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.streetAddress}
                      onChange={(e) => handleChange("streetAddress", e.target.value)}
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-heading placeholder-gray-400 outline-none focus:border-brand transition-colors"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-heading mb-1.5">
                      Street Address 2
                    </label>
                    <input
                      type="text"
                      value={form.streetAddress2}
                      onChange={(e) => handleChange("streetAddress2", e.target.value)}
                      placeholder="Suite, Floor, etc."
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-heading placeholder-gray-400 outline-none focus:border-brand transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-heading mb-1.5">
                      City <span className="text-brand">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-heading placeholder-gray-400 outline-none focus:border-brand transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-heading mb-1.5">
                      State / Province <span className="text-brand">*</span>
                    </label>
                    <select
                      value={form.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-heading outline-none focus:border-brand transition-colors bg-white"
                      required
                    >
                      <option value="">Select state...</option>
                      {usStates.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-heading mb-1.5">
                      ZIP / Postal Code <span className="text-brand">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.zip}
                      onChange={(e) => handleChange("zip", e.target.value)}
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-heading placeholder-gray-400 outline-none focus:border-brand transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-heading mb-1.5">
                      Country <span className="text-brand">*</span>
                    </label>
                    <select
                      value={form.country}
                      onChange={(e) => handleChange("country", e.target.value)}
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-heading outline-none focus:border-brand transition-colors bg-white"
                      required
                    >
                      <option>United States</option>
                      <option>Canada</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-heading mb-1.5">
                      Phone Number <span className="text-brand">*</span>
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="(555) 000-0000"
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-heading placeholder-gray-400 outline-none focus:border-brand transition-colors"
                      required
                    />
                  </div>
                </div>
              </fieldset>

              {/* Company Administrator */}
              <fieldset>
                <legend className="text-base font-bold text-heading mb-5">
                  Company Administrator
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-heading mb-1.5">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={form.jobTitle}
                      onChange={(e) => handleChange("jobTitle", e.target.value)}
                      placeholder="Owner, Purchasing Manager, etc."
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-heading placeholder-gray-400 outline-none focus:border-brand transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-heading mb-1.5">
                      Email <span className="text-brand">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.adminEmail}
                      onChange={(e) => handleChange("adminEmail", e.target.value)}
                      placeholder="you@yourcompany.com"
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-heading placeholder-gray-400 outline-none focus:border-brand transition-colors"
                      required
                    />
                  </div>
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
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-heading mb-1.5">
                      Login Password <span className="text-brand">*</span>
                    </label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      placeholder="Setup login password"
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-heading placeholder-gray-400 outline-none focus:border-brand transition-colors"
                       minLength={passwordMinLength}
                      required
                    />
                     <p className="mt-1.5 text-xs text-body">
                       Passwords only need to be at least {passwordMinLength} characters long.
                     </p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-heading mb-1.5">
                      Confirm Password <span className="text-brand">*</span>
                    </label>
                    <input
                      type="password"
                      value={form.passwordConfirm}
                      onChange={(e) => handleChange("passwordConfirm", e.target.value)}
                      placeholder="Re-enter login password"
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm text-heading placeholder-gray-400 outline-none focus:border-brand transition-colors"
                      minLength={passwordMinLength}
                      required
                    />
                  </div>
                </div>
              </fieldset>

              {/* Submit */}
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-3">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="bg-brand hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm px-10 py-3 rounded transition-colors tracking-wide"
              >
                {submitting ? "SUBMITTING…" : "SUBMIT"}
              </button>
            </form>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
