import React from "react";
import { Metadata } from "next";
import { buildMetadata } from "../../lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Kiến thức Voltara - Pin Lithium và lưu trữ năng lượng",
  description:
    "Bài viết kiến thức về pin Lithium, an toàn điện, bảo hành, vận hành UPS và xu hướng lưu trữ năng lượng từ Voltara.",
  path: "/kien-thuc",
  image: "/images/kien-thuc.webp",
});

export default function KnowledgeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
