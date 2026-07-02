/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Star, Clock, Award, PlayCircle, Users, CheckCircle2, ChevronRight, HelpCircle } from "lucide-react";
import { CourseCard } from "../components/Cards";
import { useApp } from "../context/AppContext";
import { getMenuBanner } from "../lib/menuBanners";

export default function Academy() {
  const { showToast, menuItems, academyCourses } = useApp();
  const bannerImage = getMenuBanner(menuItems, "/hoc-vien", "/images/hoc-vien.webp");
  const [activeTab, setActiveTab] = useState("all");
  const visibleCourses = academyCourses.filter((course) => !course.hidden);

  const categories = [
    { id: "all", name: "TẤT CẢ KHÓA HỌC" },
    ...Array.from(new Set(visibleCourses.map((course) => course.category))).map((category) => ({
      id: category,
      name: category,
    })),
  ];

  const filteredCourses = activeTab === "all"
    ? visibleCourses
    : visibleCourses.filter(c => c.category === activeTab);

  const featuredCourse = visibleCourses.find(c => c.rating >= 4.9) || visibleCourses[0];

  return (
    <div id="academy-page" className="pb-20 relative text-left bg-[#050505]">
      <section className="relative min-h-[45vh] lg:min-h-[55vh] flex items-center overflow-hidden bg-black pt-16 lg:pt-24 pb-16 lg:pb-24 mb-12">
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img
            src={bannerImage}
            alt="Học viện Voltara"
            className="w-full h-full object-cover object-center opacity-90"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 lg:from-black/95 lg:via-black/80 lg:to-transparent/25 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-gray-400 mb-6">
            <Link to="/" className="hover:text-gold-light transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-gold-dark font-black">Học viện</span>
          </div>

          <div className="max-w-3xl flex flex-col items-start text-left">
            <span className="text-xs font-display font-black tracking-[0.25em] text-gold-light uppercase mb-2">
              VOLTARA POWER ACADEMY
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black leading-tight text-white uppercase mb-6 glow-text tracking-tight">
              HỌC VIỆN ĐÀO TẠO <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-light via-gold-dark to-yellow-600">
                KỸ THUẬT VOLTARA
              </span>
            </h1>
            <div className="h-[2px] bg-gradient-to-r from-gold-dark to-transparent w-28 mb-6" />
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed max-w-2xl backdrop-blur-[1px]">
              Chương trình huấn luyện đo kiểm sụt dòng xả, lắp ráp đóng vỏ chống nước và chăm sóc khách hàng độc quyền cho đối tác đại lý chính thức.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 2. FEATURED VIDEO COURSE LARGE BANNER HERO (VIDEO CARD CAP / ENROLL CTA) */}
        {featuredCourse && (
          <div className="bg-[#121212] border border-gold-dark/25 p-5 md:p-8 rounded-xl mb-16 relative overflow-hidden" id="featured-academic-video-block">
            <div className="absolute top-0 right-[15%] w-72 h-72 rounded-full bg-gold-dark/5 filter blur-3xl pointer-events-none" />
            <div className="absolute top-4 left-4 bg-[#D89A2B] text-black text-[9px] font-display font-extrabold px-3 py-1.5 uppercase tracking-widest rounded-sm">
              KHÓA HỌC KHUYÊN LÊN ĐẦU
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-6">
              
              {/* Left video mockup player placeholder */}
              <div className="lg:col-span-6 relative aspect-[16/9] w-full bg-black border border-white/10 flex items-center justify-center p-2 group hover:border-[#D89A2B]/40 transition-colors rounded-lg overflow-hidden">
                <img
                  src={featuredCourse.image}
                  alt={featuredCourse.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover filter brightness-50 group-hover:brightness-75 transition-all duration-500 rounded-md"
                />
                
                {/* Visual hovering play trigger button */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <PlayCircle className="w-14 h-14 text-gold-light drop-shadow-[0_0_15px_rgba(216,154,43,0.5)] group-hover:scale-110 group-hover:text-white transition-all cursor-pointer" />
                </div>

                <div className="absolute bottom-4 left-4 bg-black/90 p-2.5 border border-white/10 text-xs rounded-md">
                  <span className="text-[10px] text-gray-500 block uppercase">Thời lượng bài học</span>
                  <span className="text-[#ECECEC] font-mono leading-none">{featuredCourse.duration} (Video Full HD)</span>
                </div>
              </div>

              {/* Right Course content detail specs */}
              <div className="lg:col-span-6 space-y-4 text-left">
                <span className="text-[9.5px] font-display font-semibold text-gold-light uppercase tracking-widest px-2.1 py-1 bg-gold-dark/10 border border-gold-dark/20 rounded-md">
                  {featuredCourse.category}
                </span>

                <h3 className="text-sm sm:text-base md:text-xl font-display font-black text-white uppercase tracking-wider leading-relaxed">
                  {featuredCourse.title}
                </h3>

                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  {featuredCourse.description || "Khóa học chi tiết về thiết kế cấu hình cụm máy sạc Lithium ion cho pin xe điện, kỹ thuật đo điện trở nội cell pin sụt áp và thuật toán viết firmware điều phối mạch quản lý pin BMS an tâm."}
                </p>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-300">
                  <span>Giảng viên: <strong className="text-gray-100 font-sans font-medium">{featuredCourse.lecturer}</strong></span>
                  <span className="flex items-center text-gold-light">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-gold-light" />
                    ))}
                    <strong className="text-gray-200 ml-1 font-mono">{featuredCourse.rating}</strong>
                  </span>
                  <span>({featuredCourse.reviews} reviews)</span>
                </div>

                <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => showToast(`Chào mừng đến với Học viện Voltara! Bạn đã đăng ký thành công khóa học "${featuredCourse.title}". Bản tài liệu PDF sơ đồ mạch đấu nối BMS đã được gửi vào hòm thư đăng ký.`, "success")}
                    className="w-full sm:w-auto bg-gradient-to-r from-gold-dark to-gold-light text-black font-display font-bold px-6 py-3 text-xs uppercase tracking-widest text-center shadow-[0_0_15px_rgba(216,154,43,0.3)] hover:opacity-95"
                  >
                    KÍCH HOẠT HỌC NGAY
                  </button>
                  <span className="text-[10px] text-gray-500 italic">* Khóa học đính kèm tài liệu file CAD/firmware mẫu của Voltara</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 3. COURSE SEARCH TABS CATEGORIES (FILTER SELECTORS) */}
        <div className="bg-[#121212] border border-white/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-1.5 font-display text-[10.5px] font-bold">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveTab(c.id)}
                className={`px-4 py-2.5 hover:bg-white/5 transition-all uppercase tracking-wider ${
                  activeTab === c.id
                    ? "text-gold-light border-b-2 border-gold-dark"
                    : "text-gray-400"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <span className="text-[10px] text-gray-500 font-mono select-none">FILTERED ({filteredCourses.length}) PROGRAMS</span>
        </div>

        {/* 4. DETAILS COURSES RESPONSIVE GRID LIST */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {/* 5. ACADEMIC BENEFITS STRIP */}
        <div className="border border-white/5 bg-[#121212] p-6 md:p-8 rounded-xl text-left mb-12">
          <h3 className="text-xs font-display font-bold text-white uppercase tracking-wider mb-6 border-b border-white/5 pb-2">
            ĐẶC QUYỀN CHỨNG CHỈ HỌC VIỆN VOLTARA
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gold-light">
                <CheckCircle2 className="w-5 h-5" />
                <h4 className="text-[11px] font-display font-extrabold text-[#ECECEC] uppercase">CHỨNG CHỈ UỶ QUYỀN CHÍNH THỨC</h4>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">Sau khi hoàn thành bài thi dồn dập, Đại lý được cấp bằng cứng treo trưng bày tại showroom gia tăng độ uy tín tuyệt đối.</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gold-light">
                <CheckCircle2 className="w-5 h-5" />
                <h4 className="text-[11px] font-display font-extrabold text-[#ECECEC] uppercase">CUNG CẤP THIẾT BỊ KHUYÊN DÙNG BÁN SỈ</h4>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">Cung cấp máy đo xung điện trở nội sinh, hàn bấm pin tự động và linh kiện thay thế với biểu giá tận xưởng R&D Voltara.</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gold-light">
                <CheckCircle2 className="w-5 h-5" />
                <h4 className="text-[11px] font-display font-extrabold text-[#ECECEC] uppercase font-sans">CO-BRAND MARKETING QUẢNG BÁ</h4>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">Bản đồ Đại lý chính thức của bạn sẽ được ghim định vị hiển thị hàng ngày tới hàng vạn lượt xem lưu lượng định hướng.</p>
            </div>
          </div>
        </div>

        {/* 6. CONVERT EMAIL / TELEGRAM HOTLINE CTA */}
        <div className="border border-[#D89A2B]/40 bg-gold-dark/5 p-8 max-w-4xl mx-auto rounded-xl text-center">
          <h3 className="text-xs font-display font-black text-white uppercase tracking-widest mb-3">
            BẢN TIN KỸ THUẬT NỘI BỘ HỌC VIỆN
          </h3>
          <p className="text-xs text-gray-400 max-w-2xl mx-auto leading-relaxed mb-6">
            Đăng ký để nhận các tài liệu bài giảng mới nhất, cập nhật danh mục linh kiện pin sạc và hướng dẫn nạp sạc pin Lithium an toàn của chúng tôi hàng tháng.
          </p>

          <Link
            to="/lien-he?type=register_academy"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-gold-dark to-gold-light text-black font-display font-bold text-xs py-3.5 px-8 uppercase tracking-widest transition-all rounded-md"
          >
            <span>LIÊN HỆ QUẢN TRỊ HỌC VIỆN</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
