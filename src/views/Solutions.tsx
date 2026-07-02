/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Link } from "react-router-dom";
import { Zap, HelpCircle, Phone, Clock, ShieldCheck, ChevronRight, CheckCircle2, Award, ClipboardList, PenTool, Wrench, Headphones } from "lucide-react";
import { SOLUTIONS_DATA, PROJECTS_DATA } from "../data";
import { SectionTitle, SolutionCard } from "../components/Cards";
import { useApp } from "../context/AppContext";
import { getMenuBanner } from "../lib/menuBanners";

export default function Solutions() {
  const { menuItems } = useApp();
  const bannerImage = getMenuBanner(menuItems, "/giai-phap", "/images/giai-phap.webp");
  
  const steps = [
    {
      num: "01",
      title: "TIẾP NHẬN YÊU CẦU",
      desc: "Lắng nghe, ghi nhận và phân tích sâu sắc các nhu cầu đặc thù của phụ tải hệ thống.",
      icon: <ClipboardList className="w-5 h-5" />
    },
    {
      num: "02",
      title: "KHẢO SÁT & TƯ VẤN",
      desc: "Kỹ sư đo lường thực địa dòng xả đột kích, đưa ra phương án sạc dự phòng khả thi.",
      icon: <HelpCircle className="w-5 h-5" />
    },
    {
      num: "03",
      title: "THIẾT KẾ GIẢI PHÁP",
      desc: "Chọn cấu hình cell lithium, thiết lập mạch quản lý bảo mật BMS và bản vẽ 3D.",
      icon: <PenTool className="w-5 h-5" />
    },
    {
      num: "04",
      title: "TRIỂN KHAI & LẮP ĐẶT",
      desc: "Lắp ráp module dập vỏ chuyên nghiệp, đấu nối mạch truyền tin đúng tiến độ.",
      icon: <Wrench className="w-5 h-5" />
    },
    {
      num: "05",
      title: "BẢO HÀNH & HỖ TRỢ",
      desc: "Xác thực kích hoạt điện tử bảo trì định kỳ thông số SOH, giải quyết sự cố 24/7.",
      icon: <Headphones className="w-5 h-5" />
    }
  ];

  return (
    <div id="solutions-page" className="pb-20 relative bg-[#050505]">
      
      {/* 1. HERO BANNER - FULL WIDTH / HIGH QUALITY MATCHING HOMEPAGE & PRODUCTS */}
      <section className="relative min-h-[45vh] lg:min-h-[55vh] flex items-center overflow-hidden bg-black pt-16 lg:pt-24 pb-16 lg:pb-24 mb-12">
        {/* Full-screen Background Banner Image */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img 
            src={bannerImage} 
            alt="Voltara Solutions Banner Background" 
            className="w-full h-full object-cover object-center transform scale-100 opacity-80"
            referrerPolicy="no-referrer"
          />
          {/* Overlay to ensure maximum text readability and aesthetic integration */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 lg:from-black/95 lg:via-black/75 lg:to-transparent/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          {/* Breadcrumb navigation */}
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-gray-400 mb-6">
            <Link to="/" className="hover:text-gold-light pointer-events-auto transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-gold-dark font-black">Giải pháp</span>
          </div>

          <div className="max-w-3xl flex flex-col items-start text-left">
            <span className="text-xs font-display font-black tracking-[0.25em] text-gold-light uppercase mb-2">
              NĂNG LỰC DỰ ÁN
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold leading-tight text-white uppercase mb-6 glow-text tracking-tight">
              GIẢI PHÁP PHÂN PHỐI NĂNG LƯỢNG LITHIUM
            </h1>
            
            <div className="h-[2px] bg-gradient-to-r from-gold-dark to-transparent w-28 mb-6" />

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-2xl backdrop-blur-[1px]">
              Đồng hành cùng phát triển bền vững cho hộ gia đình và đại xí nghiệp quốc gia. Tránh rủi ro gián đoạn sản xuất kinh doanh bằng các mô hình dự trữ an tâm dứt điểm.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 2. SOLUTIONS BY REQUEST LIST DIRECTLY DRAWN (MATCHING PHOTO 5) */}
        <div className="space-y-8 mb-20" id="solutions-by-demand">
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
            <h3 className="text-xs font-display font-black text-white uppercase tracking-wider">
              CÁC GIẢI PHÁP THEO CHƯƠNG TRÌNH NHU CẦU
            </h3>
            <span className="text-[10px] text-gray-500 font-mono">AVAILABLE SERVICES</span>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {SOLUTIONS_DATA.map((sol) => (
              <SolutionCard key={sol.id} solution={sol} />
            ))}
          </div>
        </div>

        {/* 3. IMPLEMENTATION LIFECYCLE 5-STEPS (MATCHING PHOTO 5 CENTER) */}
        <div className="py-16 bg-[#0A0A0A] border-y border-white/5 mb-20 relative overflow-hidden" id="solutions-process">
          <div className="max-w-7xl mx-auto">
            
            <SectionTitle
              subtitle="QUY TRÌNH QUẢN TRỊ"
              title="QUY TRÌNH TRIỂN KHAI GIẢI PHÁP"
              description="Toàn bộ quy trình diễn ra dưới sự giám sát chặt chẽ của các chuyên gia công nghệ năng lượng bậc cao."
            />

            {/* Horizontal timeline of steps with link arrows */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-12 relative">
              
              {/* Desktop links decoration */}
              <div className="hidden md:block absolute top-[44px] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-gold-dark/10 via-gold-dark/45 to-gold-dark/10 z-0 pointer-events-none" />

              {steps.map((st, idx) => (
                <div key={st.num} className="bg-[#121212] border border-white/5 p-5 relative z-10 hover:border-gold-dark/30 transition-all text-center">
                  {/* Number tag */}
                  <div className="absolute top-2 right-3 font-mono font-black text-gold-dark/45 text-sm">
                    {st.num}
                  </div>

                  <div className="w-12 h-12 rounded-full border border-gold-dark/20 bg-black flex items-center justify-center text-gold-light mx-auto mb-4 hover:scale-110 transition-transform">
                    {st.icon}
                  </div>

                  <h4 className="text-[11px] font-display font-extrabold text-[#ECECEC] uppercase tracking-wider mb-2 leading-snug">
                    {st.title}
                  </h4>
                  
                  <p className="text-[11.5px] text-gray-500 leading-normal">
                    {st.desc}
                  </p>
                </div>
              ))}

            </div>

          </div>
        </div>

        {/* 4. FEATURED PROJECTS - DỰ ÁN TIÊU BIỂU (MATCHING PHOTO 5 BOTTOM) */}
        <div className="mb-20" id="featured-projects">
          
          <SectionTitle
            subtitle="THỰC TẾ CHIẾN TRƯỜNG"
            title="DỰ ÁN PHÂN PHỐI TIÊU BIỂU"
            description="Bản đồ các địa danh và dự án tiêu biểu lắp đặt thành công thiết bị Voltara của chúng tôi."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROJECTS_DATA.map((proj) => (
              <div key={proj.id} className="bg-[#121212] border border-white/5 rounded-lg overflow-hidden group hover:border-gold-dark/20 transition-all duration-300">
                <div className="aspect-[4/3] w-full bg-black overflow-hidden relative shrink-0">
                  <img
                    src={proj.image}
                    alt={proj.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover filter brightness-75 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#0A0A0A] border border-gold-dark/30 px-2 py-0.5 text-[8.5px] font-display font-bold text-gold-light uppercase tracking-wider">
                    DỰ ÁN ĐỒNG BỘ
                  </div>
                </div>

                <div className="p-4 text-left">
                  <span className="text-[9.5px] text-gray-500 font-mono block mb-1 uppercase tracking-wider">
                    {proj.solutionType}
                  </span>
                  
                  <h4 className="text-xs font-display font-bold text-[#ECECEC] line-clamp-1 mb-2 group-hover:text-gold-light transition-colors uppercase">
                    {proj.title}
                  </h4>

                  <p className="text-[11px] text-gray-500 leading-snug">
                    {proj.specs}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* 5. DOCK CONVERT FORM HELP ADV ADVISOR */}
        <div className="bg-[#121212] border border-gold-dark/20 p-8 text-center max-w-4xl mx-auto rounded-xl relative">
          <span className="text-xs font-display font-semibold tracking-widest text-gold-light uppercase mb-2 block">
            CẦN TƯ VẤN THIẾT KẾ RIÊNG?
          </span>
          <h3 className="text-sm font-display font-black text-[#ECECEC] uppercase tracking-widest mb-4">
            Đội ngũ Kỹ sư R&D Voltara luôn sẵn sàng khảo sát thực tế miễn phí
          </h3>
          <p className="text-xs text-gray-500 max-w-2xl mx-auto leading-relaxed mb-6">
            Thiết kế riêng khối pin lắp ráp cho máy robot hàn tự động, cụm xe nâng logistic đặc chủng theo tệp CAD/3D phụ tải yêu cầu của quý vị.
          </p>

          <Link
            to="/lien-he?type=spec_request"
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-gold-dark to-gold-light text-black font-display font-bold py-3.5 px-8 text-xs tracking-widest uppercase hover:opacity-90 active:scale-95 transition-all rounded-md"
          >
            <span>ĐĂNG KÝ KHẢO SÁT CHUYÊN SÂU</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
