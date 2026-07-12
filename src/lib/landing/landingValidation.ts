import type {
  ComboLandingBlock,
  LandingBlock,
  LandingBlockType,
  LandingOrderRequestInput,
  LandingPage,
  OrderFormLandingBlock,
} from "../../types/landing";
export interface LandingValidationResult {
  valid: boolean;
  errors: string[];
}

export interface LandingPublishValidationResult extends LandingValidationResult {
  warnings: string[];
}

const RESERVED_SLUGS = new Set(["new", "preview", "admin", "api"]);
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_LANDING_BLOCKS = 100;
const MAX_LANDING_ORDER_ITEMS = 20;
const MAX_LANDING_ITEM_QUANTITY = 999;
const VALID_LANDING_BLOCK_TYPES: readonly LandingBlockType[] = [
  "hero", "banner", "gallery", "video", "benefits", "features", "specifications",
  "price", "combo", "gift", "countdown", "reviews", "faq", "warranty", "cta",
  "order-form", "contact-button", "spacer",
];

export function normalizeLandingSlug(value: string) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function sanitizeLandingSlugInput(value: string) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/Ä‘/g, "d")
    .replace(/Ä/g, "d")
    .toLowerCase()
    .trimStart()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+/g, "")
    .replace(/-{2,}/g, "-");
}

export function validateLandingSlug(value: string): LandingValidationResult {
  const slug = normalizeLandingSlug(value);
  const errors: string[] = [];
  if (!slug) errors.push("Slug không được để trống.");
  if (slug.length > 120) errors.push("Slug không được vượt quá 120 ký tự.");
  if (slug && !SLUG_PATTERN.test(slug)) errors.push("Slug chỉ được chứa chữ thường, số và dấu gạch ngang.");
  if (RESERVED_SLUGS.has(slug)) errors.push("Slug này được dành riêng cho hệ thống.");
  return { valid: errors.length === 0, errors };
}

export function validateLandingBlock(block: LandingBlock): LandingValidationResult {
  const errors: string[] = [];
  if (!block?.id?.trim()) errors.push("Block phải có ID.");
  if (!VALID_LANDING_BLOCK_TYPES.includes(block?.type)) errors.push(`Loại block không hợp lệ: ${String(block?.type || "")}.`);
  return { valid: errors.length === 0, errors };
}

export function validateLandingPage(page: LandingPage | Omit<LandingPage, "id">): LandingValidationResult {
  const errors = [...validateLandingSlug(page.slug).errors];
  if (!("id" in page) || !page.id?.trim()) errors.push("Landing Page phải có auto ID trước khi lưu.");
  if (!page.name?.trim()) errors.push("Tên Landing Page không được để trống.");
  if (!page.templateId?.trim()) errors.push("Landing Page phải có templateId.");
  if (!Number.isInteger(page.templateVersion) || page.templateVersion < 1) errors.push("templateVersion phải là số nguyên lớn hơn hoặc bằng 1.");
  if (!Array.isArray(page.slugHistory)) errors.push("slugHistory phải là một mảng.");
  if (!Array.isArray(page.blocks)) errors.push("blocks phải là một mảng.");
  if (page.blocks?.length > MAX_LANDING_BLOCKS) errors.push(`Landing Page không được vượt quá ${MAX_LANDING_BLOCKS} block.`);

  const blockIds = new Set<string>();
  page.blocks?.forEach((block, index) => {
    validateLandingBlock(block).errors.forEach((error) => errors.push(`Block ${index + 1}: ${error}`));
    if (blockIds.has(block.id)) errors.push(`Block ID bị trùng: ${block.id}.`);
    blockIds.add(block.id);
  });

  const normalizedHistory = (page.slugHistory || []).map(normalizeLandingSlug).filter(Boolean);
  if (new Set(normalizedHistory).size !== normalizedHistory.length) errors.push("slugHistory không được chứa slug trùng nhau.");
  return { valid: errors.length === 0, errors };
}

