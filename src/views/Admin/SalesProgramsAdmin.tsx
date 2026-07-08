import React, { useMemo, useState } from "react";
import { ChevronRight, Gift, Loader2, Plus, Search, Trash2, Upload } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Product, ProductCombo, ProductComboItem, SalesProgram, SalesProgramType } from "../../types";
import { isCloudinaryConfigured, uploadImageToCloudinary } from "../../lib/cloudinary";

const programTabs: Array<{ id: SalesProgramType; label: string; note: string }> = [
  { id: "combo", label: "Combo", note: "Ghép sản phẩm, tự tính giá gốc và đặt giá ưu đãi." },
  { id: "flash-sale", label: "Flash sale", note: "Khung sẵn cho giảm giá theo thời gian." },
  { id: "buy-x-get-y", label: "Mua X tặng Y", note: "Khung sẵn cho quà tặng theo điều kiện mua." },
  { id: "quantity-discount", label: "Giảm theo số lượng", note: "Khung sẵn cho bậc giá theo số lượng." },
];

const createBlankProgram = (): SalesProgram => ({
  id: `program-${Date.now()}`,
  type: "combo",
  name: "",
  primaryProductId: "",
  items: [],
  originalPrice: "",
  promoPrice: "",
  description: "",
  sku: "",
  image: "",
  startsAt: "",
  endsAt: "",
  hidden: false,
});

