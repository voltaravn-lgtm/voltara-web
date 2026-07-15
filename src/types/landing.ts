export const LANDING_BLOCK_TYPES = [
  "hero", "banner", "gallery", "video", "benefits", "features", "specifications",
  "price", "combo", "gift", "countdown", "reviews", "faq", "warranty", "cta",
  "order-form", "contact-button", "spacer",
] as const;

export type LandingBlockType = typeof LANDING_BLOCK_TYPES[number];
export type LandingPageStatus = "draft" | "published";
export type LandingOrderStatus = "new" | "contacted" | "confirmed" | "packing" | "shipping" | "completed" | "cancelled" | "spam";
export type LandingPreviewMode = "desktop" | "tablet" | "mobile";
export type LandingAnimation = "none" | "fade" | "zoom";

export interface LandingDesignTokens {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
  headingFont: "sans" | "display" | "serif";
  bodyFont: "sans" | "display" | "serif";
  radius: number;
  shadow: "none" | "soft" | "strong";
  containerWidth: number;
  sectionSpacing: number;
  buttonStyle: "solid" | "outline" | "pill";
}

export interface LandingProductOverrides {
  title?: string;
  description?: string;
  displayPrice?: number;
  compareAtPrice?: number;
  image?: string;
  ctaLabel?: string;
}

export interface LandingProductReference {
  productId: string;
  quantity?: number;
  overrides?: LandingProductOverrides;
}

export interface LandingBlockBase {
  id: string;
  type: LandingBlockType;
  hidden: boolean;
  label?: string;
  desktopVisible?: boolean;
  mobileVisible?: boolean;
  animation?: LandingAnimation;
  style?: {
    backgroundColor?: string;
    textColor?: string;
    alignment?: "left" | "center" | "right";
    paddingTop?: number;
    paddingBottom?: number;
  };
}

export interface HeroLandingBlock extends LandingBlockBase {
  type: "hero";
  layout?: "left-image" | "right-image" | "center" | "overlay" | "full-width";
  eyebrow?: string;
  title?: string;
  description?: string;
  image?: string;
  backgroundImage?: string;
  ctaLabel?: string;
  ctaTarget?: string;
}

export interface BannerLandingBlock extends LandingBlockBase {
  type: "banner";
  image?: string;
  mobileImage?: string;
  alt?: string;
  href?: string;
}

export interface GalleryLandingBlock extends LandingBlockBase {
  type: "gallery";
  title?: string;
  layout?: "grid" | "slider";
  images: Array<{ id: string; url: string; alt?: string }>;
}

export interface VideoLandingBlock extends LandingBlockBase {
  type: "video";
  title?: string;
  url?: string;
  poster?: string;
  autoplay?: boolean;
}

export interface BenefitsLandingBlock extends LandingBlockBase {
  type: "benefits";
  title?: string;
  items: Array<{ id: string; title: string; description?: string; icon?: string; image?: string }>;
}

export interface FeaturesLandingBlock extends LandingBlockBase {
  type: "features";
  title?: string;
  items: Array<{ id: string; title: string; description?: string; image?: string }>;
}

export interface SpecificationsLandingBlock extends LandingBlockBase {
  type: "specifications";
  title?: string;
  productId?: string;
  useProductSpecs?: boolean;
  includeKeys?: string[];
  customRows?: Array<{ id: string; label: string; value: string }>;
}

export interface PriceLandingBlock extends LandingBlockBase {
  type: "price";
  title?: string;
  productId?: string;
  useProductPrice?: boolean;
  displayPrice?: number;
  compareAtPrice?: number;
  badge?: string;
  promotionText?: string;
  ctaLabel?: string;
}

export interface ComboLandingBlock extends LandingBlockBase {
  type: "combo";
  title?: string;
  products: LandingProductReference[];
  gifts?: LandingProductReference[];
  comboPrice?: number;
  compareAtPrice?: number;
  ctaLabel?: string;
}

export interface GiftLandingBlock extends LandingBlockBase {
  type: "gift";
  title?: string;
  description?: string;
  image?: string;
  productId?: string;
  estimatedValue?: number;
  items?: Array<{ id: string; title: string; description?: string; image?: string; estimatedValue?: number }>;
}

