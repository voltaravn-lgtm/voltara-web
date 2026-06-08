import React from "react";
import { Metadata } from "next";
import Script from "next/script";
import RootClientLayout from "./RootClientLayout";
import { buildMetadata, organizationJsonLd, siteName, siteUrl, websiteJsonLd } from "../lib/seo";
import "../index.css";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "Voltara - Pin Lithium, UPS và giải pháp lưu trữ năng lượng",
    path: "/",
    image: "/images/voltara_banner.webp",
  }),
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  category: "energy",
  keywords: [
    "Voltara",
    "pin lithium",
    "pin LiFePO4",
    "UPS",
    "bộ lưu điện",
    "pin xe điện",
    "lưu trữ năng lượng",
    "bảo hành pin lithium",
  ],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark scroll-smooth" suppressHydrationWarning>
      <body
        className="min-h-screen bg-[#050505] text-[#ECECEC] antialiased"
        suppressHydrationWarning
      >
        <Script
          id="organization-jsonld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Script
          id="website-jsonld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <RootClientLayout>{children}</RootClientLayout>
      </body>
    </html>
  );
}
