"use client";

import React, { useEffect, useRef, useState } from "react";
import { Download, Eraser, ImagePlus, Layers, Maximize2, Move, Upload } from "lucide-react";

type ExportSize = 800 | 1000 | 1200;

interface ImageAsset {
  file: File;
  url: string;
  width: number;
  height: number;
}

const PREVIEW_CANVAS_SIZE = 800;

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function classNames(...items: Array<string | false | undefined>) {
  return items.filter(Boolean).join(" ");
}

export default function PromoOverlayPage(): React.ReactElement {
  const [product, setProduct] = useState<ImageAsset | null>(null);
  const [overlay, setOverlay] = useState<ImageAsset | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [exportSize, setExportSize] = useState<ExportSize>(800);
  const [quality, setQuality] = useState<number>(82);
  const dragState = useRef<{ startX: number; startY: number; startOffsetX: number; startOffsetY: number } | null>(null);

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const productImgRef = useRef<HTMLImageElement | null>(null);
  const overlayImgRef = useRef<HTMLImageElement | null>(null);
  const productInputRef = useRef<HTMLInputElement | null>(null);
  const overlayInputRef = useRef<HTMLInputElement | null>(null);

  const loadFileAsImage = (file: File): Promise<ImageAsset> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => resolve({ file, url, width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Không đọc được ảnh."));
      };
      img.src = url;
    });
  };

  const computeInitialFitScale = (imgW: number, imgH: number) => Math.min(PREVIEW_CANVAS_SIZE / imgW, PREVIEW_CANVAS_SIZE / imgH);

  const renderPreview = () => {
    const canvas = previewCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, PREVIEW_CANVAS_SIZE, PREVIEW_CANVAS_SIZE);
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, PREVIEW_CANVAS_SIZE, PREVIEW_CANVAS_SIZE);

    if (!product) {
      ctx.fillStyle = "#8A8A8A";
      ctx.font = "18px Inter, system-ui, Arial";
      ctx.textAlign = "center";
      ctx.fillText("Tải ảnh sản phẩm để bắt đầu", PREVIEW_CANVAS_SIZE / 2, PREVIEW_CANVAS_SIZE / 2);
      return;
    }

    const img = new Image();
    img.src = product.url;
    img.onload = () => {
      productImgRef.current = img;
      const base = computeInitialFitScale(product.width, product.height);
      const displayScale = base * scale;
      const drawW = Math.round(product.width * displayScale);
      const drawH = Math.round(product.height * displayScale);
      const x = Math.round((PREVIEW_CANVAS_SIZE - drawW) / 2 + offset.x);
      const y = Math.round((PREVIEW_CANVAS_SIZE - drawH) / 2 + offset.y);
      ctx.drawImage(img, x, y, drawW, drawH);

      if (!overlay) return;
      const oimg = new Image();
      oimg.src = overlay.url;
      oimg.onload = () => {
        overlayImgRef.current = oimg;
        ctx.drawImage(oimg, 0, 0, PREVIEW_CANVAS_SIZE, PREVIEW_CANVAS_SIZE);
      };
    };
  };

  useEffect(() => {
    renderPreview();
  }, [product, overlay, scale, offset]);

  useEffect(() => {
    return () => {
      if (product) URL.revokeObjectURL(product.url);
      if (overlay) URL.revokeObjectURL(overlay.url);
    };
  }, []);

  const onProductFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !/^image\/(png|jpeg|webp)$/.test(file.type)) return;
    if (product) URL.revokeObjectURL(product.url);
    const asset = await loadFileAsImage(file);
    setProduct(asset);
    setScale(computeInitialFitScale(asset.width, asset.height));
    setOffset({ x: 0, y: 0 });
  };

  const onOverlayFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file || file.type !== "image/png") return;
    if (overlay) URL.revokeObjectURL(overlay.url);
    setOverlay(await loadFileAsImage(file));
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if (!product) return;
    (event.target as Element).setPointerCapture(event.pointerId);
    setDragging(true);
    dragState.current = {
      startX: event.clientX,
      startY: event.clientY,
      startOffsetX: offset.x,
      startOffsetY: offset.y,
    };
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!dragging || !dragState.current) return;
    setOffset({
      x: dragState.current.startOffsetX + event.clientX - dragState.current.startX,
      y: dragState.current.startOffsetY + event.clientY - dragState.current.startY,
    });
  };

  const onPointerUp = () => {
    setDragging(false);
    dragState.current = null;
  };

  const generateExportCanvas = (size: ExportSize) => {
    const out = document.createElement("canvas");
    out.width = size;
    out.height = size;
    const ctx = out.getContext("2d");
    if (!ctx) throw new Error("Không tạo được canvas.");
    ctx.clearRect(0, 0, size, size);

    if (product && productImgRef.current) {
      const base = computeInitialFitScale(product.width, product.height);
      const displayScale = base * scale;
      const drawW = Math.round(product.width * displayScale);
      const drawH = Math.round(product.height * displayScale);
      const xPreview = Math.round((PREVIEW_CANVAS_SIZE - drawW) / 2 + offset.x);
      const yPreview = Math.round((PREVIEW_CANVAS_SIZE - drawH) / 2 + offset.y);
      const scaleOut = size / PREVIEW_CANVAS_SIZE;
      ctx.drawImage(productImgRef.current, Math.round(xPreview * scaleOut), Math.round(yPreview * scaleOut), Math.round(drawW * scaleOut), Math.round(drawH * scaleOut));
    }

    if (overlay && overlayImgRef.current) {
      ctx.drawImage(overlayImgRef.current, 0, 0, size, size);
    }

    return out;
  };

  const downloadCanvasAs = (canvas: HTMLCanvasElement, mime: string, qualityScalar?: number, filename?: string) => {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || `promo-${uid()}.${mime === "image/webp" ? "webp" : "png"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }, mime, qualityScalar);
  };

  const onDownloadWebP = () => downloadCanvasAs(generateExportCanvas(exportSize), "image/webp", quality / 100, `promo-${exportSize}.webp`);
  const onDownloadPNG = () => downloadCanvasAs(generateExportCanvas(exportSize), "image/png", undefined, `promo-${exportSize}.png`);

  const onClearAll = () => {
    if (product) URL.revokeObjectURL(product.url);
    if (overlay) URL.revokeObjectURL(overlay.url);
    setProduct(null);
    setOverlay(null);
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-6 text-[#ECECEC] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 border-b border-gold-dark/15 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 border border-gold-dark/30 bg-gold-dark/10 px-3 py-1 text-[10px] font-display font-bold uppercase tracking-widest text-gold-light">
              <Layers className="h-3.5 w-3.5" />
              Công cụ ảnh quảng cáo
            </div>
            <h1 className="font-display text-2xl font-black uppercase tracking-wide text-white sm:text-3xl">
              Ghép khung promo sản phẩm
            </h1>
            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-gray-400">
              Tải ảnh sản phẩm, thêm khung PNG trong suốt, kéo để canh vị trí rồi xuất WebP hoặc PNG vuông.
            </p>
          </div>
          <a href="/admin" className="inline-flex h-10 items-center justify-center border border-white/10 px-4 text-[11px] font-display font-bold uppercase tracking-widest text-gray-300 hover:border-gold-light hover:text-gold-light">
            Về quản trị
          </a>
        </header>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,460px)]">
          <section className="space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <UploadBox
                icon={<ImagePlus className="h-5 w-5" />}
                title="Ảnh sản phẩm"
                subtitle="JPG, PNG hoặc WebP"
                fileName={product?.file.name}
                buttonText="Chọn ảnh"
                onClick={() => productInputRef.current?.click()}
              />
              <UploadBox
                icon={<Layers className="h-5 w-5" />}
                title="Khung overlay"
                subtitle="PNG nền trong suốt"
                fileName={overlay?.file.name}
                buttonText="Chọn khung"
                secondary
                onClick={() => overlayInputRef.current?.click()}
              />
            </div>

            <input ref={productInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => onProductFiles(e.target.files)} />
            <input ref={overlayInputRef} type="file" accept="image/png" className="hidden" onChange={(e) => onOverlayFiles(e.target.files)} />

            <div className="border border-white/5 bg-[#0B0B0B] p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2 text-xs font-display font-bold uppercase tracking-widest text-gold-light">
                <Maximize2 className="h-4 w-4" />
                Tùy chỉnh xuất ảnh
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <ControlRange label="Phóng to ảnh" value={scale} min={0.25} max={2} step={0.01} display={scale.toFixed(2)} onChange={setScale} />
                <label className="space-y-2">
                  <span className="block text-[10px] font-display font-bold uppercase tracking-widest text-gray-400">Kích thước xuất</span>
                  <select
                    value={exportSize}
                    onChange={(e) => setExportSize(Number(e.target.value) as ExportSize)}
                    className="h-10 w-full border border-white/10 bg-black px-3 text-xs font-mono text-white outline-none focus:border-gold-light"
                  >
                    <option value={800}>800 x 800</option>
                    <option value={1000}>1000 x 1000</option>
                    <option value={1200}>1200 x 1200</option>
                  </select>
                </label>
                <ControlRange label="Chất lượng WebP" value={quality} min={50} max={100} step={1} display={`${quality}%`} onChange={setQuality} />
              </div>

              <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <ActionButton disabled={!product} onClick={onDownloadWebP} icon={<Download className="h-4 w-4" />} label="Tải WebP" />
                <ActionButton disabled={!product} onClick={onDownloadPNG} icon={<Download className="h-4 w-4" />} label="Tải PNG" variant="outline" />
                <ActionButton onClick={onClearAll} icon={<Eraser className="h-4 w-4" />} label="Xóa tất cả" variant="ghost" />
              </div>
            </div>

            <div className="border border-gold-dark/20 bg-gold-dark/5 p-4 text-xs leading-relaxed text-gray-300">
              <div className="mb-1 flex items-center gap-2 font-display font-bold uppercase tracking-widest text-gold-light">
                <Move className="h-4 w-4" />
                Cách dùng nhanh
              </div>
              Kéo trực tiếp trên ảnh xem trước để canh vị trí. Thanh phóng to chỉ áp dụng cho ảnh sản phẩm, khung overlay luôn phủ kín toàn bộ ảnh vuông.
            </div>
          </section>

          <section className="border border-gold-dark/30 bg-[#0B0B0B] p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-sm font-black uppercase tracking-widest text-white">Xem trước</h2>
                <p className="mt-1 text-[11px] text-gray-500">{exportSize} x {exportSize}px</p>
              </div>
              <span className={classNames("rounded-sm px-2 py-1 text-[10px] font-display font-bold uppercase tracking-widest", product ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-gray-500")}>
                {product ? "Sẵn sàng" : "Chưa có ảnh"}
              </span>
            </div>

            <div className="mx-auto w-full max-w-[460px] overflow-hidden border border-gold-dark/40 bg-black shadow-[0_0_35px_rgba(216,154,43,0.08)]">
              <div className="relative aspect-square w-full">
                <canvas
                  ref={previewCanvasRef}
                  width={PREVIEW_CANVAS_SIZE}
                  height={PREVIEW_CANVAS_SIZE}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                  className={classNames("absolute inset-0 h-full w-full touch-none", Boolean(product) && "cursor-move")}
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function UploadBox({ icon, title, subtitle, fileName, buttonText, secondary, onClick }: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  fileName?: string;
  buttonText: string;
  secondary?: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border border-white/5 bg-[#0B0B0B] p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-gold-dark/30 bg-gold-dark/10 text-gold-light">{icon}</div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xs font-black uppercase tracking-widest text-white">{title}</h2>
          <p className="mt-1 text-[11px] text-gray-500">{subtitle}</p>
          <p className="mt-2 truncate text-[11px] font-mono text-gray-400">{fileName || "Chưa chọn file"}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClick}
        className={classNames(
          "mt-4 inline-flex h-10 w-full items-center justify-center gap-2 text-[11px] font-display font-black uppercase tracking-widest transition-colors",
          secondary ? "border border-white/10 text-gray-200 hover:border-gold-light hover:text-gold-light" : "gold-gradient-bg text-black hover:opacity-90",
        )}
      >
        <Upload className="h-4 w-4" />
        {buttonText}
      </button>
    </div>
  );
}

function ControlRange({ label, value, min, max, step, display, onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="flex items-center justify-between text-[10px] font-display font-bold uppercase tracking-widest text-gray-400">
        {label}
        <span className="font-mono text-gold-light">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#D89A2B]"
      />
    </label>
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
