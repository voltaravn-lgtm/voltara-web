'use client';

import React, { useEffect, useState } from 'react';
import LandingOrderForm from './LandingOrderForm';
import { Product } from '../../types';
import {
  BannerLandingBlock, BenefitsLandingBlock, ComboLandingBlock, ContactButtonLandingBlock,
  CountdownLandingBlock, CtaLandingBlock, FaqLandingBlock, FeaturesLandingBlock,
  GalleryLandingBlock, GiftLandingBlock, HeroLandingBlock, LandingBlock, LandingPage,
  LandingPreviewMode, OrderFormLandingBlock, PriceLandingBlock, ReviewsLandingBlock,
  SpacerLandingBlock, SpecificationsLandingBlock, VideoLandingBlock, WarrantyLandingBlock,
} from '../../types/landing';

export interface BlockRendererProps {
  block: LandingBlock;
  page: LandingPage;
  product?: Product | null;
  products?: Product[];
  mode?: LandingPreviewMode;
  editorMode?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

function numberPrice(value?: string | number) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (!value) return undefined;
  const parsed = Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function productPrice(page: LandingPage, product?: Product | null) {
  return page.productOverrides?.displayPrice ?? numberPrice(product?.salePrice) ?? numberPrice(product?.retailPrice) ?? numberPrice(product?.price);
}

function plainText(value?: string) {
  return (value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function wrapperStyle(block: LandingBlock): React.CSSProperties {
  return {
    backgroundColor: block.style?.backgroundColor,
    color: block.style?.textColor,
    textAlign: block.style?.alignment,
    paddingTop: block.style?.paddingTop,
    paddingBottom: block.style?.paddingBottom,
  };
}

function Frame({ block, editorMode, selected, onSelect, children, className = '' }: BlockRendererProps & { children: React.ReactNode; className?: string }) {
  return <section
    onClick={editorMode ? (event) => { event.stopPropagation(); onSelect?.(); } : undefined}
    style={wrapperStyle(block)}
    className={`landing-section landing-animate-${block.animation || 'none'} relative px-5 ${editorMode ? 'cursor-pointer transition ' + (selected ? 'ring-2 ring-inset ring-gold-light' : 'ring-1 ring-inset ring-white/5') : ''} ${className}`}
  >
    {editorMode && selected && <span className="absolute left-2 top-2 z-10 bg-gold-light px-2 py-1 text-[8px] font-black uppercase text-black">Đang chọn</span>}
    {children}
  </section>;
}

function responsiveGrid(mode: LandingPreviewMode | undefined, desktopClass: string) {
  if (mode === 'mobile') return 'grid-cols-1';
  if (mode === 'desktop') return desktopClass;
  return `grid-cols-1 ${desktopClass.replace('grid-cols-', 'md:grid-cols-')}`;
}

export function HeroBlockRenderer(props: BlockRendererProps) {
  const block = props.block as HeroLandingBlock;
  const title = block.title || props.page.productOverrides?.title || props.product?.name || 'Sản phẩm Voltara';
  const description = block.description || props.page.productOverrides?.description || plainText(props.product?.description) || 'Giải pháp chính hãng dành cho bạn.';
  const image = block.image || props.page.productOverrides?.image || props.product?.image;
  const layout = block.layout || 'right-image';
  const content = <div className={`relative z-10 py-4 ${layout === 'center' || layout === 'overlay' || layout === 'full-width' ? 'mx-auto max-w-3xl text-center' : ''}`}><span className="text-[10px] font-bold uppercase tracking-[.22em] text-gold-light">{block.eyebrow || 'VOLTARA CHÍNH HÃNG'}</span><h1 className="mt-3 text-3xl font-black uppercase leading-tight md:text-5xl">{title}</h1><p className="mt-4 text-sm leading-6 opacity-70 md:text-base">{description}</p><a href={block.ctaTarget || '#dat-hang'} className="landing-button mt-6 inline-block px-6 py-3 text-xs font-black uppercase">{block.ctaLabel || props.page.productOverrides?.ctaLabel || 'Đặt hàng ngay'}</a></div>;
  const visual = <div className="relative z-10 flex min-h-64 items-center justify-center">{image ? <img src={image} alt={title} className="max-h-[520px] w-full object-contain" /> : <span className="text-xs uppercase opacity-30">Chưa có ảnh sản phẩm</span>}</div>;
  const background = block.backgroundImage || ((layout === 'overlay' || layout === 'full-width') ? image : undefined);
  if (layout === 'overlay' || layout === 'full-width') return <Frame {...props} className="overflow-hidden"><div className="relative -mx-5 flex min-h-[520px] items-center justify-center bg-cover bg-center px-6" style={background ? { backgroundImage: `linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.7)),url(${background})` } : undefined}>{content}</div></Frame>;
  if (layout === 'center') return <Frame {...props} className="overflow-hidden"><div className="mx-auto max-w-5xl">{content}{visual}</div></Frame>;
  return <Frame {...props} className="overflow-hidden"><div className={`mx-auto grid items-center gap-8 ${responsiveGrid(props.mode, 'grid-cols-2')}`}>{layout === 'left-image' ? <>{visual}{content}</> : <>{content}{visual}</>}</div></Frame>;
}

export function BannerBlockRenderer(props: BlockRendererProps) {
  const block = props.block as BannerLandingBlock;
  const image = props.mode === 'mobile' ? (block.mobileImage || block.image) : block.image;
  const content = image ? <picture>{block.mobileImage && <source media="(max-width: 767px)" srcSet={block.mobileImage} />}<img src={block.image || block.mobileImage} alt={block.alt || ''} className="mx-auto max-h-[680px] w-full object-cover" /></picture> : <div className="flex min-h-40 items-center justify-center border border-dashed border-white/15 text-xs uppercase opacity-30">Chưa chọn ảnh banner</div>;
  return <Frame {...props}>{block.href ? <a href={block.href}>{content}</a> : content}</Frame>;
}

export function GalleryBlockRenderer(props: BlockRendererProps) {
  const block = props.block as GalleryLandingBlock;
  const images: Array<{ id: string; url: string; alt?: string }> = block.images.length ? block.images : (props.product?.images || []).map((url, index) => ({ id: `${index}`, url, alt: props.product?.name }));
  const slider = block.layout === 'slider';
  return <Frame {...props}><div className="mx-auto max-w-6xl"><h2 className="text-2xl font-black uppercase md:text-3xl">{block.title || 'Hình ảnh sản phẩm'}</h2><div className={slider ? 'mt-6 flex snap-x gap-3 overflow-x-auto pb-3' : `mt-6 grid gap-3 ${responsiveGrid(props.mode, 'grid-cols-3')}`}>{images.map((image) => <img key={image.id} src={image.url} alt={image.alt || props.product?.name || ''} className={`${slider ? 'w-[82%] shrink-0 snap-center md:w-[42%]' : 'w-full'} aspect-square bg-white object-contain`} />)}{!images.length && <p className="w-full border border-dashed border-white/15 p-8 text-center text-xs opacity-30">Chưa có ảnh Gallery</p>}</div></div></Frame>;
}

export function VideoBlockRenderer(props: BlockRendererProps) {
  const block = props.block as VideoLandingBlock;
  const youtubeId = block.url?.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&/]+)/)?.[1];
  const direct = block.url && /\.(mp4|webm|ogg)(?:\?|$)/i.test(block.url);
  return <Frame {...props}><div className="mx-auto max-w-5xl"><h2 className="mb-5 text-2xl font-black uppercase">{block.title || 'Video sản phẩm'}</h2>{youtubeId ? <iframe src={`https://www.youtube-nocookie.com/embed/${youtubeId}${block.autoplay ? '?autoplay=1&mute=1' : ''}`} title={block.title || 'Video'} allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowFullScreen className="aspect-video w-full border-0" /> : direct ? <video src={block.url} poster={block.poster} autoPlay={block.autoplay} muted={block.autoplay} controls className="aspect-video w-full bg-black" /> : block.url ? <a href={block.url} target="_blank" rel="noopener noreferrer" className="flex aspect-video items-center justify-center border border-gold-dark/30 bg-black text-sm font-bold uppercase text-gold-light">Mở video TikTok / Facebook</a> : <div className="flex aspect-video items-center justify-center border border-dashed border-white/15 text-xs opacity-30">Chưa có video</div>}</div></Frame>;
}

