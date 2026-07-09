import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, ClipboardCheck, Loader2, ShieldCheck } from "lucide-react";
import { useApp } from "../context/AppContext";
import { WarrantyRecord } from "../types";
import { getMenuBanner } from "../lib/menuBanners";
import { isMachineWarrantyStatus, warrantyIdFromSerial } from "../lib/warrantyQr";
import { doc, getDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase";

const inputClass = "w-full bg-black border border-white/10 px-3.5 py-3 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-gold-light";
const lockedInputClass = `${inputClass} cursor-not-allowed border-gold-dark/25 bg-gold-dark/5 text-gray-300`;

function formatDate(date: Date) {
  return date.toLocaleDateString("vi-VN");
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateInputToVi(dateText: string) {
  const parts = dateText.split("-");
  if (parts.length !== 3) return dateText;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function addMonths(dateText: string, months: number) {
  const parts = dateText.split("/");
  if (parts.length !== 3) return "";
  const date = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  date.setMonth(date.getMonth() + months);
  return formatDate(date);
}

function getProductCodeFromSerial(serial: string) {
  const parts = serial.trim().toUpperCase().split("-").filter(Boolean);
  if (parts.length < 3) return "";
  return parts.slice(0, -2).join("-");
}

export default function WarrantyActivation() {
  const { warranties, addWarranty, updateWarranty, showToast, menuItems } = useApp();
  const bannerImage = getMenuBanner(menuItems, "/bao-hanh", "/images/bao-hanh.webp");
  const [loading, setLoading] = useState(false);
  const [checkingSerial, setCheckingSerial] = useState(false);
  const [successSerial, setSuccessSerial] = useState("");
  const [serialFromQr, setSerialFromQr] = useState(false);
  const [remoteWarranty, setRemoteWarranty] = useState<WarrantyRecord | null>(null);
  const [form, setForm] = useState({
    serial: "",
    productCode: "",
    productName: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    dealerName: "",
    purchaseDate: formatDateInput(new Date()),
    termMonths: 12,
  });

  const normalizedSerial = form.serial.trim().toUpperCase();
  const existingWarranty = useMemo(() => {
    if (remoteWarranty) return remoteWarranty;
    if (!normalizedSerial) return null;
    return warranties.find(item => item.serial.trim().toUpperCase() === normalizedSerial) || null;
  }, [normalizedSerial, remoteWarranty, warranties]);
  const lockQrFields = serialFromQr && Boolean(form.serial);
  const lockIdentityFields = !serialFromQr || lockQrFields;
  const warrantyStatus = existingWarranty?.status || "";
  const warrantyStatusMessage = warrantyStatus === "activated"
    ? "Sản phẩm này đã được kích hoạt bảo hành. Vui lòng tra cứu bảo hành hoặc liên hệ Voltara để được hỗ trợ."
    : warrantyStatus === "pending"
      ? "Serial này đã gửi yêu cầu kích hoạt và đang chờ Voltara duyệt."
      : warrantyStatus === "rejected"
        ? "Serial này đã bị từ chối kích hoạt. Vui lòng liên hệ Voltara để được hỗ trợ."
        : "";
  const blockSubmit = checkingSerial || !serialFromQr || Boolean(warrantyStatusMessage) || !existingWarranty;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const serial = params.get("serial");
    const productCode = params.get("productCode");
    const productName = params.get("productName");
    if (!serial) return;
    const nextSerial = serial.trim().toUpperCase();
    setSerialFromQr(true);
    setForm(prev => ({
      ...prev,
      serial: nextSerial,
      productCode: productCode?.trim().toUpperCase() || prev.productCode || getProductCodeFromSerial(nextSerial),
      productName: productName?.trim() || prev.productName,
    }));
  }, []);

  useEffect(() => {
    if (!serialFromQr || !normalizedSerial || !isFirebaseConfigured) return;

    setCheckingSerial(true);
    getDoc(doc(db, "warranties", warrantyIdFromSerial(normalizedSerial)))
      .then((snapshot) => {
        setRemoteWarranty(snapshot.exists() ? snapshot.data() as WarrantyRecord : null);
      })
      .catch((error) => {
        console.error("Could not check warranty serial:", error);
        showToast("Không kiểm tra được serial bảo hành. Vui lòng thử lại sau.", "error");
      })
      .finally(() => setCheckingSerial(false));
  }, [normalizedSerial, serialFromQr, showToast]);

  useEffect(() => {
    if (!existingWarranty) return;
    setForm(prev => ({
      ...prev,
      productCode: prev.productCode || existingWarranty.productCode || getProductCodeFromSerial(existingWarranty.serial),
      productName: prev.productName || existingWarranty.productName || "",
      termMonths: Number(existingWarranty.warrantyMonths || existingWarranty.termMonths || prev.termMonths),
    }));
  }, [existingWarranty]);

  const updateField = (field: keyof typeof form, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const updateSerial = (value: string) => {
    const nextSerial = value.toUpperCase();
    setForm(prev => ({
      ...prev,
      serial: nextSerial,
      productCode: !prev.productCode || prev.productCode === getProductCodeFromSerial(prev.serial)
        ? getProductCodeFromSerial(nextSerial)
        : prev.productCode,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!normalizedSerial || !form.productName.trim() || !form.customerName.trim() || !form.customerPhone.trim()) {
      showToast("Vui lòng nhập đủ Serial, sản phẩm, họ tên và số điện thoại.", "warning");
      return;
    }

    if (!serialFromQr) {
      showToast("Vui lòng quét mã QR trên tem bảo hành để kích hoạt sản phẩm.", "warning");
      return;
    }

    if (!existingWarranty) {
      showToast("Serial QR này chưa được Voltara phát hành hoặc chưa có trong hệ thống. Vui lòng liên hệ Voltara để được hỗ trợ.", "error");
      return;
    }

    if (existingWarranty?.status === "activated") {
      showToast(warrantyStatusMessage, "warning");
      return;
    }

    if (existingWarranty?.status === "pending") {
      showToast(warrantyStatusMessage, "warning");
      return;
    }

    if (existingWarranty?.status === "rejected") {
      showToast(warrantyStatusMessage, "warning");
      return;
    }

    if (existingWarranty && !isMachineWarrantyStatus(existingWarranty.status)) {
      showToast("Serial này đã có hồ sơ bảo hành trên hệ thống.", "warning");
      return;
    }

    setLoading(true);
    const today = formatDate(new Date());
    const payload: WarrantyRecord = {
      ...(existingWarranty || {}),
      id: existingWarranty?.id || warrantyIdFromSerial(normalizedSerial),
      serial: normalizedSerial,
      productCode: form.productCode.trim().toUpperCase() || existingWarranty?.productCode || getProductCodeFromSerial(normalizedSerial),
      productName: form.productName.trim(),
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone.trim(),
      customerEmail: form.customerEmail.trim(),
      dealerName: form.dealerName.trim(),
      purchasePlace: form.dealerName.trim(),
      purchaseDate: formatDateInputToVi(form.purchaseDate),
      activatedAt: new Date().toISOString(),
      activatedDate: today,
      termMonths: Number(form.termMonths),
      warrantyMonths: Number(form.termMonths),
      expiryDate: addMonths(today, Number(form.termMonths)) || "Chờ xác nhận",
      status: "pending",
      specNotes: "Khách tự kích hoạt bảo hành điện tử. Chờ quản trị viên đối chiếu thông tin mua hàng.",
      activationSource: "customer",
    };

    if (existingWarranty) {
      updateWarranty(payload);
    } else {
      addWarranty(payload);
    }
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
          <div className={`border p-3 text-xs leading-relaxed ${!serialFromQr || warrantyStatusMessage || !existingWarranty ? "border-red-500/25 bg-red-500/5 text-red-200" : "border-gold-dark/25 bg-gold-dark/5 text-gray-300"}`}>
            {checkingSerial
              ? "Đang kiểm tra serial QR trên hệ thống..."
              : !serialFromQr
              ? "Vui lòng quét mã QR trên tem bảo hành để kích hoạt. Hệ thống không nhận kích hoạt bằng cách nhập serial thủ công."
              : warrantyStatusMessage || (!existingWarranty
                ? "Serial QR này chưa được Voltara phát hành hoặc chưa có trong hệ thống. Vui lòng liên hệ Voltara để được hỗ trợ."
                : "Thông tin tem QR đã được khóa theo serial phát hành. Quý khách chỉ cần nhập thông tin mua hàng để gửi kích hoạt.")}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Serial / SN sản phẩm *">
              <input value={form.serial} onChange={(e) => updateSerial(e.target.value)} readOnly={lockIdentityFields} required className={`${lockIdentityFields ? lockedInputClass : inputClass} uppercase font-mono`} placeholder="VD: VOLTARA-48V-20AH-0001" />
            </Field>
            <Field label="Mã sản phẩm">
              <input value={form.productCode} onChange={(e) => updateField("productCode", e.target.value.toUpperCase())} readOnly={lockIdentityFields} className={`${lockIdentityFields ? lockedInputClass : inputClass} uppercase font-mono`} placeholder="VD: VT-IW300" />
            </Field>
            <Field label="Tên sản phẩm *">
              <input value={form.productName} onChange={(e) => updateField("productName", e.target.value)} readOnly={lockIdentityFields} required className={lockIdentityFields ? lockedInputClass : inputClass} placeholder="VD: Bộ Pin Xe Điện Lithium 48V 20Ah" />
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
              <input type="date" value={form.purchaseDate} onChange={(e) => updateField("purchaseDate", e.target.value)} className={`${inputClass} font-mono`} />
            </Field>
            <Field label="Thời hạn bảo hành">
              <select value={form.termMonths} onChange={(e) => updateField("termMonths", Number(e.target.value))} disabled={lockIdentityFields} className={lockIdentityFields ? lockedInputClass : inputClass}>
                <option value={6}>6 tháng</option>
                <option value={12}>12 tháng</option>
                <option value={18}>18 tháng</option>
                <option value={24}>24 tháng</option>
                <option value={36}>36 tháng</option>
              </select>
            </Field>
          </div>

          <button disabled={loading || blockSubmit} type="submit" className="gold-gradient-bg inline-flex h-12 w-full items-center justify-center gap-2 text-[11px] font-display font-black uppercase tracking-widest text-black hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
            {loading || checkingSerial ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-4 w-4" />}
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
