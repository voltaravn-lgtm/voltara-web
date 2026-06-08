import React from "react";
import { Metadata } from "next";
import { buildMetadata } from "../../lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Đại lý Voltara - Hệ thống phân phối chính hãng",
  description:
    "Tra cứu hệ thống đại lý Voltara, điểm phân phối pin Lithium, UPS và dịch vụ hỗ trợ chính hãng trên toàn quốc.",
  path: "/dai-ly",
  image: "/images/dai-ly.webp",
});

export default function DealerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
