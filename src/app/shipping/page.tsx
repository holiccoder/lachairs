import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ShippingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-heading mb-8">Shipping Information</h1>

        <div className="max-w-3xl space-y-6 text-body leading-relaxed">
          <h2 className="text-xl font-bold text-heading mt-10 mb-3">Service Areas</h2>
          <p>
            Lachairs Commercial Products ships to commercial addresses throughout the contiguous
            United States and Canada. We currently do not ship to P.O. boxes, residential
            addresses (exceptions available for certain small-parcel orders), Alaska, Hawaii,
            or international destinations outside the U.S. and Canada.
          </p>

          <h2 className="text-xl font-bold text-heading mt-10 mb-3">Shipping Methods</h2>
          <div className="space-y-4">
            <div className="bg-[#F5F5F5] rounded-lg p-6">
              <h3 className="font-bold text-heading mb-2">Small Parcel (FedEx / UPS)</h3>
              <p className="text-sm">For orders under 150 lbs and within standard box dimensions. Typically 3-7 business days. Tracking provided. Available for replacement parts, small accessories, and single-chair orders.</p>
            </div>
            <div className="bg-[#F5F5F5] rounded-lg p-6">
              <h3 className="font-bold text-heading mb-2">LTL Freight</h3>
              <p className="text-sm">For larger orders on pallets — typically 5-10 business days depending on destination. Requires a commercial loading dock or liftgate service (liftgate available for an additional fee). Appointment scheduling provided by the carrier.</p>
            </div>
            <div className="bg-[#F5F5F5] rounded-lg p-6">
              <h3 className="font-bold text-heading mb-2">Full Truckload (FTL)</h3>
              <p className="text-sm">For high-volume orders. Dedicated truck with direct delivery. Transit time varies by distance — typically 3-7 business days. Contact your account manager for a custom freight quote.</p>
            </div>
            <div className="bg-[#F5F5F5] rounded-lg p-6">
              <h3 className="font-bold text-heading mb-2">Will Call / Pickup</h3>
              <p className="text-sm">Free pickup available at our Covina, CA warehouse. Orders must be placed in advance. Pickup hours: M-F 9am - 5pm PST. Please bring your order confirmation and valid ID.</p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-heading mt-10 mb-3">Shipping Rates</h2>
          <p>
            Shipping costs are calculated at checkout based on order weight, dimensions,
            destination, and selected shipping method. Business account holders with negotiated
            freight terms will see their custom rates reflected at checkout after logging in.
            For large-volume orders, please contact your account manager for a dedicated
            freight quote.
          </p>

          <h2 className="text-xl font-bold text-heading mt-10 mb-3">Order Processing Times</h2>
          <ul className="space-y-2 list-disc pl-5">
            <li><strong>In-Stock Items:</strong> Orders placed before 2:00 PM local time typically ship within 1-2 business days.</li>
            <li><strong>Backordered Items:</strong> Estimated restock dates are displayed on the product page. We will notify you of any significant delays.</li>
            <li><strong>Custom Orders:</strong> Production lead times vary by product. Your account manager will provide a timeline at order confirmation.</li>
          </ul>

          <h2 className="text-xl font-bold text-heading mt-10 mb-3">Tracking & Delivery</h2>
          <p>
            Once your order ships, you will receive an email with tracking information and
            an estimated delivery date. For freight shipments, the carrier will contact you
            to schedule a delivery appointment. Please inspect all deliveries upon arrival
            and note any damage on the delivery receipt before signing.
          </p>

          <h2 className="text-xl font-bold text-heading mt-10 mb-3">International Shipping (Canada)</h2>
          <p>
            Orders shipping to Canada may be subject to import duties, taxes, and customs
            clearance fees. These charges are the responsibility of the buyer. Lachairs
            Commercial Products is not responsible for delays caused by customs processing.
            Please contact our team for estimated duties before placing your order.
          </p>

          <h2 className="text-xl font-bold text-heading mt-10 mb-3">Contact</h2>
          <p>
            For shipping questions or to request a freight quote, email{" "}
            <a href="mailto:shipping@lachairs.com" className="text-brand hover:text-brand-dark underline">
              shipping@lachairs.com
            </a>{" "}
            or call 800-531-9968.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
