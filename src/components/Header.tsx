/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Menu, X, Search, ShoppingCart, Sun, Moon } from "lucide-react";
import { useApp } from "../context/AppContext";
import CartDrawer from "./CartDrawer";
import { getProductHref } from "../lib/productRoutes";

function getCategoryHref(categoryId: string, subCategoryId?: string) {
  const query = subCategoryId ? `?sub=${encodeURIComponent(subCategoryId)}` : "";
  return `/san-pham/danh-muc/${encodeURIComponent(categoryId)}${query}`;
}

export const VoltaraLogo: React.FC<{ className?: string; iconOnly?: boolean }> = ({ className = "h-8", iconOnly = false }) => {
  const [useImgFallback, setUseImgFallback] = useState(false);

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {!useImgFallback ? (
        <img
          src="/images/logo-voltara.webp"
          alt="Voltara Logo"
          className="h-10 lg:h-12 w-auto object-contain"
          referrerPolicy="no-referrer"
          onError={() => {
            setUseImgFallback(true);
          }}
        />
      ) : (
        <>
          {/* Golden futuristic shield with lightning bolt inside */}
          <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 100 100" className="w-8.5 h-8.5 filter drop-shadow-[0_0_8px_rgba(218,154,43,0.6)]" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Hexagonal glowing border */}
              <polygon points="50,5 90,28 90,72 50,95 10,72 10,28" stroke="url(#goldGradient)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="#0A0A0A" />
              {/* Inner futuristic V with lightning bolt */}
              <path d="M28,30 L45,70 L52,70 L60,45" stroke="#ECECEC" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M42,25 L65,25 L50,55 L70,55 L38,82 L47,50 L32,50 Z" fill="url(#lightningGradient)" />
              
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F5C45A" />
                  <stop offset="100%" stopColor="#D89A2B" />
                </linearGradient>
                <linearGradient id="lightningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFE082" />
                  <stop offset="100%" stopColor="#F5C45A" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          {!iconOnly && (
            <div className="flex flex-col tracking-wider shrink-0">
              <span className="font-display font-black text-lg xl:text-xl italic text-white tracking-[0.12em] leading-none mb-0.5 glow-text">
                VOLTARA
              </span>
              <span className="text-[7px] font-display text-gold-dark font-medium tracking-[0.28em] uppercase leading-none pl-0.5">
                KÍCH HOẠT TƯƠNG LAI
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDayMode, setIsDayMode] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const savedMode = localStorage.getItem("voltara_display_mode");
    const nextIsDayMode = savedMode === "day";
    setIsDayMode(nextIsDayMode);
    document.body.classList.toggle("day-mode", nextIsDayMode);
  }, []);

  const toggleDisplayMode = () => {
    const nextIsDayMode = !isDayMode;
    setIsDayMode(nextIsDayMode);
    document.body.classList.toggle("day-mode", nextIsDayMode);
    localStorage.setItem("voltara_display_mode", nextIsDayMode ? "day" : "night");
  };

  const { menuItems, productCategories, products, articles, openCart, cartCount } = useApp();
  const isDealerOrderPage = location.pathname === "/dai-ly/dat-hang";
  const handleCartClick = () => {
    if (isDealerOrderPage) {
      if (window.matchMedia("(max-width: 1023px)").matches) {
        window.dispatchEvent(new CustomEvent("voltara:open-dealer-cart"));
        return;
      }
      document.getElementById("dealer-order-cart")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    openCart();
  };
  const visibleMenuItems = menuItems.filter((item) => !item.hidden);
  const visibleProductCategories = productCategories.filter((category) => !category.hidden);
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const searchResults = normalizedSearch
    ? [
        ...products
          .filter(product =>
            !product.hidden &&
            (product.name.toLowerCase().includes(normalizedSearch) ||
              product.description.toLowerCase().includes(normalizedSearch) ||
              product.category.toLowerCase().includes(normalizedSearch))
          )
          .slice(0, 5)
          .map(product => ({
            type: "Sản phẩm",
            title: product.name,
            subtitle: product.category,
            href: getProductHref(product),
          })),
        ...articles
          .filter(article =>
            article.title.toLowerCase().includes(normalizedSearch) ||
            article.brief.toLowerCase().includes(normalizedSearch) ||
            article.category.toLowerCase().includes(normalizedSearch)
          )
          .slice(0, 4)
          .map(article => ({
            type: "Kiến thức",
            title: article.title,
            subtitle: article.category,
            href: `/kien-thuc?postId=${encodeURIComponent(article.id)}`,
          })),
      ].slice(0, 8)
    : [];

  return (
    <>
      <header
        id="main-header"
        className={`sticky top-0 w-full z-50 transition-all duration-300 border-b ${
          isScrolled
            ? "bg-[#050505]/95 backdrop-blur-md py-3 shadow-lg border-gold-dark/15"
            : "bg-[#050505] py-4.5 border-white/5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between flex-nowrap lg:gap-2 xl:gap-4">
          <Link to="/" id="logo-link" className="shrink-0">
            <VoltaraLogo />
          </Link>

          {/* Desktop Navigation Menu */}
          <nav id="desktop-nav" className="hidden lg:flex items-center gap-0.5 xl:gap-2 whitespace-nowrap">
            {visibleMenuItems.map((item) => {
              const isActive =
                item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path);

              return (
                <div key={item.path} className="group/nav relative shrink-0">
                  <Link
                    id={`nav-item-${item.path}`}
                    to={item.path}
                    className={`relative block px-1.5 xl:px-3 py-2 text-[10.5px] xl:text-xs font-display font-semibold uppercase tracking-wide xl:tracking-wider transition-colors duration-200 ${
                      isActive ? "text-gold-light font-bold" : "text-gray-300 hover:text-white"
                    }`}
                  >
                    {item.name}
                    {isActive && (
                      <span
                        id={`nav-active-line-${item.name}`}
                        className="absolute bottom-[-14px] left-0 w-full h-[2px] bg-gradient-to-r from-gold-dark to-gold-light shadow-[0_2px_10px_rgba(245,196,90,0.8)]"
                      />
                    )}
                  </Link>

                  {item.path === "/san-pham" && visibleProductCategories.length > 0 && (
                    <div className="invisible absolute left-0 top-full z-50 min-w-[260px] translate-y-3 border border-gold-dark/25 bg-[#070707]/98 p-2 opacity-0 shadow-2xl shadow-black/50 backdrop-blur-md transition-all duration-200 group-hover/nav:visible group-hover/nav:translate-y-0 group-hover/nav:opacity-100">
                      {visibleProductCategories.map((category) => {
                        const children = (category.children || []).filter((child) => !child.hidden);
                        const categoryHref = getCategoryHref(category.id);
                        return (
                          <div key={category.id} className="group/category relative">
                            <Link
                              to={categoryHref}
                              className="flex items-center justify-between gap-3 px-3 py-2.5 text-[11px] font-display font-bold uppercase tracking-wider text-gray-300 transition-colors hover:bg-gold-dark/10 hover:text-gold-light"
                            >
                              <span>{category.name}</span>
                              {children.length > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-500" />}
                            </Link>
                            {children.length > 0 && (
                              <div className="invisible absolute left-full top-0 min-w-[240px] border border-gold-dark/25 bg-[#070707]/98 p-2 opacity-0 shadow-2xl shadow-black/50 transition-all group-hover/category:visible group-hover/category:opacity-100">
                                {children.map((child) => (
                                  <Link
                                    key={child.id}
                                    to={getCategoryHref(category.id, child.id)}
                                    className="block px-3 py-2.5 text-[11px] font-display font-bold uppercase tracking-wider text-gray-400 transition-colors hover:bg-gold-dark/10 hover:text-gold-light"
                                  >
                                    {child.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right Action buttons */}
          <div id="header-actions" className="hidden lg:flex items-center gap-1.5 xl:gap-4 shrink-0">
            <button
              id="search-header-btn"
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 text-gray-400 hover:text-gold-light transition-colors"
              title="Tìm kiếm"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              id="theme-toggle-btn"
              onClick={toggleDisplayMode}
              className="p-1.5 text-gray-400 hover:text-gold-light transition-colors"
              title={isDayMode ? "Chế độ ban đêm" : "Chế độ ban ngày"}
            >
              {isDayMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            
            <button
              id="cart-header-btn"
              onClick={handleCartClick}
              className="relative p-1.5 text-gray-400 hover:text-gold-light transition-colors"
              title="Sản phẩm"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full bg-gold-dark px-1 text-center text-[9px] font-bold leading-4 text-black shadow-[0_0_5px_#F5C45A]">
                  {cartCount}
                </span>
              )}
            </button>

            <Link
              id="header-cta-btn"
              to="/dai-ly"
              className="gold-border bg-transparent text-[10px] xl:text-xs font-display font-semibold tracking-wider xl:tracking-widest text-[#ECECEC] px-3.5 xl:px-6 py-2 rounded-md hover:bg-gold-dark hover:text-black transition-all duration-300 uppercase shadow-[0_0_15px_rgba(216,154,43,0.1)] hover:shadow-[0_0_20px_rgba(216,154,43,0.4)] shrink-0"
            >
              Tìm Đại Lý
            </Link>
          </div>

          {/* Mobile Header Actions */}
          <div id="mobile-menu-trigger" className="flex lg:hidden items-center gap-1 sm:gap-2">
            <button
              id="search-mobile-btn"
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsSearchOpen(true);
              }}
              className="rounded-full border border-gold-dark/50 bg-gold-dark/10 p-2 text-gold-light shadow-[0_0_12px_rgba(216,154,43,0.12)] transition-colors hover:bg-gold-dark/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
              title="Tìm kiếm sản phẩm"
              aria-label="Tìm kiếm sản phẩm"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              id="cart-mobile-btn"
              type="button"
              onClick={handleCartClick}
              className="relative p-2 text-gray-400 hover:text-gold-light transition-colors"
              aria-label="Mở giỏ hàng"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 min-w-4 h-4 rounded-full bg-gold-dark px-1 text-center text-[9px] font-bold leading-4 text-black">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              id="mobile-nav-toggle"
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-white focus:outline-none"
              aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-drawer"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation Menu */}
      <div
        id="mobile-drawer"
        className={`fixed inset-y-0 right-0 max-w-full w-80 bg-[#0A0A0A]/95 backdrop-blur-lg border-l border-gold-dark/15 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-white/5">
              <VoltaraLogo />
              <button
                id="close-mobile-drawer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mt-8 flex flex-col gap-4">
              {visibleMenuItems.map((item) => {
                const isActive =
                  item.path === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.path}
                    id={`mobile-nav-item-${item.path}`}
                    to={item.path}
                    className={`block py-2 text-sm font-display font-medium uppercase tracking-wider border-b border-white/5 pb-2 transition-colors duration-200 ${
                      isActive ? "text-gold-light font-bold" : "text-gray-300 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{item.name}</span>
                      {isActive && <div className="w-1.5 h-1.5 bg-gold-light rounded-full" />}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col gap-3">
            <Link
              id="mobile-drawer-cta"
              to="/dai-ly"
              className="w-full text-center bg-gradient-to-r from-gold-dark to-gold-light text-black font-display font-semibold py-3 text-xs tracking-widest uppercase hover:opacity-90 active:scale-95 transition-all"
            >
              Tìm Đại Lý Hệ Thống
            </Link>
            
            <Link
              id="mobile-drawer-contact"
              to="/lien-he"
              className="w-full text-center border border-white/10 hover:border-white/20 text-gray-400 py-3 text-xs tracking-widest uppercase hover:text-white transition-all"
            >
              Liên Hệ Trợ Giúp
            </Link>
          </div>
        </div>
      </div>

      {/* Background Dim Backdrop for Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
        />
      )}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[75] bg-black/85 backdrop-blur-sm p-4" onClick={() => setIsSearchOpen(false)}>
          <div className="mx-auto mt-24 w-full max-w-2xl border border-gold-dark/30 bg-[#0A0A0A] p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center gap-3 border border-white/10 bg-black px-4 py-3">
              <Search className="h-5 w-5 text-gold-light" />
              <input
                autoFocus
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tìm sản phẩm, bài viết..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
              />
              <button type="button" onClick={() => setIsSearchOpen(false)} className="p-1 text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 max-h-[55vh] overflow-y-auto">
              {!normalizedSearch ? (
                <p className="px-2 py-8 text-center text-xs font-display font-bold uppercase tracking-widest text-gray-600">Nhập từ khóa để tìm kiếm</p>
              ) : searchResults.length === 0 ? (
                <p className="px-2 py-8 text-center text-xs font-display font-bold uppercase tracking-widest text-gray-600">Không tìm thấy kết quả</p>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((result) => (
                    <Link
                      key={`${result.type}-${result.href}`}
                      to={result.href}
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="block border border-white/10 bg-[#111] px-4 py-3 hover:border-gold-dark/50 hover:bg-[#151515]"
                    >
                      <div className="text-[9px] font-display font-bold uppercase tracking-widest text-gold-light">{result.type}</div>
                      <div className="mt-1 line-clamp-1 text-xs font-display font-bold uppercase text-white">{result.title}</div>
                      <div className="mt-1 text-[10px] text-gray-500">{result.subtitle}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <CartDrawer />
    </>
  );
}
