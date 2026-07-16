import type { Metadata } from "next";
import IndustryPage from "@/components/IndustryPage";

export const metadata: Metadata = {
  title: "Venue Customers | Lachairs",
  description:
    "Commercial-grade Chiavari chairs, cross back chairs, wood folding tables and more — designed to help venue owners deliver unforgettable events.",
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

export default function VenuePage() {
  return (
    <IndustryPage
      breadcrumb="Venue Customers"
      hero={{
        image: "/backgrounds/04.jpg",
        intro: [
          "Lachairs Commercial Products is dedicated to helping venue owners create stunning and functional event spaces with dependable, commercial-grade furniture. From elegant Chiavari chairs and rustic cross back chairs to versatile wood folding tables and chairs, our products are designed to enhance every occasion.",
          "Built for frequent use, easy transport, and efficient setup, our inventory meets the demands of weddings, banquets, corporate gatherings, and more. Lachairs Commercial Products provides the tools you need to deliver unforgettable experiences.",
        ],
      }}
      sections={[
        {
          heading: "Essential Equipment",
          paragraphs: [
            "For venue owners, reliability and timeless style are essential. Our Chiavari Chairs deliver elegant, stackable seating perfect for weddings, galas, and upscale events, while Wood Folding Chairs and Wood Folding Tables combine classic charm with durability for more rustic or traditional settings.",
            "Cross Back Chairs add a touch of vintage sophistication, making them a favorite for wineries, farm venues, and outdoor celebrations.",
          ],
          products: [
            { label: "Chiavari Chairs", image: "/home-banners/02.jpg", href: "/products" },
            { label: "Wood Folding Chairs", image: "/home-banners/01.jpg", href: "/products" },
            { label: "Cross Back Chairs", image: "/backgrounds/03.jpg", href: "/products" },
            { label: "Plywood Folding Tables", image: "/home-banners/03.jpg", href: "/products" },
          ],
        },
      ]}
      exploreProducts={exploreProducts}
    />
  );
}
