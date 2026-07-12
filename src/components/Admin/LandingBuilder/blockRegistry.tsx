'use client';

import { LucideIcon, Gift, BadgeInfo, GalleryHorizontal, HelpCircle, Image, LayoutTemplate, ListChecks, MessageCircle, MousePointerClick, PackagePlus, PanelTop, Play, Rows3, ShieldCheck, ShoppingBasket, Sparkles, Star, Timer, Type } from 'lucide-react';
import { LandingBlock, LandingBlockType } from '../../../types/landing';
import { createDefaultLandingBlock } from '../../../lib/landing/landingDefaults';
import { BannerBlockEditor, BenefitsBlockEditor, BlockEditorProps, ContactButtonBlockEditor, CtaBlockEditor, DeferredBlockEditor, HeroBlockEditor, SpacerBlockEditor } from './BlockEditors';
import { BlockRendererProps, DeferredBlockRenderer } from '../../landing/BlockRenderers';
import { getLandingBlockRenderer } from '../../landing/blockRendererRegistry';
import { FaqBlockEditor, FeaturesBlockEditor, GalleryBlockEditor, ReviewsBlockEditor, SpecificationsBlockEditor, VideoBlockEditor, WarrantyBlockEditor } from './PresentationBlockEditors';
import { ComboBlockEditor, CountdownBlockEditor, GiftBlockEditor, OrderFormBlockEditor, PriceBlockEditor } from './SalesBlockEditors';
import { HeroDesignEditor } from './LandingDesignSettings';

export interface LandingBlockRegistryEntry {
  type: LandingBlockType;
  label: string;
  description: string;
  Icon: LucideIcon;
  createDefault: () => LandingBlock;
  Editor: React.ComponentType<BlockEditorProps>;
  Renderer: React.ComponentType<BlockRendererProps>;
  editorPhase: 4 | 5 | 6;
}

function entry(type: LandingBlockType, label: string, description: string, Icon: LucideIcon, Editor: React.ComponentType<BlockEditorProps> = DeferredBlockEditor, Renderer: React.ComponentType<BlockRendererProps> = DeferredBlockRenderer, editorPhase: 4 | 5 | 6 = 5): LandingBlockRegistryEntry {
  return { type, label, description, Icon, createDefault: () => createDefaultLandingBlock(type), Editor, Renderer, editorPhase };
}

export const LANDING_BLOCK_REGISTRY: Record<LandingBlockType, LandingBlockRegistryEntry> = {
  hero: entry('hero', 'Hero', 'Mở đầu Landing với tiêu đề, mô tả, ảnh và CTA.', PanelTop, HeroDesignEditor, getLandingBlockRenderer('hero'), 4),
  banner: entry('banner', 'Banner', 'Banner quảng cáo desktop và mobile.', Image, BannerBlockEditor, getLandingBlockRenderer('banner'), 4),
  gallery: entry('gallery', 'Gallery', 'Bộ sưu tập ảnh sản phẩm.', GalleryHorizontal, GalleryBlockEditor, getLandingBlockRenderer('gallery'), 6),
  video: entry('video', 'Video', 'Video giới thiệu hoặc hướng dẫn.', Play, VideoBlockEditor, getLandingBlockRenderer('video'), 6),
  benefits: entry('benefits', 'Benefits', 'Các lợi ích chính của sản phẩm.', Sparkles, BenefitsBlockEditor, getLandingBlockRenderer('benefits'), 4),
  features: entry('features', 'Features', 'Danh sách tính năng nổi bật.', ListChecks, FeaturesBlockEditor, getLandingBlockRenderer('features'), 6),
  specifications: entry('specifications', 'Specifications', 'Thông số lấy từ Product và dòng tùy chỉnh.', Rows3, SpecificationsBlockEditor, getLandingBlockRenderer('specifications'), 6),
  price: entry('price', 'Price', 'Giá, giá so sánh và CTA mua hàng.', BadgeInfo, PriceBlockEditor, getLandingBlockRenderer('price'), 6),
  combo: entry('combo', 'Combo', 'Nhóm nhiều sản phẩm thành combo.', ShoppingBasket, ComboBlockEditor, getLandingBlockRenderer('combo'), 6),
  gift: entry('gift', 'Gift', 'Quà tặng hoặc ưu đãi kèm theo.', Gift, GiftBlockEditor, getLandingBlockRenderer('gift'), 6),
  countdown: entry('countdown', 'Countdown', 'Đếm ngược thời gian khuyến mãi.', Timer, CountdownBlockEditor, getLandingBlockRenderer('countdown'), 6),
  reviews: entry('reviews', 'Reviews', 'Đánh giá và bằng chứng khách hàng.', Star, ReviewsBlockEditor, getLandingBlockRenderer('reviews'), 6),
  faq: entry('faq', 'FAQ', 'Câu hỏi thường gặp.', HelpCircle, FaqBlockEditor, getLandingBlockRenderer('faq'), 6),
  warranty: entry('warranty', 'Warranty', 'Chính sách bảo hành.', ShieldCheck, WarrantyBlockEditor, getLandingBlockRenderer('warranty'), 6),
  cta: entry('cta', 'CTA', 'Khối kêu gọi hành động.', MousePointerClick, CtaBlockEditor, getLandingBlockRenderer('cta'), 4),
  'order-form': entry('order-form', 'Order Form', 'Form đặt hàng; hoạt động ở Task 7.', PackagePlus, OrderFormBlockEditor, getLandingBlockRenderer('order-form'), 6),
  'contact-button': entry('contact-button', 'Contact Button', 'Nút gọi, Zalo, Messenger hoặc Shopee.', MessageCircle, ContactButtonBlockEditor, getLandingBlockRenderer('contact-button'), 4),
  spacer: entry('spacer', 'Spacer', 'Khoảng cách giữa các block.', Type, SpacerBlockEditor, getLandingBlockRenderer('spacer'), 4),
};

export const LANDING_BLOCK_REGISTRY_LIST = Object.values(LANDING_BLOCK_REGISTRY);
export function getLandingBlockRegistry(type: LandingBlockType) { return LANDING_BLOCK_REGISTRY[type] || entry(type, type, '', LayoutTemplate); }