export function BenefitsBlockRenderer(props: BlockRendererProps) {
  const block = props.block as BenefitsLandingBlock;
  return <Frame {...props}><div className="mx-auto max-w-6xl"><h2 className="text-2xl font-black uppercase md:text-3xl">{block.title || 'Lợi ích nổi bật'}</h2><div className={`mt-6 grid gap-3 ${responsiveGrid(props.mode, 'grid-cols-3')}`}>{block.items.map((item) => <div key={item.id} className="border border-current/10 bg-black/10 p-5">{item.image && <img src={item.image} alt="" className="mb-4 h-14 w-14 object-contain" />}<b className="text-sm uppercase">{item.title}</b><p className="mt-2 text-xs leading-5 opacity-60">{item.description}</p></div>)}{!block.items.length && <p className="col-span-full border border-dashed border-white/15 p-8 text-center text-xs opacity-30">Chưa có nội dung lợi ích</p>}</div></div></Frame>;
}

export function FeaturesBlockRenderer(props: BlockRendererProps) {
  const block = props.block as FeaturesLandingBlock;
  return <Frame {...props}><div className="mx-auto max-w-5xl"><h2 className="text-2xl font-black uppercase">{block.title || 'Tính năng nổi bật'}</h2><div className="mt-6 space-y-3">{block.items.map((item) => <div key={item.id} className="flex gap-4 border-b border-current/10 pb-3"><span className="text-gold-light">✓</span><div><b>{item.title}</b><p className="text-sm opacity-60">{item.description}</p></div></div>)}</div></div></Frame>;
}

