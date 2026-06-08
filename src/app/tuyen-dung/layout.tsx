import React from "react";
import { Metadata } from "next";
import { buildMetadata } from "../../lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Tuyển dụng Voltara - Cơ hội nghề nghiệp ngành năng lượng",
  description:
    "Gia nhập Voltara và phát triển sự nghiệp trong lĩnh vực pin Lithium, kỹ thuật điện, bán hàng và giải pháp năng lượng.",
  path: "/tuyen-dung",
  image: "/images/tuyen-dung.webp",
});

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
