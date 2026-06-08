import React from "react";
import { Metadata } from "next";
import { buildMetadata } from "../../lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Sản phẩm Voltara - Pin Lithium, UPS và ESS",
  description:
    "Khám phá sản phẩm Voltara: pin Lithium cho máy công cụ, pin xe điện, bộ lưu điện UPS và hệ lưu trữ năng lượng ESS.",
  path: "/san-pham",
  image: "/images/san-pham.webp",
});

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
