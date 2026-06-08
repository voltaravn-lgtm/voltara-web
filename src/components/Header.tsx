/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, MapPin, User, LogIn, Search, ShoppingCart } from "lucide-react";
import { useApp } from "../context/AppContext";

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
  const location = useLocation();
  const navigate = useNavigate();

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

  const { menuItems } = useApp();

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
            {menuItems.map((item) => {
              const isActive =
                item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  id={`nav-item-${item.path}`}
                  to={item.path}
                  className={`relative px-1.5 xl:px-3 py-2 text-[10.5px] xl:text-xs font-display font-semibold uppercase tracking-wide xl:tracking-wider transition-colors duration-200 shrink-0 ${
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
              );
            })}
          </nav>

          {/* Right Action buttons */}
          <div id="header-actions" className="hidden lg:flex items-center gap-1.5 xl:gap-4 shrink-0">
            <button
              id="search-header-btn"
              onClick={() => navigate("/kien-thuc")}
              className="p-1.5 text-gray-400 hover:text-gold-light transition-colors"
              title="Tìm kiếm"
            >
              <Search className="w-4 h-4" />
            </button>
            
            <button
              id="cart-header-btn"
              onClick={() => navigate("/san-pham")}
              className="relative p-1.5 text-gray-400 hover:text-gold-light transition-colors"
              title="Sản phẩm"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="absolute top-1 right-0.5 w-1.5 h-1.5 bg-gold-dark rounded-full shadow-[0_0_5px_#F5C45A]" />
            </button>

            <Link
              id="header-cta-btn"
              to="/dai-ly"
              className="gold-border bg-transparent text-[10px] xl:text-xs font-display font-semibold tracking-wider xl:tracking-widest text-[#ECECEC] px-3.5 xl:px-6 py-2 rounded-md hover:bg-gold-dark hover:text-black transition-all duration-300 uppercase shadow-[0_0_15px_rgba(216,154,43,0.1)] hover:shadow-[0_0_20px_rgba(216,154,43,0.4)] shrink-0"
            >
              Tìm Đại Lý
            </Link>
          </div>

          {/* Mobile Menu Icon */}
          <div id="mobile-menu-trigger" className="flex lg:hidden items-center gap-3">
            <button
              id="cart-mobile-btn"
              onClick={() => navigate("/san-pham")}
              className="p-2 text-gray-400 hover:text-gold-light transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
            <button
              id="mobile-nav-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-white focus:outline-none"
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
              {menuItems.map((item) => {
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
    </>
  );
}