export interface CountdownLandingBlock extends LandingBlockBase {
  type: "countdown";
  title?: string;
  endsAt?: string;
  timezone?: string;
  hideWhenExpired?: boolean;
  expiredMessage?: string;
}

export interface ReviewsLandingBlock extends LandingBlockBase {
  type: "reviews";
  title?: string;
  items: Array<{ id: string; name: string; content: string; rating?: number; image?: string }>;
}

export interface FaqLandingBlock extends LandingBlockBase {
  type: "faq";
  title?: string;
  items: Array<{ id: string; question: string; answer: string; openByDefault?: boolean }>;
}

export interface WarrantyLandingBlock extends LandingBlockBase {
  type: "warranty";
  title?: string;
  description?: string;
  image?: string;
  items?: string[];
}

export interface CtaLandingBlock extends LandingBlockBase {
  type: "cta";
  title?: string;
  description?: string;
  buttonLabel?: string;
  buttonTarget?: string;
  backgroundImage?: string;
}

export interface OrderFormLandingBlock extends LandingBlockBase {
  type: "order-form";
  title?: string;
  description?: string;
  formType?: "order" | "consultation" | "phone-only";
  submitLabel?: string;
  successMessage?: string;
  productIds?: string[];
  requireAddress?: boolean;
  allowNote?: boolean;
  showName?: boolean;
  showAddress?: boolean;
  showNote?: boolean;
  showQuantity?: boolean;
  showBusinessName?: boolean;
  showBusinessType?: boolean;
  showEstimatedVolume?: boolean;
}

export interface ContactButtonLandingBlock extends LandingBlockBase {
  type: "contact-button";
  channel: "call" | "zalo" | "messenger" | "shopee";
  label?: string;
  href?: string;
  fixedOnMobile?: boolean;
}

export interface SpacerLandingBlock extends LandingBlockBase {
  type: "spacer";
  desktopHeight: number;
  mobileHeight: number;
}

export type LandingBlock =
  | HeroLandingBlock | BannerLandingBlock | GalleryLandingBlock | VideoLandingBlock
  | BenefitsLandingBlock | FeaturesLandingBlock | SpecificationsLandingBlock
  | PriceLandingBlock | ComboLandingBlock | GiftLandingBlock | CountdownLandingBlock
  | ReviewsLandingBlock | FaqLandingBlock | WarrantyLandingBlock | CtaLandingBlock
  | OrderFormLandingBlock | ContactButtonLandingBlock | SpacerLandingBlock;

export interface LandingPageSeo {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
}

export interface LandingPageLayout {
  hideHeader: boolean;
  hideFooter: boolean;
  stickyMobileCta: boolean;
  theme: "dark" | "light";
}

export interface LandingPageTracking {
  metaPixelId?: string;
  tiktokPixelId?: string;
  googleTagManagerId?: string;
}

export interface LandingPage {
  id: string;
  slug: string;
  slugHistory: string[];
  name: string;
  status: LandingPageStatus;
  templateId: string;
  templateVersion: number;
  primaryProductId?: string;
  productOverrides?: LandingProductOverrides;
  seo: LandingPageSeo;
  layout: LandingPageLayout;
  design?: LandingDesignTokens;
  tracking: LandingPageTracking;
  blocks: LandingBlock[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  source?: string;
}

export interface LandingOrderItemSnapshot {
  productId: string;
  variantId?: string;
  variantName?: string;
  sku: string;
  name: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  isGift?: boolean;
}

export interface LandingOrder {
  id: string;
  orderCode: string;
  landingPageId: string;
  landingPageSlug: string;
  landingPageTitle: string;
  customerName: string;
  phone: string;
  address: string;
  province?: string;
  district?: string;
  ward?: string;
  note?: string;
  businessName?: string;
  businessType?: string;
  estimatedVolume?: string;
  items: LandingOrderItemSnapshot[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  currency: "VND";
  source?: string;
  status: LandingOrderStatus;
  adminNote: string;
  assignedTo: string;
  requestId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LandingOrderRequestInput {
  landingPageId?: string;
  slug?: string;
  customerName?: string;
  phone: string;
  address?: string;
  province?: string;
  district?: string;
  ward?: string;
  note?: string;
  businessName?: string;
  businessType?: string;
  estimatedVolume?: string;
  items: Array<{ productId: string; variantId?: string; quantity: number }>;
  requestId?: string;
  idempotencyKey?: string;
  website?: string;
}
