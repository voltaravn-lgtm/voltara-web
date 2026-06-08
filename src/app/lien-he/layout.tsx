import React from "react";
import { Metadata } from "next";
import { buildMetadata } from "../../lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Liên hệ Voltara - Tư vấn pin Lithium và UPS",
  description:
    "Liên hệ Voltara để được tư vấn pin Lithium, UPS, hệ lưu trữ năng lượng, báo giá sản phẩm và hợp tác đại lý.",
  path: "/lien-he",
  image: "/images/lien-he.webp",
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
