import React from "react";
import { Metadata } from "next";
import { buildMetadata } from "../../lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Kích hoạt bảo hành Voltara - Bảo hành điện tử",
  description:
    "Kích hoạt bảo hành điện tử cho sản phẩm Voltara bằng Serial/SN, gửi thông tin mua hàng và tra cứu trạng thái bảo hành chính hãng.",
  path: "/kich-hoat-bao-hanh",
  image: "/images/bao-hanh.webp",
});

export default function WarrantyActivationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
