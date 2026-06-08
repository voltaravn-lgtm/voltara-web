/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { VoltaraLogo } from "./Header";
import { Mail, Phone, MapPin, Send, Facebook, Youtube, MessageCircle, AlertTriangle } from "lucide-react";
import { useApp } from "../context/AppContext";

export const VietnamMapSVG: React.FC<{ className?: string }> = ({ className = "w-full max-w-[240px]" }) => {
  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <img
        src="/images/ban-do-viet-nam.webp"
        alt="Bản đồ Việt Nam"
        referrerPolicy="no-referrer"
        className="w-full h-auto object-contain mix-blend-screen"
      />
    </div>
  );
};

export default function Footer() {
  const { addNewsletterSubscriber, showToast } = useApp();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) return;

    setStatus("loading");
    try {
      await addNewsletterSubscriber(normalizedEmail);
      setStatus("success");
      setEmail("");
      showToast("Đã đăng ký nhận tin thành công.", "success");
    } catch (error) {
      console.error("Could not subscribe newsletter email:", error);
      setStatus("error");
      showToast("Chưa lưu được email nhận tin. Vui lòng thử lại.", "error");
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer id="main-footer" className="bg-[#050505] border-t border-gold-dark/15 pt-16 pb-24 md:pb-8 relative z-10 overflow-hidden">
      {/* Background faint geometric circles as in Voltara style */}
      <div className="absolute [-100px]:top-0 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-[#F5C45A] opacity-[0.015] blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 mb-12">
          
          {/* Column 1: Brand Intro */}
          <div className="lg:col-span-4 flex flex-col gap-6" id="footer-col-intro">
            <VoltaraLogo />
            <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
              Voltara cam kết mang đến những giải pháp pin Lithium và nguồn điện thông minh, giúp nâng cao hiệu suất và chất lượng cuộc sống. Hướng tới thương hiệu toàn cầu đi đầu năng lượng xanh vững bền.
            </p>
            
            {/* Social Network Icons with Gold Border */}
            <div className="flex items-center gap-3 mt-2">
              <a
                href="#facebook"
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-gold-light hover:border-gold-light/60 hover:-translate-y-1 transition-all duration-300 shadow-sm"
                title="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#youtube"
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-gold-light hover:border-gold-light/60 hover:-translate-y-1 transition-all duration-300 shadow-sm"
                title="Youtube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="#zalo"
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-gold-light hover:border-gold-light/60 hover:-translate-y-1 transition-all duration-300 shadow-sm"
                title="Zalo"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="#tiktok"
                className="text-gray-400 hover:text-gold-light transition-all text-xs font-display font-medium border border-white/10 px-2.5 h-8 flex items-center rounded-full hover:border-gold-light/60"
                title="Tiktok"
              >
                TIKTOK
              </a>
            </div>

            {/* Newsletter form directly built here as instructed in image layout */}
            <div className="mt-4">
              <h4 className="text-xs font-display font-semibold uppercase tracking-wider text-gold-light mb-2">Đăng Ký Nhận Tin</h4>
              <p className="text-[11px] text-gray-500 mb-2">Nhận thông tin sản phẩm mới, ưu đãi và công nghệ hữu ích từ Voltara.</p>
              <form onSubmit={handleSubscribe} className="flex h-10 w-full max-w-sm border border-white/10 bg-[#0F0F0F] rounded-md overflow-hidden focus-within:border-gold-dark/60 transition-colors">
                <input
                  type="email"
                  placeholder="Nhập email của bạn..."
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent px-3 text-xs text-white placeholder-gray-600 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="bg-gold-dark text-black px-4 flex items-center justify-center font-semibold hover:bg-gold-light transition-all"
                >
                  {status === "loading" ? "..." : <Send className="w-3.5 h-3.5" />}
                </button>
              </form>
              {status === "success" && (
                <p className="text-[11px] text-emerald-400 mt-1">Đăng ký email thành công! Xin cảm ơn.</p>
              )}
            </div>
          </div>

          {/* Column 2: Quick Links (Về Voltara) */}
          <div className="lg:col-span-2 flex flex-col gap-4" id="footer-col-about">
            <h4 className="text-[11px] font-display font-semibold uppercase tracking-widest text-[#ECECEC] border-l-2 border-gold-dark pl-2.5">
              Về Voltara
            </h4>
            <div className="flex flex-col gap-2.5 text-xs text-gray-400">
              <Link to="/gioi-thieu" className="hover:text-gold-light transition-colors">Giới thiệu công ty</Link>
              <Link to="/gioi-thieu" className="hover:text-gold-light transition-colors">Tầm nhìn - Sứ mệnh</Link>
              <Link to="/gioi-thieu" className="hover:text-gold-light transition-colors">Giá trị cốt lõi</Link>
              <Link to="/gioi-thieu" className="hover:text-gold-light transition-colors">Nhà máy sản xuất</Link>
              <Link to="/kien-thuc" className="hover:text-gold-light transition-colors">Tin tức nội bộ</Link>
            </div>
          </div>

          {/* Column 3: Products Categories */}
          <div className="lg:col-span-2 flex flex-col gap-4" id="footer-col-products">
            <h4 className="text-[11px] font-display font-semibold uppercase tracking-widest text-[#ECECEC] border-l-2 border-gold-dark pl-2.5">
              Sản phẩm
            </h4>
            <div className="flex flex-col gap-2.5 text-xs text-gray-400">
              <Link to="/san-pham" className="hover:text-gold-light transition-colors">Pin máy công cụ</Link>
              <Link to="/san-pham" className="hover:text-gold-light transition-colors">UPS cửa cuốn</Link>
              <Link to="/san-pham" className="hover:text-gold-light transition-colors">Pin xe điện</Link>
              <Link to="/san-pham" className="hover:text-gold-light transition-colors">Ắc quy Lithium</Link>
              <Link to="/san-pham" className="hover:text-gold-light transition-colors">Ắc quy chì axit</Link>
              <Link to="/san-pham" className="hover:text-gold-light transition-colors">Khối pin OEM/ODM</Link>
            </div>
          </div>

          {/* Column 4: Links (Hỗ trợ & CS) */}
          <div className="lg:col-span-2 flex flex-col gap-4" id="footer-col-support">
            <h4 className="text-[11px] font-display font-semibold uppercase tracking-widest text-[#ECECEC] border-l-2 border-gold-dark pl-2.5">
              Hỗ trợ khách hàng
            </h4>
            <div className="flex flex-col gap-2.5 text-xs text-gray-400">
              <Link to="/bao-hanh" className="hover:text-gold-light transition-colors">Tra cứu bảo hành</Link>
              <Link to="/bao-hanh" className="hover:text-gold-light transition-colors">Chính sách bảo hành</Link>
              <Link to="/kien-thuc" className="hover:text-gold-light transition-colors">Hướng dẫn sử dụng</Link>
              <Link to="/hoc-vien" className="hover:text-gold-light transition-colors">Học viện Voltara</Link>
              <Link to="/lien-he" className="hover:text-gold-light transition-colors">Liên hệ hỗ trợ 24/7</Link>
            </div>
          </div>

          {/* Column 5: Map of Vietnam */}
          <div className="lg:col-span-2 flex flex-col items-center lg:items-end justify-center" id="footer-col-map">
            <VietnamMapSVG />
          </div>

        </div>

        {/* Divider line in Voltara golden tone */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-gold-dark/20 to-transparent my-8" />

        {/* Contact Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-400 mb-8 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-gold-dark shrink-0" />
            <span>123 Đường Năng Lượng, KCN Hòa Phú, H. Long Hồ, Vĩnh Long</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-gold-dark shrink-0" />
            <span>Hotline hỗ trợ: <strong className="text-[#ECECEC]">1900 1234</strong> (8h00 - 17h30)</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-gold-dark shrink-0" />
            <span>Gửi thư: <strong className="text-[#ECECEC]">info@voltara.vn</strong></span>
          </div>
        </div>

        {/* Brand Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-4">
          <span>&copy; {currentYear} VOLTARA. Tất cả quyền được bảo lưu.</span>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-gold-light">Chính sách bảo mật</a>
            <a href="#terms" className="hover:text-gold-light">Điều khoản sử dụng</a>
            <span className="flex items-center gap-1 text-[10px] text-yellow-600">
              <AlertTriangle className="w-3 h-3 text-yellow-600" /> Hoàng Sa - Trường Sa là của Việt Nam
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
