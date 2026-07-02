import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Check, ClipboardCheck, Loader2, ShieldCheck } from "lucide-react";
import { useApp } from "../context/AppContext";
import { WarrantyRecord } from "../types";
import { getMenuBanner } from "../lib/menuBanners";

const inputClass = "w-full bg-black border border-white/10 px-3.5 py-3 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-gold-light";

function warrantyIdFromSerial(serial: string) {
  return `warranty-${serial.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase()}`;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("vi-VN");
}

function addMonths(dateText: string, months: number) {
  const parts = dateText.split("/");
  if (parts.length !== 3) return "";
  const date = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  date.setMonth(date.getMonth() + months);
  return formatDate(date);
}

export default function WarrantyActivation() {
  const { warranties, addWarranty, showToast, menuItems } = useApp();
  const bannerImage = getMenuBanner(menuItems, "/bao-hanh", "/images/bao-hanh.webp");
  const [loading, setLoading] = useState(false);
  const [successSerial, setSuccessSerial] = useState("");
  const [form, setForm] = useState({
    serial: "",
    productName: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    dealerName: "",
    purchaseDate: formatDate(new Date()),
    termMonths: 12,
  });

  const updateField = (field: keyof typeof form, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedSerial = form.serial.trim().toUpperCase();
    if (!normalizedSerial || !form.productName.trim() || !form.customerName.trim() || !form.customerPhone.trim()) {
      showToast("Vui lòng nhập đủ Serial, sản phẩm, họ tên và số điện thoại.", "warning");
      return;
    }

    const exists = warranties.some(item => item.serial.trim().toUpperCase() === normalizedSerial);
    if (exists) {
      showToast("Serial này đã có hồ sơ bảo hành trên hệ thống.", "warning");
      return;
    }

    setLoading(true);
    const today = formatDate(new Date());
    const payload: WarrantyRecord = {
      id: warrantyIdFromSerial(normalizedSerial),
      serial: normalizedSerial,
      productName: form.productName.trim(),
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone.trim(),
      customerEmail: form.customerEmail.trim(),
      dealerName: form.dealerName.trim(),
      purchaseDate: form.purchaseDate,
      activatedDate: today,
      termMonths: Number(form.termMonths),
      expiryDate: addMonths(today, Number(form.termMonths)) || "Chờ xác nhận",
      status: "Chờ admin duyệt",
      specNotes: "Khách tự kích hoạt bảo hành điện tử. Chờ quản trị viên đối chiếu thông tin mua hàng.",
      activationSource: "customer",
    };

    addWarranty(payload);
    setSuccessSerial(normalizedSerial);
    setLoading(false);
    showToast("Đã gửi yêu cầu kích hoạt bảo hành. Admin sẽ kiểm tra và duyệt.", "success");
  };

  return (
    <div className="min-h-screen bg-[#050505] pb-20 text-[#ECECEC]">
      <section className="relative overflow-hidden bg-black pt-28 pb-14">
        <div className="absolute inset-0 opacity-40">
          <img src={bannerImage} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/60" />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center gap-2 text-[11px] font-mono text-gray-500">
            <Link to="/" className="hover:text-gold-light">Trang chủ</Link>
            <span>/</span>
            <Link to="/bao-hanh" className="hover:text-gold-light">Bảo hành</Link>
            <span>/</span>
            <span className="text-gold-light">Kích hoạt</span>
          </div>
          <div className="inline-flex items-center gap-2 border border-gold-dark/30 bg-gold-dark/10 px-3 py-1 text-[10px] font-display font-bold uppercase tracking-widest text-gold-light">
            <ShieldCheck className="h-4 w-4" />
            Bảo hành điện tử
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-black uppercase leading-tight text-white sm:text-4xl">
            Kích hoạt bảo hành Voltara
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-300">
            Nhập thông tin mua hàng để gửi yêu cầu kích hoạt bảo hành điện tử. Hồ sơ sẽ được lưu vào hệ thống và chờ quản trị viên xác nhận.
          </p>
        </div>
      </section>

      <main className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 pt-10 sm:px-6 lg:grid-cols-12 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-5 border border-gold-dark/25 bg-[#0B0B0B] p-5 sm:p-6 lg:col-span-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Serial / SN sản phẩm *">
              <input value={form.serial} onChange={(e) => updateField("serial", e.target.value)} required className={`${inputClass} uppercase font-mono`} placeholder="VD: VOLTARA-48V-20AH-0001" />
            </Field>
            <Field label="Tên sản phẩm *">
              <input value={form.productName} onChange={(e) => updateField("productName", e.target.value)} required className={inputClass} placeholder="VD: Bộ Pin Xe Điện Lithium 48V 20Ah" />
            </Field>
            <Field label="Họ tên khách hàng *">
              <input value={form.customerName} onChange={(e) => updateField("customerName", e.target.value)} required className={inputClass} placeholder="Nguyễn Văn A" />
            </Field>
            <Field label="Số điện thoại / Zalo *">
              <input value={form.customerPhone} onChange={(e) => updateField("customerPhone", e.target.value)} required className={inputClass} placeholder="0912345678" />
            </Field>
            <Field label="Email">
              <input type="email" value={form.customerEmail} onChange={(e) => updateField("customerEmail", e.target.value)} className={inputClass} placeholder="email@gmail.com" />
            </Field>
            <Field label="Đại lý / nơi mua hàng">
              <input value={form.dealerName} onChange={(e) => updateField("dealerName", e.target.value)} className={inputClass} placeholder="Tên đại lý hoặc sàn TMĐT" />
            </Field>
            <Field label="Ngày mua hàng">
              <input value={form.purchaseDate} onChange={(e) => updateField("purchaseDate", e.target.value)} className={`${inputClass} font-mono`} placeholder="DD/MM/YYYY" />
            </Field>
            <Field label="Thời hạn bảo hành">
              <select value={form.termMonths} onChange={(e) => updateField("termMonths", Number(e.target.value))} className={inputClass}>
                <option value={12}>12 tháng</option>
                <option value={18}>18 tháng</option>
                <option value={24}>24 tháng</option>
                <option value={36}>36 tháng</option>
              </select>
            </Field>
          </div>

          <button disabled={loading} type="submit" className="gold-gradient-bg inline-flex h-12 w-full items-center justify-center gap-2 text-[11px] font-display font-black uppercase tracking-widest text-black hover:opacity-90 disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-4 w-4" />}
            Gửi kích hoạt bảo hành
          </button>
        </form>

        <aside className="space-y-4 lg:col-span-4">
          {successSerial ? (
            <div className="border border-emerald-500/20 bg-emerald-500/5 p-5">
              <Check className="mb-3 h-8 w-8 text-emerald-400" />
              <h2 className="font-display text-sm font-black uppercase tracking-widest text-white">Đã ghi nhận</h2>
              <p className="mt-2 text-xs leading-relaxed text-gray-300">
                Serial <span className="font-mono text-gold-light">{successSerial}</span> đã được gửi vào hệ thống ở trạng thái chờ duyệt.
              </p>
            </div>
          ) : (
            <div className="border border-white/10 bg-[#101010] p-5">
              <h2 className="font-display text-sm font-black uppercase tracking-widest text-white">Lưu ý</h2>
              <p className="mt-2 text-xs leading-relaxed text-gray-400">
                Serial đã kích hoạt sẽ không thể gửi lại. Nếu nhập sai, vui lòng liên hệ hotline hoặc đại lý để được hỗ trợ chỉnh hồ sơ.
              </p>
            </div>
          )}
          <Link to="/bao-hanh" className="inline-flex w-full items-center justify-center border border-white/10 px-4 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-gray-300 hover:border-gold-light hover:text-gold-light">
            Tra cứu bảo hành
          </Link>
        </aside>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5">
      <span className="block text-[9px] font-display font-bold uppercase tracking-widest text-gray-500">{label}</span>
      {children}
    </label>
  );
}
