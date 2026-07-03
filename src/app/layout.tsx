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
    image: "/images/logo-voltara-new.webp",
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
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
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
