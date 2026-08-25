import type { Metadata } from "next";
import CatalogFlipbook from "@/src/components/catalog/CatalogFlipbook";
import { loadVoltara2026Catalog } from "@/src/lib/catalog/catalogConfig";
import { buildMetadata } from "@/src/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Catalog Voltara 2026",
  description: "Xem catalog sản phẩm Voltara 2026 trực tuyến với trải nghiệm lật trang như sách thật.",
  path: "/catalog",
  image: "/catalog/voltara-2026/page-001.webp",
});

export default async function CatalogPage() {
  const catalog = await loadVoltara2026Catalog();
  return <CatalogFlipbook catalog={catalog} />;
}
