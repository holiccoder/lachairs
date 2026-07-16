"use client";

import { motion } from "motion/react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface IndustryProductLink {
  label: string;
  image: string;
  href: string;
}

export interface IndustrySection {
  heading: string;
  paragraphs: string[];
  products?: IndustryProductLink[];
}

export interface IndustryBenefit {
  title: string;
  text?: string;
}

export interface IndustryPageProps {
  breadcrumb: string;
  hero: {
    image: string;
    intro: string[];
  };
  sections?: IndustrySection[];
  benefits?: IndustryBenefit[];
  ctaCard?: {
    title: string;
    text: string;
    buttonLabel: string;
    buttonHref: string;
    image: string;
  };
  exploreProducts: IndustryProductLink[];
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function FadeIn({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ProductGrid({ items }: { items: IndustryProductLink[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((p) => (
        <Link
          key={p.label}
          href={p.href}
          className="flex flex-col items-center gap-3 group"
        >
          <div className="w-full aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-100 group-hover:border-brand/30 transition-colors">
            <img
              src={p.image}
              alt={p.label}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <span className="text-sm md:text-base text-body text-center leading-tight group-hover:text-heading transition-colors">
            {p.label}
          </span>
        </Link>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function IndustryPage({
  breadcrumb,
  hero,
  sections,
  benefits,
  ctaCard,
  exploreProducts,
}: IndustryPageProps) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      {/* Breadcrumb */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-6 w-full">
        <nav className="text-xs text-body">
          <Link href="/" className="hover:text-brand transition-colors">
            Home
          </Link>
          <span className="mx-2 text-gray-300">/</span>
          <span className="text-heading">{breadcrumb}</span>
        </nav>
      </div>

      {/* Hero image + intro */}
      <section className="pt-10">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <FadeIn>
            <div className="rounded-lg overflow-hidden mb-10">
              <img
                src={hero.image}
                alt={breadcrumb}
                className="w-full h-64 md:h-96 object-cover"
              />
            </div>
          </FadeIn>
          <FadeIn className="max-w-4xl mx-auto space-y-5 text-body leading-relaxed text-base md:text-lg">
            {hero.intro.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </FadeIn>
        </div>
      </section>

      {/* Optional content sections */}
      {sections?.map((section, i) => (
        <section
          key={section.heading}
          className={`py-16 md:py-20 ${i % 2 === 0 ? "" : "bg-[#F5F5F5]"}`}
        >
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
            <FadeIn>
              <h2 className="text-2xl md:text-3xl font-bold text-heading text-center mb-6">
                {section.heading}
              </h2>
            </FadeIn>
            <FadeIn className="max-w-4xl mx-auto space-y-4 text-body leading-relaxed text-center mb-10">
              {section.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </FadeIn>
            {section.products ? <ProductGrid items={section.products} /> : null}
          </div>
        </section>
      ))}

      {/* Optional Benefits list */}
      {benefits ? (
        <section className="py-16 md:py-20 bg-[#F5F5F5]">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
            <FadeIn>
              <h2 className="text-2xl md:text-3xl font-bold text-heading text-center mb-10">
                Resale Partner Benefits
              </h2>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {benefits.map((b) => (
                <FadeIn key={b.title}>
                  <div className="bg-white rounded-lg p-6 h-full border border-gray-100">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-brand shrink-0 mt-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path d="M5 12 L10 17 L20 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div>
                        <h3 className="text-base font-semibold text-heading">{b.title}</h3>
                        {b.text ? (
                          <p className="text-sm text-body leading-relaxed mt-1">{b.text}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Optional CTA card */}
      {ctaCard ? (
        <section className="py-16 md:py-20">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
            <FadeIn>
              <div className="grid grid-cols-1 md:grid-cols-2 rounded-lg overflow-hidden bg-[#F5F5F5]">
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <h3 className="text-xl md:text-2xl font-bold text-heading mb-4">
                    {ctaCard.title}
                  </h3>
                  <p className="text-body leading-relaxed mb-6">{ctaCard.text}</p>
                  <Link
                    href={ctaCard.buttonHref}
                    className="bg-brand hover:bg-brand-dark text-white font-semibold text-xs px-6 py-3 rounded transition-colors tracking-wide inline-block w-max"
                  >
                    {ctaCard.buttonLabel}
                  </Link>
                </div>
                <div className="h-64 md:h-auto">
                  <img
                    src={ctaCard.image}
                    alt={ctaCard.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      ) : null}

      {/* Explore Our Products */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <FadeIn>
            <h2 className="text-2xl md:text-3xl font-bold text-heading text-center mb-12">
              Explore Our Products
            </h2>
          </FadeIn>
          <ProductGrid items={exploreProducts} />
          <div className="text-center mt-12">
            <Link
              href="/products"
              className="inline-block border-2 border-brand text-brand hover:bg-brand hover:text-white font-semibold text-sm px-8 py-3 rounded transition-colors tracking-wide"
            >
              VIEW ALL PRODUCTS
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
