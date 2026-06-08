import { Metadata } from "next";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://voltara.vn";
export const siteName = "Voltara";

export const defaultDescription =
  "Voltara cung cấp pin Lithium, bộ lưu điện UPS, giải pháp lưu trữ năng lượng và dịch vụ bảo hành chính hãng tại Việt Nam.";

const defaultImage = "/images/voltara_banner.webp";

export function buildMetadata({
  title,
  description = defaultDescription,
  path = "/",
  image = defaultImage,
  noIndex = false,
}: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(normalizedPath, siteUrl);
  const imageUrl = new URL(image, siteUrl);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: "vi_VN",
      siteName,
      title,
      description,
      url,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${siteName} - ${title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl.toString()],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteName,
  url: siteUrl,
  logo: new URL("/images/logo-voltara.webp", siteUrl).toString(),
  email: "voltaravn@gmail.com",
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  url: siteUrl,
  inLanguage: "vi-VN",
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/san-pham?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};