export default function SalesProgramsAdmin() {
  const { products, salesPrograms, addSalesProgram, updateSalesProgram, deleteSalesProgram, showToast } = useApp();
  const [activeType, setActiveType] = useState<SalesProgramType>("combo");
  const [form, setForm] = useState<SalesProgram>(createBlankProgram());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [productQuery, setProductQuery] = useState("");
  const [uploading, setUploading] = useState(false);

  const filteredPrograms = useMemo(
    () => salesPrograms.filter((program) => program.type === activeType),
    [activeType, salesPrograms],
  );

  const suggestions = useMemo(() => {
    const query = productQuery.trim().toLowerCase();
    if (!query) return [];
    return products
      .filter((product) =>
        product.id.toLowerCase().includes(query) ||
        product.name.toLowerCase().includes(query) ||
        (product.sku || "").toLowerCase().includes(query)
      )
      .slice(0, 8);
  }, [productQuery, products]);

  const resetForm = () => {
    setForm({ ...createBlankProgram(), type: activeType });
    setEditingId(null);
    setProductQuery("");
    setIsFormOpen(true);
  };

  const formatDateTimeInput = (date: Date) => {
    const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return offsetDate.toISOString().slice(0, 16);
  };

  const setQuickSchedule = (days: number | null) => {
    const now = new Date();
    const nextStartsAt = form.startsAt || formatDateTimeInput(now);
    const nextEndsAt = days
      ? formatDateTimeInput(new Date(now.getTime() + days * 24 * 60 * 60 * 1000))
      : "";
    setForm((prev) => ({
      ...prev,
      startsAt: nextStartsAt,
      endsAt: nextEndsAt,
    }));
  };

  const getProductPriceValue = (productId: string) => parsePrice(products.find((product) => product.id === productId)?.salePrice || products.find((product) => product.id === productId)?.price);
  const calculateOriginalPrice = (items: ProductComboItem[] = []) =>
    items.reduce((total, item) => total + getProductPriceValue(item.productId) * Math.max(1, Number(item.quantity || 1)), 0);

  const updateItems = (items: ProductComboItem[]) => {
    setForm((prev) => ({
      ...prev,
      items,
      primaryProductId: prev.primaryProductId || items[0]?.productId || "",
      originalPrice: String(calculateOriginalPrice(items) || ""),
    }));
  };

  const addProductToProgram = (productId: string) => {
    const id = productId.trim();
    const product = products.find((item) => item.id === id);
    if (!product) {
      showToast("Không tìm thấy sản phẩm theo ID đã nhập.", "warning");
      return;
    }

    const currentItems = form.items || [];
    const nextItems = currentItems.some((item) => item.productId === id)
      ? currentItems.map((item) => item.productId === id ? { ...item, quantity: Math.max(1, Number(item.quantity || 1)) + 1 } : item)
      : [...currentItems, { productId: id, quantity: 1 }];

    updateItems(nextItems);
    setForm((prev) => ({
      ...prev,
      name: prev.name || `Combo ${product.name}`,
      primaryProductId: prev.primaryProductId || id,
    }));
    setProductQuery("");
  };

  const updateItemQuantity = (productId: string, quantity: number) => {
    updateItems((form.items || []).map((item) =>
      item.productId === productId ? { ...item, quantity: Math.max(1, Math.floor(quantity || 1)) } : item
    ));
  };

  const removeItem = (productId: string) => {
    updateItems((form.items || []).filter((item) => item.productId !== productId));
  };

  const handleEdit = (program: SalesProgram) => {
    setForm({
      ...program,
      items: program.items || [],
      hidden: program.hidden ?? false,
    });
    setEditingId(program.id);
    setIsFormOpen(true);
    setActiveType(program.type);
    setProductQuery("");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (activeType !== "combo") {
      showToast("Loại chương trình này sẽ được mở rộng ở bước sau.", "info");
      return;
    }
    if (!form.name.trim()) {
      showToast("Vui lòng nhập tên chương trình.", "warning");
      return;
    }
    if (!(form.items || []).length) {
      showToast("Vui lòng thêm ít nhất một sản phẩm vào combo.", "warning");
      return;
    }

    const nextProgram: SalesProgram = {
      ...form,
      type: activeType,
      name: form.name.trim(),
      primaryProductId: form.primaryProductId || form.items?.[0]?.productId || "",
      originalPrice: String(calculateOriginalPrice(form.items || []) || form.originalPrice || ""),
      updatedAt: new Date().toISOString(),
    };

    if (editingId) {
      updateSalesProgram(nextProgram);
      showToast("Đã cập nhật chương trình bán hàng.", "success");
    } else {
      addSalesProgram(nextProgram);
      showToast("Đã tạo chương trình bán hàng.", "success");
    }
    resetForm();
  };

  const handleUploadImage = async (files: FileList | null) => {
    if (!files?.length) return;
    if (!isCloudinaryConfigured()) {
      showToast("Chưa cấu hình Cloudinary để tải ảnh.", "warning");
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImageToCloudinary(files[0]);
      setForm((prev) => ({ ...prev, image: url }));
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể tải ảnh combo.", "error");
    } finally {
      setUploading(false);
    }
  };

  const getProgramStatus = (program: SalesProgram) => {
    if (program.hidden) return "Đang ẩn";
    const now = Date.now();
    const startsAt = program.startsAt ? new Date(program.startsAt).getTime() : 0;
    const endsAt = program.endsAt ? new Date(program.endsAt).getTime() : 0;
    if (startsAt && startsAt > now) return "Sắp chạy";
    if (endsAt && endsAt < now) return "Hết hạn";
    return "Đang chạy";
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 border border-gold-dark/20 bg-black p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-display text-lg font-black uppercase tracking-widest text-white">Chương trình bán hàng</h2>
          <p className="mt-1 text-xs text-gray-500">Quản lý combo, flash sale, mua X tặng Y và giảm giá theo số lượng ở một nơi.</p>
        </div>
        <button type="button" onClick={resetForm} className="inline-flex items-center justify-center gap-2 border border-gold-dark/40 px-4 py-2.5 text-[10px] font-display font-bold uppercase tracking-widest text-gold-light hover:border-gold-light">
          <Plus className="h-3.5 w-3.5" />
          Tạo chương trình
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
        {programTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveType(tab.id);
              setForm({ ...createBlankProgram(), type: tab.id });
              setEditingId(null);
            }}
            className={`border p-3 text-left transition-colors ${activeType === tab.id ? "border-gold-light bg-gold-dark/10 text-white" : "border-white/10 bg-black text-gray-400 hover:border-gold-dark/40"}`}
          >
            <span className="block text-[11px] font-display font-black uppercase tracking-widest">{tab.label}</span>
            <span className="mt-1 block text-[10px] leading-relaxed text-gray-500">{tab.note}</span>
          </button>
        ))}
      </div>

      <div className="border border-white/10 bg-[#080808]">
        <button type="button" onClick={() => setIsFormOpen((open) => !open)} className="flex w-full items-center justify-between gap-3 p-4 text-left">
          <span>
            <span className="block font-display text-sm font-black uppercase tracking-widest text-gold-light">{editingId ? "Sửa chương trình" : "Tạo chương trình mới"}</span>
            <span className="mt-1 block text-[10px] text-gray-500">Form này tách riêng khỏi thông tin sản phẩm, hạn chế sửa nhầm ảnh/mô tả sản phẩm.</span>
          </span>
          <ChevronRight className={`h-5 w-5 text-gold-light transition-transform ${isFormOpen ? "rotate-90" : ""}`} />
        </button>

        {isFormOpen && (
          <form onSubmit={handleSubmit} className="space-y-4 border-t border-white/10 p-4">
            {activeType !== "combo" && (
              <div className="border border-amber-500/20 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-200">
                Mục này đã có khung quản lý, phần logic áp dụng chi tiết sẽ mở rộng sau. Hiện combo là loại đang hoạt động đầy đủ.
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tên chương trình / tên combo" className={inputClass("md:col-span-2")} />
              <input value={form.promoPrice || ""} onChange={(e) => setForm({ ...form, promoPrice: e.target.value })} placeholder="Giá ưu đãi / giá combo" className={inputClass()} />
              <input value={form.sku || ""} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="SKU chương trình" className={inputClass("font-mono")} />
              <input type="datetime-local" value={form.startsAt || ""} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} className={inputClass()} />
              <input type="datetime-local" value={form.endsAt || ""} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} className={inputClass()} />
              <div className="md:col-span-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => setForm({ ...form, startsAt: formatDateTimeInput(new Date()) })} className="border border-white/10 px-3 py-2 text-[10px] font-display font-bold uppercase tracking-widest text-gray-300 hover:border-gold-light hover:text-gold-light">
                  Bắt đầu ngay
                </button>
                {[7, 14, 30].map((days) => (
                  <button key={days} type="button" onClick={() => setQuickSchedule(days)} className="border border-white/10 px-3 py-2 text-[10px] font-display font-bold uppercase tracking-widest text-gray-300 hover:border-gold-light hover:text-gold-light">
                    Chạy {days} ngày
                  </button>
                ))}
                <button type="button" onClick={() => setQuickSchedule(null)} className="border border-white/10 px-3 py-2 text-[10px] font-display font-bold uppercase tracking-widest text-gray-300 hover:border-gold-light hover:text-gold-light">
                  Không giới hạn
                </button>
              </div>
              <input value={form.image || ""} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="URL ảnh chương trình" className={inputClass("md:col-span-2 font-mono")} />
              <label className="inline-flex cursor-pointer items-center justify-center gap-2 border border-gold-dark/40 px-3 py-2.5 text-[10px] font-display font-bold uppercase tracking-widest text-gold-light hover:border-gold-light">
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                {uploading ? "Đang tải..." : "Tải ảnh từ máy"}
                <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => { handleUploadImage(e.target.files); e.currentTarget.value = ""; }} />
              </label>
              <label className="inline-flex items-center gap-2 border border-white/10 bg-black px-3 py-2.5 text-[10px] font-display font-bold uppercase tracking-widest text-gray-300">
                <input type="checkbox" checked={!form.hidden} onChange={(e) => setForm({ ...form, hidden: !e.target.checked })} className="accent-[#D89A2B]" />
                Đang hiển thị
              </label>
              <textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mô tả thành phần, điều kiện áp dụng..." rows={2} className={inputClass("md:col-span-4 resize-none")} />
            </div>

            <div className="border border-gold-dark/20 bg-black/60 p-3">
              <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="font-display text-[11px] font-black uppercase tracking-widest text-gold-light">Sản phẩm trong combo</h3>
                  <p className="mt-1 text-[10px] text-gray-500">Gõ ID sản phẩm hoặc tìm theo tên/SKU. Giá gốc sẽ tự cộng theo số lượng.</p>
                </div>
                <div className="font-display text-[11px] font-black uppercase tracking-widest text-gold-light">
                  Tổng giá gốc: {formatPrice(calculateOriginalPrice(form.items || []))}
                </div>
              </div>

              <div className="relative grid grid-cols-1 gap-2 lg:grid-cols-[1fr_auto]">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <input value={productQuery} onChange={(e) => setProductQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addProductToProgram(productQuery); } }} placeholder="Nhập ID sản phẩm hoặc tìm theo tên" className={inputClass("pl-9")} />
                  {suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-20 max-h-52 overflow-y-auto border border-gold-dark/30 bg-black shadow-xl">
                      {suggestions.map((product) => (
                        <button key={product.id} type="button" onClick={() => addProductToProgram(product.id)} className="flex w-full items-center justify-between gap-3 border-b border-white/5 px-3 py-2 text-left text-[10px] text-gray-300 hover:bg-gold-dark/10 hover:text-white">
                          <span className="min-w-0">
                            <span className="block truncate font-display font-bold uppercase">{product.name}</span>
                            <span className="font-mono text-gray-500">ID: {product.id}</span>
                          </span>
                          <span className="shrink-0 font-display font-black text-gold-light">{product.salePrice || product.price || "Liên hệ"}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button type="button" onClick={() => addProductToProgram(productQuery)} className="border border-gold-dark/40 px-4 py-2.5 text-[10px] font-display font-bold uppercase tracking-widest text-gold-light hover:border-gold-light">
                  Thêm mã
                </button>
              </div>

              {(form.items || []).length > 0 ? (
                <div className="mt-3 space-y-2">
                  {(form.items || []).map((item) => {
                    const product = products.find((entry) => entry.id === item.productId);
                    return (
                      <div key={item.productId} className="grid grid-cols-1 gap-2 border border-white/10 bg-[#050505] p-2 sm:grid-cols-[1fr_90px_auto] sm:items-center">
                        <div className="min-w-0 text-[10px]">
                          <div className="truncate font-display font-bold uppercase text-white">{product?.name || "Sản phẩm không còn tồn tại"}</div>
                          <div className="font-mono text-gray-500">ID: {item.productId} | Giá: {product?.salePrice || product?.price || "Liên hệ"}</div>
                        </div>
                        <input type="number" min="1" value={item.quantity || 1} onChange={(e) => updateItemQuantity(item.productId, Number(e.target.value))} className={inputClass()} />
                        <button type="button" onClick={() => removeItem(item.productId)} className="text-[10px] font-display font-bold uppercase text-red-400 hover:text-white">
                          Xóa mã
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-3 border border-dashed border-white/10 p-4 text-center text-[10px] text-gray-500">Chưa có sản phẩm nào trong chương trình.</div>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={resetForm} className="border border-white/10 px-5 py-2.5 text-[10px] font-display font-bold uppercase tracking-widest text-gray-300 hover:border-white/30">
                Làm mới
              </button>
              <button type="submit" className="gold-gradient-bg px-5 py-2.5 text-[10px] font-display font-black uppercase tracking-widest text-black">
                {editingId ? "Lưu thay đổi" : "Tạo chương trình"}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="space-y-3">
        {filteredPrograms.length === 0 ? (
          <div className="border border-dashed border-white/10 bg-black/50 p-8 text-center text-xs text-gray-500">Chưa có chương trình nào trong mục này.</div>
        ) : (
          filteredPrograms.map((program) => (
            <div key={program.id} className="grid grid-cols-1 gap-3 border border-white/10 bg-black/80 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="border border-gold-dark/30 bg-gold-dark/10 px-2 py-0.5 text-[9px] font-display font-bold uppercase tracking-widest text-gold-light">{getProgramStatus(program)}</span>
                  <span className="font-mono text-[9px] uppercase text-gray-500">ID: {program.id}</span>
                  <span className="font-display text-[9px] font-bold uppercase tracking-widest text-gray-500">{(program.items || []).length} sản phẩm</span>
                </div>
                <h3 className="truncate font-display text-sm font-black uppercase text-white">{program.name}</h3>
                <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-gray-500">
                  <span>Giá gốc: {formatPrice(parsePrice(program.originalPrice))}</span>
                  <span>/</span>
                  <span className="text-gold-light">Giá ưu đãi: {program.promoPrice ? formatPrice(parsePrice(program.promoPrice)) : "Chưa đặt"}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => handleEdit(program)} className="border border-gold-dark/40 px-3 py-2 text-[10px] font-display font-bold uppercase tracking-widest text-gold-light hover:border-gold-light">
                  Sửa
                </button>
                <button type="button" onClick={() => deleteSalesProgram(program.id)} className="border border-red-500/20 px-3 py-2 text-[10px] font-display font-bold uppercase tracking-widest text-red-400 hover:border-red-400 hover:text-white">
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function inputClass(extra = "") {
  return `w-full bg-black border border-[#1A1A1A] px-3 py-2.5 text-xs text-[#ECECEC] placeholder:text-gray-600 focus:border-gold-light focus:outline-none ${extra}`;
}

function parsePrice(value: string | undefined) {
  const numeric = String(value || "").replace(/[^\d]/g, "");
  return numeric ? Number(numeric) : 0;
}

function formatPrice(value: number) {
  return value ? `${value.toLocaleString("vi-VN")}đ` : "0đ";
}

export function salesProgramToProductCombo(program: SalesProgram, products: Product[]): ProductCombo {
  const description = program.description || (program.items || [])
    .map((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      return product ? `${product.name}${item.quantity && item.quantity > 1 ? ` x${item.quantity}` : ""}` : "";
    })
    .filter(Boolean)
    .join(" + ");

  return {
    id: program.id,
    name: program.name,
    items: program.items,
    originalPrice: program.originalPrice,
    comboPrice: program.promoPrice,
    description,
    sku: program.sku,
    image: program.image,
    startsAt: program.startsAt,
    endsAt: program.endsAt,
    hidden: program.hidden,
  };
}
