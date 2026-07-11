import React, { useMemo, useState } from "react";
import { Percent, Save, Search, Trash2 } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Product } from "../../types";

const parsePrice = (value?: string) => Number(String(value || "").replace(/[^0-9]/g, "")) || 0;
const formatPrice = (value: number) => value ? new Intl.NumberFormat("vi-VN").format(value) + "đ" : "Liên hệ";
const retailPrice = (product: Product) => parsePrice(product.retailPrice || product.salePrice || product.price);

type PriceDraft = Pick<Product, "dealerLevel1Price" | "dealerLevel2Price" | "dealerLevel1DiscountPercent" | "dealerLevel2DiscountPercent">;

export default function DealerPricingAdmin() {
  const { products, dealerPricingSettings, updateDealerPricingSettings, updateProduct, showToast } = useApp();
  const [query, setQuery] = useState("");
  const [level2, setLevel2] = useState(dealerPricingSettings.level2DiscountPercent);
  const [level1, setLevel1] = useState(dealerPricingSettings.level1DiscountPercent);
  const [drafts, setDrafts] = useState<Record<string, PriceDraft>>({});
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return products.filter((product) => !normalized || `${product.name} ${product.id} ${product.sku || ""}`.toLowerCase().includes(normalized));
  }, [products, query]);

  const draftFor = (product: Product): PriceDraft => drafts[product.id] || {
    dealerLevel1Price: product.dealerLevel1Price || "",
    dealerLevel2Price: product.dealerLevel2Price || "",
    dealerLevel1DiscountPercent: product.dealerLevel1DiscountPercent,
    dealerLevel2DiscountPercent: product.dealerLevel2DiscountPercent ?? product.dealerDiscountPercent,
  };

  const changeDraft = (product: Product, patch: Partial<PriceDraft>) => setDrafts((current) => ({
    ...current,
    [product.id]: { ...draftFor(product), ...patch },
  }));

  const saveGlobal = async () => {
    setSaving(true);
    try {
      if (level1 <= level2) {
        showToast("Chiết khấu cấp 1 phải cao hơn chiết khấu cấp 2.", "warning");
        return;
      }
      await updateDealerPricingSettings({ level2DiscountPercent: level2, level1DiscountPercent: level1 });
      showToast("Đã lưu chính sách giá đại lý chung.", "success");
    } catch {
      showToast("Không thể lưu chính sách giá đại lý.", "error");
    } finally { setSaving(false); }
  };

  const saveProduct = async (product: Product) => {
    const draft = draftFor(product);
    const level1Price = parsePrice(draft.dealerLevel1Price);
    const level2Price = parsePrice(draft.dealerLevel2Price);
    if (level1Price && level2Price && level1Price >= level2Price) {
      showToast("Giá đại lý cấp 1 phải thấp hơn giá đại lý cấp 2.", "warning");
      return;
    }
    const discount1 = draft.dealerLevel1DiscountPercent;
    const discount2 = draft.dealerLevel2DiscountPercent;
    if (discount1 !== undefined && discount2 !== undefined && discount1 <= discount2) {
      showToast("Chiết khấu riêng cấp 1 phải cao hơn cấp 2.", "warning");
      return;
    }
    await updateProduct({ ...product, ...draft });
    setDrafts((current) => { const next = { ...current }; delete next[product.id]; return next; });
    showToast(`Đã lưu giá riêng cho ${product.sku || product.id}.`, "success");
  };

  const clearProduct = async (product: Product) => {
    await updateProduct({ ...product, dealerLevel1Price: "", dealerLevel2Price: "", dealerDiscountPercent: undefined, dealerLevel1DiscountPercent: undefined, dealerLevel2DiscountPercent: undefined });
    setDrafts((current) => { const next = { ...current }; delete next[product.id]; return next; });
    showToast("Đã xóa giá riêng, sản phẩm sẽ dùng mức chung.", "success");
  };

  return <div className="space-y-6">
    <div>
      <h2 className="flex items-center gap-2 font-display text-lg font-black uppercase text-gold-light"><Percent className="h-5 w-5" /> Giá đại lý</h2>
      <p className="mt-1 text-xs text-gray-400">Cấp 1 nhập trực tiếp từ NSX nên có chiết khấu cao hơn và giá thấp hơn cấp 2.</p>
    </div>

    <section className="border border-gold-dark/25 bg-black p-5">
      <div className="mb-4"><h3 className="text-sm font-black uppercase text-white">Mức giá chung</h3><p className="mt-1 text-[11px] text-gray-500">Chỉ lưu 1 cấu hình, không ghi lại toàn bộ sản phẩm.</p></div>
      <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <label className="space-y-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">Chiết khấu đại lý cấp 2 (%)
          <input type="number" min="20" max="35" value={level2} onChange={(e) => setLevel2(Number(e.target.value))} className="w-full border border-white/10 bg-[#0b0b0b] px-4 py-3 text-base font-black text-white outline-none focus:border-gold-light" />
        </label>
        <label className="space-y-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">Chiết khấu đại lý cấp 1 (% giá bán lẻ)
          <input type="number" min="0" max="90" value={level1} onChange={(e) => setLevel1(Number(e.target.value))} className="w-full border border-white/10 bg-[#0b0b0b] px-4 py-3 text-base font-black text-white outline-none focus:border-gold-light" />
        </label>
        <button onClick={saveGlobal} disabled={saving} className="flex items-center justify-center gap-2 bg-gold-light px-6 py-3 text-xs font-black uppercase text-black disabled:opacity-50"><Save className="h-4 w-4" /> Lưu mức chung</button>
      </div>
      <p className="mt-4 text-[10px] font-bold uppercase text-gray-500">Ví dụ trực tiếp trên giá bán lẻ 1.000.000đ</p><div className="mt-2 grid gap-2 text-xs sm:grid-cols-2"><div className="border border-white/10 bg-[#0b0b0b] p-3 text-gray-400">Cấp 2 — giảm trực tiếp {level2}% giá bán: <b className="text-gold-light">{formatPrice(1000000 * (1 - level2 / 100))}</b></div><div className="border border-emerald-500/20 bg-emerald-500/5 p-3 text-gray-400">Cấp 1 — giảm trực tiếp {level1}% giá bán: <b className="text-emerald-400">{formatPrice(1000000 * (1 - level1 / 100))}</b></div></div>
    </section>

    <section className="border border-white/10 bg-black">
      <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-sm font-black uppercase">Giá riêng theo sản phẩm</h3><p className="mt-1 text-[10px] text-gray-500">Nhập SKU/mã/tên, sửa đúng một dòng rồi lưu.</p></div><label className="flex min-w-[320px] items-center gap-2 border border-white/10 bg-[#0b0b0b] px-3 py-2"><Search className="h-4 w-4 text-gray-500" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nhập SKU hoặc mã sản phẩm..." className="w-full bg-transparent text-xs outline-none" /></label></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[1120px] text-left text-xs"><thead className="bg-[#111] text-[9px] uppercase tracking-wider text-gray-500"><tr><th className="p-3">Sản phẩm</th><th className="p-3">Giá bán lẻ</th><th className="p-3">CK cấp 2 (% giá bán)</th><th className="p-3">CK cấp 1 (% giá bán)</th><th className="p-3">Giá cấp 2 riêng</th><th className="p-3">Giá cấp 1 riêng</th><th className="p-3">Giá áp dụng</th><th className="p-3">Thao tác</th></tr></thead><tbody>
        {filtered.map((product) => { const draft = draftFor(product); const retail = retailPrice(product); const discount2 = draft.dealerLevel2DiscountPercent ?? level2; const discount1 = draft.dealerLevel1DiscountPercent ?? level1; const c2 = parsePrice(draft.dealerLevel2Price) || Math.round(retail * (1 - discount2 / 100)); const c1 = parsePrice(draft.dealerLevel1Price) || Math.round(retail * (1 - discount1 / 100)); const hasOverride = Boolean(product.dealerLevel1Price || product.dealerLevel2Price || product.dealerLevel1DiscountPercent !== undefined || product.dealerLevel2DiscountPercent !== undefined || product.dealerDiscountPercent !== undefined); return <tr key={product.id} className="border-t border-white/5 hover:bg-white/[.02]"><td className="p-3"><div className="flex items-center gap-3"><img src={product.image} alt="" className="h-11 w-11 bg-white object-contain" /><div className="max-w-56"><b className="line-clamp-1 text-white">{product.name}</b><span className="mt-1 block font-mono text-[10px] text-gold-light">{product.sku || product.id}</span></div></div></td><td className="p-3 font-bold">{formatPrice(retail)}</td><td className="p-3"><input type="number" min="0" max="90" value={draft.dealerLevel2DiscountPercent ?? ""} onChange={(e) => changeDraft(product, { dealerLevel2DiscountPercent: e.target.value === "" ? undefined : Number(e.target.value) })} placeholder={`${level2}% chung`} className="w-28 border border-white/10 bg-[#0b0b0b] px-3 py-2 outline-none focus:border-gold-light" /></td><td className="p-3"><input type="number" min="0" max="90" value={draft.dealerLevel1DiscountPercent ?? ""} onChange={(e) => changeDraft(product, { dealerLevel1DiscountPercent: e.target.value === "" ? undefined : Number(e.target.value) })} placeholder={`${level1}% chung`} className="w-28 border border-white/10 bg-[#0b0b0b] px-3 py-2 outline-none focus:border-gold-light" /></td><td className="p-3"><input value={draft.dealerLevel2Price || ""} onChange={(e) => changeDraft(product, { dealerLevel2Price: e.target.value })} placeholder={formatPrice(c2)} className="w-32 border border-white/10 bg-[#0b0b0b] px-3 py-2 outline-none focus:border-gold-light" /></td><td className="p-3"><input value={draft.dealerLevel1Price || ""} onChange={(e) => changeDraft(product, { dealerLevel1Price: e.target.value })} placeholder={formatPrice(c1)} className="w-32 border border-white/10 bg-[#0b0b0b] px-3 py-2 outline-none focus:border-gold-light" /></td><td className="p-3"><div>C2 ({discount2}%): <b className="text-gold-light">{formatPrice(c2)}</b></div><div className="mt-1">C1 ({discount1}%): <b className="text-emerald-400">{formatPrice(c1)}</b></div><span className={`mt-1 inline-block text-[9px] uppercase ${hasOverride ? "text-emerald-400" : "text-gray-600"}`}>{hasOverride ? "Đang dùng giá riêng" : "Theo mức chung"}</span></td><td className="p-3"><div className="flex gap-2"><button onClick={() => saveProduct(product)} disabled={!drafts[product.id]} className="flex items-center gap-1 border border-gold-dark/40 px-3 py-2 text-[10px] font-bold uppercase text-gold-light disabled:opacity-30"><Save className="h-3.5 w-3.5" /> Lưu</button>{hasOverride && <button title="Xóa giá riêng" onClick={() => clearProduct(product)} className="border border-red-500/20 p-2 text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>}</div></td></tr>; })}
      </tbody></table>{filtered.length === 0 && <p className="p-10 text-center text-xs text-gray-500">Không tìm thấy sản phẩm.</p>}</div>
    </section>
  </div>;
}
