import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ReturnPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-heading mb-8">Return Policy</h1>

        <div className="max-w-3xl space-y-6 text-body leading-relaxed">
          <h2 className="text-xl font-bold text-heading mt-10 mb-3">30-Day Return Window</h2>
          <p>
            We accept returns on most products within 30 calendar days of delivery. To be
            eligible for a return, products must be in their original packaging, unused,
            and in resalable condition. Returns initiated after 30 days will not be accepted
            unless covered under warranty.
          </p>

          <h2 className="text-xl font-bold text-heading mt-10 mb-3">How to Initiate a Return</h2>
          <ol className="space-y-3 list-decimal pl-5">
            <li>Log into your business account and navigate to your order history, or contact our support team at{" "}
              <a href="mailto:returns@lachairs.com" className="text-brand hover:text-brand-dark underline">
                returns@lachairs.com
              </a>.
            </li>
            <li>Provide your order number and the reason for the return.</li>
            <li>Our team will issue a Return Merchandise Authorization (RMA) number within 2 business days.</li>
            <li>Clearly mark the RMA number on the outside of all return packages.</li>
            <li>Ship the return to the address provided with your RMA. Return shipping costs are the responsibility of the buyer unless the return is due to our error.</li>
          </ol>

          <h2 className="text-xl font-bold text-heading mt-10 mb-3">Non-Returnable Items</h2>
          <ul className="space-y-2 list-disc pl-5">
            <li>Custom or made-to-order furniture and finishes</li>
            <li>Clearance and &quot;final sale&quot; items</li>
            <li>Products that have been assembled, modified, or permanently installed</li>
            <li>Replacement parts and accessories (covered under separate warranty)</li>
            <li>Items damaged due to customer misuse or improper storage</li>
          </ul>

          <h2 className="text-xl font-bold text-heading mt-10 mb-3">Refund Process</h2>
          <p>
            Once your return is received and inspected, we will notify you of the approval
            or rejection of your refund. Approved refunds will be processed within 5-10
            business days to the original method of payment. For business accounts on net
            terms, a credit memo will be issued against your outstanding balance.
          </p>

          <h2 className="text-xl font-bold text-heading mt-10 mb-3">Restocking Fee</h2>
          <p>
            A restocking fee of 15% may apply to returns that are not the result of our
            error, including orders placed incorrectly by the customer. This fee covers
            inspection, repackaging, and inventory processing. Restocking fees will be
            deducted from your refund amount.
          </p>

          <h2 className="text-xl font-bold text-heading mt-10 mb-3">Damaged or Defective Items</h2>
          <p>
            If your order arrives damaged or with manufacturing defects, please notify us
            within 48 hours of delivery. Photograph the damage — including packaging — and
            email the images to our support team. We will arrange for a replacement shipment
            or full refund at no cost to you and coordinate return shipping for the damaged
            items if required.
          </p>

          <h2 className="text-xl font-bold text-heading mt-10 mb-3">Contact</h2>
          <p>
            For questions about returns, reach us at{" "}
            <a href="mailto:returns@lachairs.com" className="text-brand hover:text-brand-dark underline">
              returns@lachairs.com
            </a>{" "}
            or call 800-531-9968.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
