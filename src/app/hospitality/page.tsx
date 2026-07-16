import type { Metadata } from "next";
import IndustryPage from "@/components/IndustryPage";

export const metadata: Metadata = {
  title: "Hospitality Customers | Lachairs",
  description:
    "Commercial-grade event furniture for restaurants, wineries, pubs, hotels, catering companies and nightclubs — crafted for long-lasting performance and quick setup.",
};

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

export default function HospitalityPage() {
  return (
    <IndustryPage
      breadcrumb="Hospitality Customers"
      hero={{
        image: "/backgrounds/02.jpg",
        intro: [
          "Lachairs Commercial Products is dedicated to supporting the hospitality industry — including restaurants, wineries, pubs, hotels hosting events, catering companies, and nightclubs — with durable, commercial-grade event furniture.",
          "From stackable chairs and sturdy tables to specialty seating, each piece is crafted for long-lasting performance, easy storage, and quick setup, ensuring smooth transitions between events or daily operations.",
          "Discover how our versatile, affordable furniture can enhance your spaces and elevate your guests' experience.",
        ],
      }}
      ctaCard={{
        title: "Your Vision, Our Craftsmanship",
        text: "At Lachairs Commercial Products, we understand that every hospitality space is unique. That's why we offer a wide range of customization options to ensure your furniture perfectly complements your vision.",
        buttonLabel: "CONTACT US",
        buttonHref: "/contact",
        image: "/left.jpg",
      }}
      exploreProducts={exploreProducts}
    />
  );
}
