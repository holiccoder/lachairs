import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-heading mb-2">Privacy Policy</h1>
        <p className="text-sm text-body mb-8">Last Updated: January 1, 2026</p>

        <div className="max-w-3xl space-y-6 text-body leading-relaxed">
          <h2 className="text-xl font-bold text-heading mt-10 mb-3">1. Information We Collect</h2>
          <p>
            When you create a business account, place an order, or contact our support team,
            we may collect the following types of information:
          </p>
          <ul className="space-y-2 list-disc pl-5">
            <li>Business name, contact person, and job title</li>
            <li>Email address, phone number, and mailing address</li>
            <li>Tax identification numbers and business licenses (for trade account verification)</li>
            <li>Order history and purchase preferences</li>
            <li>Payment information (processed securely through third-party payment processors)</li>
            <li>Website usage data including IP address, browser type, and pages visited</li>
          </ul>

          <h2 className="text-xl font-bold text-heading mt-10 mb-3">2. How We Use Your Information</h2>
          <p>We use the collected information for the following purposes:</p>
          <ul className="space-y-2 list-disc pl-5">
            <li>Processing and fulfilling your orders</li>
            <li>Managing your business account and providing customer support</li>
            <li>Sending order confirmations, shipping updates, and invoices</li>
            <li>Communicating about product updates, promotions, and new inventory (with opt-out option)</li>
            <li>Improving our website and product offerings based on usage analytics</li>
            <li>Complying with legal obligations and preventing fraud</li>
          </ul>

          <h2 className="text-xl font-bold text-heading mt-10 mb-3">3. Information Sharing</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. We may
            share your information only in the following circumstances:
          </p>
          <ul className="space-y-2 list-disc pl-5">
            <li>With shipping carriers and logistics partners to fulfill your orders</li>
            <li>With payment processors to complete transactions</li>
            <li>When required by law or to protect our legal rights</li>
            <li>With your explicit consent</li>
          </ul>

          <h2 className="text-xl font-bold text-heading mt-10 mb-3">4. Data Security</h2>
          <p>
            We implement industry-standard security measures including SSL encryption, secure
            server infrastructure, and regular security audits. Access to your personal
            information is restricted to authorized personnel who require it for business
            purposes. While we strive to protect your data, no method of electronic storage
            or transmission is 100% secure.
          </p>

          <h2 className="text-xl font-bold text-heading mt-10 mb-3">5. Cookies & Tracking</h2>
          <p>
            Our website uses cookies and similar tracking technologies to enhance your browsing
            experience, analyze site traffic, and personalize content. You can control cookie
            preferences through your browser settings. Disabling cookies may affect certain
            features of our website.
          </p>

          <h2 className="text-xl font-bold text-heading mt-10 mb-3">6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="space-y-2 list-disc pl-5">
            <li>Access and review the personal information we hold about you</li>
            <li>Request corrections to inaccurate or incomplete data</li>
            <li>Request deletion of your personal information, subject to legal requirements</li>
            <li>Opt out of marketing communications at any time</li>
            <li>Request a copy of your data in a portable format</li>
          </ul>

          <h2 className="text-xl font-bold text-heading mt-10 mb-3">7. Contact Us</h2>
          <p>
            If you have questions or concerns about this Privacy Policy, please contact us at{" "}
            <a href="mailto:privacy@lachairs.com" className="text-brand hover:text-brand-dark underline">
              privacy@lachairs.com
            </a>{" "}
            or call 800-531-9968.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
