"use client";

import React, { useEffect, useRef, useState } from "react";
import { Download, Eraser, FileImage, ImagePlus, Loader2, Trash2, Upload, Wand2 } from "lucide-react";

type ResizeOption = "original" | 800 | 1200 | 1600 | 2000;

interface ImageItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  previewUrl: string;
  convertedBlob?: Blob;
  convertedUrl?: string;
  convertedSize?: number;
  converting?: boolean;
  error?: string;
}

function classNames(...items: Array<string | false | undefined>) {
  return items.filter(Boolean).join(" ");
}

function bytesToHuman(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function WebPConverterPage() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [quality, setQuality] = useState<number>(82);
  const [resize, setResize] = useState<ResizeOption>("original");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const itemsRef = useRef<ImageItem[]>([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
        if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
      });
    };
  }, []);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;

    const allowed = ["image/jpeg", "image/jpg", "image/png"];
    const newItems: ImageItem[] = [];

    for (const file of Array.from(files)) {
      if (!allowed.includes(file.type)) continue;
      try {
        const dataUrl = await fileToDataUrl(file);
        const dims = await getImageDimensions(dataUrl);
        newItems.push({
          id: uid(),
          file,
          name: file.name,
          originalSize: file.size,
          originalWidth: dims.width,
          originalHeight: dims.height,
          previewUrl: URL.createObjectURL(file),
        });
      } catch {
        // Skip broken files.
      }
    }

    if (newItems.length > 0) {
      setItems((prev) => [...prev, ...newItems]);
    }
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(true);
  };

  const onDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  async function convertItem(item: ImageItem, overrideResize?: ResizeOption): Promise<ImageItem> {
    const qualityScalar = Math.max(0, Math.min(1, quality / 100));
    const target = overrideResize ?? resize;
    const dataUrl = await fileToDataUrl(item.file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Không đọc được ảnh."));
      image.src = dataUrl;
    });

    let targetWidth = img.naturalWidth;
    if (target !== "original") {
      targetWidth = Math.min(Number(target), img.naturalWidth);
    }

    const scale = targetWidth / img.naturalWidth;
    const targetHeight = Math.round(img.naturalHeight * scale);
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Không tạo được canvas.");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const blob = await toBlob(canvas, "image/webp", qualityScalar);
    const oldConvertedUrl = item.convertedUrl;
    if (oldConvertedUrl) URL.revokeObjectURL(oldConvertedUrl);

    return {
      ...item,
      convertedBlob: blob,
      convertedUrl: URL.createObjectURL(blob),
      convertedSize: blob.size,
    };
  }

  const convertSingle = async (id: string) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, converting: true, error: undefined } : item));
    try {
      const current = itemsRef.current.find((item) => item.id === id);
      if (!current) return;
      const converted = await convertItem(current);
      setItems((prev) => prev.map((item) => item.id === id ? { ...converted, converting: false } : item));
    } catch (error) {
      setItems((prev) => prev.map((item) => item.id === id ? { ...item, converting: false, error: error instanceof Error ? error.message : "Không chuyển được ảnh." } : item));
    }
  };

  const convertAll = async () => {
    for (const item of itemsRef.current) {
      if (!item.converting) {
        await convertSingle(item.id);
      }
    }
  };

  const downloadItem = (item: ImageItem) => {
    if (!item.convertedUrl || !item.convertedBlob) return;
    const a = document.createElement("a");
    a.href = item.convertedUrl;
    a.download = `${item.name.replace(/\.[^/.]+$/, "")}.webp`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const downloadAll = async () => {
    if (itemsRef.current.some((item) => !item.convertedBlob)) {
      await convertAll();
    }

    for (const item of itemsRef.current) {
      if (item.convertedUrl) {
        downloadItem(item);
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
    }
  };

  const clearAll = () => {
    items.forEach((item) => {
      URL.revokeObjectURL(item.previewUrl);
      if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
    });
    setItems([]);
  };

  const removeItem = (id: string) => {
    const item = items.find((entry) => entry.id === id);
    if (item) {
      URL.revokeObjectURL(item.previewUrl);
      if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
    }
    setItems((prev) => prev.filter((entry) => entry.id !== id));
  };

  const totalImages = items.length;
  const totalOriginal = items.reduce((sum, item) => sum + item.originalSize, 0);
  const totalWebp = items.reduce((sum, item) => sum + (item.convertedSize || 0), 0);
  const totalSaved = Math.max(0, totalOriginal - totalWebp);

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-6 text-[#ECECEC] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 border-b border-gold-dark/15 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 border border-gold-dark/30 bg-gold-dark/10 px-3 py-1 text-[10px] font-display font-bold uppercase tracking-widest text-gold-light">
              <Wand2 className="h-3.5 w-3.5" />
              Tối ưu hình ảnh
            </div>
            <h1 className="font-display text-2xl font-black uppercase tracking-wide text-white sm:text-3xl">
              Chuyển ảnh sang WebP
            </h1>
            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-gray-400">
              Chọn nhiều ảnh JPG/PNG, giảm dung lượng ngay trên trình duyệt rồi tải file WebP về máy.
            </p>
          </div>
          <a href="/admin" className="inline-flex h-10 items-center justify-center border border-white/10 px-4 text-[11px] font-display font-bold uppercase tracking-widest text-gray-300 hover:border-gold-light hover:text-gold-light">
            Về quản trị
          </a>
        </header>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Tổng ảnh" value={String(totalImages)} />
          <StatCard label="Dung lượng gốc" value={bytesToHuman(totalOriginal)} />
          <StatCard label="Sau WebP" value={totalWebp ? bytesToHuman(totalWebp) : "-"} />
          <StatCard label="Tiết kiệm" value={totalWebp ? bytesToHuman(totalSaved) : "-"} highlight />
        </section>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <section className="border border-white/5 bg-[#0B0B0B] p-4">
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={classNames(
                  "flex min-h-48 flex-col items-center justify-center border border-dashed p-5 text-center transition-colors",
                  dragging ? "border-gold-light bg-gold-dark/10" : "border-white/15 bg-black/40",
                )}
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center border border-gold-dark/30 bg-gold-dark/10 text-gold-light">
                  <ImagePlus className="h-6 w-6" />
                </div>
                <h2 className="font-display text-sm font-black uppercase tracking-widest text-white">
                  Kéo thả ảnh vào đây
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-gray-500">Hỗ trợ JPG và PNG. Có thể chọn nhiều ảnh cùng lúc.</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="gold-gradient-bg mt-4 inline-flex h-10 items-center justify-center gap-2 px-4 text-[11px] font-display font-black uppercase tracking-widest text-black hover:opacity-90"
                >
                  <Upload className="h-4 w-4" />
                  Chọn ảnh
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,image/png,.jpg,.jpeg,image/jpeg"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    handleFiles(event.target.files);
                    event.currentTarget.value = "";
                  }}
                />
              </div>
            </section>

            <section className="border border-white/5 bg-[#0B0B0B] p-4 space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-[10px] font-display font-bold uppercase tracking-widest text-gray-400">
                  Chất lượng
                  <span className="font-mono text-gold-light">{quality}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={quality}
                  onChange={(event) => setQuality(Number(event.target.value))}
                  className="w-full accent-[#D89A2B]"
                />
              </div>

              <label className="block space-y-2">
                <span className="block text-[10px] font-display font-bold uppercase tracking-widest text-gray-400">Resize chiều rộng</span>
                <select
                  value={resize}
                  onChange={(event) => setResize(event.target.value === "original" ? "original" : Number(event.target.value) as ResizeOption)}
                  className="h-10 w-full border border-white/10 bg-black px-3 text-xs text-white outline-none focus:border-gold-light"
                >
                  <option value="original">Giữ kích thước gốc</option>
                  <option value="800">Tối đa 800px</option>
                  <option value="1200">Tối đa 1200px</option>
                  <option value="1600">Tối đa 1600px</option>
                  <option value="2000">Tối đa 2000px</option>
                </select>
              </label>

              <div className="grid grid-cols-1 gap-2">
                <ActionButton disabled={items.length === 0} onClick={convertAll} icon={<Wand2 className="h-4 w-4" />} label="Chuyển tất cả" />
                <ActionButton disabled={items.length === 0} onClick={downloadAll} icon={<Download className="h-4 w-4" />} label="Tải tất cả" variant="outline" />
                <ActionButton disabled={items.length === 0} onClick={clearAll} icon={<Eraser className="h-4 w-4" />} label="Xóa danh sách" variant="ghost" />
              </div>
            </section>

            <p className="border border-gold-dark/20 bg-gold-dark/5 p-3 text-[11px] leading-relaxed text-gray-400">
              Ảnh được xử lý trực tiếp trên trình duyệt, không tải lên server hay Firebase.
            </p>
          </aside>

          <section className="min-w-0 border border-white/5 bg-[#0B0B0B] p-4">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-sm font-black uppercase tracking-widest text-white">Danh sách ảnh</h2>
                <p className="mt-1 text-[11px] text-gray-500">Chuyển từng ảnh hoặc xử lý tất cả một lần.</p>
              </div>
              <span className="self-start border border-white/10 px-3 py-1 text-[10px] font-mono uppercase text-gray-400 sm:self-auto">
                {items.length} file
              </span>
            </div>

            {items.length === 0 ? (
              <div className="flex min-h-72 flex-col items-center justify-center border border-dashed border-white/10 bg-black/30 p-6 text-center">
                <FileImage className="mb-3 h-10 w-10 text-gray-600" />
                <h3 className="font-display text-sm font-bold uppercase tracking-widest text-gray-400">Chưa có ảnh</h3>
                <p className="mt-2 max-w-sm text-xs leading-relaxed text-gray-500">Chọn ảnh ở khung bên trái, kết quả chuyển WebP sẽ hiện tại đây.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <ImageRow
                    key={item.id}
                    item={item}
                    onConvert={() => convertSingle(item.id)}
                    onDownload={() => downloadItem(item)}
                    onRemove={() => removeItem(item.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Không đọc được file."));
    reader.readAsDataURL(file);
  });
}

function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("Không đọc được kích thước ảnh."));
    img.src = dataUrl;
  });
}

