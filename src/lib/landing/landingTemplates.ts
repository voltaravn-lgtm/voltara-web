import { Product } from "../../types";
import {
  LandingBlock,
  LandingBlockType,
  LandingPageLayout,
  LandingProductOverrides,
} from "../../types/landing";
import { createDefaultLandingBlock } from "./landingDefaults";

export interface LandingTemplateDefinition {
  templateId: string;
  templateVersion: number;
  name: string;
  description: string;
  blockTypes: LandingBlockType[];
  layout: LandingPageLayout;
  createOverrides?: (product: Product) => LandingProductOverrides | undefined;
}

const salesLayout: LandingPageLayout = {
  hideHeader: true,
  hideFooter: true,
  stickyMobileCta: true,
  theme: "dark",
};

export const LANDING_TEMPLATES: LandingTemplateDefinition[] = [
  {
    templateId: "single-product",
    templateVersion: 1,
    name: "Sản phẩm đơn",
    description: "Bố cục bán một sản phẩm với lợi ích, thông số, giá, bảo hành và form đặt hàng.",
    blockTypes: ["hero", "benefits", "gallery", "specifications", "price", "warranty", "faq", "order-form", "contact-button"],
    layout: salesLayout,
    createOverrides: () => ({ ctaLabel: "Đặt hàng ngay" }),
  },
  {
    templateId: "promotion-product",
    templateVersion: 1,
    name: "Sản phẩm khuyến mãi",
    description: "Nhấn mạnh ưu đãi, thời gian giới hạn, quà tặng và bằng chứng khách hàng.",
    blockTypes: ["hero", "banner", "price", "countdown", "gift", "benefits", "reviews", "faq", "order-form", "contact-button"],
    layout: salesLayout,
    createOverrides: () => ({ ctaLabel: "Nhận ưu đãi ngay" }),
  },
  {
    templateId: "product-combo",
    templateVersion: 1,
    name: "Combo sản phẩm",
    description: "Bố cục bán combo; sản phẩm chính được thêm sẵn, các sản phẩm khác bổ sung ở Builder.",
    blockTypes: ["hero", "gallery", "combo", "gift", "benefits", "warranty", "faq", "order-form", "contact-button"],
    layout: salesLayout,
    createOverrides: () => ({ ctaLabel: "Chọn combo" }),
  },
  {
    templateId: "consultation-lead",
    templateVersion: 1,
    name: "Thu tư vấn",
    description: "Tập trung giải thích nhu cầu và thu thông tin khách hàng để Sale tư vấn.",
    blockTypes: ["hero", "benefits", "features", "specifications", "reviews", "faq", "order-form", "contact-button"],
    layout: salesLayout,
    createOverrides: () => ({ ctaLabel: "Đăng ký tư vấn" }),
  },
  {
    templateId: "shopee-redirect",
    templateVersion: 1,
    name: "Điều hướng sang Shopee",
    description: "Giới thiệu nhanh sản phẩm và dẫn khách sang gian hàng Shopee để hoàn tất mua hàng.",
    blockTypes: ["hero", "gallery", "benefits", "price", "reviews", "warranty", "cta", "contact-button"],
    layout: salesLayout,
    createOverrides: () => ({ ctaLabel: "Mua trên Shopee" }),
  },
  {
    templateId: "technical-product",
    templateVersion: 1,
    name: "Sản phẩm kỹ thuật nhiều thông số",
    description: "Ưu tiên tính năng, video, bảng thông số, bảo hành và tư vấn kỹ thuật.",
    blockTypes: ["hero", "gallery", "video", "features", "specifications", "benefits", "warranty", "faq", "cta", "order-form", "contact-button"],
    layout: salesLayout,
    createOverrides: () => ({ ctaLabel: "Nhận tư vấn kỹ thuật" }),
  },
];

export function getLandingTemplate(templateId: string) {
  return LANDING_TEMPLATES.find((template) => template.templateId === templateId) || null;
}

export function createBlocksFromTemplate(template: LandingTemplateDefinition, product: Product): LandingBlock[] {
  return template.blockTypes.map((type) => {
    const block = createDefaultLandingBlock(type);
    switch (block.type) {
      case "specifications": return { ...block, productId: product.id };
      case "price": return { ...block, productId: product.id };
      case "combo": return { ...block, products: [{ productId: product.id }] };
      case "gift": return { ...block, productId: product.id };
      case "order-form": return { ...block, productIds: [product.id] };
      case "contact-button": return template.templateId === "shopee-redirect"
        ? { ...block, channel: "shopee", label: "Mua trên Shopee" }
        : { ...block, channel: "zalo", label: "Chat Zalo" };
      case "cta": return template.templateId === "shopee-redirect"
        ? { ...block, title: `Mua ${product.name} trên Shopee`, buttonLabel: "Mua trên Shopee" }
        : { ...block, buttonLabel: template.createOverrides?.(product)?.ctaLabel || block.buttonLabel };
      default: return block;
    }
  });
}

export function createLandingTemplateData(template: LandingTemplateDefinition, product: Product) {
  return {
    templateId: template.templateId,
    templateVersion: template.templateVersion,
    primaryProductId: product.id,
    productOverrides: template.createOverrides?.(product),
    layout: { ...template.layout },
    blocks: createBlocksFromTemplate(template, product),
  };
}
