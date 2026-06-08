import React from "react";
import { Calendar, Mail, Trash2 } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function NewsletterAdmin() {
  const { newsletterSubscribers, deleteNewsletterSubscriber, showToast } = useApp();

  const handleDelete = async (email: string) => {
    if (!window.confirm(`Xóa email "${email}" khỏi danh sách nhận tin?`)) return;

    try {
      await deleteNewsletterSubscriber(email);
      showToast("Đã xóa email khỏi danh sách nhận tin.", "info");
    } catch (error) {
      console.error("Could not delete newsletter subscriber:", error);
      showToast("Không xóa được email nhận tin.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-display font-semibold tracking-wide text-white uppercase flex items-center gap-2 text-gold-light">
            <Mail className="w-5 h-5" />
            Danh sách nhận tin ({newsletterSubscribers.length})
          </h2>
          <p className="text-xs text-gray-400">
            Email khách đăng ký ở footer website để nhận thông tin sản phẩm mới, ưu đãi và nội dung marketing.
          </p>
        </div>
      </div>

      {newsletterSubscribers.length === 0 ? (
        <div className="border border-white/5 bg-black/40 text-center py-16">
          <Mail className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <h3 className="text-sm font-display font-bold text-gray-400 uppercase">
            Chưa có email đăng ký nhận tin
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 leading-relaxed">
            Khi khách nhập email ở footer, danh sách sẽ hiện tại đây.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {newsletterSubscribers.map((subscriber) => (
            <div
              key={subscriber.id || subscriber.email}
              className="bg-black border border-white/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-gold-dark/30 transition-colors"
            >
              <div className="space-y-1">
                <a
                  href={`mailto:${subscriber.email}`}
                  className="text-sm font-mono text-white hover:text-gold-light transition-colors"
                >
                  {subscriber.email}
                </a>
                <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-500 uppercase tracking-wider">
                  <span>Nguồn: {subscriber.source || "footer"}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {subscriber.date ? new Date(subscriber.date).toLocaleString("vi-VN") : "Chưa rõ ngày"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(subscriber.email)}
                className="self-start sm:self-center inline-flex items-center gap-1.5 border border-white/10 px-3 py-2 text-[10px] font-display font-bold uppercase tracking-widest text-gray-400 hover:border-red-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Xóa
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