function toBlob(canvas: HTMLCanvasElement, mime: string, qualityScalar: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Không chuyển được ảnh."));
    }, mime, qualityScalar);
  });
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="border border-white/5 bg-[#0B0B0B] p-4">
      <div className="text-[10px] font-display font-bold uppercase tracking-widest text-gray-500">{label}</div>
      <div className={classNames("mt-2 text-lg font-display font-black", highlight ? "text-gold-light" : "text-white")}>{value}</div>
    </div>
  );
}

function ImageRow({ item, onConvert, onDownload, onRemove }: {
  item: ImageItem;
  onConvert: () => void;
  onDownload: () => void;
  onRemove: () => void;
}) {
  const savedPercent = item.convertedSize ? Math.round(((item.originalSize - item.convertedSize) / item.originalSize) * 100) : null;

  return (
    <article className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 border border-white/5 bg-black/50 p-3 xl:grid-cols-[80px_minmax(0,1fr)_auto] xl:items-center">
      <div className="h-16 w-16 overflow-hidden border border-white/10 bg-black xl:h-20 xl:w-20">
        <img src={item.previewUrl} alt={item.name} className="h-full w-full object-cover" />
      </div>

      <div className="min-w-0 overflow-hidden">
        <h3 className="max-w-full truncate text-xs font-display font-bold uppercase tracking-wide text-white" title={item.name}>{item.name}</h3>
        <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-[10px] text-gray-500 md:grid-cols-4 xl:grid-cols-4">
          <Meta label="Kích thước" value={`${item.originalWidth} x ${item.originalHeight}`} />
          <Meta label="File gốc" value={bytesToHuman(item.originalSize)} />
          <Meta label="WebP" value={item.convertedSize ? bytesToHuman(item.convertedSize) : "-"} />
          <Meta label="Tiết kiệm" value={savedPercent !== null ? `${savedPercent}%` : "-"} gold />
        </div>
        {item.error && <p className="mt-2 text-[11px] text-red-400">{item.error}</p>}
      </div>

      <div className="col-span-2 grid grid-cols-3 gap-2 xl:col-span-1 xl:flex xl:items-center">
        <button
          type="button"
          onClick={onConvert}
          disabled={item.converting}
          className="inline-flex h-9 items-center justify-center gap-1.5 bg-gold-dark px-3 text-[10px] font-display font-black uppercase tracking-widest text-black hover:bg-gold-light disabled:opacity-60"
        >
          {item.converting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
          {item.converting ? "Đang" : "Chuyển"}
        </button>
        <button
          type="button"
          onClick={onDownload}
          disabled={!item.convertedUrl}
          className="inline-flex h-9 items-center justify-center gap-1.5 border border-white/10 px-3 text-[10px] font-display font-bold uppercase tracking-widest text-gray-300 hover:border-gold-light hover:text-gold-light disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Download className="h-3.5 w-3.5" />
          Tải
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex h-9 items-center justify-center border border-red-500/20 px-3 text-red-400 hover:bg-red-500 hover:text-white"
          title="Xóa ảnh"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  );
}

function Meta({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className="min-w-0">
      <div className="truncate font-display font-bold uppercase tracking-widest text-gray-600">{label}</div>
      <div className={classNames("mt-0.5 truncate font-mono", gold ? "text-gold-light" : "text-gray-300")} title={value}>{value}</div>
    </div>
  );
}

function ActionButton({ label, icon, disabled, variant = "primary", onClick }: {
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  variant?: "primary" | "outline" | "ghost";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={classNames(
        "inline-flex h-11 items-center justify-center gap-2 px-4 text-[11px] font-display font-black uppercase tracking-widest transition-colors disabled:cursor-not-allowed disabled:opacity-45",
        variant === "primary" && "gold-gradient-bg text-black hover:opacity-90",
        variant === "outline" && "border border-white/10 text-white hover:border-gold-light hover:text-gold-light",
        variant === "ghost" && "border border-white/5 text-gray-400 hover:border-red-400 hover:text-red-400",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
