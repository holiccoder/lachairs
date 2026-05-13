"use client";

import { useState } from "react";
import Link from "next/link";

interface ConfigOptionValue {
  value_index: number;
}

interface ConfigOption {
  id: number;
  attribute_id: string;
  label: string;
  position: number;
  values: ConfigOptionValue[];
  product_id: number;
}

interface Image {
  file: string;
  url: string;
  types: string[];
}

interface ProductData {
  name: string;
  sku: string;
  status: number;
  weight: number;
  typeId: string;
  countryOfManufacture?: string;
  images: Image[];
  description?: string;
  configurableOptions?: ConfigOption[];
}

interface Props {
  product: ProductData;
}

export default function ProductClient({ product }: Props) {
  const [selectedImage, setSelectedImage] = useState(
    product.images.length > 0
      ? product.images.find((i) => i.types.includes("image"))?.url || product.images[0].url
      : ""
  );

  const thumbnails = product.images.slice(0, 6);

  const specs: { label: string; value: string }[] = [
    { label: "SKU", value: product.sku },
    { label: "Weight", value: `${product.weight} lbs` },
    { label: "Type", value: product.typeId === "configurable" ? "Configurable Product" : "Simple Product" },
  ];

  if (product.countryOfManufacture) {
    specs.push({ label: "Country of Manufacture", value: product.countryOfManufacture });
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 w-full pb-12">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          <div className="flex-1 max-w-[560px]">
            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-4 border border-gray-100">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <svg viewBox="0 0 48 48" className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth="1">
                    <rect x="6" y="10" width="36" height="28" rx="2" />
                    <circle cx="17" cy="20" r="3" />
                    <path d="M6 30 L18 22 L26 28 L36 18 L42 22 L42 38 L6 38Z" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>

            {thumbnails.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {thumbnails.map((img) => (
                  <button
                    key={img.file}
                    onClick={() => setSelectedImage(img.url)}
                    className={`w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-md overflow-hidden border-2 transition-colors ${
                      selectedImage === img.url
                        ? "border-brand"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1">
            <p className="text-xs font-bold text-heading tracking-wide mb-2">
              LACHAIRS COMMERCIAL PRODUCTS
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-heading mb-3">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 mb-3">
              <span className={`w-2 h-2 rounded-full ${product.status === 1 ? "bg-green-500" : "bg-red-500"}`} />
              <span className={`text-sm font-semibold ${product.status === 1 ? "text-green-600" : "text-red-600"}`}>
                {product.status === 1 ? "IN STOCK" : "OUT OF STOCK"}
              </span>
            </div>

            <p className="text-sm text-body mb-5">Item #: {product.sku}</p>

            <div className="flex items-center gap-4 mb-6">
              <button className="flex items-center gap-1.5 text-sm text-body hover:text-brand transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                Add to Wish List
              </button>
              <button className="flex items-center gap-1.5 text-sm text-body hover:text-brand transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
                Add to Compare
              </button>
            </div>

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-brand hover:text-brand-dark font-semibold text-lg transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Login or Register to View Prices &amp; Options
            </Link>

            {product.configurableOptions && product.configurableOptions.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-bold text-heading mb-3">Options</h3>
                {product.configurableOptions.map((opt) => (
                  <div key={opt.id} className="mb-3">
                    <p className="text-sm font-semibold text-heading mb-1.5">{opt.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {opt.values.map((v) => (
                        <span
                          key={v.value_index}
                          className="border border-gray-300 rounded px-3 py-1 text-xs text-body"
                        >
                          {v.value_index}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 w-full pb-16">
        <div className="flex gap-8 border-b border-gray-200 mb-8">
          <span className="pb-3 text-sm font-semibold text-heading relative">
            Description
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-heading" />
          </span>
          <Link href="#specs" className="pb-3 text-sm font-semibold text-gray-400 hover:text-body transition-colors">
            Specifications
          </Link>
        </div>

        {product.description ? (
          <div className="bg-[#F5F5F5] rounded-lg p-8 md:p-10 mb-8">
            <div
              className="text-sm md:text-base text-body leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: product.description
                  .replace(/\r\n/g, "<br/>")
                  .replace(/•/g, "• ")
                  .replace(/'/g, "'")
                  .replace(/"/g, '"')
                  .replace(/¾/g, "¾")
                  .replace(/ /g, " "),
              }}
            />
          </div>
        ) : (
          <div className="bg-[#F5F5F5] rounded-lg p-8 md:p-10 mb-8">
            <p className="text-sm text-body">No description available.</p>
          </div>
        )}

        <div id="specs" className="bg-[#F5F5F5] rounded-lg p-8 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
            {specs.map((spec) => (
              <div
                key={spec.label}
                className="flex justify-between py-2.5 border-b border-gray-200 text-sm"
              >
                <span className="text-body">{spec.label}</span>
                <span className="text-heading font-medium">{spec.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-4 border-t border-gray-200">
            <p className="text-xs text-body leading-relaxed">
              <span className="font-semibold text-heading">Prop 65 Message: </span>
              This product can expose you to chemicals including wood dust, which is known
              to the State of California to cause cancer. For more information, visit{" "}
              <a href="https://www.P65Warnings.ca.gov" target="_blank" rel="noopener noreferrer" className="text-brand hover:text-brand-dark underline transition-colors">
                www.P65Warnings.ca.gov
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
