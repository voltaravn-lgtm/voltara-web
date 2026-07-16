import React, { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import { collection, limit, onSnapshot, query } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../../lib/firebase";
import { ContactSubmission } from "../../types";
import { Phone, Mail, Trash2, Calendar, FileText, Check, ShieldCheck, HelpCircle } from "lucide-react";

export default function ContactAdmin() {
  const { contactSubmissions, setContactSubmissions, deleteSubmission } = useApp();
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined;
    return onSnapshot(query(collection(db, "contactSubmissions"), limit(50)), (snapshot) => {
      setContactSubmissions(snapshot.docs
        .map((item) => item.data() as ContactSubmission)
        .sort((a, b) => String(b.id).localeCompare(String(a.id))));
    }, (error) => console.error("Could not load contact submissions:", error));
  }, [setContactSubmissions]);

  const translateInquiry = (type: string) => {
    switch (type) {
      case "technical": return "Hỗ trợ kỹ thuật";
      case "dealer": return "Trở thành Đại lý";
      case "project": return "Kỹ sư dự án riêng";
      case "academy": return "Học tập / Tham quan";
      default: return "Hỗ trợ chung";
    }
  };

  const getBadgeClass = (type: string) => {
    switch (type) {
      case "dealer": return "border-gold-light text-gold-light bg-gold-dark/5";
      case "technical": return "border-blue-400 text-blue-400 bg-blue-500/5";
      case "project": return "border-purple-400 text-purple-400 bg-purple-500/5";
      case "academy": return "border-emerald-400 text-emerald-400 bg-emerald-500/5";
      default: return "border-gray-500 text-gray-400 bg-white/5";
    }
  };

  const filteredSubmissions = contactSubmissions.filter(sub => {
    if (filterType === "all") return true;
    return sub.inquiryType === filterType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-display font-semibold tracking-wide text-white uppercase flex items-center gap-2 text-gold-light">
            <Mail className="w-5 h-5" />
            XỬ LÝ THÔNG TIN LIÊN HỆ CỦA KHÁCH HÀNG ({contactSubmissions.length})
          </h2>
          <p className="text-xs text-gray-400">Xem và quản lý các yêu cầu trở thành đại lý, đăng ký tham quan hoặc yêu cầu tư vấn kỹ sư của khách hàng.</p>
        </div>

        {/* Short inquiry filters */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase text-gray-400 font-bold">Lọc loại:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-black text-xs text-white border border-white/10 px-2 py-1 focus:outline-none focus:border-gold-light rounded-md"
          >
            <option value="all">TẤT CẢ ({contactSubmissions.length})</option>
            <option value="technical">Kỹ thuật</option>
            <option value="dealer">Làm Đại Lý</option>
            <option value="project">Dự án riêng</option>
            <option value="academy">Học viện</option>
          </select>
        </div>
      </div>

      {filteredSubmissions.length === 0 ? (
        <div className="border border-white/5 bg-black/40 text-center py-16">
          <Mail className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <h3 className="text-sm font-display font-bold text-gray-400">CHƯA CÓ TIN NHẮN LIÊN HỆ NÀO</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 leading-relaxed">
            Mọi bài gửi từ hộp thư trang chủ hoặc trang Liên hệ sẽ hiển thị tức khắc tại danh sách này.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((sub) => (
            <div key={sub.id} className="bg-black border border-white/5 p-5 text-left relative hover:border-gold-dark/30 transition-all">
              
              <button
                onClick={() => {
                  if (window.confirm("Xóa tin nhắn liên hệ này?")) {
                    deleteSubmission(sub.id);
                  }
                }}
                className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                title="Xóa yêu cầu"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[9px] font-mono text-gray-500 font-bold">#{sub.id}</span>
                <span className="text-xs font-display font-black text-white uppercase tracking-wider">{sub.fullname}</span>
                <span className={`text-[9.5px] font-mono border px-2 py-0.5 uppercase font-bold tracking-wider ${getBadgeClass(sub.inquiryType)}`}>
                  {translateInquiry(sub.inquiryType)}
                </span>
                <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1.5 ml-auto mr-8"><Calendar className="w-3.5 h-3.5" />{sub.date || "Hôm nay"}</span>
              </div>

              {/* Contact meta parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-gray-400 bg-white/5 p-3 mt-3 border border-white/5">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gold-dark shrink-0" />
                  <span>Điện thoại: </span>
                  <a href={`tel:${sub.phone}`} className="text-gold-light hover:underline font-bold font-mono text-xs">{sub.phone}</a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gold-dark shrink-0" />
                  <span>Email: </span>
                  <a href={`mailto:${sub.email}`} className="text-[#ECECEC] hover:underline font-mono text-xs">{sub.email}</a>
                </div>
              </div>

              {/* Subject & Message lines */}
              <div className="mt-4 space-y-1">
                <h4 className="text-xs font-display font-bold text-[#ECECEC] border-l-2 border-gold-dark pl-2">
                  CHỦ ĐỀ: {sub.subject}
                </h4>
                <p className="text-xs text-gray-400 pl-2 leading-relaxed whitespace-pre-wrap pt-0.5 bg-black/60 p-3 mt-1.5 border border-white/5 font-sans">
                  {sub.message || "(Khách gửi tin nhắn trống)"}
                </p>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
