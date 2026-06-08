import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Phone, MessageSquare, Check, Send, X, Battery, Home, MapPin, Calculator } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function MobileQuickAccess() {
  const location = useLocation();
  const { showToast, addQuoteRequest } = useApp();
  const [isOpenChatModal, setIsOpenChatModal] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    name: "",
    phone: "",
    batteryType: "Xe Điện",
    voltage: "72V",
    capacity: "30Ah",
    notes: "",
  });
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);

  // Hidden in Admin view
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteForm.name || !quoteForm.phone) {
      showToast("Vui lòng điền tên và số điện thoại liên hệ!", "warning");
      return;
    }

    addQuoteRequest({
      id: "quote-req-" + Date.now(),
      customerName: quoteForm.name,
      phone: quoteForm.phone,
      productName: `Khảo sát nhanh: Pin ${quoteForm.batteryType} (${quoteForm.voltage} / ${quoteForm.capacity})`,
      batteryType: quoteForm.batteryType === "Xe Điện" ? "Xe Máy Điện / Xe Đạp" : quoteForm.batteryType,
      voltage: quoteForm.voltage,
      capacity: quoteForm.capacity,
      notes: quoteForm.notes || "Khảo sát nhanh từ Mobile Quick Access",
      date: new Date().toISOString(),
      status: "Chờ xử lý"
    });

    setIsSubmitSuccess(true);
    setTimeout(() => {
      setIsSubmitSuccess(false);
      setIsOpenChatModal(false);
      setQuoteForm({
        name: "",
        phone: "",
        batteryType: "Xe Điện",
        voltage: "72V",
        capacity: "30Ah",
        notes: "",
      });
    }, 4000);
  };

  // Helper to determine if path is matching
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* 1. FIXED FLOATING APP-LIKE TAB MENU FOR MOBILE ONLY */}
      <div
        id="mobile-quick-bar"
        className="fixed bottom-0 left-0 right-0 z-45 md:hidden bg-[#070707]/95 border-t border-gold-dark/15 backdrop-blur-md px-1 py-2 pb-[calc(8px+env(safe-area-inset-bottom))] flex items-center justify-around shadow-[0_-8px_35px_rgba(0,0,0,0.92)]"
      >
        {/* TAB 1: HOME */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center text-[9px] font-display font-medium uppercase tracking-wider transition-colors py-1 flex-1 ${
            isActive("/") ? "text-gold-light" : "text-gray-400"
          }`}
        >
          <Home className={`w-5 h-5 mb-1 ${isActive("/") ? "text-gold-light" : "text-gray-400"}`} />
          <span>Trang Chủ</span>
        </Link>

        {/* TAB 2: PRODUCTS */}
        <Link
          to="/san-pham"
          className={`flex flex-col items-center justify-center text-[9px] font-display font-medium uppercase tracking-wider transition-colors py-1 flex-1 ${
            isActive("/san-pham") ? "text-gold-light" : "text-gray-400"
          }`}
        >
          <Battery className={`w-5 h-5 mb-1 ${isActive("/san-pham") ? "text-gold-light" : "text-gray-400"}`} />
          <span>Sản Phẩm</span>
        </Link>

        {/* TAB 3: DEALERS */}
        <Link
          to="/dai-ly"
          className={`flex flex-col items-center justify-center text-[9px] font-display font-medium uppercase tracking-wider transition-colors py-1 flex-1 ${
            isActive("/dai-ly") ? "text-gold-light" : "text-gray-400"
          }`}
        >
          <MapPin className={`w-5 h-5 mb-1 ${isActive("/dai-ly") ? "text-gold-light" : "text-gray-400"}`} />
          <span>Đại Lý</span>
        </Link>

        {/* TAB 4: GET QUOTE TRIGGER */}
        <button
          onClick={() => setIsOpenChatModal(true)}
          className={`flex flex-col items-center justify-center text-[9px] font-display font-medium uppercase tracking-wider transition-colors py-1 flex-1 cursor-pointer ${
            isOpenChatModal ? "text-gold-light" : "text-gray-400"
          }`}
        >
          <Calculator className={`w-5 h-5 mb-1 ${isOpenChatModal ? "text-gold-light" : "text-gray-400 animate-pulse"}`} />
          <span>Báo Giá</span>
        </button>

        {/* TAB 5: CALL HOTLINE */}
        <a
          href="tel:19001234"
          className="flex flex-col items-center justify-center text-[9px] font-display font-semibold uppercase tracking-wider text-gray-400 py-1 flex-1"
        >
          <div className="bg-gradient-to-r from-gold-dark to-gold-light text-black p-1 rounded-full mb-1 flex items-center justify-center shadow-[0_0_10px_rgba(218,154,43,0.3)] animate-pulse">
            <Phone className="w-3.5 h-3.5 text-black stroke-[3]" />
          </div>
          <span className="text-gold-light font-black">Hotline</span>
        </a>
      </div>

      {/* 2. CHAT & SPECIFICATION QUOTE MODAL OVERLAY */}
      {isOpenChatModal && (
        <div className="fixed inset-0 z-50 md:hidden flex items-end justify-center bg-black/85 backdrop-blur-sm animate-fade-in">
          {/* Backdrop dismiss */}
          <div className="absolute inset-0" onClick={() => setIsOpenChatModal(false)} />

          <div className="relative w-full bg-[#101010] border-t-2 border-gold-dark max-h-[85vh] overflow-y-auto px-5 py-6 rounded-t-3xl shadow-2xl z-10">
            {/* Grab handle illustration */}
            <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Battery className="w-5 h-5 text-gold-light" />
                <h3 className="font-display font-extrabold text-sm text-white uppercase tracking-wider">
                  YÊU CẦU BÁO GIÁ PIN VOLTARA
                </h3>
              </div>
              <button
                onClick={() => setIsOpenChatModal(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QUICK CONTACT CHANNELS */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <a
                href="https://zalo.me/0900000000"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-[#0068FF] text-white p-3 text-xs font-bold uppercase tracking-wider hover:opacity-90"
              >
                <MessageSquare className="w-4 h-4" />
                Dẫn tới Zalo 24/7
              </a>
              <a
                href="https://m.me/voltara.battery"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-[#0084FF] text-white p-3 text-xs font-bold uppercase tracking-wider hover:opacity-90"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.914 1.448 5.518 3.7 7.234V22l3.355-1.84c.91.253 1.879.394 2.895.394 5.523 0 10-4.146 10-9.26C21.95 6.146 17.523 2 12 2zm1.14 12.235l-2.583-2.753-5.047 2.753 5.55-5.892 2.628 2.753 5.002-2.753-5.55 5.892z" />
                </svg>
                Trò chuyện FB
              </a>
            </div>

            {/* SEPARATOR */}
            <div className="relative flex py-3 items-center">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-4 text-[9px] font-mono uppercase tracking-widest text-gray-500">
                Hoặc gửi khảo sát nhanh bên dưới
              </span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            {/* SPECIFICATION INQUIRY FORM */}
            {isSubmitSuccess ? (
              <div className="py-8 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-gold-dark/20 border border-gold-light/40 rounded-full flex items-center justify-center text-gold-light mb-3 animate-pulse">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-white font-display font-bold uppercase tracking-wider text-sm mb-2">
                  Đã tiếp nhận yêu cầu!
                </h4>
                <p className="text-xs text-gray-400 max-w-sm leading-relaxed px-4">
                  Chuyên viên tư vấn cell pin Lithium Voltara sỉ lẻ sẽ gọi điện thoại hoặc liên hệ qua Zalo cho quý khách trong vòng 10 phút.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">
                    Họ tên khách hàng <span className="text-gold-light">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={quoteForm.name}
                    onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="w-full bg-[#181818] border border-white/15 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-dark rounded-md"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">
                      Số điện thoại của bạn <span className="text-gold-light">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={quoteForm.phone}
                      onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                      placeholder="Số điện thoại / Zalo"
                      className="w-full bg-[#181818] border border-white/15 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-dark rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">
                      Mục đích sử dụng
                    </label>
                    <select
                      value={quoteForm.batteryType}
                      onChange={(e) => setQuoteForm({ ...quoteForm, batteryType: e.target.value })}
                      className="w-full bg-[#181818] border border-white/15 px-2 py-2 text-xs text-white focus:outline-none focus:border-gold-dark rounded-md"
                    >
                      <option value="Xe Điện">Xe Máy Điện / Xe Đạp</option>
                      <option value="Ắc Quy">Ắc quy ô tô / Loa kẹo kéo</option>
                      <option value="May Cong Cu">Pin máy khoan / Thiết bị cầm tay</option>
                      <option value="Luu Tru">Bộ điện sạc dự phòng UPS / Solar</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">
                      Điện áp ước lượng (V)
                    </label>
                    <input
                      type="text"
                      value={quoteForm.voltage}
                      onChange={(e) => setQuoteForm({ ...quoteForm, voltage: e.target.value })}
                      placeholder="Ví dụ: 72V, 60V, 12V..."
                      className="w-full bg-[#181818] border border-white/15 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-dark rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">
                      Dung lượng (Ah)
                    </label>
                    <input
                      type="text"
                      value={quoteForm.capacity}
                      onChange={(e) => setQuoteForm({ ...quoteForm, capacity: e.target.value })}
                      placeholder="Ví dụ: 30Ah, 50Ah, 100Ah..."
                      className="w-full bg-[#181818] border border-white/15 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-dark rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">
                    Ghi chú yêu cầu kỹ thuật thêm
                  </label>
                  <textarea
                    rows={2}
                    value={quoteForm.notes}
                    onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                    placeholder="Mô tả cụ thể dòng xả liên tục mong muốn hoặc BMS lắp ráp nếu có..."
                    className="w-full bg-[#181818] border border-white/15 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-dark resize-none rounded-md"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gold-dark to-gold-light text-black text-xs font-display font-bold uppercase tracking-wider py-3 rounded-md transition-transform active:scale-[0.99] cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  GỬI YÊU CẦU BÁO GIÁ NGAY
                </button>
              </form>
            )}

            <div className="mt-4 text-center">
              <span className="text-[10px] font-mono text-gray-500">
                Hotline tư vấn kỹ thuật trực tiếp: <span className="text-gold-light font-bold">1900 1234</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
