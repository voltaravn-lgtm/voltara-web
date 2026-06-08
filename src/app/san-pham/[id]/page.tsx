import { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import ProductDetailClient from "../../../components/ProductDetailClient";
import { PRODUCTS_DATA } from "../../../data";
import { buildMetadata, siteUrl } from "../../../lib/seo";

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCTS_DATA.map((product) => ({
    id: product.id,
  }));
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = PRODUCTS_DATA.find((item) => item.id === id);

  if (!product) {
    return buildMetadata({
      title: "Không tìm thấy sản phẩm - Voltara",
      path: "/san-pham",
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${product.name} - Voltara`,
    description: product.description,
    path: `/san-pham/${product.id}`,
    image: product.image,
  });
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = PRODUCTS_DATA.find((item) => item.id === id);

  if (!product) {
    notFound();
  }

  const relatedProducts = PRODUCTS_DATA.filter(
    (item) => item.category === product.category && item.id !== product.id,
  ).slice(0, 3);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [product.image],
    description: product.description,
    brand: {
      "@type": "Brand",
      name: product.brand || "Voltara",
    },
    sku: product.id,
    category: product.category,
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/san-pham/${product.id}`,
      priceCurrency: "VND",
      availability: "https://schema.org/InStock",
    },
    additionalProperty: Object.entries(product.specs).map(([name, value]) => ({
      "@type": "PropertyValue",
      name,
      value,
    })),
  };

  return (
    <>
      <Script
        id={`product-jsonld-${product.id}`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}
