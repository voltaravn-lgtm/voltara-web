import { LandingBlockType } from '../../types/landing';
import {
  BannerBlockRenderer, BenefitsBlockRenderer, BlockRendererProps, ComboBlockRenderer,
  ContactButtonBlockRenderer, CountdownBlockRenderer, CtaBlockRenderer, DeferredBlockRenderer,
  FaqBlockRenderer, FeaturesBlockRenderer, GalleryBlockRenderer, GiftBlockRenderer,
  HeroBlockRenderer, OrderFormBlockRenderer, PriceBlockRenderer, ReviewsBlockRenderer,
  SpacerBlockRenderer, SpecificationsBlockRenderer, VideoBlockRenderer, WarrantyBlockRenderer,
} from './BlockRenderers';

export const LANDING_BLOCK_RENDERERS: Record<LandingBlockType, React.ComponentType<BlockRendererProps>> = {
  hero: HeroBlockRenderer,
  banner: BannerBlockRenderer,
  gallery: GalleryBlockRenderer,
  video: VideoBlockRenderer,
  benefits: BenefitsBlockRenderer,
  features: FeaturesBlockRenderer,
  specifications: SpecificationsBlockRenderer,
  price: PriceBlockRenderer,
  combo: ComboBlockRenderer,
  gift: GiftBlockRenderer,
  countdown: CountdownBlockRenderer,
  reviews: ReviewsBlockRenderer,
  faq: FaqBlockRenderer,
  warranty: WarrantyBlockRenderer,
  cta: CtaBlockRenderer,
  'order-form': OrderFormBlockRenderer,
  'contact-button': ContactButtonBlockRenderer,
  spacer: SpacerBlockRenderer,
};

export function getLandingBlockRenderer(type: LandingBlockType) {
  return LANDING_BLOCK_RENDERERS[type] || DeferredBlockRenderer;
}
