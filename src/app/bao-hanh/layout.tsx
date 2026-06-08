import React from "react";
import { Metadata } from "next";
import { buildMetadata } from "../../lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Bảo hành Voltara - Tra cứu bảo hành pin Lithium",
  description:
    "Tra cứu thông tin bảo hành sản phẩm Voltara bằng serial, kiểm tra thời hạn và trạng thái bảo hành pin Lithium chính hãng.",
  path: "/bao-hanh",
  image: "/images/bao-hanh.webp",
});

export default function WarrantyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
