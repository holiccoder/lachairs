import type { Metadata } from "next";
import IndustryPage from "@/components/IndustryPage";

export const metadata: Metadata = {
  title: "Resale Partners | Lachairs",
  description:
    "Wholesale pricing, container-level quantities, drop shipping and custom orders for Lachairs resale partners across CA, TX and NJ warehouses.",
};

const benefits = [
  { title: "Wholesale Pricing" },
  { title: "Drop Shipping" },
  { title: "Container Pricing" },
  { title: "Custom Orders Available" },
  { title: "No Monthly Fees" },
  { title: "No Handling Fees" },
  { title: "No Packaging Fees" },
  { title: "Online Pricing, Inventory & Order Processing" },
  { title: "Large Inventories" },
  { title: "Easy Onboarding" },
  { title: "No Minimum Order Requirements" },
  { title: "Personal Account Management" },
  { title: "Prime Warehouse Locations: CA, TX, and NJ" },
  { title: "100s of Hospitality & Special Event Products" },
];

const exploreProducts = [
  { label: "Folding Chairs", image: "/home-banners/01.jpg", href: "/products" },
  { label: "Stacking Chairs", image: "/home-banners/02.jpg", href: "/products" },
  { label: "Folding Tables", image: "/home-banners/03.jpg", href: "/products" },
  { label: "Banquet Chairs", image: "/backgrounds/01.jpg", href: "/products" },
  { label: "Metal Stacking Chairs", image: "/backgrounds/02.jpg", href: "/products" },
  { label: "Throne Chairs", image: "/backgrounds/03.jpg", href: "/products" },
  { label: "Bars & Barstools", image: "/backgrounds/04.jpg", href: "/products" },
  { label: "Cocktail Tables", image: "/party.jpg", href: "/products" },
];

export default function ResalePartnersPage() {
  return (
    <IndustryPage
      breadcrumb="Resale Customers"
      hero={{
        image: "/backgrounds/03.jpg",
        intro: [
          "Lachairs Commercial Products is dedicated to supporting resale partners with exclusive benefits that drive your business forward. As a valued partner, you gain access to wholesale pricing, container-level quantities, and customized solutions tailored to your business needs.",
          "Our extensive inventory — including elegant Chiavari chairs, rustic cross back chairs, and durable wood folding tables — ensures you can offer your customers the commercial-grade quality they expect.",
          "Resale partners also enjoy personalized account management to streamline ordering, logistics, and support, ensuring a seamless experience. Whether you're growing your inventory or fulfilling large-scale orders, Lachairs Commercial Products delivers the reliability, affordability, and partnership you need to succeed.",
        ],
      }}
      ctaCard={{
        title: "Register Your Business",
        text: "Apply for a resale partner account today and unlock wholesale pricing, container pricing and dedicated account management.",
        buttonLabel: "REGISTER YOUR BUSINESS",
        buttonHref: "/register",
        image: "/left.jpg",
      }}
      benefits={benefits}
      exploreProducts={exploreProducts}
    />
  );
}
