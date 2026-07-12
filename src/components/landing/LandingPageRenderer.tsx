import { Product } from '../../types';
import { LandingPage } from '../../types/landing';
import { getLandingBlockRenderer } from './blockRendererRegistry';
import LandingFooter from './LandingFooter';
import LandingHeader from './LandingHeader';
import { landingDesignStyle } from '../../lib/landing/landingDesign';
import LandingTracking from './LandingTracking';

interface LandingPageRendererProps { page: LandingPage; product?: Product | null; products?: Product[]; }

export default function LandingPageRenderer({ page, product, products = [] }: LandingPageRendererProps) {
  const dark = page.layout.theme === 'dark';
  return <div style={landingDesignStyle(page)} data-button-style={page.design?.buttonStyle || 'solid'} className={`landing-root min-h-screen overflow-x-hidden ${dark ? 'bg-[#070707] text-white' : 'bg-white text-[#141414]'}`}>
    <LandingTracking page={page} product={product} />
    {!page.layout.hideHeader && <LandingHeader />}
    <main>
      {page.blocks.filter((block) => !block.hidden).map((block) => {
        const Renderer = getLandingBlockRenderer(block.type);
        const visibility = block.desktopVisible === false ? 'md:hidden' : block.mobileVisible === false ? 'hidden md:block' : '';
        return <div key={block.id} className={visibility}><Renderer block={block} page={page} product={product} products={products} /></div>;
      })}
    </main>
    {!page.layout.hideFooter && <LandingFooter />}
    {page.layout.stickyMobileCta && <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gold-dark/30 bg-black/95 p-3 pb-[calc(.75rem+env(safe-area-inset-bottom))] md:hidden"><a href="#dat-hang" className="landing-button block w-full py-3 text-center text-xs font-black uppercase">{page.productOverrides?.ctaLabel || 'Đặt hàng ngay'}</a></div>}
  </div>;
}
