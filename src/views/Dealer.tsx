/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Phone, Award, Globe, Shield, ExternalLink, ChevronRight, Check } from "lucide-react";
import { DEALERS_DATA } from "../data";
import { SectionTitle } from "../components/Cards";
import { useApp } from "../context/AppContext";
import { getMenuBanner } from "../lib/menuBanners";

export default function Dealer() {
  const { menuItems } = useApp();
  const bannerImage = getMenuBanner(menuItems, "/dai-ly", "/images/dai-ly.webp");
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const provinces = ["all", "Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Cần Thơ", "Bình Dương", "Vĩnh Long", "Đồng Nai", "Nghệ An", "Hải Phòng"];

  const filteredDealers = DEALERS_DATA.filter((dealer) => {
    const matchesProvince = selectedProvince === "all" || dealer.province === selectedProvince;
    const matchesSearch = dealer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          dealer.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          dealer.district.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProvince && matchesSearch;
  });

  return (
    <div id="dealer-page" className="pb-20 relative bg-[#050505] text-left">
      <Link to="/dai-ly/dat-hang" className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] left-3 right-3 z-[46] flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-gold-dark to-gold-light px-5 py-3.5 text-xs font-black uppercase tracking-wider text-black shadow-[0_8px_30px_rgba(216,154,43,.35)] hover:brightness-110 md:bottom-6 md:left-auto md:right-6 md:z-40 md:py-3">
        Đặt hàng đại lý <ChevronRight className="h-4 w-4" />
      </Link>
      {/* 1. HERO BANNER - FULL WIDTH */}
      <section className="relative min-h-[45vh] lg:min-h-[55vh] flex items-center overflow-hidden bg-black pt-16 lg:pt-24 pb-16 lg:pb-24 mb-12">
        {/* Full-screen Background Banner Image */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img 
            src={bannerImage} 
            alt="Voltara Dealers Banner Background" 
            className="w-full h-full object-cover object-center transform scale-100 opacity-80"
            referrerPolicy="no-referrer"
          />
          {/* Overlay to ensure maximum text readability and aesthetic integration */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 lg:from-black/95 lg:via-black/75 lg:to-transparent/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          {/* Breadcrumb navigation */}
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-gray-400 mb-6 font-medium">
            <Link to="/" className="hover:text-gold-light pointer-events-auto transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-gold-dark font-black">Hệ thống đại lý</span>
          </div>

          <div className="max-w-3xl flex flex-col items-start text-left">
            <span className="text-xs font-display font-black tracking-[0.25em] text-gold-light uppercase mb-2">
              MẠNG LƯỚI PHÂN PHỐI
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold leading-tight text-white uppercase mb-6 glow-text tracking-tight">
              ĐẠI LÝ UỶ QUYỀN CHÍNH THỨC VOLTARA
            </h1>
            
            <div className="h-[2px] bg-gradient-to-r from-gold-dark to-transparent w-28 mb-6" />

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-2xl backdrop-blur-[1px]">
              Tìm kiếm showroom trưng bày, điểm cung ứng đóng sạc, lắp ráp pin Lithium Voltara sỉ lẻ gần quý khách hàng nhất toàn quốc.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 2. SEARCH INTERFACE WITH PROVINCE DROPDOWN AND OUTLINE GRID */}
        <div className="bg-[#121212] border border-white/5 p-6 mb-12">
          <h3 className="text-xs font-display font-black text-white uppercase tracking-widest mb-4">
            BỘ LỌC TÌM KIẾM ĐỊA KHO ĐẠI LÝ
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Input Search text */}
            <div className="md:col-span-6 flex items-center bg-black border border-white/10 px-3.5 h-12">
              <Search className="w-5 h-5 text-gray-500 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Nhập tên đại lý, tên phố, quận huyện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-[#ECECEC] placeholder-gray-600 focus:outline-none w-full font-sans"
              />
            </div>

            {/* Selector province */}
            <div className="md:col-span-4 flex items-center bg-black border border-white/10 px-3.5 h-12">
              <MapPin className="w-5 h-5 text-gold-dark mr-2 shrink-0" />
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="bg-transparent text-xs text-gray-300 focus:outline-none w-full font-display font-semibold"
              >
                <option value="all">Tất cả các Tỉnh/Thành</option>
                {provinces.filter(p => p !== "all").map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Quick reset status filter */}
            <button
              onClick={() => {
                setSelectedProvince("all");
                setSearchQuery("");
              }}
              className="md:col-span-2 bg-gradient-to-r from-gold-dark to-gold-light text-black font-display font-bold text-xs h-12 tracking-wider uppercase hover:opacity-95 transition-all text-center"
            >
              CÀI LẠI BỘ LỌC
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 text-[10.5px] items-center text-gray-500 select-none">
            <span>Tìm nhanh Tỉnh thành tiêu biểu:</span>
            {["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Cần Thơ"].map((prov) => (
              <button
                key={prov}
                onClick={() => setSelectedProvince(prov)}
                className={`px-3 py-1 border transition-all ${
                  selectedProvince === prov
                    ? "border-gold-light bg-gold-dark/10 text-gold-light"
                    : "border-white/5 bg-black hover:border-white/20 text-gray-400"
                }`}
              >
                {prov}
              </button>
            ))}
          </div>
        </div>

        {/* 3. DYNAMIC SHOWROOMS / DEALERS CARDS GRID */}
        <div id="dealers-grid-section" className="mb-20">
          
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-6 select-none">
            <h3 className="text-xs font-display font-black text-white uppercase tracking-wider">
              DANH SÁCH CHI TIẾT ĐIỂM ĐẠI LÝ ({filteredDealers.length})
            </h3>
            <span className="text-[10px] text-gray-500 font-mono">MAP LOCATIONS ({filteredDealers.length})</span>
          </div>

          {filteredDealers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pr-0">
              {filteredDealers.map((dealer) => (
                <div
                  key={dealer.id}
                  className="bg-[#121212] border border-white/5 hover:border-[#D89A2B]/40 p-5 rounded-lg relative group transition-all duration-300 text-left flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    
                    {/* Badge top */}
                    <div className="flex items-center justify-between text-[10px] font-display font-semibold mb-2">
                      <span className="text-gold-light uppercase tracking-wider flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-gold-dark shrink-0" />
                        <span>{dealer.isHQ ? "Tổng kho kỹ thuật" : "Đại lý ủy quyền"}</span>
                      </span>
                      <span className="text-gray-500 font-mono">{dealer.province}</span>
                    </div>

                    <h4 className="text-xs font-display font-bold text-[#ECECEC] uppercase tracking-wide group-hover:text-gold-light transition-colors line-clamp-1 leading-normal">
                      {dealer.name}
                    </h4>

                    <div className="h-[1.5px] bg-gradient-to-r from-gold-dark/30 to-transparent w-20" />

                    <div className="space-y-2 text-xs text-gray-400 font-sans">
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-gold-dark shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{dealer.address}, quận/huyện: {dealer.district}</span>
                      </div>
                      
                      <div className="flex items-center gap-2.5">
                        <Phone className="w-4 h-4 text-gold-dark shrink-0" />
                        <span>Hotline: <strong className="text-gray-300 font-mono font-medium">{dealer.phone}</strong></span>
                      </div>
                    </div>

                  </div>

                  <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between">
                    <span className="text-[10.5px] text-gray-500 italic">Đã đo kiểm dột kích cell sạc</span>
                    
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dealer.name + " " + dealer.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-display font-bold text-gold-light uppercase tracking-wider flex items-center gap-1 hover:text-white"
                    >
                      <span>Vị trí Map</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border border-dashed border-white/10 text-gray-500 text-xs">
              Hiện chưa có đại lý Voltara được đăng ký ở khu vực Tỉnh/Thành này. Vui lòng bấm &ldquo;Cài lại bộ lọc&rdquo; để xem địa lý kề cạnh.
            </div>
          )}

        </div>

        {/* 4. BECOME A VOLTARA PARTNER / DEALER ENTRANCE */}
        <div className="border border-gold-dark/25 bg-gradient-to-r from-[#121212]/50 to-[#0A0A0A]/50 p-8 md:p-10 relative overflow-hidden text-center max-w-4xl mx-auto rounded-xl">
          <div className="absolute top-0 right-0 p-5 opacity-5 pointer-events-none text-gold-light">
            <Shield className="w-20 h-20" />
          </div>

          <span className="text-[10px] sm:text-xs font-display font-semibold tracking-[0.25em] text-[#D89A2B] uppercase mb-2 block">
            CHƯƠNG TRÌNH KHỞI SỰ ĐẠI LÝ 2026
          </span>
          
          <h3 className="text-sm sm:text-base font-display font-black text-white uppercase tracking-wider mb-4 leading-relaxed">
            NÂNG CAO LỢI NHUẬN SHOWROOM KINH DOANH CỦA BẠN
          </h3>
          
          <p className="text-xs text-gray-400 max-w-2xl mx-auto leading-relaxed mb-6 font-sans">
            Tất cả các sản phẩm chính hãng mang thương hiệu Voltara được áp dụng chính sách sỉ độc quyền cực lớn, đào tạo sạc lắp ráp đo cell hoàn toàn miễn phí tại trung tâm Học viện, và hỗ trợ dán biển quảng cáo tại showroom 100%.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto text-left text-xs text-gray-300 mb-8 pl-4 sm:pl-0">
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-gold-light shrink-0" /> <span>Chiết khấu sỉ cực cao</span></div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-gold-light shrink-0" /> <span>Hỗ trợ biển showroom</span></div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-gold-light shrink-0" /> <span>Trị gián sụt xả hoàn chỉnh</span></div>
          </div>

          <Link
            to="/lien-he?type=register_dealer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-gold-dark to-gold-light text-black font-display font-bold py-3.5 px-8 text-xs tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(216,154,43,0.3)] hover:opacity-95 rounded-md"
          >
            <span>GỬI ĐƠN ĐĂNG KÝ HỢP TÁC ĐẠI LÝ</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
