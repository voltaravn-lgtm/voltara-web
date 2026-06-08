/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ShieldCheck, Check, X, Phone, Mail, ClipboardCopy, Search, RefreshCw, Zap, Clock, Shield, FileText, ClipboardCheck, Wrench, Headphones, ArrowRight, ArrowDown } from "lucide-react";
import { SectionTitle } from "../components/Cards";
import { useApp } from "../context/AppContext";

export default function Warranty() {
  const { warranties } = useApp();
  const [serial, setSerial] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serial.trim()) return;

    setLoading(true);
    setResult(null);

    // Simulate database check
    setTimeout(() => {
      setLoading(false);
      const upperSerial = serial.trim().toUpperCase();
      
      const found = warranties.find(w => w.serial.toUpperCase() === upperSerial);
      if (found) {
        setResult({
          isValid: true,
          serial: found.serial,
          productName: found.productName,
          customerName: found.customerName,
          customerPhone: phone.trim() || found.customerPhone || "Chưa cung cấp",
          activatedDate: found.activatedDate,
          termMonths: found.termMonths,
          expiryDate: found.expiryDate,
          status: found.status,
          specNotes: found.specNotes
        });
      } else {
        setResult({
          isValid: false,
          error: `Không tìm thấy Serial '${upperSerial}' trên hệ thống Voltara. Hãy kiểm tra lại hoặc liên hệ quản trị viên để đăng ký kích hoạt.`
        });
      }
    }, 1000);
  };

  const warrantTerms = [
    { id: "term-1", title: "PIN MÁY CÔNG CỤ", months: "12 THÁNG", intro: "Áp dụng cho tất cả các dòng pin máy sạc Makita, Bosch, Dewalt, Milwaukee thương hiệu Voltara (18V, 20V...)" },
    { id: "term-2", title: "PIN LƯU TRỮ NĂNG LƯỢNG", months: "24 THÁNG", intro: "Áp dụng cho tủ sạc dự trữ mặt trời ESS lai, pin lưu trữ điện cửa cuốn thông minh (12V, 24V, 48V...)" },
    { id: "term-3", title: "ẮC QUY LITHIUM", months: "36 THÁNG", intro: "Áp dụng cho khối bình Lithium (LiFePO4) thay thế ắc quy truyền thống xe nâng, ô tô, tàu cano biển sâu" },
    { id: "term-4", title: "BMS & PHỤ KIỆN", months: "12 THÁNG", intro: "Áp dụng cho mạch cân bằng điện áp BMS rời lẻ, bộ sạc siêu tốc sụt áp chống nén, đồng hồ đo dòng" }
  ];

  const processSteps = [
    {
      step: 1,
      title: "TIẾP NHẬN YÊU CẦU",
      desc: "Khách hàng thông báo Serial qua hotline hoặc mang trực tiếp tới đại lý chính thức gần nhất.",
      icon: FileText,
    },
    {
      step: 2,
      title: "KIỂM TRA SẢN PHẨM",
      desc: "Kỹ thuật viên đo đạc phần trăm dung lượng SOH, đọc ghi chép nhật ký sụt áp trên mạch chip BMS.",
      icon: ClipboardCheck,
    },
    {
      step: 3,
      title: "XỬ LÝ BẢO HÀNH",
      desc: "Tiến hành sạc cân bằng điện ly, thay thế linh kiện lõi hỏng hóc hoặc thực chi đổi mới pack pin sạc.",
      icon: Wrench,
    },
    {
      step: 4,
      title: "KIỂM TRA & BÀN GIAO",
      desc: "Đóng máy bọc màng khí nén cao cấp thử tải dứt điểm, đóng gói dọn sạch sẽ trao trả màng lưới.",
      icon: ShieldCheck,
    },
    {
      step: 5,
      title: "HỖ TRỢ SAU BẢO HÀNH",
      desc: "Điện thoại thăm hỏi tình trạng sạc pin, lưu ý các cách bảo dưỡng giữ xả sâu an toàn tại nơi làm việc.",
      icon: Headphones,
    },
  ];

  return (
    <div id="warranty-page" className="pb-20 relative bg-[#050505]">
      
      {/* 1. HERO - FULL WIDTH ACCORDING TO USER REQUEST */}
      <section className="relative min-h-[45vh] lg:min-h-[55vh] flex items-center overflow-hidden bg-black pt-16 lg:pt-24 pb-16 lg:pb-24 mb-20">
        {/* Full-screen Background Banner Image */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img 
            src="/images/bao-hanh.webp" 
            alt="Voltara Warranty Banner Background" 
            className="w-full h-full object-cover object-center transform scale-100 opacity-90"
            referrerPolicy="no-referrer"
          />
          {/* Overlay to ensure maximum text readability and aesthetic integration */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 lg:from-black/95 lg:via-black/80 lg:to-transparent/25 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          
          <div className="flex items-center gap-2 mb-2 text-xs font-mono tracking-wider text-gray-500">
            <Link to="/" className="hover:text-gold-light">Trang chủ</Link>
            <span>/</span>
            <span className="text-gold-dark">Bảo hành</span>
          </div>

          <div className="max-w-3xl flex flex-col items-start text-left mt-6">
            <span className="text-xs font-display font-semibold tracking-[0.25em] text-gold-light uppercase mb-2">
              BẢO CHỨNG CHẤT LƯỢNG
            </span>
            <h1 className="text-4xl sm:text-5xl font-display font-black leading-tight text-white uppercase mb-6 glow-text">
              CHÍNH SÁCH BẢO HÀNH <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-light via-gold-dark to-yellow-600 gold-text-glow">
                CHÍNH HÃNG VOLTARA
              </span>
            </h1>
            
            <div className="h-[2px] bg-gradient-to-r from-gold-dark to-transparent w-28 mb-6" />

            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed mb-8 max-w-2xl backdrop-blur-[1px]">
              Voltara cam kết mang đến những sản phẩm pin Lithium chất lượng cao cùng dịch vụ bảo hành minh bạch, nhanh chóng, đảm bảo quyền lợi tối đa cho khách hàng tại Việt Nam.
            </p>

            <div className="flex flex-wrap items-center gap-6 text-xs text-gray-350">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-gold-dark" /> Bảo hành đổi tức thời</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gold-dark" /> Xử lý nhanh trong 48h</span>
              <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-gold-dark" /> Bảo hiểm sụt áp an tâm</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 2. CHÍNH SÁCH BẢO HÀNH ĐỊNH PHÂN NHÓM (MATCHING PHOTO 6 CENTER-TOP) */}
        <div className="mb-20 text-center" id="warranty-durations">
          
          <SectionTitle
            subtitle="THỜI HẠN BẢO HÀNH CHÍNH QUY"
            title="THỜI HẠN BẢO HÀNH THEO NHÓM SẢN PHẨM"
            description="Mỗi thiết bị đều tương thích với một thời hạn sạc pin lâu dài và chế độ hậu mãi đổi cũ lấy mới đặc quyền."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 pr-0">
            {warrantTerms.map((t) => (
              <div key={t.id} className="bg-[#121212] border border-white/5 p-6 rounded-lg relative group hover:border-[#D89A2B]/40 transition-all duration-300 text-left flex flex-col justify-between">
                <div>
                  <h4 className="text-[11px] font-display font-extrabold text-[#C7C7C7] uppercase tracking-wider mb-2">
                    {t.title}
                  </h4>
                  <div className="text-xl sm:text-2xl font-display font-black text-gold-light mb-4 tracking-tight group-hover:scale-105 transition-transform duration-300">
                    {t.months}
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed mb-4">
                    {t.intro}
                  </p>
                </div>
                
                <span className="text-[9.5px] font-mono text-gray-600 block pt-3 border-t border-white/5 uppercase">
                  Voltara Warranty Standard
                </span>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-gray-500 italic mt-4 text-center">
            * Lưu ý: Thời hạn bảo hành được tính từ ngày mua hàng ghi trên hóa đơn đỏ hoặc thông tin lưu trữ phiếu kiểm định kích hoạt điện tử.
          </p>

        </div>

        {/* 3. WARRANTY CONDITIONS YES/NO MATRIX (MATCHING PHOTO 6 MIDDLE) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20" id="warranty-conditions-matrix">
          
          {/* Covered Card */}
          <div className="bg-[#121212]/50 border border-emerald-500/10 p-6 md:p-8 rounded-xl relative">
            <div className="absolute top-4 right-4 text-emerald-500/20 pointer-events-none">
              <ShieldCheck className="w-16 h-16" />
            </div>
            <h3 className="text-xs font-display font-bold text-emerald-400 uppercase tracking-widest border-b border-white/5 pb-3 mb-5 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>ĐIỀU KIỆN ĐƯỢC BẢO HÀNH</span>
            </h3>

            <ul className="space-y-3.5 text-xs text-gray-300 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Sản phẩm còn trong thời hạn bảo hành đăng ký trên hệ thống.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Tem bảo hành, tem chống giả, nhãn Serial và mã vạch phải còn nguyên vẹn, không bóc rách, sứt tẩy.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Sản phẩm phát sinh hư hại do sai số kỹ cấu trúc của linh kiện, lỗi sản xuất lắp ráp chip BMS của nhà sản xuất.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Sử dụng thực tế đúng mục đích, đúng dải sụt dòng hoặc hướng dẫn hiển thị trên sách kèm theo.</span>
              </li>
            </ul>
          </div>

          {/* Not Covered Card */}
          <div className="bg-[#121212]/50 border border-rose-500/10 p-6 md:p-8 rounded-xl relative">
            <div className="absolute top-4 right-4 text-rose-500/20 pointer-events-none">
              <ShieldAlert className="w-16 h-16" />
            </div>
            <h3 className="text-xs font-display font-bold text-rose-400 uppercase tracking-widest border-b border-white/5 pb-3 mb-5 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <span>ĐIỀU KIỆN KHÔNG ĐƯỢC BẢO HÀNH</span>
            </h3>

            <ul className="space-y-3.5 text-xs text-gray-300 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>Sản phẩm đã quá thời hạn bảo hành quy định của nhãn hàng.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>Số Serial, nhãn mác thương hiệu bị mất, rách dời, cạo xóa mờ không còn thông tin đối chiếu trùng mã.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>Hư hại cơ học do tác động vật lý ném rơi vỡ, nứt móp, sử dụng trong môi trường ngập nước sương dầu cháy nổ sụt rỉ.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>Khối pin sạc tự ý tháo mở sửa chữa đấu nối bên ngoài khi không được văn phòng kỹ thuật ủy quyền.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* 4. WARRANTY PROCESS (MATCHING PHOTO 6 MIDDLE-BOTTOM) */}
        <div className="py-16 bg-[#0A0A0A] border-y border-white/5 mb-20 relative overflow-hidden" id="warranty-flow">
          <div className="max-w-7xl mx-auto">
            
            <SectionTitle
              subtitle="TÁC VỤ KỸ THUẬT QUY CHUẨN"
              title="QUY TRÌNH BẢO HÀNH 5 BƯỚC"
              description="Voltara thiết kế một quy trình kỹ thuật tốc độ cao, dứt điểm chập cháy và trả sản phẩm lành tính cho quý đại lý."
            />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 lg:gap-8 mt-16 relative">
              {processSteps.map((s, index) => {
                const StepIcon = s.icon;
                return (
                  <div key={s.step} className="relative flex flex-col items-center text-center group">
                    
                    {/* Glowing Circular Icon Container */}
                    <div className="relative flex items-center justify-center w-20 h-20 rounded-full border border-gold-dark/40 bg-[#0F0F0F] shadow-[0_0_15px_rgba(216,154,43,0.15)] group-hover:shadow-[0_0_25px_rgba(216,154,43,0.4)] group-hover:border-gold-light/60 transition-all duration-350 mb-5 z-10">
                      <StepIcon className="w-8 h-8 text-gold-light group-hover:scale-110 transition-transform duration-300" />
                    </div>

                    {/* Step Label */}
                    <span className="text-[10px] font-mono font-bold text-gold-dark mb-1.5 uppercase tracking-widest">
                      BƯỚC {s.step}
                    </span>

                    {/* Step Name */}
                    <h4 className="text-xs font-display font-black text-white hover:text-gold-light transition-colors duration-200 uppercase tracking-wide mb-2.5">
                      {s.title}
                    </h4>

                    {/* Step Description */}
                    <p className="text-[11px] text-gray-400 max-w-[200px] leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                      {s.desc}
                    </p>

                    {/* Desktop Connector Arrow */}
                    {index < 4 && (
                      <div className="hidden md:flex absolute top-10 -right-4 lg:-right-6 translate-x-1/2 z-0 items-center justify-center text-gold-dark/40 group-hover:text-gold-light/60 transition-colors duration-300">
                        <ArrowRight className="w-4 h-4 animate-pulse" />
                      </div>
                    )}

                    {/* Mobile Connector Arrow */}
                    {index < 4 && (
                      <div className="flex md:hidden my-6 items-center justify-center text-gold-dark/30 animate-bounce">
                        <ArrowDown className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* 5. DATABASE FORM VERIFICATION & CALL SUPPORT DIRECT (MATCHING PHOTO 6 BOTTOM) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto items-stretch" id="warranty-verification-pane">
          
          {/* Verification Form */}
          <div className="lg:col-span-7 bg-[#121212] border border-gold-dark/25 p-6 md:p-8 text-left">
            <h3 className="text-xs font-display font-black text-white uppercase tracking-widest mb-2">
              KIỂM TRA BẢO HÀNH ĐIỆN TỬ
            </h3>
            <p className="text-[11px] text-gray-500 mb-6 leading-relaxed">
              Nhập mã định danh Serial/SN số khắc la-ze sau vỏ pin để kiểm tra trạng thái kích hoạt chính quy.
            </p>

            <Link
              to="/kich-hoat-bao-hanh"
              className="mb-5 inline-flex items-center justify-center gap-2 border border-gold-dark/30 px-4 py-2 text-[10px] font-display font-bold uppercase tracking-widest text-gold-light hover:border-gold-light hover:text-white"
            >
              <ClipboardCheck className="w-4 h-4" />
              Kích hoạt bảo hành điện tử
            </Link>

            <form onSubmit={handleLookup} className="space-y-4">
              <div>
                <label className="text-[9px] font-display font-bold text-gray-600 uppercase mb-1 block">Nhập mã serial/SN sản phẩm *</label>
                <input
                  type="text"
                  required
                  value={serial}
                  onChange={(e) => setSerial(e.target.value)}
                  placeholder="Ví dụ: VOLTARA-20V-MA01"
                  className="w-full bg-black text-[#ECECEC] border border-white/10 px-3.5 py-3 text-xs focus:outline-none focus:border-gold-light uppercase font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] font-display font-bold text-gray-600 uppercase mb-1 block">Số điện thoại mua hàng (Không bắt buộc)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ví dụ: 0912345678"
                  className="w-full bg-black text-[#ECECEC] border border-white/10 px-3.5 py-3 text-xs focus:outline-none focus:border-gold-light"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold-dark text-black font-display font-bold text-xs py-3.5 tracking-widest uppercase hover:bg-gold-light transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>HỆ THỐNG ĐANG ĐỐI CHIẾU...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>KIỂM TRA HỆ THỐNG</span>
                  </>
                )}
              </button>
            </form>

            {/* Results layout card */}
            {result && (
              <div className="mt-6 p-4 bg-black border border-white/5 text-xs">
                {result.isValid ? (
                  <div className="space-y-2">
                    <div className="flex justify-between border-b border-white/5 pb-2 text-[10.5px]">
                      <span className="text-gray-500">Sản phẩm kích hoạt:</span>
                      <span className="text-white font-bold uppercase">{result.productName}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2 text-[10.5px]">
                      <span className="text-gray-500">Mã Số Serial:</span>
                      <span className="text-gold-light font-mono font-semibold">{result.serial}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-1">
                      <div>
                        <span className="text-gray-500 block text-[9.5px] uppercase">Gia chủ mua:</span>
                        <span className="text-gray-300 font-medium">{result.customerName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[9.5px] uppercase">Hạn định kì:</span>
                        <span className="text-gray-300 font-medium">{result.termMonths} tháng</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[9.5px] uppercase">Kích hoạt lúc:</span>
                        <span className="text-gray-300 font-mono font-medium">{result.activatedDate}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[9.5px] uppercase">Ngày hết hạn:</span>
                        <span className="text-[#ECECEC] font-mono font-medium">{result.expiryDate}</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-white/5">
                      <span className="text-gray-500 block text-[9.5px] uppercase mb-1">Kết quả đo SOH:</span>
                      <p className="text-[10.5px] text-gray-400 italic bg-white/5 p-2 border-l-2 border-gold-dark">{result.specNotes}</p>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-gray-500 text-[10px]">Trạng thái:</span>
                      <span className="text-emerald-400 font-bold uppercase">{result.status}</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-rose-400 tracking-wide font-medium block">{result.error}</span>
                )}
              </div>
            )}
          </div>

          {/* Hotline Advisor card next to form */}
          <div className="lg:col-span-5 border border-white/5 bg-[#161616]/70 p-6 md:p-8 flex flex-col justify-between text-left relative overflow-hidden" id="warranty-advisor-box">
            {/* Visual element representing human counselor */}
            <div className="aspect-[16/10] w-full bg-[#050505] border border-white/5 overflow-hidden relative mb-4">
              <img
                src="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?auto=format&fit=crop&q=80&w=400"
                alt="Người tư vấn Voltara"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover grayscale brightness-90 saturate-50"
              />
              <div className="absolute inset-0 bg-[#D89A2B]/5 mix-blend-color pointer-events-none" />
              <div className="absolute bottom-3 left-3 bg-black/95 border border-white/10 px-2.5 py-0.5 text-[8.5px] font-mono text-gray-400">
                WARRANTY HOTLINE LIVE
              </div>
            </div>

            <div>
              <h4 className="text-xs font-display font-extrabold text-[#ECECEC] uppercase mb-1">ĐƯỜNG DÂY NÓNG BẢO HÀNH</h4>
              <p className="text-[10.5px] text-gray-500 leading-relaxed mb-4">
                Mọi thắc mắc về kỹ thuật hàn nối, sụt dòng hoặc đổi mới cell màng pin lithium, vui lòng liên hệ trực tiếp ban bảo hành:
              </p>
            </div>

            <div className="space-y-3 pt-3 border-t border-white/5 text-xs text-gray-300">
              <a href="tel:19001234" className="flex items-center gap-3 hover:text-gold-light transition-colors group">
                <Phone className="w-4 h-4 text-gold-dark shrink-0 group-hover:scale-110 transition-transform" />
                <span>Hotline: <strong className="text-white text-sm font-mono">1900 1234</strong></span>
              </a>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-gold-dark shrink-0 mt-0.5" />
                <span>Giờ làm việc: <strong className="text-white">Thứ 2 - Thứ 7 (8:00 - 17:30)</strong> / Chủ nhật nghỉ</span>
              </div>
              <a href="mailto:baohanh@voltara.vn" className="flex items-center gap-3 hover:text-gold-light transition-colors">
                <Mail className="w-4 h-4 text-gold-dark shrink-0" />
                <span>Hộp thư: <strong className="text-white">baohanh@voltara.vn</strong></span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
