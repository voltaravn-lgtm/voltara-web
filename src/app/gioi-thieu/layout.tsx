import React from "react";
import { Metadata } from "next";
import { buildMetadata } from "../../lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Giới thiệu Voltara - Thương hiệu năng lượng Lithium",
  description:
    "Tìm hiểu Voltara, thương hiệu pin Lithium và giải pháp lưu trữ năng lượng định hướng an toàn, bền bỉ và hiệu suất cao.",
  path: "/gioi-thieu",
  image: "/images/voltara_banner.webp",
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
