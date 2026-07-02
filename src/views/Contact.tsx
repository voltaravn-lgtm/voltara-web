/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, Send, Check, ShieldCheck, HelpCircle, ArrowRight, PhoneCall, RefreshCw } from "lucide-react";
import { BRANCHES_DATA } from "../data";
import { SectionTitle, BranchCard } from "../components/Cards";

import { useApp } from "../context/AppContext";
import { getMenuBanner } from "../lib/menuBanners";

export default function Contact() {
  const { addSubmission, contactSettings, menuItems } = useApp();
  const bannerImage = getMenuBanner(menuItems, "/lien-he", "/images/lien-he.webp");
  const [searchParams] = useSearchParams();
  const prepopulatedTitle = searchParams.get("title") || "";
  const prepopulatedType = searchParams.get("type") || "";

  const [form, setForm] = useState({
    fullname: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
    inquiryType: "technical"
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const phoneHref = contactSettings.hotline.replace(/[^\d+]/g, "");

  // Prepopulate form fields if query params are present
  useEffect(() => {
    if (prepopulatedTitle) {
      setForm(prev => ({
        ...prev,
        subject: `Yêu cầu thông tin: ${prepopulatedTitle.replace(/_/g, " ")}`
      }));
    }
    if (prepopulatedType) {
      if (prepopulatedType === "register_dealer") {
        setForm(prev => ({
          ...prev,
          inquiryType: "dealer",
          subject: "Đăng ký làm Đại lý ủy quyền chính thức Voltara"
        }));
      } else if (prepopulatedType === "spec_request") {
        setForm(prev => ({
          ...prev,
          inquiryType: "project",
          subject: "Yêu cầu kỹ sư khảo sát & thiết kế phụ tải riêng"
        }));
      } else if (prepopulatedType === "register_academy") {
        setForm(prev => ({
          ...prev,
          inquiryType: "academy",
          subject: "Đăng ký tham quan hoặc học tập tại Học viện Voltara"
        }));
      }
    }
  }, [prepopulatedTitle, prepopulatedType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    addSubmission({
      id: "sub-" + Date.now(),
      fullname: form.fullname,
      phone: form.phone,
      email: form.email,
      subject: form.subject || "Yêu cầu tư vấn",
      message: form.message,
      inquiryType: form.inquiryType,
      date: new Date().toLocaleDateString("vi-VN")
    });

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setForm({
          fullname: "",
          phone: "",
          email: "",
          subject: "",
          message: "",
          inquiryType: "technical"
        });
      }, 2500);
    }, 1200);
  };

  return (
    <div id="contact-page" className="pb-20 relative bg-[#050505] text-left">
      {/* 1. HERO BANNER - FULL WIDTH */}
      <section className="relative min-h-[45vh] lg:min-h-[55vh] flex items-center overflow-hidden bg-black pt-16 lg:pt-24 pb-16 lg:pb-24 mb-12">
        {/* Full-screen Background Banner Image */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img 
            src={bannerImage} 
            alt="Voltara Contact Banner Background" 
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
            <span className="text-gold-dark font-black">Liên hệ</span>
          </div>

          <div className="max-w-3xl flex flex-col items-start text-left">
            <span className="text-xs font-display font-black tracking-[0.25em] text-gold-light uppercase mb-2">
              KẾT NỐI VOLTARA
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold leading-tight text-white uppercase mb-6 glow-text tracking-tight">
              LIÊN HỆ VỚI CHÚNG TÔI
            </h1>
            
            <div className="h-[2px] bg-gradient-to-r from-gold-dark to-transparent w-28 mb-6" />

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-2xl backdrop-blur-[1px]">
              Mọi hỗ trợ kỹ thuật, yêu cầu báo giá đại lý hoặc tư vấn thiết kế pin Lithium, vui lòng gửi tin nhắn hoặc gọi Hotline trực tiếp.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 2. MAIN SUB-BODY LAYOUT - CONTACT FORM & DETAILS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch mb-20" id="contact-form-row">
          
          {/* Left column: Highly styled luxurious validation Form */}
          <div className="lg:col-span-7 bg-[#121212] border border-gold-dark/20 p-6 md:p-8 rounded-xl relative">
            <div className="absolute top-0 left-8 transform -translate-y-1/2 bg-gold-dark text-black text-[9px] font-display font-extrabold px-3.5 py-1 uppercase tracking-widest rounded-sm">
              GỬI TIN NHẮN TỚI VOLTARA
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-display font-bold text-gray-600 uppercase mb-1 block">Họ và Tên của bạn *</label>
                  <input
                    type="text"
                    required
                    value={form.fullname}
                    onChange={(e) => setForm({ ...form, fullname: e.target.value })}
                    placeholder="Ví dụ: Hoàng Anh Quân"
                    className="w-full bg-black text-[#ECECEC] border border-white/10 px-3.5 py-3 text-xs focus:outline-none focus:border-gold-light rounded-md"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-display font-bold text-gray-600 uppercase mb-1 block">Số điện thoại liên hệ *</label>
                  <input
                    type="text"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Ví dụ: 0945*******"
                    className="w-full bg-black text-[#ECECEC] border border-white/10 px-3.5 py-3 text-xs focus:outline-none focus:border-gold-light rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-display font-bold text-gray-600 uppercase mb-1 block">Hòm thư Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Ví dụ: quan.hoang@gmail.com"
                    className="w-full bg-black text-[#ECECEC] border border-white/10 px-3.5 py-3 text-xs focus:outline-none focus:border-gold-light rounded-md"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-display font-bold text-gray-600 uppercase mb-1 block">Nhu cầu Liên kết hoặc Tư vấn *</label>
                  <select
                    value={form.inquiryType}
                    onChange={(e) => setForm({ ...form, inquiryType: e.target.value })}
                    className="w-full bg-black text-[#ECECEC] border border-white/10 h-11 px-3.5 text-xs focus:outline-none focus:border-gold-light rounded-md"
                  >
                    <option value="technical">Hỗ trợ kỹ thuật đo cell</option>
                    <option value="dealer">Trở thành Đại lý ủy quyền</option>
                    <option value="project">Báo giá dự án pin lưu trữ ESS</option>
                    <option value="warranty">Bảo hành hoặc Đổi cũ lấy mới</option>
                    <option value="academy">Đào tạo học tập Học viện</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-display font-bold text-gray-600 uppercase mb-1 block">Tiêu đề yêu cầu *</label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Ví dụ: Tư vấn pin 20V chân mạc Makita sỉ"
                  className="w-full bg-black text-[#ECECEC] border border-white/10 px-3.5 py-3 text-xs focus:outline-none focus:border-gold-light rounded-md"
                />
              </div>

              <div>
                <label className="text-[9px] font-display font-bold text-gray-600 uppercase mb-1 block">Chi tiết nội dung tin nhắn *</label>
                <textarea
                  rows={4}
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Chi tiết câu hỏi hoặc kích tước xả kiệt cell pin quý khách cần..."
                  className="w-full bg-black text-[#ECECEC] border border-white/10 px-3.5 py-3 text-xs focus:outline-none focus:border-gold-light rounded-md"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-gold-dark to-gold-light text-black font-display font-bold text-xs py-4 tracking-widest uppercase hover:opacity-90 active:scale-95 transition-all text-center flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(216,154,43,0.3)] rounded-md"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>DỮ LIỆU ĐANG TRUYỀN DIỆN...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>GỬI YÊU CẦU CHO CHÚNG TÔI</span>
                  </>
                )}
              </button>

            </form>

            {success && (
              <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-6 text-center z-20 border border-gold-light/40">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-display font-bold text-white uppercase tracking-wider">GỬI LIÊN HỆ THÀNH CÔNG!</h4>
                <p className="text-[11px] text-gray-400 mt-2 max-w-sm leading-relaxed">
                  Đã ghi nhận yêu cầu liên hệ của bạn trơn tru. Bộ phận hỗ trợ chăm sóc kỹ thuật Voltara sẽ liên hệ lại điện thoại của bạn ngay lập tức. Cảm ơn bạn.
                </p>
              </div>
            )}

          </div>

          {/* Right column: High-tech physical contact details */}
          <div className="lg:col-span-5 bg-[#161616]/60 border border-white/5 p-6 md:p-8 flex flex-col justify-between text-left">
            <div>
              <h3 className="text-xs font-display font-black text-white uppercase tracking-widest mb-4">
                {contactSettings.companyName}
              </h3>
              
              <div className="space-y-4 text-xs text-gray-400">
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gold-dark shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-200 block text-[10.5px] uppercase">Địa chỉ liên hệ:</strong>
                    <span className="leading-relaxed">{contactSettings.address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <PhoneCall className="w-4 h-4 text-gold-dark shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-200 block text-[10.5px] uppercase">Tổng đài Hỗ trợ sỉ:</strong>
                    <a href={`tel:${phoneHref}`} className="font-mono text-white text-sm font-extrabold block mt-0.5 hover:text-gold-light transition-colors">{contactSettings.hotline}</a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-gold-dark shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-200 block text-[10.5px] uppercase">Hộp thư điện tử liên kết:</strong>
                    <a href={`mailto:${contactSettings.email}`} className="text-white block hover:text-gold-light transition-colors">{contactSettings.email}</a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-gold-dark shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-200 block text-[10.5px] uppercase">Giờ làm việc:</strong>
                    <span>{contactSettings.workingHours}</span>
                  </div>
                </div>

              </div>
            </div>

            {contactSettings.googleMapEmbedUrl ? (
              <iframe
                title="Google Map Voltara"
                src={contactSettings.googleMapEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="mt-6 aspect-[16/8] w-full border border-white/10 grayscale-[25%]"
              />
            ) : (
              <div className="mt-6 aspect-[16/8] w-full bg-[#050505] border border-white/5 p-4 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(216,154,43,0.05)_0%,transparent_100%)]" />
                <div className="flex items-center justify-between text-[9px] font-mono text-gray-500 uppercase select-none">
                  <span>VOLTARA-COOR-MAP</span>
                  <span className="text-gold-light animate-ping">● LIVE SATELLITE</span>
                </div>
                <div className="text-center font-mono font-black text-xs text-gold-light select-none">
                  10&deg;47'21.4&quot;N 106&deg;38'24.5&quot;E
                </div>
                <div className="flex items-center justify-between text-[9px] text-gray-600 font-mono">
                  <span>ALTITUDE: 14m</span>
                  <span>STATUS: ACCURATE SECURE</span>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* 3. PHYSICAL OFFICE & LABORATORY BRANCHES (CATALOG CARD LIST) */}
        <div className="mb-12" id="branches-list-section">
          <SectionTitle
            subtitle="TRUNG TÂM & CHI NHÁNH"
            title="HỆ THỐNG VĂN PHÒNG & THỬ NGHIỆM REGIONAL"
            description="Tìm kiếm địa chỉ điểm bảo hành, phòng đo Lab, hoặc văn phòng hành chính Voltara gần khu vực của bạn nhất."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 pr-0">
            {BRANCHES_DATA.map((branch) => (
              <BranchCard key={branch.id} branch={branch} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
