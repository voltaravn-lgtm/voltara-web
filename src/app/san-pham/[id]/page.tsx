import { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import ProductDetailClient from "../../../components/ProductDetailClient";
import { getBuildProducts } from "../../../lib/productData";
import { getProductSlug, slugifyProductText } from "../../../lib/productRoutes";
import { buildMetadata, siteUrl } from "../../../lib/seo";

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamicParams = false;

async function findProductByRoute(id: string) {
  const products = await getBuildProducts();
  const normalizedId = slugifyProductText(id);
  return products.find((item) =>
    item.id === id ||
    slugifyProductText(item.id) === normalizedId ||
    getProductSlug(item) === normalizedId
  ) || null;
}

export async function generateStaticParams() {
  const products = await getBuildProducts();
  const ids = new Set<string>();

  products.forEach((product) => {
    ids.add(getProductSlug(product));
  });

  return Array.from(ids).map((id) => ({ id }));
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await findProductByRoute(id);

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
    path: `/san-pham/${getProductSlug(product)}`,
    image: product.image,
  });
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = await findProductByRoute(id);

  if (!product) {
    notFound();
  }

  const allProducts = await getBuildProducts();
  const relatedProducts = allProducts.filter(
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
      url: `${siteUrl}/san-pham/${getProductSlug(product)}`,
      priceCurrency: "VND",
      availability: "https://schema.org/InStock",
    },
    additionalProperty: Object.entries(product.specs || {}).filter(([, value]) => String(value || "").trim()).map(([name, value]) => ({
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
