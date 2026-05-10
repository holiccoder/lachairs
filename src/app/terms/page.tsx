import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-heading mb-2">Terms &amp; Conditions</h1>
        <p className="text-sm text-body mb-8">Last Updated: January 1, 2026</p>

        <div className="max-w-3xl space-y-6 text-body leading-relaxed">
          <h2 className="text-xl font-bold text-heading mt-10 mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Lachairs Commercial Products website and services, you agree
            to be bound by these Terms &amp; Conditions. If you do not agree with any part of
            these terms, you may not use our services. These terms apply to all visitors, users,
            and business account holders.
          </p>

          <h2 className="text-xl font-bold text-heading mt-10 mb-3">2. Business Account Registration</h2>
          <p>
            To access wholesale pricing and place orders, you must register for a business
            account. You agree to provide accurate and complete information during the
            registration process. Lachairs Commercial Products reserves the right to approve
            or deny any business account application at its sole discretion. Account approval
            typically occurs within 1 business day. You are responsible for maintaining the
            confidentiality of your account credentials.
          </p>

          <h2 className="text-xl font-bold text-heading mt-10 mb-3">3. Pricing &amp; Payment</h2>
          <p>
            All prices listed on the website are in U.S. dollars. Business account pricing is
            visible only to approved account holders after logging in. Prices are subject to
            change without notice. Payment terms for approved business accounts are net 30 days
            unless otherwise negotiated. We accept payment via ACH transfer, company check, and
            major credit cards.
          </p>

          <h2 className="text-xl font-bold text-heading mt-10 mb-3">4. Orders &amp; Fulfillment</h2>
          <p>
            All orders are subject to acceptance and availability. We reserve the right to
            refuse or cancel any order. Order confirmations do not constitute acceptance; a
            separate shipping confirmation will be sent once your order has been processed.
            Lead times vary by product and quantity. Estimated ship dates are provided at the
            time of order and are non-binding.
          </p>

          <h2 className="text-xl font-bold text-heading mt-10 mb-3">5. Shipping &amp; Delivery</h2>
          <p>
            We ship to commercial addresses throughout the United States and Canada. Shipping
            costs are calculated based on order size, weight, and destination. Freight shipments
            require a loading dock or liftgate service (additional fees may apply). Title and
            risk of loss pass to the buyer upon delivery to the carrier. Please refer to our
            Shipping Information page for full details.
          </p>

          <h2 className="text-xl font-bold text-heading mt-10 mb-3">6. Returns &amp; Warranty</h2>
          <p>
            Products may be returned within 30 days of delivery, subject to our Return Policy.
            Custom and made-to-order items are non-returnable. All products are covered by the
            manufacturer&apos;s warranty as detailed in our Warranty page. Lachairs Commercial
            Products disclaims all other warranties, express or implied, to the fullest extent
            permitted by law.
          </p>

          <h2 className="text-xl font-bold text-heading mt-10 mb-3">7. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Lachairs Commercial Products shall not be
            liable for any indirect, incidental, special, or consequential damages arising out
            of or in connection with the use of our products or services. Our total liability
            for any claim shall not exceed the purchase price of the products giving rise to
            the claim.
          </p>

          <h2 className="text-xl font-bold text-heading mt-10 mb-3">8. Intellectual Property</h2>
          <p>
            All content on this website including text, graphics, logos, images, and software
            is the property of Lachairs Commercial Products or its licensors and is protected by
            U.S. and international copyright laws. The Titan Event Furniture trade mark and Lachairs
            Commercial Products trade mark are registered trademarks.
          </p>

          <h2 className="text-xl font-bold text-heading mt-10 mb-3">9. Governing Law</h2>
          <p>
            These terms shall be governed by and construed in accordance with the laws of the
            State of California, without regard to its conflict of law provisions. Any disputes
            arising under these terms shall be resolved exclusively in the state or federal
            courts located in Los Angeles County, California.
          </p>

          <h2 className="text-xl font-bold text-heading mt-10 mb-3">10. Contact Information</h2>
          <p>
            For questions about these Terms &amp; Conditions, please contact us at{" "}
            <a href="mailto:legal@lachairs.com" className="text-brand hover:text-brand-dark underline">
              legal@lachairs.com
            </a>
            .
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
