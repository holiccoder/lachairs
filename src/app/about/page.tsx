import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-heading mb-8">About Us</h1>

        <div className="max-w-3xl space-y-6 text-body leading-relaxed">
          <p>
            Lachairs Commercial Products is a premier supplier of commercial-grade furniture and
            equipment, proudly serving event professionals, hospitality venues, and interior
            designers across the United States and Canada. Founded with a mission to simplify
            the sourcing process for business buyers, we combine extensive inventory,
            competitive pricing, and exceptional customer service to deliver an unmatched
            experience.
          </p>

          <h2 className="text-xl font-bold text-heading mt-10 mb-3">Our Story</h2>
          <p>
            What began as a small family-operated warehouse in Los Angeles has grown into a
            nationwide operation with distribution centers in Houston, Texas, and the New York
            metro area. Over the past two decades, we&apos;ve partnered with thousands of
            event rental companies, hotels, convention centers, and design firms — earning a
            reputation for reliability, quality, and deep industry expertise.
          </p>

          <h2 className="text-xl font-bold text-heading mt-10 mb-3">Our Mission</h2>
          <p>
            We believe that sourcing commercial furniture should be straightforward. Our
            platform gives business customers access to transparent inventory data, bulk
            purchasing options, and dedicated account management — all designed to save time
            and reduce friction in the procurement process.
          </p>

          <h2 className="text-xl font-bold text-heading mt-10 mb-3">Our Values</h2>
          <ul className="space-y-3 list-disc pl-5">
            <li>
              <strong>Quality First</strong> — Every product in our catalog is vetted for
              contract-grade durability and performance.
            </li>
            <li>
              <strong>Customer Partnership</strong> — We don&apos;t just sell furniture; we
              invest in long-term relationships with customized solutions and responsive support.
            </li>
            <li>
              <strong>Innovation</strong> — From our online ordering platform to custom
              fabrication capabilities, we continuously evolve to meet modern business needs.
            </li>
            <li>
              <strong>Integrity</strong> — Honest pricing, accurate lead times, and
              transparent communication are the foundation of every transaction.
            </li>
          </ul>

          <h2 className="text-xl font-bold text-heading mt-10 mb-3">Our Location</h2>
          <div className="grid grid-cols-1 gap-6 mt-4">
            <div className="bg-[#F5F5F5] rounded-lg p-6">
              <h3 className="font-bold text-heading mb-2">Covina, CA</h3>
              <p className="text-sm">628 Shoppers Ln<br />Covina, CA 91723</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
