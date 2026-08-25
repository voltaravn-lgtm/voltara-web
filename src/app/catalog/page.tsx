import type { Metadata } from "next";
import CatalogFlipbook from "@/src/components/catalog/CatalogFlipbook";
import { voltara2026Catalog } from "@/src/lib/catalog/catalogConfig";
import { buildMetadata } from "@/src/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Catalog Voltara 2026",
  description: "Xem catalog sản phẩm Voltara 2026 trực tuyến với trải nghiệm lật trang như sách thật.",
  path: "/catalog",
  image: voltara2026Catalog.pages[0].src,
});

export default function CatalogPage() {
  return <CatalogFlipbook catalog={voltara2026Catalog} />;
}