export function SpecificationsBlockRenderer(props: BlockRendererProps) {
  const block = props.block as SpecificationsLandingBlock;
  const boundProduct = props.products?.find((item) => item.id === block.productId) || props.product;
  const productRows = block.useProductSpecs === false ? [] : Object.entries(boundProduct?.specs || {}).filter(([key]) => !block.includeKeys?.length || block.includeKeys.includes(key));
  const rows = [...productRows.map(([label, value]) => ({ id: label, label, value })), ...(block.customRows || [])];
  return <Frame {...props}><div className="mx-auto max-w-4xl"><h2 className="text-2xl font-black uppercase">{block.title || 'Thông số kỹ thuật'}</h2><div className="mt-6 divide-y divide-current/10 border border-current/10">{rows.map((row) => <div key={row.id} className="grid grid-cols-2 gap-4 px-4 py-3 text-sm"><b>{row.label}</b><span className="opacity-70">{row.value}</span></div>)}{!rows.length && <p className="p-8 text-center text-xs opacity-30">Chưa có thông số</p>}</div></div></Frame>;
}

export function PriceBlockRenderer(props: BlockRendererProps) {
  const block = props.block as PriceLandingBlock;
  const boundProduct = props.products?.find((item) => item.id === block.productId) || props.product;
  const price = block.displayPrice ?? productPrice(props.page, boundProduct);
  const compare = block.compareAtPrice ?? props.page.productOverrides?.compareAtPrice ?? numberPrice(boundProduct?.retailPrice) ?? numberPrice(boundProduct?.price);
  return <Frame {...props}><div className="mx-auto max-w-3xl border border-gold-dark/40 bg-black/20 p-6 text-center"><h2 className="text-2xl font-black uppercase">{block.title || 'Ưu đãi hôm nay'}</h2>{block.badge && <span className="mt-3 inline-block bg-gold-light px-3 py-1 text-[10px] font-black uppercase text-black">{block.badge}</span>}<div className="mt-5">{compare && compare !== price && <span className="mr-3 text-sm line-through opacity-40">{money.format(compare)}</span>}<strong className="text-3xl text-gold-light">{price ? money.format(price) : 'Liên hệ'}</strong></div>{block.promotionText && <p className="mt-3 text-sm opacity-65">{block.promotionText}</p>}<a href="#dat-hang" className="mt-5 inline-block bg-gold-light px-7 py-3 text-xs font-black uppercase text-black">{block.ctaLabel || props.page.productOverrides?.ctaLabel || 'Đặt hàng ngay'}</a></div></Frame>;
}

