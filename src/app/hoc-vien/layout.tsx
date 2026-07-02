import React from "react";
import { Metadata } from "next";
import { buildMetadata } from "../../lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Học viện Voltara - Đào tạo kỹ thuật pin Lithium",
  description:
    "Chương trình đào tạo kỹ thuật Voltara về pin Lithium, hệ lưu trữ năng lượng, bảo hành và vận hành sản phẩm an toàn.",
  path: "/hoc-vien",
  image: "/images/hoc-vien.webp",
});

export default function AcademyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
