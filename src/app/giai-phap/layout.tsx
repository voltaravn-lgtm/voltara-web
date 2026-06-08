import React from "react";
import { Metadata } from "next";
import { buildMetadata } from "../../lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Giải pháp năng lượng Voltara - Lithium, UPS và lưu trữ điện",
  description:
    "Các giải pháp năng lượng Voltara cho gia đình, đại lý, nhà xưởng, hệ UPS và hệ thống lưu trữ điện Lithium hiệu suất cao.",
  path: "/giai-phap",
  image: "/images/giai-phap.webp",
});

export default function SolutionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