export function ComboBlockRenderer(props: BlockRendererProps) {
  const block = props.block as ComboLandingBlock;
  return <Frame {...props}><div className="mx-auto max-w-5xl"><h2 className="text-center text-2xl font-black uppercase">{block.title || 'Combo tiết kiệm'}</h2><div className="mt-5 grid gap-3 md:grid-cols-2">{block.products.map((ref, index) => { const item = props.products?.find((product) => product.id === ref.productId); return <div key={`${ref.productId}-${index}`} className="flex items-center gap-3 border border-current/10 p-3">{(ref.overrides?.image || item?.image) && <img src={ref.overrides?.image || item?.image} alt="" className="h-16 w-16 bg-white object-contain" />}<div><b className="text-xs uppercase">{ref.overrides?.title || item?.name || ref.productId}</b><p className="mt-1 text-xs opacity-50">Số lượng: {ref.quantity || 1}</p></div></div>; })}</div>{block.gifts?.length ? <p className="mt-4 text-center text-sm text-gold-light">Tặng kèm {block.gifts.length} sản phẩm</p> : null}<strong className="mt-5 block text-center text-3xl text-gold-light">{block.comboPrice ? money.format(block.comboPrice) : 'Liên hệ'}</strong></div></Frame>;
}

export function GiftBlockRenderer(props: BlockRendererProps) { const block = props.block as GiftLandingBlock; const items = block.items || []; return <Frame {...props}><div className="mx-auto max-w-5xl text-center"><h2 className="text-2xl font-black uppercase">{block.title || 'Quà tặng kèm'}</h2><p className="mt-3 opacity-65">{block.description}</p>{items.length ? <div className={`mt-6 grid gap-3 ${responsiveGrid(props.mode, 'grid-cols-3')}`}>{items.map((item) => <div key={item.id} className="border border-current/10 p-4">{item.image && <img src={item.image} alt={item.title} className="mx-auto mb-3 h-32 w-full object-contain" />}<b className="text-sm uppercase">{item.title}</b>{item.description && <p className="mt-2 text-xs opacity-60">{item.description}</p>}{item.estimatedValue && <p className="mt-2 text-xs text-gold-light">Trị giá {money.format(item.estimatedValue)}</p>}</div>)}</div> : block.image && <img src={block.image} alt="" className="mx-auto mt-5 max-h-64 object-contain" />}</div></Frame>; }

