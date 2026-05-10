import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function WarrantyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-heading mb-8">Warranty</h1>

        <div className="max-w-3xl space-y-6 text-body leading-relaxed">
          <h2 className="text-xl font-bold text-heading mt-10 mb-3">Our Commitment to Quality</h2>
          <p>
            Lachairs Commercial Products stands behind every item we sell. We partner with
            industry-leading manufacturers to ensure that our products meet the highest
            standards for commercial-grade durability and performance.
          </p>

          <h2 className="text-xl font-bold text-heading mt-10 mb-3">Warranty Coverage by Product Category</h2>

          <div className="space-y-4">
            <div className="bg-[#F5F5F5] rounded-lg p-6">
              <h3 className="font-bold text-heading mb-2">Folding Chairs &amp; Banquet Chairs</h3>
              <p className="text-sm">12-Year Limited Warranty on frame and structure. 2-Year Limited Warranty on finish and surface treatment. This warranty covers manufacturing defects in materials and workmanship under normal commercial use.</p>
            </div>
            <div className="bg-[#F5F5F5] rounded-lg p-6">
              <h3 className="font-bold text-heading mb-2">Folding Tables &amp; Banquet Tables</h3>
              <p className="text-sm">12-Year Limited Warranty on frame and leg mechanism. 5-Year Limited Warranty on tabletop surface against delamination and manufacturing defects. Does not cover surface damage from improper cleaning, cuts, or extreme impact.</p>
            </div>
            <div className="bg-[#F5F5F5] rounded-lg p-6">
              <h3 className="font-bold text-heading mb-2">Lounge &amp; Outdoor Furniture</h3>
              <p className="text-sm">5-Year Limited Warranty on frame structure. 2-Year Limited Warranty on cushions, fabric, and finish. Outdoor furniture warranties cover fading and material degradation under normal outdoor exposure.</p>
            </div>
            <div className="bg-[#F5F5F5] rounded-lg p-6">
              <h3 className="font-bold text-heading mb-2">Carts, Dollies &amp; Storage</h3>
              <p className="text-sm">5-Year Limited Warranty on welded frames and structural components. 1-Year Limited Warranty on casters, wheels, and moving parts.</p>
            </div>
            <div className="bg-[#F5F5F5] rounded-lg p-6">
              <h3 className="font-bold text-heading mb-2">Replacement Parts &amp; Accessories</h3>
              <p className="text-sm">90-Day Limited Warranty on replacement parts including foot caps, glides, and hardware components.</p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-heading mt-10 mb-3">What Is Covered</h2>
          <ul className="space-y-2 list-disc pl-5">
            <li>Manufacturing defects in materials and workmanship</li>
            <li>Structural failures under normal commercial use within rated weight capacity</li>
            <li>Weld failures on steel frames</li>
            <li>Delamination of tabletop surfaces not caused by misuse</li>
          </ul>

          <h2 className="text-xl font-bold text-heading mt-10 mb-3">What Is Not Covered</h2>
          <ul className="space-y-2 list-disc pl-5">
            <li>Damage from improper use, abuse, or accidents</li>
            <li>Normal wear and tear including scratches, dents, and surface marks</li>
            <li>Damage from improper cleaning chemicals or methods</li>
            <li>Modifications or repairs performed by unauthorized parties</li>
            <li>Products used outside their rated weight capacity</li>
            <li>Fading or discoloration from extreme environmental exposure beyond rated specifications</li>
          </ul>

          <h2 className="text-xl font-bold text-heading mt-10 mb-3">How to Make a Warranty Claim</h2>
          <ol className="space-y-3 list-decimal pl-5">
            <li>Contact our warranty department at{" "}
              <a href="mailto:warranty@lachairs.com" className="text-brand hover:text-brand-dark underline">
                warranty@lachairs.com
              </a>{" "}
              or call 800-531-9968.
            </li>
            <li>Provide your original order number, product details, and a description of the issue.</li>
            <li>Include clear photographs showing the defect or damage.</li>
            <li>Our team will review your claim within 3-5 business days and provide a resolution — which may include repair, replacement, or credit at our discretion.</li>
          </ol>

          <p className="text-sm text-body mt-6">
            This warranty gives you specific legal rights, and you may also have other rights
            which vary by state. This limited warranty is the sole and exclusive warranty
            provided by Lachairs Commercial Products.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
