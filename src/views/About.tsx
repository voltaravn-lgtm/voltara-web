/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Zap, Award, Globe, Users, ChevronRight, Activity, Cpu, Factory, Trophy, Handshake, MapPin, Package } from "lucide-react";
import { SectionTitle } from "../components/Cards";
import { useApp } from "../context/AppContext";

export default function About() {
  const { aboutContent, showToast } = useApp();
  return (
    <div id="about-page" className="relative">
      
      {/* 1. HERO - BRAND IDENTITY BLOCK (MATCHING PHOTO 2 TOP) */}
      <section className="relative min-h-[55vh] lg:min-h-[65vh] flex items-center overflow-hidden bg-black pt-16 lg:pt-24 pb-16 lg:pb-24">
        {/* Full-screen Background Banner Image */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img 
            src={aboutContent.section1BannerImage || "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=1600"} 
            alt="Voltara About Banner Background" 
            className="w-full h-full object-cover object-center transform scale-100 opacity-90"
            referrerPolicy="no-referrer"
          />
          {/* Overlay to ensure maximum text readability and aesthetic integration */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 lg:from-black/95 lg:via-black/75 lg:to-transparent/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          
          <div className="flex items-center gap-2 mb-2 text-xs font-mono tracking-wider text-gray-500">
            <Link to="/" className="hover:text-gold-light">Trang chủ</Link>
            <span>/</span>
            <span className="text-gold-dark">Giới thiệu</span>
          </div>

          <div className="max-w-3xl flex flex-col items-start text-left mt-6">
            <span className="text-xs font-display font-semibold tracking-[0.25em] text-gold-light uppercase mb-2">
              {aboutContent.section1Subtitle || "VỀ VOLTARA"}
            </span>
            <h1 className="text-4xl sm:text-5xl font-display font-black leading-tight text-white uppercase mb-6 glow-text">
              {aboutContent.section1Title || "KÍCH HOẠT TƯƠNG LAI"}
            </h1>
            
            <div className="h-[2px] bg-gradient-to-r from-gold-dark to-transparent w-28 mb-6" />

            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed mb-8 max-w-2xl backdrop-blur-[1px]">
              {aboutContent.section1Desc || "Voltara là thương hiệu tiên phong trong lĩnh vực nghiên cứu, chế tạo, liên kết sản xuất và cung cấp các dòng sản phẩm bộ pin Lithium sạc và nguồn điện lưu trữ thông minh tại Việt Nam. Hướng tới trở thành giải pháp năng lượng xanh vững mạnh toàn diện hỗ trợ cho sinh hoạt, di chuyển tuần hoàn bền vững của thế giới tương lai."}
            </p>

            <button
              onClick={() => {
                const element = document.getElementById("voltara-factory-section");
                element?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 border border-[#D89A2B]/40 hover:border-gold-light text-[#ECECEC] font-display font-semibold px-5 py-3 text-xs tracking-widest uppercase hover:bg-gold-dark hover:text-black transition-all"
            >
              <span>TÌM HIỂU HÀNH TRÌNH VOLTARA</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. VISION, MISSION, VALUES BLOCK (MATCHING MOCKUP PHOTO EXACTLY WITH FULL BACKGROUND EARTH GLOBE) */}
      <section 
        className="py-24 bg-black border-t border-white/5 relative overflow-hidden bg-cover bg-center bg-no-repeat min-h-[600px] flex items-center"
        style={{ backgroundImage: "url('/images/trai-dat.webp')" }}
      >
        {/* Soft elegant background glows / vignettes */}
        <div className="absolute inset-0 bg-black/40 mix-blend-multiply pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent pointer-events-none lg:block hidden" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent pointer-events-none lg:block hidden" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 xl:gap-12 items-start">
            
            {/* LEFT COLUMN: TẦM NHÌN */}
            <div className="lg:col-span-5 space-y-10">
              <div className="relative">
                <h3 className="text-xl md:text-2xl font-display font-semibold tracking-widest text-[#ECECEC] uppercase relative pb-3.5 select-none">
                  TẦM NHÌN
                  <div className="absolute bottom-0 left-0 w-16 h-[2px] bg-gradient-to-r from-gold-light to-gold-dark" />
                </h3>
              </div>

              <div className="space-y-10">
                {/* 2030 item */}
                <div className="flex items-start gap-5 group">
                  <div className="h-16 w-16 rounded-full border border-gold-dark/20 flex items-center justify-center shrink-0 relative p-1 bg-black/60 backdrop-blur-sm group-hover:border-gold-light group-hover:shadow-[0_0_15px_rgba(245,196,90,0.25)] transition-all duration-300">
                    <div className="h-full w-full rounded-full border border-gold-dark/40 flex items-center justify-center bg-gradient-to-br from-black to-neutral-900">
                      <Globe className="w-5 h-5 text-gold-light group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-[#F5C45A] font-display font-bold text-lg leading-none tracking-wide mb-1.5">
                      {aboutContent.strategic1Year || "2030"}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-light">
                      {aboutContent.strategic1Desc || "Đưa sản phẩm pin máy công cụ, phụ tùng lithium Voltara phủ khắp 63 tỉnh thành Việt Nam. Thay thế hoàn toàn 80% ắc quy chì axit cũ rách."}
                    </p>
                  </div>
                </div>

                {/* 2035 item */}
                <div className="flex items-start gap-5 group">
                  <div className="h-16 w-16 rounded-full border border-gold-dark/20 flex items-center justify-center shrink-0 relative p-1 bg-black/60 backdrop-blur-sm group-hover:border-gold-light group-hover:shadow-[0_0_15px_rgba(245,196,90,0.25)] transition-all duration-300">
                    <div className="h-full w-full rounded-full border border-gold-dark/40 flex items-center justify-center bg-gradient-to-br from-black to-neutral-900">
                      <MapPin className="w-5 h-5 text-gold-light group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-[#F5C45A] font-display font-bold text-lg leading-none tracking-wide mb-1.5">
                      {aboutContent.strategic2Year || "2035"}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-light">
                      {aboutContent.strategic2Desc || "Xây dựng mạng lưới bán hàng ổn định xuất khẩu sang các thị trường Thái Lan, Indonesia, Malaysia, Campuchia đạt chứng nhận chất lượng FCC/CE."}
                    </p>
                  </div>
                </div>

                {/* 2040 item */}
                <div className="flex items-start gap-5 group">
                  <div className="h-16 w-16 rounded-full border border-gold-dark/20 flex items-center justify-center shrink-0 relative p-1 bg-black/60 backdrop-blur-sm group-hover:border-gold-light group-hover:shadow-[0_0_15px_rgba(245,196,90,0.25)] transition-all duration-300">
                    <div className="h-full w-full rounded-full border border-gold-dark/40 flex items-center justify-center bg-gradient-to-br from-black to-neutral-900">
                      <Trophy className="w-5 h-5 text-gold-light group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-[#F5C45A] font-display font-bold text-lg leading-none tracking-wide mb-1.5">
                      {aboutContent.strategic3Year || "2040"}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-light">
                      {aboutContent.strategic3Desc || "Tham gia phát triển trạm trữ điện trung tâm ESS dòng sạc siêu thọ cùng các đối tác hạ tầng ô-tô sạc ô nhiễm thấp tại các quốc gia Tây Âu và Liên Kỳ."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* MIDDLE SPACING: empty column segment so the beautiful background planet and slash line are completely visible */}
            <div className="hidden lg:block lg:col-span-2 h-10" />

            {/* RIGHT COLUMN: SỨ MỆNH & GIÁ TRỊ CỐT LÕI */}
            <div className="lg:col-span-12 xl:col-span-5 lg:col-start-8 xl:col-start-8 space-y-12 text-left">
              {/* Sứ Mệnh */}
              <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-display font-semibold tracking-widest text-[#ECECEC] uppercase relative pb-3.5 select-none font-medium">
                  SỨ MỆNH
                  <div className="absolute bottom-0 left-0 w-16 h-[2px] bg-gradient-to-r from-gold-light to-gold-dark" />
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-light">
                  {aboutContent.missionDesc || "Cung cấp những giải pháp tích trữ năng lượng Lithium thế hệ mới, tối đa tính hữu dụng thực chiến trong dụng cụ cầm tay, đảm bảo an toàn tuyệt đối, dập tắt rủi ro sinh khí bốc cháy chập mạch, kiến tạo một cộng đồng sống lành mạnh."}
                </p>
              </div>

              {/* Giá Trị Cốt Lõi */}
              <div className="space-y-6">
                <h3 className="text-xl md:text-2xl font-display font-semibold tracking-widest text-[#ECECEC] uppercase relative pb-3.5 select-none font-medium">
                  GIÁ TRỊ CỐT LÕI
                  <div className="absolute bottom-0 left-0 w-16 h-[2px] bg-gradient-to-r from-gold-light to-gold-dark" />
                </h3>

                {/* 4 elements side by side in right column on large screen - or 2x2 grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 pt-2">
                  {/* Item 1 */}
                  <div className="flex flex-col items-center text-center p-3.5 rounded-xl border border-white/[0.04] bg-black/60 backdrop-blur-sm hover:bg-black/80 hover:border-gold-light/25 transition-all duration-300">
                    <div className="h-10 w-10 rounded-xl border border-gold-dark/20 flex items-center justify-center bg-black/80 mb-2.5 shrink-0">
                      <ShieldCheck className="w-5 h-5 text-gold-light" />
                    </div>
                    <h4 className="text-[11px] sm:text-xs font-display font-bold text-[#ECECEC] uppercase tracking-wider mb-1">
                      {aboutContent.coreValue1Title || "CHẤT LƯỢNG"}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-light leading-snug">
                      {aboutContent.coreValue1Desc || "Đặt độ an toàn của người dùng lên hàng đầu."}
                    </p>
                  </div>

                  {/* Item 2 */}
                  <div className="flex flex-col items-center text-center p-3.5 rounded-xl border border-white/[0.04] bg-black/60 backdrop-blur-sm hover:bg-black/80 hover:border-gold-light/25 transition-all duration-300">
                    <div className="h-10 w-10 rounded-xl border border-gold-dark/20 flex items-center justify-center bg-black/80 mb-2.5 shrink-0">
                      <Zap className="w-5 h-5 text-gold-light" />
                    </div>
                    <h4 className="text-[11px] sm:text-xs font-display font-bold text-[#ECECEC] uppercase tracking-wider mb-1">
                      {aboutContent.coreValue2Title || "ĐỔI MỚI"}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-light leading-snug">
                      {aboutContent.coreValue2Desc || "Cập nhập BMS thế hệ mới bảo mật rò dỉ điện môi."}
                    </p>
                  </div>

                  {/* Item 3 */}
                  <div className="flex flex-col items-center text-center p-3.5 rounded-xl border border-white/[0.04] bg-black/60 backdrop-blur-sm hover:bg-black/80 hover:border-gold-light/25 transition-all duration-300">
                    <div className="h-10 w-10 rounded-xl border border-gold-dark/20 flex items-center justify-center bg-black/80 mb-2.5 shrink-0">
                      <Handshake className="w-5 h-5 text-gold-light" />
                    </div>
                    <h4 className="text-[11px] sm:text-xs font-display font-bold text-[#ECECEC] uppercase tracking-wider mb-1">
                      {aboutContent.coreValue3Title || "HỢP TÁC"}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-light leading-snug">
                      {aboutContent.coreValue3Desc || "Đồng hành trọn vẹn thịnh vượng cùng đại lý ủy quyền."}
                    </p>
                  </div>

                  {/* Item 4 */}
                  <div className="flex flex-col items-center text-center p-3.5 rounded-xl border border-white/[0.04] bg-black/60 backdrop-blur-sm hover:bg-black/80 hover:border-gold-light/25 transition-all duration-300">
                    <div className="h-10 w-10 rounded-xl border border-gold-dark/20 flex items-center justify-center bg-black/80 mb-2.5 shrink-0">
                      <Users className="w-5 h-5 text-gold-light" />
                    </div>
                    <h4 className="text-[11px] sm:text-xs font-display font-bold text-[#ECECEC] uppercase tracking-wider mb-1">
                      {aboutContent.coreValue4Title || "TRÁCH NHIỆM"}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-light leading-snug">
                      {aboutContent.coreValue4Desc || "An tâm bảo hiểm rủi ro tài sản cao cấp chính hãng."}
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Golden Stats Strip Underneath block - Rebuilt for high-fidelity dark luxury match */}
          <div className="mt-20 border border-gold-dark/20 rounded-2xl bg-gradient-to-br from-[#0c0c0c] via-[#080808] to-[#050505] p-6 lg:p-8 shadow-[0_15px_35px_rgba(0,0,0,0.9),_inset_0_1px_1px_rgba(255,255,255,0.03),_0_0_20px_rgba(216,154,43,0.03)] hover:border-gold-light/25 transition-all duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 divide-y sm:divide-y-0 lg:divide-x divide-white/[0.04] lg:divide-gold-dark/10">
              
              {/* Stat 1 */}
              <div className="flex items-center gap-4 px-2 md:px-6 py-3 sm:py-0">
                <div className="shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-b from-[#161616] to-[#0d0d0d] border border-gold-dark/10 hover:border-gold-light/25 shadow-inner transition-colors duration-300">
                  <Users className="w-6 h-6 text-gold-light opacity-95 filter drop-shadow-[0_0_6px_rgba(216,154,43,0.3)]" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl md:text-3xl font-display font-black text-gold-light leading-none">
                      {aboutContent.stat1Num || "50+"}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 uppercase font-display font-bold tracking-wider leading-tight mt-1.5">
                    {aboutContent.stat1Label || "Đại lý toàn quốc"}
                  </div>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="flex items-center gap-4 px-2 md:px-6 py-3 sm:py-0 sm:border-l sm:border-white/[0.04] lg:border-l-0">
                <div className="shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-b from-[#161616] to-[#0d0d0d] border border-gold-dark/10 hover:border-gold-light/25 shadow-inner transition-colors duration-300">
                  <Package className="w-6 h-6 text-gold-light opacity-95 filter drop-shadow-[0_0_6px_rgba(216,154,43,0.3)]" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl md:text-3xl font-display font-black text-gold-light leading-none">
                      {aboutContent.stat2Num || "100.000+"}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 uppercase font-display font-bold tracking-wider leading-tight mt-1.5">
                    {aboutContent.stat2Label || "Sản phẩm bàn giao"}
                  </div>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="flex items-center gap-4 px-2 md:px-6 py-3 sm:py-0 lg:border-l lg:border-gold-dark/10">
                <div className="shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-b from-[#161616] to-[#0d0d0d] border border-gold-dark/10 hover:border-gold-light/25 shadow-inner transition-colors duration-300">
                  <Factory className="w-6 h-6 text-gold-light opacity-95 filter drop-shadow-[0_0_6px_rgba(216,154,43,0.3)]" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    {(() => {
                      const num = aboutContent.stat3Num || "5.000 m²";
                      const match = num.match(/^([\d.,+%-]+)\s*(.*)$/);
                      if (match) {
                        return (
                          <>
                            <span className="text-2xl md:text-3xl font-display font-black text-gold-light leading-none">{match[1]}</span>
                            {match[2] && <span className="text-xs font-display font-medium text-gold-dark/80 ml-0.5">{match[2]}</span>}
                          </>
                        );
                      }
                      return <span className="text-2xl md:text-3xl font-display font-black text-gold-light leading-none">{num}</span>;
                    })()}
                  </div>
                  <div className="text-[10px] text-gray-400 uppercase font-display font-bold tracking-wider leading-tight mt-1.5">
                    {aboutContent.stat3Label || "Nhà máy hiện đại"}
                  </div>
                </div>
              </div>

              {/* Stat 4 */}
              <div className="flex items-center gap-4 px-2 md:px-6 py-3 sm:py-0 sm:border-l sm:border-white/[0.04] lg:border-l lg:border-gold-dark/10">
                <div className="shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-b from-[#161616] to-[#0d0d0d] border border-gold-dark/10 hover:border-gold-light/25 shadow-inner transition-colors duration-300">
                  <Award className="w-6 h-6 text-gold-light opacity-95 filter drop-shadow-[0_0_6px_rgba(216,154,43,0.3)]" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    {(() => {
                      const num = aboutContent.stat4Num || "3 Năm";
                      const match = num.match(/^([\d.,+%-]+)\s*(.*)$/);
                      if (match) {
                        return (
                          <>
                            <span className="text-2xl md:text-3xl font-display font-black text-gold-light leading-none">{match[1]}</span>
                            {match[2] && <span className="text-xs uppercase font-display font-medium text-gold-dark/80 ml-0.5">{match[2]}</span>}
                          </>
                        );
                      }
                      return <span className="text-2xl md:text-3xl font-display font-black text-gold-light leading-none">{num}</span>;
                    })()}
                  </div>
                  <div className="text-[10px] text-gray-400 uppercase font-display font-bold tracking-wider leading-tight mt-1.5">
                    {aboutContent.stat4Label || "Bảo hành chính hãng"}
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 3. MODERN FACTORY CAPABILITIES BLOCK (MATCHING PHOTO 2 BOTTOM) */}
      <section className="py-20 bg-[#050505]" id="voltara-factory-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Factory Info Text */}
            <div className="lg:col-span-5 flex flex-col items-start text-left">
              <span className="text-[10px] font-mono tracking-widest text-gold-light uppercase">
                {aboutContent.factorySubtitle || "TIÊU CHUẨN ĐỒNG BỘ"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white uppercase mt-1 mb-4 leading-normal">
                {aboutContent.factoryTitle || "Nhà Máy Hiện Đại Công Nghệ Tiên Tiến"}
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed mb-6">
                {aboutContent.factoryDesc || "Voltara đầu tư quy trình chế tác tự động hóa khép kín tại khu công nghiệp Vĩnh Long..."}
              </p>

              <div className="grid grid-cols-2 gap-4 w-full mb-6">
                <div className="border border-white/5 p-3">
                  <div className="text-gold-light text-xs font-display font-black">XÍCH DÂY TRUYỀN</div>
                  <div className="text-[10px] text-gray-500">Tự động hoá 90%</div>
                </div>
                <div className="border border-white/5 p-3">
                  <div className="text-gold-light text-xs font-display font-black">KIỂM ĐỊNH</div>
                  <div className="text-[10px] text-gray-500">Nghiêm ngặt 10 lớp</div>
                </div>
                <div className="border border-white/5 p-3">
                  <div className="text-gold-light text-xs font-display font-black">MÁY MÓC</div>
                  <div className="text-[10px] text-gray-500">Công nghệ CHLB Đức</div>
                </div>
                <div className="border border-white/5 p-3">
                  <div className="text-gold-light text-xs font-display font-black">SINH HOẠT</div>
                  <div className="text-[10px] text-gray-500">Sạch, trung hoà các-bon</div>
                </div>
              </div>

              <button
                onClick={() => showToast("Thông báo: Hệ thống đăng ký tham quan nhà máy Vĩnh Long tạm thời đóng để hiệu chuẩn robot. Vui lòng quay lại trong quý sau.", "info")}
                className="bg-gold-dark text-black font-display font-bold py-3 px-6 text-xs text-center uppercase tracking-widest hover:bg-gold-light hover:shadow-[0_0_15px_rgba(216,154,43,0.35)] transition-all"
              >
                Tham Quan Nhà Máy →
              </button>
            </div>

            {/* High-quality illustration representing workers and automated machinery */}
            <div className="lg:col-span-7 relative">
              <div className="absolute -inset-1 bg-gradient-to-[#F5C45A] opacity-5 filter blur-lg" />
              <div className="relative border border-gold-dark/25 p-3 bg-black">
                <img
                  src={aboutContent.factoryImage || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800"}
                  alt="Nhà máy Voltara"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover grayscale opacity-90 brightness-95 group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute bottom-5 right-5 bg-black/90 p-3 border border-white/10 text-right">
                  <span className="text-[9.5px] font-mono text-gold-light block font-semibold leading-none mb-1">FACTORY COORDINATES</span>
                  <span className="text-[10px] font-mono text-gray-400 uppercase leading-none">Vinh Long province, VN</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. REPUTATIONAL QUOTE BOX AT BOTTOM (MATCHING PHOTO 2 QUOTE) */}
      <section className="py-16 bg-[#080808] border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="relative">
            {/* Big quote mark graphic */}
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-gold-dark/10 font-serif text-8xl pointer-events-none select-none">
              &ldquo;
            </span>
            
            <p className="text-sm sm:text-base text-gray-300 font-sans italic leading-relaxed max-w-2xl mx-auto relative z-10 pt-4">
              &ldquo;{aboutContent.quoteText || "Voltara không chỉ sản xuất pin sạc, chúng tôi kiến tạo các giải pháp lưu trữ và phân phối..."}&rdquo;
            </p>
            
            <div className="mt-4 flex flex-col items-center">
              <div className="w-10 h-[1.5px] bg-gold-dark my-4" />
              <span className="text-xs font-display font-extrabold tracking-widest text-gold-light uppercase leading-none">
                {aboutContent.quoteAuthor || "HỘI ĐỒNG SÁNG LẬP VOLTARA TECHNOLOGY"}
              </span>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
}
