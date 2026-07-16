"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import type { Product } from "@/lib/magento";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const heroSlides = [
  {
    src: "/home-banners/01.jpg",
    heading: "The Easiest Way to Source Commercial Furniture",
    text: "Reliable inventory, contract-grade durability, and dedicated support for business buyers. Get started by creating your account.",
    button: "UNLOCK BUSINESS PRICING",
    subtext: "Account Approval Typically Within 1 Business Day",
  },
  {
    src: "/home-banners/02.jpg",
    heading: "Custom Furniture Designed for Your Vision",
    text: "From concept to completion, we work with designers and venues to craft pieces that match your exact specifications.",
    button: "EXPLORE CUSTOMIZATION",
    subtext: "Free Design Consultation Available",
  },
  {
    src: "/home-banners/03.jpg",
    heading: "Trusted by Hospitality Leaders Nationwide",
    text: "Join hundreds of hotels, venues, and event planners who rely on Lachairs for quality, consistency, and on-time delivery.",
    button: "CREATE WHOLESALE ACCOUNT",
    subtext: "Serving the US and Canada",
  },
];

const industryCategories = [
  {
    title: "PARTY RENTAL",
    image: "/backgrounds/01.jpg",
    href: "/party-rental",
  },
  {
    title: "HOSPITALITY",
    image: "/backgrounds/02.jpg",
    href: "/hospitality",
  },
  {
    title: "RESALE PARTNERS",
    image: "/backgrounds/03.jpg",
    href: "/resale-partners",
  },
  {
    title: "VENUE",
    image: "/backgrounds/04.jpg",
    href: "/venue",
  },
];

