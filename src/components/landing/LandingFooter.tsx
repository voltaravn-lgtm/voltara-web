import Link from 'next/link';

export default function LandingFooter() {
  return <footer className="border-t border-[#d99d1a]/20 bg-black px-5 py-10 text-center text-white"><Link href="/"><img src="/images/logo-voltara.webp" alt="Voltara" className="mx-auto h-10 w-auto object-contain" /></Link><p className="mt-4 text-xs text-white/45">Sản phẩm và giải pháp năng lượng chính hãng Voltara.</p></footer>;
}