export function CountdownBlockRenderer(props: BlockRendererProps) { const block = props.block as CountdownLandingBlock; const [now, setNow] = useState(0); useEffect(() => { setNow(Date.now()); const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, []); const end = block.endsAt ? new Date(block.endsAt).getTime() : 0; const remaining = now ? Math.max(0, end - now) : 0; const expired = Boolean(now && end && remaining === 0); if (expired && block.hideWhenExpired) return null; const days = Math.floor(remaining / 86400000); const hours = Math.floor(remaining / 3600000) % 24; const minutes = Math.floor(remaining / 60000) % 60; const seconds = Math.floor(remaining / 1000) % 60; return <Frame {...props}><div className="mx-auto max-w-4xl text-center"><h2 className="text-2xl font-black uppercase">{block.title}</h2><p className="mt-4 text-xl tracking-widest text-gold-light">{!now ? 'Đang tính thời gian…' : expired ? block.expiredMessage : end ? `${days} ngày · ${hours} giờ · ${minutes} phút · ${seconds} giây` : 'Thời gian sẽ được cập nhật'}</p></div></Frame>; }

export function ReviewsBlockRenderer(props: BlockRendererProps) { const block = props.block as ReviewsLandingBlock; return <Frame {...props}><div className="mx-auto max-w-6xl"><h2 className="text-2xl font-black uppercase">{block.title}</h2><div className={`mt-6 grid gap-3 ${responsiveGrid(props.mode, 'grid-cols-3')}`}>{block.items.map((item) => <blockquote key={item.id} className="border border-current/10 p-5"><span className="text-gold-light">{'★'.repeat(item.rating || 5)}</span><p className="mt-3 text-sm opacity-70">“{item.content}”</p><b className="mt-4 block text-xs uppercase">{item.name}</b></blockquote>)}</div></div></Frame>; }

export function FaqBlockRenderer(props: BlockRendererProps) { const block = props.block as FaqLandingBlock; return <Frame {...props}><div className="mx-auto max-w-4xl"><h2 className="text-2xl font-black uppercase">{block.title}</h2><div className="mt-5 divide-y divide-current/10 border-y border-current/10">{block.items.map((item) => <details key={item.id} open={item.openByDefault} className="group py-4"><summary className="cursor-pointer list-none font-bold">{item.question}</summary><p className="pt-3 text-sm leading-6 opacity-65">{item.answer}</p></details>)}</div></div></Frame>; }

export function WarrantyBlockRenderer(props: BlockRendererProps) { const block = props.block as WarrantyLandingBlock; return <Frame {...props}><div className="mx-auto max-w-4xl text-center">{block.image && <img src={block.image} alt="" className="mx-auto mb-5 max-h-56 object-contain" />}<h2 className="text-2xl font-black uppercase">{block.title || 'Bảo hành chính hãng'}</h2><p className="mt-3 opacity-65">{block.description || props.product?.warranty}</p>{block.items?.length ? <ul className="mt-4 space-y-2 text-sm">{block.items.map((item) => <li key={item}>✓ {item}</li>)}</ul> : null}</div></Frame>; }

export function CtaBlockRenderer(props: BlockRendererProps) { const block = props.block as CtaLandingBlock; return <Frame {...props}><div className="mx-auto max-w-3xl text-center"><h2 className="text-2xl font-black uppercase md:text-3xl">{block.title || 'Sẵn sàng sở hữu sản phẩm?'}</h2><p className="mt-3 text-sm opacity-60">{block.description}</p><a href={block.buttonTarget || '#dat-hang'} className="mt-5 inline-block bg-gold-light px-7 py-3 text-xs font-black uppercase text-black">{block.buttonLabel || 'Đặt hàng ngay'}</a></div></Frame>; }

export function OrderFormBlockRenderer(props: BlockRendererProps) { const block = props.block as OrderFormLandingBlock; return <Frame {...props}><LandingOrderForm block={block} page={props.page} products={props.products || (props.product ? [props.product] : [])} editorMode={props.editorMode} /></Frame>; }

export function ContactButtonBlockRenderer(props: BlockRendererProps) { const block = props.block as ContactButtonLandingBlock; const content = <><span className="rounded-full bg-gold-light px-6 py-3 text-xs font-black uppercase text-black">{block.label || block.channel}</span><p className="mt-3 text-[9px] uppercase opacity-35">{block.channel}</p></>; return <Frame {...props}><div className="text-center">{block.href ? <a href={block.href}>{content}</a> : <div>{content}</div>}</div></Frame>; }

export function SpacerBlockRenderer(props: BlockRendererProps) {
  const block = props.block as SpacerLandingBlock;
  const frame = (height: number, className = '') => <div key={className || 'spacer'} onClick={props.editorMode ? props.onSelect : undefined} style={{ height: Math.max(16, height) }} className={`${className} relative ${props.editorMode ? `cursor-pointer border-y border-dashed ${props.selected ? 'border-gold-light bg-gold-dark/10' : 'border-white/10'}` : ''}`}>{props.editorMode && <span className="absolute inset-0 flex items-center justify-center text-[9px] uppercase opacity-30">Spacer {height}px</span>}</div>;
  if (props.mode) return frame(props.mode === 'mobile' ? block.mobileHeight : block.desktopHeight);
  return <>{frame(block.mobileHeight, 'md:hidden')}{frame(block.desktopHeight, 'hidden md:block')}</>;
}

export function DeferredBlockRenderer(props: BlockRendererProps) { return <Frame {...props}><div className="mx-auto max-w-4xl border border-dashed border-white/15 p-7 text-center"><b className="text-sm uppercase">{props.block.label || props.block.type}</b><p className="mt-2 text-xs opacity-35">Nội dung block đang chờ cấu hình.</p></div></Frame>; }
