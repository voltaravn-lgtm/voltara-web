"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronRight, Phone, ShieldCheck, ShoppingCart, Zap } from "lucide-react";
import QuoteRequestModal from "./QuoteRequestModal";
import { useApp } from "../context/AppContext";
import { getProductHref } from "../lib/productRoutes";
import { Product } from "../types";

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const { products } = useApp();
  const currentProduct = products.find((item) => item.id === product.id) || product;
  const productSource = products.length > 0 ? products : [product, ...relatedProducts];
  const sameCategoryProducts = productSource.filter(
    (item) => item.category === currentProduct.category && item.id !== currentProduct.id,
  );
  const currentRelatedProducts = (
    sameCategoryProducts.length > 0
      ? sameCategoryProducts
      : productSource.filter((item) => item.id !== currentProduct.id)
  ).slice(0, 3);

  const gallery = useMemo(() => {
    const images = [currentProduct.image, ...(currentProduct.images || [])];
    return Array.from(new Set(images.filter(Boolean)));
  }, [currentProduct.image, currentProduct.images]);

  const [activeImage, setActiveImage] = useState(gallery[0] || currentProduct.image);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const descriptionHtml = useMemo(
    () => formatProductDescriptionToHtml(currentProduct.description),
    [currentProduct.description],
  );
  const shortDescription = useMemo(
    () => getShortDescription(currentProduct.description),
    [currentProduct.description],
  );

  useEffect(() => {
    setActiveImage(gallery[0] || currentProduct.image);
  }, [gallery, currentProduct.image]);

  return (
    <div className="bg-[#050505] pb-20">
      <section className="relative overflow-hidden bg-black pt-28 pb-12 lg:pt-36 lg:pb-16">
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={currentProduct.image}
            alt={currentProduct.name}
            className="h-full w-full object-cover opacity-20 blur-sm scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-7 flex items-center gap-2 text-[11px] font-mono tracking-wider text-gray-400">
            <a href="/" className="hover:text-gold-light transition-colors">Trang chủ</a>
            <span>/</span>
            <a href="/san-pham" className="hover:text-gold-light transition-colors">Sản phẩm</a>
            <span>/</span>
            <span className="text-gold-light line-clamp-1">{currentProduct.name}</span>
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-6">
              <div className="border border-gold-dark/25 bg-[#0A0A0A] p-5 shadow-[0_0_40px_rgba(216,154,43,0.08)]">
                <div className="relative aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
                  {currentProduct.tag && (
                    <span className="absolute left-4 top-4 z-10 bg-gold-dark px-3 py-1 text-[10px] font-display font-bold uppercase tracking-wider text-black">
                      {currentProduct.tag}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(216,154,43,0.13)_0%,transparent_65%)]" />
                  <img
                    src={activeImage}
                    alt={currentProduct.name}
                    className="relative z-10 max-h-[84%] max-w-[84%] object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.7)]"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {gallery.length > 1 && (
                  <div className="mt-4 grid grid-cols-4 gap-3">
                    {gallery.map((image) => (
                      <button
                        key={image}
                        type="button"
                        onClick={() => setActiveImage(image)}
                        className={`aspect-[4/3] border bg-black p-2 transition-colors ${
                          activeImage === image ? "border-gold-light" : "border-white/10 hover:border-gold-dark/50"
                        }`}
                        aria-label={`Xem ảnh ${currentProduct.name}`}
                      >
                        <img src={image} alt="" className="h-full w-full object-contain" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-[10px] font-display font-bold uppercase tracking-[0.22em] text-gold-light">
                <span>{currentProduct.brand}</span>
                <span className="text-gray-600">•</span>
                <span>{currentProduct.category}</span>
              </div>

              <h1 className="max-w-3xl text-2xl font-display font-black uppercase leading-tight text-white sm:text-3xl lg:text-4xl">
                {currentProduct.name}
              </h1>

              <div className="my-6 h-[2px] w-28 bg-gradient-to-r from-gold-dark to-transparent" />

              <p className="max-w-2xl text-sm leading-7 text-gray-300">
                {shortDescription}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["Điện áp", currentProduct.voltage],
                  ["Dung lượng", currentProduct.capacity],
                  ["Cell", currentProduct.cellType],
                  ["Bảo hành", currentProduct.warranty],
                ].map(([label, value]) => (
                  <div key={label} className="border border-white/10 bg-[#101010] px-4 py-3">
                    <div className="text-[9px] font-display font-bold uppercase tracking-wider text-gray-500">{label}</div>
                    <div className="mt-1 text-xs font-semibold text-[#ECECEC]">{value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="inline-flex h-12 items-center justify-center gap-2 bg-gradient-to-r from-[#D89A2B] to-[#F5C45A] px-6 text-[11px] font-display font-black uppercase tracking-widest text-black shadow-[0_0_25px_rgba(216,154,43,0.2)] transition-transform hover:scale-[1.01]"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Yêu cầu báo giá
                </button>
                <a
                  href="tel:19001234"
                  className="inline-flex h-12 items-center justify-center gap-2 border border-gold-dark/30 px-6 text-[11px] font-display font-bold uppercase tracking-widest text-gold-light transition-colors hover:border-gold-light hover:text-white"
                >
                  <Phone className="h-4 w-4" />
                  1900 1234
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 pt-12 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-8">
          {descriptionHtml && (
            <div className="mb-8 border border-white/10 bg-[#0C0C0C] p-6 lg:p-8">
              <div className="mb-6 flex items-center gap-2">
                <Zap className="h-5 w-5 text-gold-light" />
                <h2 className="font-display text-sm font-black uppercase tracking-widest text-white">
                  Mô tả chi tiết
                </h2>
              </div>
              <div
                className="product-description-content text-sm leading-7 text-gray-300"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            </div>
          )}

          <div className="border border-white/10 bg-[#0C0C0C] p-6 lg:p-8">
            <div className="mb-6 flex items-center gap-2">
              <Zap className="h-5 w-5 text-gold-light" />
              <h2 className="font-display text-sm font-black uppercase tracking-widest text-white">
                Thông số kỹ thuật
              </h2>
            </div>

            <div className="divide-y divide-white/10">
              {Object.entries(currentProduct.specs || {}).map(([key, value]) => (
                <div key={key} className="grid grid-cols-1 gap-1 py-4 sm:grid-cols-3 sm:gap-6">
                  <div className="text-[11px] font-display font-bold uppercase tracking-wider text-gray-500">{key}</div>
                  <div className="text-sm font-medium text-[#ECECEC] sm:col-span-2">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-5 lg:col-span-4">
          <div className="border border-gold-dark/25 bg-gold-dark/5 p-6">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-gold-light" />
              <h2 className="font-display text-sm font-black uppercase tracking-widest text-white">
                Cam kết Voltara
              </h2>
            </div>
            <ul className="space-y-3 text-xs leading-relaxed text-gray-300">
              {[
                "Tư vấn đúng cấu hình theo thiết bị và môi trường sử dụng.",
                "Kiểm tra dung lượng, điện áp và mạch bảo vệ trước khi bàn giao.",
                "Hỗ trợ đại lý, kỹ thuật và bảo hành chính hãng Voltara.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-light" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <a
            href="/san-pham"
            className="inline-flex w-full items-center justify-center gap-2 border border-white/10 px-5 py-4 text-[11px] font-display font-bold uppercase tracking-widest text-gray-300 transition-colors hover:border-gold-light hover:text-gold-light"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách sản phẩm
          </a>
        </aside>
      </section>

      {currentRelatedProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-display font-bold uppercase tracking-[0.22em] text-gold-light">
                Cùng danh mục
              </span>
              <h2 className="mt-2 font-display text-xl font-black uppercase text-white">
                Sản phẩm liên quan
              </h2>
            </div>
            <a href="/san-pham" className="hidden text-[11px] font-display font-bold uppercase tracking-widest text-gold-light hover:text-white sm:inline-flex">
              Xem tất cả
            </a>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {currentRelatedProducts.map((item) => (
              <a
                key={item.id}
                href={getProductHref(item.id)}
                className="group border border-white/10 bg-[#101010] p-4 transition-colors hover:border-gold-dark/50"
              >
                <div className="aspect-[4/3] bg-black p-3">
                  <img src={item.image} alt={item.name} className="h-full w-full object-contain transition-transform group-hover:scale-105" referrerPolicy="no-referrer" />
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-display font-bold uppercase tracking-wider text-gold-light">{item.brand}</div>
                    <h3 className="mt-1 line-clamp-2 text-xs font-display font-bold uppercase leading-relaxed text-white">{item.name}</h3>
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-gray-500 transition-transform group-hover:translate-x-1 group-hover:text-gold-light" />
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      <QuoteRequestModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        prepopulatedProduct={currentProduct.name}
      />
    </div>
  );
}

function formatProductDescriptionToHtml(desc: string | undefined): string {
  if (!desc) return "";

  let html = desc.trim();
  html = html.replace(/!\[(.*?)\]\s*\((.*?)\)/gs, '<img src="$2" alt="$1" class="my-5 max-h-[420px] w-full max-w-3xl object-contain border border-white/10 bg-black p-3" referrerPolicy="no-referrer" />');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/^### (.*?)$/gm, '<h3 class="mt-6 mb-2 font-display text-sm font-black uppercase tracking-widest text-gold-light">$1</h3>');
  html = html.replace(/^-[ ]+(.*?)$/gm, '<li class="ml-5 list-disc text-gray-300">$1</li>');
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-gold-light underline hover:text-white" target="_blank" rel="noopener noreferrer">$1</a>');
  html = html.replace(/\n/g, "<br />");

  return html;
}

function getShortDescription(desc: string | undefined): string {
  if (!desc) return "";

  return desc
    .replace(/!\[(.*?)\]\s*\((.*?)\)/gs, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^### /gm, "")
    .trim()
    .split("\n")
    .filter(Boolean)[0] || "";
}
