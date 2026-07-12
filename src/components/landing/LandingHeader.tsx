import Link from 'next/link';

export default function LandingHeader() {
  return <header className="sticky top-0 z-40 border-b border-[#d99d1a]/20 bg-black/95 backdrop-blur"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4"><Link href="/" aria-label="Về trang chủ Voltara"><img src="/images/logo-voltara.webp" alt="Voltara" className="h-10 w-auto object-contain" /></Link><a href="#dat-hang" className="border border-gold-dark/60 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-gold-light">Đặt hàng</a></div></header>;
}
