import Link from "next/link";

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const footerProductLinks = [
  { label: "Catalog", href: "/products" },
  { label: "Customization", href: "#" },
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

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8 px-6 lg:px-12">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Column 1 — Brand */}
          <div>
            <div className="mb-4">
              <img src="/logo.jpg" alt="Lachairs" className="h-16 w-auto object-contain" />
            </div>
            <p className="text-base text-body leading-relaxed">
              628 Shoppers Ln<br />
              Covina, CA 91723<br />
              info@lachairs.com<br />
              800-531-9968
            </p>
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

          {/* Column 4 — Newsletter */}
          <div>
            <h4 className="text-sm font-bold text-heading mb-4 uppercase tracking-wide">
              Get Social
            </h4>
            <p className="text-sm text-body leading-relaxed mb-4">
              Sign up for our newsletter to get updates on new arrivals, special offers and our
              latest news.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email..."
                className="flex-1 border border-gray-300 rounded-l px-3 py-2.5 text-sm text-body placeholder-gray-400 outline-none focus:border-brand transition-colors"
              />
              <button className="bg-brand hover:bg-brand-dark text-white text-xs font-semibold px-4 py-2.5 rounded-r transition-colors tracking-wide">
                SUBSCRIBE
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-200 mb-6" />

        {/* Copyright */}
        <p className="text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Lachairs Commercial Products. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