function finitePositive(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function finiteNonNegative(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function collectLandingProductIds(page: LandingPage | Omit<LandingPage, "id">) {
  const ids = new Set<string>();
  if (page.primaryProductId) ids.add(page.primaryProductId);
  page.blocks?.forEach((block) => {
    if ("productId" in block && block.productId) ids.add(block.productId);
    if (block.type === "order-form") block.productIds?.forEach((id) => ids.add(id));
    if (block.type === "combo") [...block.products, ...(block.gifts || [])].forEach((item) => item.productId && ids.add(item.productId));
  });
  return ids;
}

function hasDeadTarget(target?: string) {
  const value = String(target || "").trim();
  return !value || value === "#";
}

export function validateLandingPageForPublish(page: LandingPage): LandingPublishValidationResult {
  const base = validateLandingPage(page);
  const errors = [...base.errors];
  const warnings: string[] = [];
  const productIds = collectLandingProductIds(page);
  const orderForms = page.blocks.filter((block): block is OrderFormLandingBlock => block.type === "order-form" && !block.hidden);

  if (page.templateId !== "blank" && !page.primaryProductId) errors.push("Landing created from a sales template must have a primary product before publish.");
  if (orderForms.length && productIds.size === 0) errors.push("Order Form needs at least one valid product before publish.");
  orderForms.forEach((form) => {
    const ids = form.productIds?.filter(Boolean) || [];
    if ((form.formType || "order") === "order" && ids.length === 0 && !page.primaryProductId) errors.push(`Order Form "${form.label || form.title || form.id}" has no product.`);
  });

  if (page.productOverrides?.displayPrice != null && !finitePositive(page.productOverrides.displayPrice)) warnings.push("Primary product display price override is not a positive number.");
  if (page.productOverrides?.compareAtPrice != null && !finiteNonNegative(page.productOverrides.compareAtPrice)) warnings.push("Primary product compare-at price is invalid.");
  if (finitePositive(page.productOverrides?.displayPrice) && finitePositive(page.productOverrides?.compareAtPrice) && page.productOverrides!.displayPrice! > page.productOverrides!.compareAtPrice!) warnings.push("Primary product override price is higher than compare-at price.");

  page.blocks.forEach((block) => {
    if (block.type === "price") {
      if (block.displayPrice != null && !finitePositive(block.displayPrice)) warnings.push(`Price block "${block.label || block.id}" has an invalid display price.`);
      if (finitePositive(block.displayPrice) && finitePositive(block.compareAtPrice) && block.displayPrice! > block.compareAtPrice!) warnings.push(`Price block "${block.label || block.id}" has display price higher than compare-at price.`);
    }
    if (block.type === "combo") {
      const combo = block as ComboLandingBlock;
      if (combo.comboPrice != null && !finitePositive(combo.comboPrice)) warnings.push(`Combo block "${combo.label || combo.id}" has an invalid combo price.`);
      if (!combo.products.length) warnings.push(`Combo block "${combo.label || combo.id}" has no products.`);
    }
    if (block.type === "countdown" && block.endsAt) {
      const endsAt = new Date(block.endsAt).getTime();
      if (Number.isFinite(endsAt) && endsAt <= Date.now()) warnings.push(`Countdown block "${block.label || block.id}" is already expired.`);
    }
    if (block.type === "cta" && hasDeadTarget(block.buttonTarget)) warnings.push(`CTA block "${block.label || block.id}" has no target.`);
    if (block.type === "hero" && block.ctaLabel && hasDeadTarget(block.ctaTarget)) warnings.push(`Hero block "${block.label || block.id}" has no CTA target.`);
    if (block.type === "contact-button" && hasDeadTarget(block.href)) warnings.push(`Contact button "${block.label || block.id}" has no destination.`);
  });

  if (!page.seo?.title?.trim()) warnings.push("SEO title is empty.");
  if (!page.seo?.description?.trim()) warnings.push("SEO description is empty.");
  if (!page.seo?.image?.trim()) warnings.push("Social image is empty.");

  return { valid: errors.length === 0, errors, warnings };
}

export function validateLandingOrderRequest(input: LandingOrderRequestInput): LandingValidationResult {
  const errors: string[] = [];
  const phone = String(input.phone || "").replace(/\D/g, "");
  if (!input.landingPageId?.trim()) errors.push("Thiếu Landing Page ID.");
  if (!input.customerName?.trim() || input.customerName.trim().length > 120) errors.push("Tên khách hàng không hợp lệ.");
  if (!/^(0|84)\d{9}$/.test(phone)) errors.push("Số điện thoại không hợp lệ.");
  if (!input.address?.trim() || input.address.trim().length > 500) errors.push("Địa chỉ không hợp lệ.");
  if ((input.note || "").length > 1000) errors.push("Ghi chú không được vượt quá 1000 ký tự.");
  if (!input.idempotencyKey?.trim() || input.idempotencyKey.length > 150) errors.push("Mã chống gửi trùng không hợp lệ.");
  if (!Array.isArray(input.items) || input.items.length === 0 || input.items.length > MAX_LANDING_ORDER_ITEMS) errors.push(`Đơn hàng phải có từ 1 đến ${MAX_LANDING_ORDER_ITEMS} sản phẩm.`);
  input.items?.forEach((item) => {
    if (!item.productId?.trim()) errors.push("Sản phẩm trong đơn thiếu ID.");
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_LANDING_ITEM_QUANTITY) errors.push(`Số lượng phải từ 1 đến ${MAX_LANDING_ITEM_QUANTITY}.`);
  });
  return { valid: errors.length === 0, errors };
}
