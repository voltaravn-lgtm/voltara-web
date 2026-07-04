export interface ProductVideoEmbed {
  originalUrl: string;
  embedUrl?: string;
  directUrl?: string;
  provider: "youtube" | "direct" | "external";
  label: string;
}

function getYouTubeId(url: URL) {
  const hostname = url.hostname.replace(/^www\./, "").toLowerCase();

  if (hostname === "youtu.be") {
    return url.pathname.split("/").filter(Boolean)[0] || "";
  }

  if (hostname === "youtube.com" || hostname === "m.youtube.com" || hostname === "youtube-nocookie.com") {
    if (url.pathname.startsWith("/shorts/") || url.pathname.startsWith("/embed/")) {
      return url.pathname.split("/").filter(Boolean)[1] || "";
    }
    return url.searchParams.get("v") || "";
  }

  return "";
}

export function getProductVideoEmbed(rawUrl: string, index = 0): ProductVideoEmbed | null {
  const originalUrl = String(rawUrl || "").trim();
  if (!originalUrl) return null;

  try {
    const url = new URL(originalUrl);
    const youtubeId = getYouTubeId(url);

    if (youtubeId) {
      return {
        originalUrl,
        embedUrl: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}`,
        provider: "youtube",
        label: `Video ${index + 1}`,
      };
    }

    if (/\.(mp4|webm|ogg)(?:$|\?)/i.test(url.pathname + url.search)) {
      return {
        originalUrl,
        directUrl: originalUrl,
        provider: "direct",
        label: `Video ${index + 1}`,
      };
    }

    return {
      originalUrl,
      provider: "external",
      label: `Video ${index + 1}`,
    };
  } catch {
    return null;
  }
}

export function cleanVideoUrls(videoUrls: string[] | undefined) {
  return Array.from(new Set((videoUrls || []).map((url) => String(url || "").trim()).filter(Boolean)));
}
