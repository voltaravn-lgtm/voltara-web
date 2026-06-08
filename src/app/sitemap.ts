import { MetadataRoute } from "next";
import { PRODUCTS_DATA } from "../data";
import { siteUrl } from "../lib/seo";

export const dynamic = "force-static";

const routes = [
  "",
  "/gioi-thieu",
  "/san-pham",
  "/giai-phap",
  "/dai-ly",
  "/bao-hanh",
  "/kich-hoat-bao-hanh",
  "/kien-thuc",
  "/tuyen-dung",
  "/hoc-vien",
  "/lien-he",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const pageRoutes = routes.map((route) => ({
    url: new URL(route || "/", siteUrl).toString(),
    lastModified,
    changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
    priority: route === "" ? 1 : route === "/san-pham" ? 0.9 : 0.7,
  }));

  const productRoutes = PRODUCTS_DATA.map((product) => ({
    url: new URL(`/san-pham/${product.id}`, siteUrl).toString(),
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...pageRoutes, ...productRoutes];
}
