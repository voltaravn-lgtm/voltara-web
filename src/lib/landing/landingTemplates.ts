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
  productRequired?: boolean;
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
    templateId: "dealer-recruitment",
    templateVersion: 1,
    name: "Tuyển đại lý phân phối",
    description: "Landing B2B thu lead đại lý với quyền lợi, chính sách hợp tác, bằng chứng và form sàng lọc.",
    blockTypes: ["hero", "benefits", "features", "reviews", "faq", "order-form", "contact-button"],
    layout: salesLayout,
    productRequired: false,
  },
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

export function createBlocksFromTemplate(template: LandingTemplateDefinition, product?: Product): LandingBlock[] {
  return template.blockTypes.map((type) => {
    const block = createDefaultLandingBlock(type);
    if (template.templateId === "dealer-recruitment") {
      switch (block.type) {
        case "hero": return { ...block, eyebrow: "CƠ HỘI HỢP TÁC CÙNG VOLTARA", title: "Trở thành đại lý phân phối Voltara tại khu vực của bạn", description: "Sản phẩm có định vị rõ ràng, chính sách đồng hành thực tế và hỗ trợ bán hàng từ thương hiệu.", ctaLabel: "Nhận chính sách đại lý", ctaTarget: "#dat-hang" };
        case "benefits": return { ...block, title: "Quyền lợi dành cho đại lý", items: [
          { id: "dealer-benefit-margin", title: "Chính sách giá cạnh tranh", description: "Chiết khấu theo cấp độ và sản lượng kinh doanh." },
          { id: "dealer-benefit-area", title: "Hỗ trợ theo khu vực", description: "Cùng xây dựng thị trường và hạn chế cạnh tranh nội bộ." },
          { id: "dealer-benefit-marketing", title: "Đồng hành marketing", description: "Cung cấp nội dung, hình ảnh và tư vấn triển khai bán hàng." },
        ] };
        case "features": return { ...block, title: "Quy trình hợp tác minh bạch", items: [
          { id: "dealer-step-1", title: "1. Đăng ký", description: "Để lại thông tin và khu vực mong muốn kinh doanh." },
          { id: "dealer-step-2", title: "2. Tư vấn", description: "Đội ngũ Voltara trao đổi nhu cầu và chính sách phù hợp." },
          { id: "dealer-step-3", title: "3. Kích hoạt", description: "Thống nhất kế hoạch nhập hàng và bắt đầu triển khai." },
        ] };
        case "reviews": return { ...block, title: "Đối tác nói gì về Voltara", items: [] };
        case "faq": return { ...block, title: "Câu hỏi thường gặp", items: [
          { id: "dealer-faq-capital", question: "Cần vốn ban đầu bao nhiêu?", answer: "Mức nhập hàng phụ thuộc khu vực, mô hình kinh doanh và nhóm sản phẩm. Voltara sẽ tư vấn phương án phù hợp sau khi nhận đăng ký." },
          { id: "dealer-faq-support", question: "Đại lý được hỗ trợ những gì?", answer: "Chính sách cụ thể có thể gồm tài liệu bán hàng, nội dung truyền thông, đào tạo sản phẩm và hỗ trợ triển khai theo từng chương trình." },
          { id: "dealer-faq-area", question: "Khu vực của tôi đã có đại lý chưa?", answer: "Đội ngũ phụ trách sẽ kiểm tra tình trạng khu vực và phản hồi khi liên hệ tư vấn." },
        ] };
        case "order-form": return { ...block, title: "Đăng ký nhận chính sách đại lý", description: "Hoàn tất thông tin bên dưới, đội ngũ Voltara sẽ liên hệ trong thời gian sớm nhất.", formType: "consultation", submitLabel: "Gửi đăng ký đại lý", successMessage: "Cảm ơn bạn đã quan tâm. Voltara sẽ sớm liên hệ để trao đổi chính sách hợp tác.", productIds: [], requireAddress: false, showAddress: true, showNote: true, showQuantity: false, showBusinessName: true, showBusinessType: true, showEstimatedVolume: true };
        case "contact-button": return { ...block, channel: "zalo", label: "Tư vấn đại lý", fixedOnMobile: true };
        default: return block;
      }
    }
    switch (block.type) {
      case "specifications": return { ...block, productId: product?.id };
      case "price": return { ...block, productId: product?.id };
      case "combo": return { ...block, products: product ? [{ productId: product.id }] : [] };
      case "gift": return { ...block, productId: product?.id };
      case "order-form": return { ...block, productIds: product ? [product.id] : [] };
      case "contact-button": return template.templateId === "shopee-redirect"
        ? { ...block, channel: "shopee", label: "Mua trên Shopee" }
        : { ...block, channel: "zalo", label: "Chat Zalo" };
      case "cta": return template.templateId === "shopee-redirect"
        ? { ...block, title: `Mua ${product?.name || "sản phẩm"} trên Shopee`, buttonLabel: "Mua trên Shopee" }
        : { ...block, buttonLabel: product ? (template.createOverrides?.(product)?.ctaLabel || block.buttonLabel) : block.buttonLabel };
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

export function createStandaloneLandingTemplateData(template: LandingTemplateDefinition) {
  return {
    templateId: template.templateId,
    templateVersion: template.templateVersion,
    layout: { ...template.layout },
    blocks: createBlocksFromTemplate(template),
  };
}
