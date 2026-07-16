import type { Metadata } from "next";
import IndustryPage from "@/components/IndustryPage";

export const metadata: Metadata = {
  title: "Party Rental Customers | Lachairs",
  description:
    "Commercial-grade event furniture built for party rental companies — folding chairs, tables and specialty seating designed for frequent rental, transport and setup.",
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

export default function PartyRentalPage() {
  return (
    <IndustryPage
      breadcrumb="Party Rental Customers"
      hero={{
        image: "/party.jpg",
        intro: [
          "Lachairs Commercial Products is committed to helping party rental companies grow with dependable, commercial-grade event furniture designed for performance and longevity.",
          "From folding chairs and tables to specialty seating and staging solutions, our products are built to withstand the rigors of frequent rentals, transport, and setup — without sacrificing appearance or function.",
          "Whether you're scaling your inventory or refining your rental lineup, Lachairs makes it easier to deliver a seamless client experience, event after event.",
        ],
      }}
      sections={[
        {
          heading: "Essential Equipment",
          paragraphs: [
            "When it comes to party rentals, reliability and ease of use are key. Our selection of plastic folding chairs and resin folding chairs offers durable, stackable seating perfect for indoor and outdoor events.",
            "Pair your seating with our wood folding tables for classic elegance or opt for plastic folding tables for lightweight convenience. Both options provide sturdy surfaces for weddings, banquets, and corporate events, making setup and teardown quick and efficient.",
          ],
          products: [
            { label: "Plastic Folding Chairs", image: "/home-banners/01.jpg", href: "/products" },
            { label: "Resin Folding Chairs", image: "/home-banners/02.jpg", href: "/products" },
            { label: "Plastic Folding Tables", image: "/home-banners/03.jpg", href: "/products" },
            { label: "Plywood Folding Tables", image: "/backgrounds/01.jpg", href: "/products" },
          ],
        },
        {
          heading: "Stand Out In Your Market",
          paragraphs: [
            "Elevate your inventory with standout seating that sets you apart from the competition. Sleek and modern stainless steel chairs offer contemporary appeal, while timeless cross back chairs bring rustic elegance to weddings and upscale events. Our slatted wood folding chairs combine durability and classic design, giving your clients versatile options to match any occasion.",
          ],
          products: [
            { label: "Stainless Steel Chairs", image: "/backgrounds/02.jpg", href: "/products" },
            { label: "Wood Slatted Folding Chairs", image: "/backgrounds/03.jpg", href: "/products" },
            { label: "Cross Back Chairs", image: "/backgrounds/04.jpg", href: "/products" },
          ],
        },
      ]}
      exploreProducts={exploreProducts}
    />
  );
}
