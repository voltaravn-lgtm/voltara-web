import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Product } from "../../types";
import { uploadImageToCloudinary, isCloudinaryConfigured } from "../../lib/cloudinary";
import { Battery, Plus, Edit, Trash2, X, Save, Copy, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Image as ImageIcon, Link as LinkIcon, List, Eye, Upload, Loader2 } from "lucide-react";

// Helper to render markdown and layout codes inside product descriptions
export function formatDescriptionToHtml(desc: string | undefined): string {
  if (!desc) return "";
  
  let html = desc;
  
  // Convert standard markdown bold **text** to <strong>text</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  
  // Convert *text* to <em>text</em>
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  
  // Convert ### Heading to styled title
  html = html.replace(/^### (.*?)$/gm, '<h3 class="text-xs font-display font-semibold tracking-wide text-[#F5C45A] mt-3 mb-1 uppercase">$1</h3>');
  
  // Convert markdown image ![alt](url) to img tags
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-height:180px; margin: 8px auto; display:block;" class="max-w-full my-3 object-contain filter drop-shadow-md border border-white/5 p-1" referrerPolicy="no-referrer" />');
  
  // Convert markdown link [text](url) to anchor tags
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-gold-light underline hover:text-white" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // Convert list bullet lines starting with "- "
  html = html.replace(/^-[ ]+(.*?)$/gm, '<li class="list-disc ml-4 my-0.5 text-gray-300">$1</li>');
  
  // Convert double newlines to paragraphs or simple paragraph breaks
  html = html.replace(/\n/g, "<br />");
  
  return html;
}

export default function ProductsAdmin() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    showToast
  } = useApp();

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isToolbarPreviewMode, setIsToolbarPreviewMode] = useState(false);
  const [uploadingImageTarget, setUploadingImageTarget] = useState<string | null>(null);
  
  const [productForm, setProductForm] = useState<Partial<Product>>({
    id: "",
    name: "",
    voltage: "",
    capacity: "",
    brand: "Voltara",
    cellType: "LiFePO4 Core",
    warranty: "12 tháng",
    image: "/images/voltara_banner.webp",
    description: "",
    category: "pin-may-cong-cu",
    price: "1.200.000đ",
    specs: {}
  });

  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");

  const handleOpenProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({ ...product, images: product.images || [] });
    } else {
      setEditingProduct(null);
      setProductForm({
        id: "VOLTARA-" + Math.floor(Math.random() * 90000 + 10000),
        name: "",
        voltage: "12V",
        capacity: "50Ah",
        brand: "Voltara Max",
        cellType: "Pin Lithium Sắt Phosphate (LiFePO4)",
        warranty: "24 tháng",
        image: "/images/voltara_banner.webp",
        images: [],
        description: "Mô tả sản phẩm bình ắc quy Lithium Voltara chất lượng bộc phát dòng dòng xả lớn.",
        category: "ac-quy-lithium",
        price: "2.500.000₫",
        specs: {
          "Điện thế danh định": "12.8V",
          "Dung lượng danh định": "50Ah",
          "Tuổi thọ thiết kế": "Trên 2000 chu kỳ",
          "Mạch bảo vệ": "BMS thông minh tích hợp bảo vệ quá dòng"
        }
      });
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.id || !productForm.name) {
      showToast("Vui lòng điền đầy đủ ID và Tên sản phẩm!", "warning");
      return;
    }

    const currentForm = productForm as Product;

    if (editingProduct) {
      updateProduct(currentForm);
      showToast("Đã lưu chỉnh sửa sản phẩm thành công!", "success");
    } else {
      if (products.some(p => p.id === currentForm.id)) {
        showToast("ID Sản phẩm bị trùng lặp! Hãy đổi ID khác.", "error");
        return;
      }
      addProduct(currentForm);
      showToast("Đã thêm sản phẩm mới thành công!", "success");
    }
    setIsProductModalOpen(false);
  };

  const handleDeleteProductPrompt = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}" khỏi kho?`)) {
      deleteProduct(id);
    }
  };

  const handleCopyProduct = (prod: Product) => {
    const newId = prod.id + "-copy-" + Math.floor(Math.random() * 900 + 100);
    setEditingProduct(null); // Save as new unique entry
    setProductForm({
      ...prod,
      id: newId,
      name: prod.name + " (Bản sao)",
    });
    setIsToolbarPreviewMode(false);
    setIsProductModalOpen(true);
  };

  const insertFormatting = (type: "bold" | "italic" | "align-left" | "align-center" | "align-right" | "image" | "bullet" | "heading" | "link") => {
    const textarea = document.getElementById("product-description-textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const text = textarea.value || "";
    const selectedText = text.substring(startPos, endPos);

    let replacement = "";
    switch (type) {
      case "bold":
        replacement = `**${selectedText || "Chữ in đậm"}**`;
        break;
      case "italic":
        replacement = `*${selectedText || "Chữ in nghiêng"}*`;
        break;
      case "align-left":
        replacement = `<div class="text-left">\n${selectedText || "Nội dung căn trái"}\n</div>`;
        break;
      case "align-center":
        replacement = `<div class="text-center">\n${selectedText || "Nội dung căn giữa"}\n</div>`;
        break;
      case "align-right":
        replacement = `<div class="text-right">\n${selectedText || "Nội dung căn phải"}\n</div>`;
        break;
      case "image":
        replacement = `\n![Mô tả ảnh](${selectedText || "url_hinh_anh_voltara_banner_v.png"})\n`;
        break;
      case "bullet":
        replacement = `\n- ${selectedText || "Mục dòng liệt kê"}`;
        break;
      case "heading":
        replacement = `\n### ${selectedText || "Tiêu đề phụ"}\n`;
        break;
      case "link":
        replacement = `[${selectedText || "Văn bản hiển thị"}](https://voltara.vn)`;
        break;
    }

    const newContent = text.substring(0, startPos) + replacement + text.substring(endPos);
    setProductForm(prev => ({ ...prev, description: newContent }));
    
    // reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(startPos + replacement.length, startPos + replacement.length);
    }, 50);
  };

  const handleCloudinaryUpload = async (
    files: FileList | null,
    target: "main" | "gallery" | "description",
  ) => {
    if (!files || files.length === 0) return;

    if (!isCloudinaryConfigured()) {
      showToast("Chưa cấu hình Cloudinary. Thêm NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME và NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.", "warning");
      return;
    }

    const selectedFiles = Array.from(files);
    setUploadingImageTarget(target);

    try {
      const urls: string[] = [];
      for (const file of selectedFiles) {
        urls.push(await uploadImageToCloudinary(file));
      }

      if (target === "main") {
        setProductForm(prev => ({ ...prev, image: urls[0] }));
      }

      if (target === "gallery") {
        setProductForm(prev => ({
          ...prev,
          images: [...(prev.images || []), ...urls],
        }));
      }

      if (target === "description") {
        const markdownImages = urls.map((url, index) => `![Ảnh sản phẩm ${index + 1}](${url})`).join("\n");
        setProductForm(prev => ({
          ...prev,
          description: prev.description ? `${prev.description}\n${markdownImages}` : markdownImages,
        }));
      }

      showToast(`Đã tải ${urls.length} ảnh lên Cloudinary.`, "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tải ảnh lên Cloudinary.";
      showToast(message, "error");
    } finally {
      setUploadingImageTarget(null);
    }
  };

  const insertImageUrlToDescription = (url: string, alt = "Ảnh sản phẩm") => {
    if (!url.trim()) return;

    const markdownImage = `![${alt}](${url.trim()})`;
    setProductForm(prev => ({
      ...prev,
      description: prev.description ? `${prev.description}\n${markdownImage}` : markdownImage,
    }));
    setIsToolbarPreviewMode(false);
    showToast("Đã chèn ảnh vào mô tả sản phẩm.", "success");
  };

  const handleAddSpecItem = () => {
    if (!newSpecKey || !newSpecValue) return;
    setProductForm(prev => ({
      ...prev,
      specs: {
        ...(prev.specs || {}),
        [newSpecKey]: newSpecValue
      }
    }));
    setNewSpecKey("");
    setNewSpecValue("");
  };

  const handleRemoveSpecItem = (key: string) => {
    setProductForm(prev => {
      const copy = { ...(prev.specs || {}) };
      delete copy[key];
      return { ...prev, specs: copy };
    });
  };

  return (
    <div id="products-admin-module" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-display font-semibold tracking-wide text-white uppercase flex items-center gap-2 text-gold-light">
            <Battery className="w-4 h-4 scale-110" />
            QUẢN LÝ KHO HÀNG SẢN PHẨM ({products.length})
          </h2>
          <p className="text-xs text-gray-400">Xem và hiệu chỉnh dòng xả sạc, dung lượng pin, bảo hành kỹ thuật của các dòng sản phẩm.</p>
        </div>
        
        <button
          onClick={() => handleOpenProductModal()}
          className="gold-gradient-bg hover:opacity-95 text-black font-display font-bold py-2.5 px-4 text-[11px] tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 self-start cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Thêm sản phẩm
        </button>
      </div>

      {/* Catalog lists */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        {products.map((prod) => (
          <div key={prod.id} className="bg-black/80 border border-[#1A1A1A] hover:border-gold-dark/40 p-4 transition-all duration-350 flex flex-col justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-[#111] border border-[#222] p-1 flex items-center justify-center shrink-0">
                <img 
                  src={prod.image} 
                  alt={prod.name} 
                  className="max-h-full max-w-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-gold-light tracking-wide bg-gold-dark/10 p-0.5">{prod.voltage} / {prod.capacity}</span>
                  <span className="text-[9px] text-gray-500 font-mono">ID: {prod.id}</span>
                </div>
                <h3 className="text-xs font-display font-bold text-white uppercase line-clamp-1 leading-snug">{prod.name}</h3>
                <p className="text-[10px] text-gray-500 font-bold">{prod.price || "Liên hệ"}</p>
                <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">{prod.description}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#1A1A1A] flex items-center justify-between">
              <span className="text-[9px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 font-bold uppercase">{prod.category}</span>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyProduct(prod)}
                  className="bg-[#111] hover:bg-[#222] border border-white/5 text-[10px] font-display uppercase tracking-wider text-[#A3E635] px-2.5 py-1 flex items-center gap-1 transition-all cursor-pointer"
                  title="Nhân bản sản phẩm"
                >
                  <Copy className="w-3 h-3 text-[#A3E635]" />
                  Nhân bản
                </button>
                <button
                  onClick={() => handleOpenProductModal(prod)}
                  className="bg-[#111] hover:bg-[#222] border border-white/5 text-[10px] font-display uppercase tracking-wider text-white px-2.5 py-1 flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Edit className="w-3 h-3 text-[#F5C45A]" />
                  Sửa
                </button>
                <button
                  onClick={() => handleDeleteProductPrompt(prod.id, prod.name)}
                  className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 text-[10px] px-2 py-1 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* POPUP MODAL */}
      {isProductModalOpen && (
        <div id="product-admin-modal" className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0A0A0A] border border-gold-dark/40 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_15px_50px_rgba(216,154,43,0.15)] flex flex-col justify-between">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-sm font-display font-black tracking-widest text-[#F5C45A] uppercase flex items-center gap-2">
                <Battery className="w-4 h-4 text-gold-light" />
                {editingProduct ? "CHỈNH SỬA SẢN PHẨM" : "THÊM SẢN PHẨM MỚI"}
              </h2>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1">
                  <label className="text-[9px] font-display font-extrabold uppercase tracking-widest text-gray-400">ID Sản phẩm (Độc nhất)</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingProduct}
                    value={productForm.id}
                    onChange={(e) => setProductForm(prev => ({ ...prev, id: e.target.value }))}
                    className="w-full bg-black border border-[#1A1A1A] focus:border-gold-light text-[#ECECEC] px-3.5 py-2.5 text-xs focus:outline-none font-mono disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-display font-extrabold uppercase tracking-widest text-gray-400">Tên Sản phẩm</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-black border border-[#1A1A1A] focus:border-gold-light text-[#ECECEC] px-3.5 py-2.5 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-display font-extrabold uppercase tracking-widest text-gray-400">Nhãn hiệu điện thế (Voltage)</label>
                  <input
                    type="text"
                    required
                    value={productForm.voltage}
                    onChange={(e) => setProductForm(prev => ({ ...prev, voltage: e.target.value }))}
                    className="w-full bg-black border border-[#1A1A1A] focus:border-gold-light text-[#ECECEC] px-3.5 py-2.5 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-display font-extrabold uppercase tracking-widest text-gray-400">Dung lượng (Capacity)</label>
                  <input
                    type="text"
                    required
                    value={productForm.capacity}
                    onChange={(e) => setProductForm(prev => ({ ...prev, capacity: e.target.value }))}
                    className="w-full bg-black border border-[#1A1A1A] focus:border-gold-light text-[#ECECEC] px-3.5 py-2.5 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-display font-extrabold uppercase tracking-widest text-gray-400">Nhãn giá tiền hiển thị</label>
                  <input
                    type="text"
                    value={productForm.price}
                    onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full bg-black border border-[#1A1A1A] focus:border-gold-light text-[#ECECEC] px-3.5 py-2.5 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-display font-extrabold uppercase tracking-widest text-gray-400">Danh mục sản phẩm (Category)</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-black border border-[#1A1A1A] text-xs px-3.5 py-2.5 text-[#ECECEC] focus:outline-none uppercase font-bold"
                  >
                    <option value="pin-may-cong-cu">PIN MÁY CÔNG CỤ</option>
                    <option value="ups-cua-cuon">UPS CỬA CUỐN</option>
                    <option value="pin-xe-dien">PIN XE ĐIỆN</option>
                    <option value="ac-quy-lithium">ẮC QUY LITHIUM</option>
                    <option value="ac-quy-chi-axit">ẮC QUY CHÌ AXIT</option>
                    <option value="pin-luu-tru-nang-luong">PIN LƯU TRỮ NĂNG LƯỢNG</option>
                    <option value="phu-kien-linh-kien">PHỤ KIỆN & LINH KIỆN</option>
                  </select>
                </div>

                <div className="col-span-1 sm:col-span-2 space-y-1">
                  <label className="text-[9px] font-display font-extrabold uppercase tracking-widest text-[#F5C45A]">Đường dẫn ảnh Đại diện chính</label>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className={`inline-flex items-center gap-1.5 px-3 py-2 text-[10px] font-display font-bold uppercase tracking-widest border cursor-pointer transition-colors ${uploadingImageTarget === "main" ? "border-gold-light text-gold-light" : "border-gold-dark/40 text-gold-light hover:border-gold-light"}`}>
                      {uploadingImageTarget === "main" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      <span>{uploadingImageTarget === "main" ? "Đang tải..." : "Tải ảnh từ máy"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        disabled={Boolean(uploadingImageTarget)}
                        onChange={(e) => {
                          handleCloudinaryUpload(e.target.files, "main");
                          e.target.value = "";
                        }}
                      />
                    </label>
                    {!isCloudinaryConfigured() && (
                      <span className="text-[10px] text-amber-400">Chưa cấu hình Cloudinary</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={productForm.image}
                    onChange={(e) => setProductForm(prev => ({ ...prev, image: e.target.value }))}
                    className="w-full bg-black border border-[#1A1A1A] text-xs px-3.5 py-2.5 text-[#ECECEC] focus:outline-none font-mono"
                  />
                  {productForm.image && (
                    <div className="flex flex-wrap items-end gap-3">
                      <div className="w-24 h-20 bg-black border border-white/10 flex items-center justify-center p-1.5">
                        <img src={productForm.image} alt="Preview" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                      </div>
                      <button
                        type="button"
                        onClick={() => insertImageUrlToDescription(productForm.image || "", productForm.name || "Ảnh sản phẩm")}
                        className="border border-white/15 px-3 py-2 text-[10px] font-display font-bold uppercase tracking-widest text-gray-300 hover:border-gold-light hover:text-gold-light transition-colors"
                      >
                        Chèn ảnh này vào mô tả
                      </button>
                    </div>
                  )}
                </div>

                <div className="col-span-1 sm:col-span-2 space-y-1">
                  <label className="text-[9px] font-display font-extrabold uppercase tracking-widest text-gray-400">Đường dẫn ảnh bổ sung (mỗi đường dẫn ảnh đặt trên một dòng)</label>
                  <label className={`inline-flex items-center gap-1.5 px-3 py-2 text-[10px] font-display font-bold uppercase tracking-widest border cursor-pointer transition-colors ${uploadingImageTarget === "gallery" ? "border-gold-light text-gold-light" : "border-white/15 text-gray-300 hover:border-gold-light hover:text-gold-light"}`}>
                    {uploadingImageTarget === "gallery" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>{uploadingImageTarget === "gallery" ? "Đang tải..." : "Tải ảnh bổ sung"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      disabled={Boolean(uploadingImageTarget)}
                      onChange={(e) => {
                        handleCloudinaryUpload(e.target.files, "gallery");
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <textarea
                    rows={3}
                    placeholder="https://example.com/image2.jpg&#10;https://example.com/image3.jpg"
                    value={productForm.images ? productForm.images.join("\n") : ""}
                    onChange={(e) => {
                      const lines = e.target.value.split("\n").map(line => line.trim()).filter(Boolean);
                      setProductForm(prev => ({ ...prev, images: lines }));
                    }}
                    className="w-full bg-black border border-[#1A1A1A] text-xs px-3.5 py-2.5 text-[#ECECEC] focus:outline-none font-mono placeholder:text-gray-700 leading-relaxed"
                  />
                  {productForm.images && productForm.images.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {productForm.images.map((imageUrl, index) => (
                        <div key={`${imageUrl}-${index}`} className="space-y-2">
                          <div className="w-20 h-16 bg-black border border-white/10 flex items-center justify-center p-1.5">
                            <img src={imageUrl} alt="" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                          </div>
                          <button
                            type="button"
                            onClick={() => insertImageUrlToDescription(imageUrl, `${productForm.name || "Ảnh sản phẩm"} ${index + 1}`)}
                            className="block w-20 border border-white/10 px-1.5 py-1 text-[8.5px] font-display font-bold uppercase tracking-wider text-gray-400 hover:border-gold-light hover:text-gold-light"
                          >
                            Chèn
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="col-span-1 sm:col-span-2 space-y-2">
                  <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-1">
                    <label className="text-[9px] font-display font-extrabold uppercase tracking-widest text-gray-400">
                      Mô tả chi tiết và Trình soạn thảo
                    </label>
                    <div className="flex items-center gap-1.5 bg-black p-0.5 border border-[#111]">
                      <button
                        type="button"
                        onClick={() => setIsToolbarPreviewMode(false)}
                        className={`text-[9.5px] font-display font-bold uppercase py-1 px-2.5 tracking-wider transition-colors cursor-pointer ${!isToolbarPreviewMode ? "gold-gradient-bg text-black font-black" : "text-gray-400 hover:text-white"}`}
                      >
                        Soạn thảo
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsToolbarPreviewMode(true)}
                        className={`text-[9.5px] font-display font-bold uppercase py-1 px-2.5 tracking-wider transition-colors cursor-pointer ${isToolbarPreviewMode ? "gold-gradient-bg text-black font-black" : "text-gray-400 hover:text-white"}`}
                      >
                        Xem trước
                      </button>
                    </div>
                  </div>

                  {/* Toolbar Row (only visible in write mode) */}
                  {!isToolbarPreviewMode && (
                    <div className="flex flex-wrap items-center gap-1 p-1.5 bg-[#0D0D0D] border border-[#1A1A1A] select-none rounded-md">
                      <button
                        type="button"
                        onClick={() => insertFormatting("bold")}
                        className="p-1 hover:bg-gold-dark/20 text-gray-400 hover:text-gold-light transition-colors cursor-pointer"
                        title="In đậm (Bold)"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting("italic")}
                        className="p-1 hover:bg-gold-dark/20 text-gray-400 hover:text-gold-light transition-colors cursor-pointer"
                        title="In nghiêng (Italic)"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      
                      <div className="w-[1px] h-4 bg-white/10 mx-1" />

                      <button
                        type="button"
                        onClick={() => insertFormatting("heading")}
                        className="px-1.5 py-0.5 hover:bg-gold-dark/20 text-gray-400 hover:text-gold-light transition-colors cursor-pointer text-[10px] font-display font-black leading-none uppercase border border-white/5"
                        title="Thêm tiêu đề phụ"
                      >
                        H3
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting("bullet")}
                        className="p-1 hover:bg-gold-dark/20 text-gray-400 hover:text-gold-light transition-colors cursor-pointer"
                        title="Gạch đầu dòng (List)"
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>

                      <div className="w-[1px] h-4 bg-white/10 mx-1" />

                      <button
                        type="button"
                        onClick={() => insertFormatting("align-left")}
                        className="p-1 hover:bg-gold-dark/20 text-gray-400 hover:text-gold-light transition-colors cursor-pointer"
                        title="Căn lề trái"
                      >
                        <AlignLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting("align-center")}
                        className="p-1 hover:bg-gold-dark/20 text-gray-400 hover:text-gold-light transition-colors cursor-pointer"
                        title="Căn lề giữa"
                      >
                        <AlignCenter className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting("align-right")}
                        className="p-1 hover:bg-gold-dark/20 text-gray-400 hover:text-gold-light transition-colors cursor-pointer"
                        title="Căn lề phải"
                      >
                        <AlignRight className="w-3.5 h-3.5" />
                      </button>

                      <div className="w-[1px] h-4 bg-white/10 mx-1" />

                      <button
                        type="button"
                        onClick={() => insertFormatting("image")}
                        className="p-1 hover:bg-gold-dark/20 text-gray-400 hover:text-gold-light transition-colors cursor-pointer"
                        title="Chèn ảnh sinh động dạng URL"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                      </button>
                      <label
                        className="p-1 hover:bg-gold-dark/20 text-gray-400 hover:text-gold-light transition-colors cursor-pointer"
                        title="Tải ảnh và chèn vào mô tả"
                      >
                        {uploadingImageTarget === "description" ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="sr-only"
                          disabled={Boolean(uploadingImageTarget)}
                          onChange={(e) => {
                            handleCloudinaryUpload(e.target.files, "description");
                            e.target.value = "";
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => insertFormatting("link")}
                        className="p-1 hover:bg-gold-dark/20 text-gray-400 hover:text-gold-light transition-colors cursor-pointer"
                        title="Chèn liên kết"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {isToolbarPreviewMode ? (
                    <div 
                      className="w-full bg-black border border-[#1A1A1A] p-4 text-xs leading-relaxed max-h-[160px] min-h-[120px] overflow-y-auto text-gray-300 rounded-md overflow-x-hidden font-sans"
                      dangerouslySetInnerHTML={{ __html: formatDescriptionToHtml(productForm.description) }}
                    />
                  ) : (
                    <textarea
                      id="product-description-textarea"
                      rows={5}
                      value={productForm.description}
                      onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Nhập mô tả kỹ thuật chi tiết của sản phẩm. Bạn có thể bôi đen chữ để bấm căn lề, in đậm, in nghiêng hoặc chèn hình ảnh trên thanh công cụ..."
                      className="w-full bg-black border border-[#1A1A1A] text-xs px-3.5 py-2.5 text-[#ECECEC] focus:outline-none focus:border-gold-light leading-relaxed font-sans"
                    />
                  )}
                </div>

              </div>

              {/* Dynamic specs builder */}
              <div className="border border-[#1A1A1A] p-4 bg-black/50 space-y-3">
                <span className="text-[9px] font-display font-extrabold uppercase tracking-widest text-[#F5C45A] block leading-none">Thông số kỹ thuật đi kèm</span>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Tên thông số (Vd: Dòng xả liên tục)"
                    value={newSpecKey}
                    onChange={(e) => setNewSpecKey(e.target.value)}
                    className="flex-1 bg-black border border-[#1A1A1A] text-xs px-3 py-2 text-white placeholder:text-gray-600 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Giá trị (Vd: 35A)"
                    value={newSpecValue}
                    onChange={(e) => setNewSpecValue(e.target.value)}
                    className="flex-1 bg-black border border-[#1A1A1A] text-xs px-3 py-2 text-white placeholder:text-gray-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddSpecItem}
                    className="bg-gold-dark/20 hover:bg-gold-dark text-gold-light hover:text-black border border-gold-dark/30 text-xs font-display font-black tracking-widest uppercase transition-all px-4 py-2 cursor-pointer"
                  >
                    Thêm thông số
                  </button>
                </div>

                <div className="space-y-1.5 pt-2">
                  {Object.entries(productForm.specs || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between bg-black/80 px-3 py-1.5 text-xs text-gray-300 border border-[#1D1D1D]">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">{key}:</span>
                        <span>{value}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecItem(key)}
                        className="text-red-400 hover:text-red-500 text-[10px] uppercase font-bold"
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form triggers */}
              <div className="pt-4 border-t border-[#1A1A1A] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-3 border border-white/5 text-xs font-display text-gray-400 font-bold tracking-widest uppercase hover:text-white transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="gold-gradient-bg text-black font-display font-bold py-3 px-6 text-xs tracking-widest uppercase hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Lưu sản phẩm
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
