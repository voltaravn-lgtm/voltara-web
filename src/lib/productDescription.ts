export function decodeDescriptionEntities(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");
}

export function getPlainProductDescription(description: string | undefined): string {
  if (!description) return "";

  return decodeDescriptionEntities(description)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<img\b[^>]*>/gi, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[*_`#>-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getProductDescriptionExcerpt(description: string | undefined, fallback = "", maxLength = 180): string {
  const text = getPlainProductDescription(description) || fallback;
  if (text.length <= maxLength) return text;

  return `${text.slice(0, maxLength).trimEnd()}...`;
}
