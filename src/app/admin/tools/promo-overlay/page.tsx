"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, Download, Eraser, ImagePlus, Layers, Maximize2, Move, Palette, Save, Trash2, Upload } from "lucide-react";
import { useApp } from "../../../../context/AppContext";
import { isCloudinaryConfigured, uploadImageToCloudinary } from "../../../../lib/cloudinary";

type ExportSize = 800 | 1000 | 1200;
type BackgroundMode = "white" | "transparent" | "custom";

interface ImageAsset {
  file: File;
  url: string;
  width: number;
  height: number;
}

interface ProductItem extends ImageAsset {
  id: string;
  scale: number;
  offset: { x: number; y: number };
}

const PREVIEW_CANVAS_SIZE = 800;

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function classNames(...items: Array<string | false | undefined>) {
  return items.filter(Boolean).join(" ");
}

function getBaseName(fileName: string) {
  return (
    fileName
      // Bỏ đuôi file nếu có
      .replace(/\.[^/.]+$/, "")

      // Tách dấu tiếng Việt
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")

      // Xử lý riêng chữ đ/Đ
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")

      // Đưa về chữ thường
      .toLowerCase()

      // Ký tự không phải chữ/số thì đổi thành dấu -
      .replace(/[^a-z0-9]+/g, "-")

      // Gộp nhiều dấu - thành một
      .replace(/-+/g, "-")

      // Xóa dấu - ở đầu/cuối
      .replace(/^-|-$/g, "")
  ) || "promo";
}

