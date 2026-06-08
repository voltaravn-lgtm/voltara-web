import React from "react";
import { Metadata } from "next";
import { buildMetadata } from "../../lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Voltara Admin",
  description: "Khu vực quản trị nội bộ Voltara.",
  path: "/admin",
  noIndex: true,
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
