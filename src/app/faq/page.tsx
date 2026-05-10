import Header from "@/components/Header";
import Footer from "@/components/Footer";

const faqs = [
  {
    q: "How do I create a business account?",
    a: "Click 'CREATE BUSINESS ACCOUNT' in the header or visit the registration page. Fill out your company details and submit. Our team reviews applications within 1 business day and you'll receive an email once approved.",
  },
  {
    q: "Who can register for a wholesale account?",
    a: "Wholesale accounts are available to verified businesses including event rental companies, hospitality venues, interior design firms, restaurants, educational institutions, government agencies, religious organizations, and resellers.",
  },
  {
    q: "How do I place an order?",
    a: "Once your business account is approved, log in to view wholesale pricing. Browse our catalog, add items to your cart, and proceed through checkout. You can also request a quote for large or custom orders.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept ACH transfers, company checks, and major credit cards. Net 30 payment terms are available for approved business accounts.",
  },
  {
    q: "What are your shipping options and lead times?",
    a: "We ship to commercial addresses throughout the US and Canada via LTL freight and ground carriers. Lead times vary by product and quantity — estimated ship dates are provided at the time of order. Freight shipments require a loading dock or liftgate service (additional fees may apply).",
  },
  {
    q: "Do you offer international shipping?",
    a: "Currently we ship within the United States and Canada. For international inquiries outside these regions, please contact our sales team.",
  },
  {
    q: "What is your return policy?",
    a: "Products may be returned within 30 days of delivery, subject to a restocking fee. Items must be in original condition and packaging. Custom and made-to-order items are non-returnable. Please visit our Return Policy page for full details.",
  },
  {
    q: "Do your products come with a warranty?",
    a: "Yes, all products are covered by manufacturer warranties. Warranty periods vary by product — ranging from 1 year to 12 years depending on the item. Visit our Warranty page for details on specific products.",
  },
  {
    q: "Can I customize furniture?",
    a: "Yes, we offer custom fabrication services for bulk orders. This includes custom colors, finishes, dimensions, and branding. Contact our sales team to discuss your project requirements.",
  },
  {
    q: "Do you offer volume discounts?",
    a: "Yes, wholesale pricing is available to all approved business accounts. Additional volume discounts may apply for large quantity orders. Contact your account representative for a quote.",
  },
  {
    q: "How do I track my order?",
    a: "Log in to your account dashboard to view order status, tracking information, and order history. You'll also receive email notifications when your order ships.",
  },
  {
    q: "Where are you located?",
    a: "Our headquarters is in Los Angeles, CA, with additional distribution centers in Houston, TX and the New York metro area. Visit our Contact Us page for full addresses and phone numbers.",
  },
];

export default function FaqPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <section className="bg-[#F5F5F5] py-14 md:py-20">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-heading mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-base text-body max-w-xl mx-auto leading-relaxed">
            Find answers to common questions about our products, ordering process, and business accounts.
          </p>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16">
        <div className="max-w-3xl mx-auto divide-y divide-gray-200">
          {faqs.map((faq, i) => (
            <details key={i} className="group py-5">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <h3 className="text-base font-semibold text-heading pr-4 group-open:text-brand transition-colors">
                  {faq.q}
                </h3>
                <span className="shrink-0 text-gray-400 group-open:hidden">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
                    <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="shrink-0 text-brand hidden group-open:block">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 text-sm text-body leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>

        <div className="max-w-3xl mx-auto mt-16 bg-[#F5F5F5] rounded-lg p-8 text-center">
          <h2 className="text-lg font-bold text-heading mb-3">Still have questions?</h2>
          <p className="text-sm text-body leading-relaxed mb-6">
            Our team is ready to help. Reach out and we'll get back to you within one business day.
          </p>
          <a
            href="/contact"
            className="inline-block bg-brand hover:bg-brand-dark text-white font-semibold text-sm px-8 py-3 rounded transition-colors tracking-wide"
          >
            CONTACT US
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