export default function PromoOverlayPage(): React.ReactElement {
  const { promoOverlaySettings, updatePromoOverlaySettings, showToast } = useApp();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<ImageAsset | null>(null);
  const [eventEnabled, setEventEnabled] = useState(promoOverlaySettings.enabled);
  const [eventEndDate, setEventEndDate] = useState(promoOverlaySettings.endDate || "");
  const [savingEventOverlay, setSavingEventOverlay] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [exportSize, setExportSize] = useState<ExportSize>(800);
  const [quality, setQuality] = useState<number>(82);
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>("white");
  const [customBackground, setCustomBackground] = useState("#ffffff");
  const [exportBaseName, setExportBaseName] = useState("may-khoan-qzj005");
  const dragState = useRef<{ startX: number; startY: number; startOffsetX: number; startOffsetY: number } | null>(null);

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const productImgRefs = useRef<Map<string, HTMLImageElement>>(new Map());
  const overlayImgRef = useRef<HTMLImageElement | null>(null);
  const productInputRef = useRef<HTMLInputElement | null>(null);
  const overlayInputRef = useRef<HTMLInputElement | null>(null);
  const productsRef = useRef<ProductItem[]>([]);
  const overlayRef = useRef<ImageAsset | null>(null);

  const activeProduct = useMemo(() => products.find((item) => item.id === activeProductId) || products[0] || null, [activeProductId, products]);

  useEffect(() => {
    setEventEnabled(promoOverlaySettings.enabled);
    setEventEndDate(promoOverlaySettings.endDate || "");
  }, [promoOverlaySettings.enabled, promoOverlaySettings.endDate]);

  const computeInitialFitScale = (imgW: number, imgH: number) => Math.min(PREVIEW_CANVAS_SIZE / imgW, PREVIEW_CANVAS_SIZE / imgH);

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

  const updateActiveProduct = (changes: Partial<Pick<ProductItem, "scale" | "offset">>) => {
    if (!activeProduct) return;
    setProducts((current) => current.map((item) => (item.id === activeProduct.id ? { ...item, ...changes } : item)));
  };

  const drawBackground = (ctx: CanvasRenderingContext2D, size: number, preview = false) => {
    ctx.clearRect(0, 0, size, size);

    if (backgroundMode === "transparent") {
      if (!preview) return;
      const block = size / 20;
      for (let y = 0; y < size; y += block) {
        for (let x = 0; x < size; x += block) {
          ctx.fillStyle = (Math.floor(x / block) + Math.floor(y / block)) % 2 === 0 ? "#f7f7f7" : "#dedede";
          ctx.fillRect(x, y, block, block);
        }
      }
      return;
    }

    ctx.fillStyle = backgroundMode === "custom" ? customBackground : "#ffffff";
    ctx.fillRect(0, 0, size, size);
  };

  const drawProduct = (ctx: CanvasRenderingContext2D, product: ProductItem, img: HTMLImageElement, size: number) => {
    const base = computeInitialFitScale(product.width, product.height);
    const displayScale = base * product.scale;
    const drawW = Math.round(product.width * displayScale);
    const drawH = Math.round(product.height * displayScale);
    const xPreview = Math.round((PREVIEW_CANVAS_SIZE - drawW) / 2 + product.offset.x);
    const yPreview = Math.round((PREVIEW_CANVAS_SIZE - drawH) / 2 + product.offset.y);
    const scaleOut = size / PREVIEW_CANVAS_SIZE;
    ctx.drawImage(img, Math.round(xPreview * scaleOut), Math.round(yPreview * scaleOut), Math.round(drawW * scaleOut), Math.round(drawH * scaleOut));
  };

  const renderPreview = () => {
    const canvas = previewCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    drawBackground(ctx, PREVIEW_CANVAS_SIZE, true);

    if (!activeProduct) {
      ctx.fillStyle = "#8A8A8A";
      ctx.font = "18px Inter, system-ui, Arial";
      ctx.textAlign = "center";
      ctx.fillText("Tải ảnh sản phẩm để bắt đầu", PREVIEW_CANVAS_SIZE / 2, PREVIEW_CANVAS_SIZE / 2);
      return;
    }

    const cachedProduct = productImgRefs.current.get(activeProduct.id);
    if (cachedProduct) {
      drawProduct(ctx, activeProduct, cachedProduct, PREVIEW_CANVAS_SIZE);
      if (overlay && overlayImgRef.current) ctx.drawImage(overlayImgRef.current, 0, 0, PREVIEW_CANVAS_SIZE, PREVIEW_CANVAS_SIZE);
      return;
    }

    const img = new Image();
    img.src = activeProduct.url;
    img.onload = () => {
      productImgRefs.current.set(activeProduct.id, img);
      drawBackground(ctx, PREVIEW_CANVAS_SIZE, true);
      drawProduct(ctx, activeProduct, img, PREVIEW_CANVAS_SIZE);
      if (overlay && overlayImgRef.current) ctx.drawImage(overlayImgRef.current, 0, 0, PREVIEW_CANVAS_SIZE, PREVIEW_CANVAS_SIZE);
    };
  };

  useEffect(() => {
    if (!overlay) {
      overlayImgRef.current = null;
      renderPreview();
      return;
    }

    const img = new Image();
    img.src = overlay.url;
    img.onload = () => {
      overlayImgRef.current = img;
      renderPreview();
    };
  }, [overlay]);

  useEffect(() => {
    renderPreview();
  }, [activeProduct, overlay, backgroundMode, customBackground]);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  useEffect(() => {
    overlayRef.current = overlay;
  }, [overlay]);

  useEffect(() => {
    return () => {
      productsRef.current.forEach((product) => URL.revokeObjectURL(product.url));
      if (overlayRef.current) URL.revokeObjectURL(overlayRef.current.url);
    };
  }, []);

  const onProductFiles = async (files: FileList | null) => {
    const selectedFiles = Array.from(files || []).filter((file) => /^image\/(png|jpeg|webp)$/.test(file.type));
    if (!selectedFiles.length) return;

    const loadedProducts = await Promise.all(selectedFiles.map(async (file) => {
      const asset = await loadFileAsImage(file);
      return {
        ...asset,
        id: uid(),
        scale: 1,
        offset: { x: 0, y: 0 },
      };
    }));

    setProducts((current) => [...current, ...loadedProducts]);
    setActiveProductId((current) => current || loadedProducts[0]?.id || null);
  };

  const onOverlayFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file || file.type !== "image/png") return;
    if (overlay) URL.revokeObjectURL(overlay.url);
    setOverlay(await loadFileAsImage(file));
  };

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Không đọc được file overlay."));
      reader.readAsDataURL(file);
    });
  };

  const convertImageFileToWebp = (asset: ImageAsset, qualityValue = 0.86): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = asset.width;
        canvas.height = asset.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Không tạo được canvas để nén WebP."));
          return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Trình duyệt không thể xuất WebP."));
            return;
          }

          const webpName = asset.file.name.replace(/\.[^/.]+$/, "") + ".webp";
          resolve(new File([blob], webpName, { type: "image/webp" }));
        }, "image/webp", qualityValue);
      };
      img.onerror = () => reject(new Error("Không đọc được ảnh overlay để nén WebP."));
      img.src = asset.url;
    });
  };

  const saveEventOverlay = async () => {
    if (!overlay && !promoOverlaySettings.imageUrl) {
      showToast("Chọn khung overlay PNG trước khi bật sự kiện.", "warning");
      return;
    }

    setSavingEventOverlay(true);

    try {
      let imageUrl = promoOverlaySettings.imageUrl;
      let fileName = promoOverlaySettings.fileName || "";

      if (overlay) {
        const webpOverlay = await convertImageFileToWebp(overlay);
        imageUrl = isCloudinaryConfigured()
          ? await uploadImageToCloudinary(webpOverlay)
          : await fileToDataUrl(webpOverlay);
        fileName = webpOverlay.name;
      }

      const currentLibrary = promoOverlaySettings.library || [];
      const nextLibrary = imageUrl
        ? [
            {
              url: imageUrl,
              fileName: fileName || "promo-overlay.webp",
              createdAt: new Date().toISOString(),
            },
            ...currentLibrary.filter((item) => item.url !== imageUrl),
          ].slice(0, 24)
        : currentLibrary;

      await updatePromoOverlaySettings({
        enabled: eventEnabled,
        imageUrl,
        fileName,
        endDate: eventEndDate,
        library: nextLibrary,
      });
      showToast(eventEnabled ? "Đã lưu overlay sự kiện cho toàn bộ sản phẩm." : "Đã tắt overlay sự kiện.", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể lưu overlay sự kiện.";
      showToast(message, "error");
    } finally {
      setSavingEventOverlay(false);
    }
  };

  const useLibraryOverlay = async (item: { url: string; fileName: string }) => {
    try {
      await updatePromoOverlaySettings({
        ...promoOverlaySettings,
        enabled: true,
        imageUrl: item.url,
        fileName: item.fileName,
        endDate: eventEndDate,
      });
      setEventEnabled(true);
      showToast("Đã chọn khung promo từ thư viện.", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể chọn khung promo.";
      showToast(message, "error");
    }
  };

  const deleteLibraryOverlay = async (item: { url: string; fileName: string }) => {
    const confirmed = window.confirm("Xóa khung này khỏi thư viện promo? File gốc trên Cloudinary sẽ không bị xóa.");
    if (!confirmed) return;

    try {
      const nextLibrary = (promoOverlaySettings.library || []).filter((libraryItem) => libraryItem.url !== item.url);
      const isActiveOverlay = promoOverlaySettings.imageUrl === item.url;

      await updatePromoOverlaySettings({
        ...promoOverlaySettings,
        enabled: isActiveOverlay ? false : promoOverlaySettings.enabled,
        imageUrl: isActiveOverlay ? "" : promoOverlaySettings.imageUrl,
        fileName: isActiveOverlay ? "" : promoOverlaySettings.fileName,
        library: nextLibrary,
      });

      if (isActiveOverlay) {
        setEventEnabled(false);
      }

      showToast(isActiveOverlay ? "Đã xóa khung khỏi thư viện và tắt overlay đang dùng." : "Đã xóa khung khỏi thư viện promo.", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể xóa khung promo.";
      showToast(message, "error");
    }
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if (!activeProduct) return;
    (event.target as Element).setPointerCapture(event.pointerId);
    setDragging(true);
    dragState.current = {
      startX: event.clientX,
      startY: event.clientY,
      startOffsetX: activeProduct.offset.x,
      startOffsetY: activeProduct.offset.y,
    };
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!dragging || !dragState.current) return;
    updateActiveProduct({
      offset: {
        x: dragState.current.startOffsetX + event.clientX - dragState.current.startX,
        y: dragState.current.startOffsetY + event.clientY - dragState.current.startY,
      },
    });
  };

  const onPointerUp = () => {
    setDragging(false);
    dragState.current = null;
  };

  const generateExportCanvas = (size: ExportSize, product: ProductItem) => {
    const out = document.createElement("canvas");
    out.width = size;
    out.height = size;
    const ctx = out.getContext("2d");
    if (!ctx) throw new Error("Không tạo được canvas.");

    drawBackground(ctx, size);

    const productImg = productImgRefs.current.get(product.id);
    if (productImg) drawProduct(ctx, product, productImg, size);
    if (overlay && overlayImgRef.current) ctx.drawImage(overlayImgRef.current, 0, 0, size, size);

    return out;
  };

  const downloadCanvasAs = (canvas: HTMLCanvasElement, mime: string, qualityScalar: number | undefined, filename: string) => {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }, mime, qualityScalar);
  };

  const ensureProductImage = (product: ProductItem): Promise<HTMLImageElement> => {
    const cached = productImgRefs.current.get(product.id);
    if (cached) return Promise.resolve(cached);

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        productImgRefs.current.set(product.id, img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = product.url;
    });
  };

  const downloadProducts = async (mime: "image/webp" | "image/png", all = false) => {
  const targets = all ? products : activeProduct ? [activeProduct] : [];
  if (!targets.length) return;

  await Promise.all(targets.map(ensureProductImage));

  const extension = mime === "image/webp" ? "webp" : "png";
  const cleanBaseName = getBaseName(exportBaseName || activeProduct?.file.name || "promo");

  targets.forEach((product, index) => {
    const fileIndex = all || targets.length > 1 ? `-${index + 1}` : "";
    const filename = `${cleanBaseName}${fileIndex}.${extension}`;

    downloadCanvasAs(
      generateExportCanvas(exportSize, product),
      mime,
      mime === "image/webp" ? quality / 100 : undefined,
      filename,
    );
  });
};

  const removeProduct = (id: string) => {
    setProducts((current) => {
      const removed = current.find((item) => item.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.url);
        productImgRefs.current.delete(id);
      }
      const next = current.filter((item) => item.id !== id);
      if (activeProductId === id) setActiveProductId(next[0]?.id || null);
      return next;
    });
  };

  const onClearAll = () => {
    products.forEach((product) => URL.revokeObjectURL(product.url));
    if (overlay) URL.revokeObjectURL(overlay.url);
    productImgRefs.current.clear();
    overlayImgRef.current = null;
    setProducts([]);
    setActiveProductId(null);
    setOverlay(null);
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
              Tải một hoặc nhiều ảnh sản phẩm, chọn nền xuất, thêm khung PNG trong suốt rồi xuất WebP hoặc PNG vuông.
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
                subtitle="JPG, PNG hoặc WebP, chọn được nhiều ảnh"
                fileName={products.length ? `${products.length} ảnh đã chọn` : undefined}
                buttonText="Thêm ảnh"
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

            <input ref={productInputRef} type="file" multiple accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => onProductFiles(e.target.files)} />
            <input ref={overlayInputRef} type="file" accept="image/png" className="hidden" onChange={(e) => onOverlayFiles(e.target.files)} />

            <div className="border border-gold-dark/25 bg-gold-dark/5 p-4 sm:p-5">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 text-[10px] font-display font-bold uppercase tracking-widest text-gold-light">
                    <Layers className="h-4 w-4" />
                    Sự kiện overlay toàn site
                  </div>
                  <p className="max-w-2xl text-xs leading-relaxed text-gray-400">
                    Dùng khung overlay hiện tại làm lớp phủ tạm thời trên ảnh đại diện sản phẩm ngoài website. Khi lưu, khung sẽ được nén WebP trước khi upload Cloudinary.
                  </p>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-3 border border-white/10 bg-black px-3 py-2">
                  <input
                    type="checkbox"
                    checked={eventEnabled}
                    onChange={(e) => setEventEnabled(e.target.checked)}
                    className="h-4 w-4 accent-gold-dark"
                  />
                  <span className="text-[11px] font-display font-bold uppercase tracking-widest text-white">
                    Bật sự kiện
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
                <label className="space-y-2">
                  <span className="flex items-center gap-2 text-[10px] font-display font-bold uppercase tracking-widest text-gray-400">
                    <Calendar className="h-3.5 w-3.5 text-gold-light" />
                    Ngày kết thúc
                  </span>
                  <input
                    type="date"
                    value={eventEndDate}
                    onChange={(e) => setEventEndDate(e.target.value)}
                    className="h-10 w-full border border-white/10 bg-black px-3 text-xs font-mono text-white outline-none focus:border-gold-light"
                  />
                  <span className="block text-[10px] text-gray-500">Để trống nếu muốn overlay chạy tới khi tắt thủ công.</span>
                </label>

                <button
                  type="button"
                  onClick={saveEventOverlay}
                  disabled={savingEventOverlay}
                  className="self-end inline-flex h-10 items-center justify-center gap-2 bg-gradient-to-r from-gold-dark to-gold-light px-5 text-[11px] font-display font-black uppercase tracking-widest text-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {savingEventOverlay ? "Đang lưu..." : "Lưu sự kiện"}
                </button>
              </div>

              {promoOverlaySettings.imageUrl && (
                <div className="mt-4 flex items-center gap-3 border border-white/10 bg-black/50 p-3">
                  <img src={promoOverlaySettings.imageUrl} alt="" className="h-14 w-14 object-contain" />
                  <div className="min-w-0 text-xs">
                    <div className="font-display font-bold uppercase tracking-widest text-white">
                      Overlay đang lưu: {promoOverlaySettings.enabled ? "đang bật" : "đang tắt"}
                    </div>
                    <div className="mt-1 truncate font-mono text-[11px] text-gray-500">
                      {promoOverlaySettings.fileName || promoOverlaySettings.imageUrl}
                    </div>
                  </div>
                </div>
              )}

              {(promoOverlaySettings.library || []).length > 0 && (
                <div className="mt-5 border-t border-white/10 pt-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-[10px] font-display font-black uppercase tracking-widest text-white">
                      Thư viện promo
                    </h3>
                    <span className="text-[10px] text-gray-500">{promoOverlaySettings.library?.length || 0} khung</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {(promoOverlaySettings.library || []).map((item) => (
                      <div
                        key={item.url}
                        className={classNames(
                          "group relative border bg-black/70 p-2 text-left transition-colors hover:border-gold-light",
                          promoOverlaySettings.imageUrl === item.url ? "border-gold-light" : "border-white/10",
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => useLibraryOverlay(item)}
                          className="block w-full text-left"
                        >
                          <div className="aspect-square bg-[#080808] p-2">
                            <img src={item.url} alt="" className="h-full w-full object-contain" />
                          </div>
                          <div className="mt-2 truncate text-[10px] font-mono text-gray-500 group-hover:text-gold-light">
                            {item.fileName}
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteLibraryOverlay(item)}
                          className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center border border-red-500/30 bg-black/80 text-red-300 opacity-100 transition-colors hover:border-red-400 hover:bg-red-500 hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
                          aria-label="Xóa khung promo khỏi thư viện"
                          title="Xóa khỏi thư viện"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {products.length > 0 && (
              <div className="border border-white/5 bg-[#0B0B0B] p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="font-display text-xs font-black uppercase tracking-widest text-white">Danh sách ảnh sản phẩm</h2>
                  <span className="text-[11px] text-gray-500">{products.length} ảnh</span>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {products.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveProductId(item.id)}
                      className={classNames(
                        "flex min-w-0 items-center gap-3 border p-2 text-left transition-colors",
                        activeProduct?.id === item.id ? "border-gold-light bg-gold-dark/10" : "border-white/5 bg-black/40 hover:border-white/20",
                      )}
                    >
                      <img src={item.url} alt="" className="h-11 w-11 shrink-0 object-cover" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[11px] font-display font-bold uppercase tracking-widest text-white">Ảnh {index + 1}</span>
                        <span className="block truncate text-[11px] font-mono text-gray-500">{item.file.name}</span>
                      </span>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(event) => {
                          event.stopPropagation();
                          removeProduct(item.id);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            event.stopPropagation();
                            removeProduct(item.id);
                          }
                        }}
                        className="shrink-0 px-2 py-1 text-[10px] font-display font-bold uppercase tracking-widest text-gray-500 hover:text-red-400"
                      >
                        Xóa
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="border border-white/5 bg-[#0B0B0B] p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2 text-xs font-display font-bold uppercase tracking-widest text-gold-light">
                <Maximize2 className="h-4 w-4" />
                Tùy chỉnh xuất ảnh
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
                <ControlRange label="Phóng to ảnh" value={activeProduct?.scale || 1} min={0.25} max={2} step={0.01} display={(activeProduct?.scale || 1).toFixed(2)} onChange={(value) => updateActiveProduct({ scale: value })} disabled={!activeProduct} />
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

              <label className="space-y-2">
  <span className="block text-[10px] font-display font-bold uppercase tracking-widest text-gray-400">
    Tên file xuất
  </span>
  <input
    type="text"
    value={exportBaseName}
    onChange={(e) => setExportBaseName(e.target.value)}
    placeholder="may-khoan-qzj005"
    className="h-10 w-full border border-white/10 bg-black px-3 text-xs font-mono text-white outline-none focus:border-gold-light"
  />
</label>

              <div className="mt-5 border-t border-white/5 pt-5">
                <div className="mb-3 flex items-center gap-2 text-xs font-display font-bold uppercase tracking-widest text-gold-light">
                  <Palette className="h-4 w-4" />
                  Nền ảnh xuất
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
                  <ModeButton active={backgroundMode === "white"} label="Nền trắng" onClick={() => setBackgroundMode("white")} />
                  <ModeButton active={backgroundMode === "transparent"} label="Không nền" onClick={() => setBackgroundMode("transparent")} />
                  <ModeButton active={backgroundMode === "custom"} label="Màu tùy chọn" onClick={() => setBackgroundMode("custom")} />
                  <label className={classNames("flex h-10 items-center gap-2 border border-white/10 bg-black px-3", backgroundMode !== "custom" && "opacity-45")}>
                    <span className="h-5 w-5 border border-white/20" style={{ backgroundColor: customBackground }} />
                    <input
                      type="color"
                      value={customBackground}
                      disabled={backgroundMode !== "custom"}
                      onChange={(e) => setCustomBackground(e.target.value)}
                      className="h-6 w-10 cursor-pointer border-0 bg-transparent p-0 disabled:cursor-not-allowed"
                      aria-label="Chọn màu nền"
                    />
                  </label>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <ActionButton disabled={!activeProduct} onClick={() => downloadProducts("image/webp")} icon={<Download className="h-4 w-4" />} label="Tải WebP" />
                <ActionButton disabled={!activeProduct} onClick={() => downloadProducts("image/png")} icon={<Download className="h-4 w-4" />} label="Tải PNG" variant="outline" />
                <ActionButton onClick={onClearAll} icon={<Eraser className="h-4 w-4" />} label="Xóa tất cả" variant="ghost" />
              </div>
              {products.length > 1 && (
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <ActionButton disabled={!products.length} onClick={() => downloadProducts("image/webp", true)} icon={<Download className="h-4 w-4" />} label="Tải tất cả WebP" variant="outline" />
                  <ActionButton disabled={!products.length} onClick={() => downloadProducts("image/png", true)} icon={<Download className="h-4 w-4" />} label="Tải tất cả PNG" variant="outline" />
                </div>
              )}
            </div>

            <div className="border border-gold-dark/20 bg-gold-dark/5 p-4 text-xs leading-relaxed text-gray-300">
              <div className="mb-1 flex items-center gap-2 font-display font-bold uppercase tracking-widest text-gold-light">
                <Move className="h-4 w-4" />
                Cách dùng nhanh
              </div>
              Chọn ảnh trong danh sách rồi kéo trực tiếp trên khung xem trước để canh vị trí riêng cho từng ảnh. Nền xuất có thể để trắng, trong suốt hoặc màu tùy chọn.
            </div>
          </section>

          <section className="border border-gold-dark/30 bg-[#0B0B0B] p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-sm font-black uppercase tracking-widest text-white">Xem trước</h2>
                <p className="mt-1 text-[11px] text-gray-500">{exportSize} x {exportSize}px</p>
              </div>
              <span className={classNames("rounded-sm px-2 py-1 text-[10px] font-display font-bold uppercase tracking-widest", activeProduct ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-gray-500")}>
                {activeProduct ? "Sẵn sàng" : "Chưa có ảnh"}
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
                  className={classNames("absolute inset-0 h-full w-full touch-none", Boolean(activeProduct) && "cursor-move")}
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

function ControlRange({ label, value, min, max, step, display, disabled, onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <label className={classNames("space-y-2", disabled && "opacity-45")}>
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
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#D89A2B] disabled:cursor-not-allowed"
      />
    </label>
  );
}

function ModeButton({ active, label, onClick }: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        "h-10 border px-3 text-[11px] font-display font-black uppercase tracking-widest transition-colors",
        active ? "border-gold-light bg-gold-dark/10 text-gold-light" : "border-white/10 text-gray-300 hover:border-gold-light hover:text-gold-light",
      )}
    >
      {label}
    </button>
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