const whyChooseBlocks = [
  {
    title: "Quality Craftsmanship",
    text: "Our furniture and equipment are built to last, ensuring reliability and performance.",
    icon: (
      <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 48 L8 56 M48 48 L56 56" strokeLinecap="round" />
        <rect x="10" y="12" width="44" height="40" rx="4" />
        <circle cx="28" cy="32" r="6" />
        <path d="M34 26 L44 16 M40 16 L44 16 L44 20" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Exceptional Customer Service",
    text: "Our dedicated team is committed to providing personalized assistance and support.",
    icon: (
      <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 44 C20 44 8 40 8 28 C8 16 20 12 20 12" />
        <path d="M44 44 C44 44 56 40 56 28 C56 16 44 12 44 12" />
        <rect x="16" y="20" width="32" height="28" rx="8" />
        <circle cx="28" cy="34" r="2" fill="currentColor" />
        <circle cx="36" cy="34" r="2" fill="currentColor" />
        <path d="M28 40 C30 42 34 42 36 40" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Competitive Pricing",
    text: "We offer competitive rates without compromising on quality.",
    icon: (
      <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="32" cy="32" r="24" />
        <path d="M24 24 L40 40 M40 24 L24 40" strokeLinecap="round" />
        <circle cx="32" cy="22" r="3" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Extensive Inventory",
    text: "We have a vast selection of products to meet your unique requirements.",
    icon: (
      <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="8" y="28" width="48" height="24" rx="4" />
        <path d="M8 32 C20 28 44 28 56 32" />
        <rect x="24" y="12" width="16" height="20" rx="4" />
        <path d="M28 12 L28 8 M36 12 L36 8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Customization",
    text: "We can customize furniture to fit your design needs.",
    icon: (
      <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="32" cy="32" r="24" />
        <path d="M16 32 L48 32" strokeLinecap="round" />
        <circle cx="22" cy="32" r="6" />
        <circle cx="42" cy="32" r="6" />
        <circle cx="22" cy="32" r="3" fill="currentColor" />
        <circle cx="42" cy="32" r="3" fill="currentColor" />
      </svg>
    ),
  },
];

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                            */
/* -------------------------------------------------------------------------- */

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? "100%" : "-100%" }),
  center: { x: 0 },
  exit: (direction: number) => ({ x: direction < 0 ? "100%" : "-100%" }),
};

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

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function HomeClient({ products }: { products: Product[] }) {
  const [heroIndex, setHeroIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextHero = useCallback(() => {
    setDirection(1);
    setHeroIndex((i) => (i + 1) % heroSlides.length);
  }, []);
  const prevHero = useCallback(() => {
    setDirection(-1);
    setHeroIndex((i) => (i - 1 + heroSlides.length) % heroSlides.length);
  }, []);
  const goToHero = useCallback(
    (target: number) => {
      const diff = (target - heroIndex + heroSlides.length) % heroSlides.length;
      setDirection(diff <= heroSlides.length / 2 ? 1 : -1);
      setHeroIndex(target);
    },
    [heroIndex],
  );

  useEffect(() => {
    const timer = setInterval(nextHero, 5000);
    return () => clearInterval(timer);
  }, [nextHero]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      {/* ================================================================== */}
      {/*  2. Hero Carousel                                                   */}
      {/* ================================================================== */}
      <section className="relative min-h-[600px] md:min-h-[750px] overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          {heroSlides.map(
            (slide, i) =>
              i === heroIndex && (
                <motion.div
                  key={i}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ x: { type: "tween", duration: 0.5, ease: "easeInOut" } }}
                  className="absolute inset-0"
                >
                  <img
                    src={slide.src}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50" />
                  <div className="absolute inset-0 flex items-center">
                    <div className="max-w-[1440px] mx-auto px-6 lg:px-12 w-full">
                      <div className="max-w-xl">
                        <FadeIn>
                          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
                            {slide.heading}
                          </h1>
                          <p className="text-base lg:text-lg text-white/80 leading-relaxed mb-8">
                            {slide.text}
                          </p>
                          <button className="bg-brand hover:bg-brand-dark text-white font-semibold text-sm px-8 py-3.5 rounded transition-colors tracking-wide">
                            {slide.button}
                          </button>
                          <p className="mt-4 text-xs text-white/60">
                            {slide.subtext}
                          </p>
                        </FadeIn>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ),
          )}
        </AnimatePresence>

        {/* Arrows */}
        <button
          onClick={prevHero}
          className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 flex items-center justify-center transition-colors z-10"
          aria-label="Previous slide"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18 L9 12 L15 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          onClick={nextHero}
          className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 flex items-center justify-center transition-colors z-10"
          aria-label="Next slide"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 6 L15 12 L9 18" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-10">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToHero(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === heroIndex ? "bg-white w-6" : "bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ================================================================== */}
      {/*  3. Introduction Text Block                                         */}
      {/* ================================================================== */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <FadeIn className="max-w-[800px] mx-auto text-center">
            <p className="text-base md:text-lg text-body leading-relaxed">
              Lachairs Commercial Products is your resource for high-quality furniture and equipment
              designed to elevate your events and hospitality venues. Based in Los Angeles,
              California, Houston, Texas, and the metro New York area, we proudly serve the United
              States and Canada, partnering with leading event businesses, hospitality professionals,
              and commercial interior designers.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  4. Industry / Category Grid (2x2)                                  */}
      {/* ================================================================== */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 bg-white">
            {industryCategories.map((cat) => (
              <FadeIn key={cat.title} className="relative h-64 md:h-80 overflow-hidden group cursor-pointer">
                <Link href={cat.href} className="absolute inset-0 block">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-white text-2xl md:text-3xl font-bold tracking-widest">
                      {cat.title}
                    </h3>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  5. Customization Section                                           */}
      {/* ================================================================== */}
      <section className="py-20">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <FadeIn>
            <h2 className="text-2xl md:text-3xl font-bold text-heading text-center mb-12">
              Customization At Your Fingertips
            </h2>
          </FadeIn>

          <div className="flex flex-col md:flex-row gap-12 items-center">
            {/* Left — text */}
            <FadeIn className="flex-1 max-w-lg">
              <p className="text-base md:text-lg text-body leading-relaxed mb-8">
                Whether you are a commercial interior design firm or working with one, we can work
                together to create unique, custom furniture to match your vision.
              </p>
              <Link
                href="/contact"
                className="bg-brand hover:bg-brand-dark text-white font-semibold text-xs px-6 py-2.5 rounded transition-colors tracking-wide inline-block"
              >
                CONTACT US
              </Link>
            </FadeIn>

            {/* Right — placeholder image */}
            <FadeIn className="flex-1">
              <div className="rounded-lg h-72 overflow-hidden">
                <img
                  src="/left.jpg"
                  alt="Conference room setup"
                  className="w-full h-full object-cover"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  6. Why Choose — Value Proposition                                  */}
      {/* ================================================================== */}
      <section className="py-20">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <FadeIn>
            <h2 className="text-2xl md:text-3xl font-bold text-heading text-center mb-14">
              Why Choose Lachairs Commercial Products?
            </h2>
          </FadeIn>

          <div className="flex flex-col gap-4">
            {whyChooseBlocks.map((block) => (
              <FadeIn key={block.title}>
                <div className="bg-[#F5F5F5] rounded-lg p-8 md:p-10 flex items-start gap-6">
                  <div className="text-heading shrink-0 mt-1">{block.icon}</div>
                  <div>
                    <h3 className="text-lg font-bold text-heading mb-2">{block.title}</h3>
                    <p className="text-sm md:text-base text-body leading-relaxed">{block.text}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  7. Pre-Footer CTA                                                  */}
      {/* ================================================================== */}
      <section className="py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <FadeIn className="max-w-[800px] mx-auto text-center">
            <p className="text-base md:text-lg text-body leading-relaxed mb-10">
              Whether you&apos;re planning a grand event, outfitting a new hotel, or updating your
              commercial interior, Lachairs Commercial Products has the solutions you need. Contact us
              today to learn more about our products and services.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="bg-brand hover:bg-brand-dark text-white font-semibold text-sm px-8 py-3.5 rounded transition-colors tracking-wide w-full sm:w-auto">
                CREATE A WHOLESALE ACCOUNT
              </button>
              <Link
                href="/contact"
                className="bg-brand hover:bg-brand-dark text-white font-semibold text-sm px-8 py-3.5 rounded transition-colors tracking-wide w-full sm:w-auto inline-block text-center"
              >
                CONTACT US
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  8. Explore Our Products                                            */}
      {/* ================================================================== */}
      <section className="py-20">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <FadeIn>
            <h2 className="text-2xl md:text-3xl font-bold text-heading text-center mb-14">
              Explore Our Products
            </h2>
          </FadeIn>

          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products.slice(0, 15).map((product) => (
              <FadeIn key={product.id}>
                <Link
                  href={`/product/${encodeURIComponent(product.urlKey || product.sku)}`}
                  className="flex flex-col items-center gap-3 group"
                >
                  <div className="w-full aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-100 group-hover:border-brand/30 transition-colors">
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1">
                          <rect x="6" y="10" width="36" height="28" rx="2" />
                          <circle cx="17" cy="20" r="3" />
                          <path d="M6 30 L18 22 L26 28 L36 18 L42 22 L42 38 L6 38Z" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <span className="text-sm md:text-base text-body text-center leading-tight group-hover:text-heading transition-colors line-clamp-2">
                    {product.name}
                  </span>
                </Link>
              </FadeIn>
            ))}
          </div>

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
