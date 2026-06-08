/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Grid, List, Search, Filter, ShieldCheck, Phone, RefreshCw, X, ShoppingCart, Info, Check, Cpu, Shield, Zap, Leaf } from "lucide-react";
import { useApp } from "../context/AppContext";
import { SectionTitle, ProductCard } from "../components/Cards";
import QuoteRequestModal from "../components/QuoteRequestModal";
import { getProductHref } from "../lib/productRoutes";

// Helper to render markdown and custom layouts inside descriptions
function formatDescriptionToHtml(desc: string | undefined): string {
  if (!desc) return "";
  
  let html = desc;
  
  // Convert standard markdown bold **text** to <strong>text</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  
  // Convert *text* to <em>text</em>
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  
  // Convert ### Heading to styled title
  html = html.replace(/^### (.*?)$/gm, '<h3 class="text-xs font-display font-semibold tracking-wide text-[#F5C45A] mt-3 mb-1 uppercase">$1</h3>');
  
  // Convert markdown image ![alt](url) to img tags
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-height:220px; margin: 12px auto; display:block;" class="max-w-full my-3 object-contain filter drop-shadow-md border border-white/5 p-1" referrerPolicy="no-referrer" />');
  
  // Convert markdown link [text](url) to anchor tags
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-gold-light underline hover:text-white" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // Convert list bullet lines starting with "- "
  html = html.replace(/^-[ ]+(.*?)$/gm, '<li class="list-disc ml-4 my-0.5 text-gray-300">$1</li>');
  
  // Convert double newlines to paragraphs or simple paragraph breaks
  html = html.replace(/\n/g, "<br />");
  
  return html;
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedIdFromUrl = searchParams.get("select");
  const { products, showToast } = useApp();

  const [activeCategory, setActiveCategory] = useState("all");
  const [filterBrand, setFilterBrand] = useState("all");
  const [filterVoltage, setFilterVoltage] = useState("all");
  const [filterCapacity, setFilterCapacity] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [activeDetailImage, setActiveDetailImage] = useState<string>("");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteProductName, setQuoteProductName] = useState("");

  // Count active filters for badge
  const activeFiltersCount = 
    (activeCategory !== "all" ? 1 : 0) + 
    (filterBrand !== "all" ? 1 : 0) + 
    (filterVoltage !== "all" ? 1 : 0) + 
    (filterCapacity !== "all" ? 1 : 0) +
    (searchQuery ? 1 : 0);

  // Categories list
  const sidebarCategories = [
    { id: "all", name: "TẤT CẢ SẢN PHẨM" },
    { id: "pin-may-cong-cu", name: "PIN MÁY CÔNG CỤ" },
    { id: "ups-cua-cuon", name: "UPS CỬA CUỐN" },
    { id: "pin-xe-dien", name: "PIN XE ĐIỆN" },
    { id: "ac-quy-lithium", name: "ẮC QUY LITHIUM" },
    { id: "ac-quy-chi-axit", name: "ẮC QUY CHÌ AXIT" },
    { id: "pin-luu-tru-nang-luong", name: "PIN LƯU TRỮ NĂNG LƯỢNG" },
    { id: "phu-kien-linh-kien", name: "PHỤ KIỆN & LINH KIỆN" },
  ];

  // Auto detect select from url query
  useEffect(() => {
    if (selectedIdFromUrl) {
      const prod = products.find(p => p.id === selectedIdFromUrl);
      if (prod) {
        setSelectedProduct(prod);
        setActiveDetailImage(prod.image);
      }
    }
  }, [selectedIdFromUrl, products]);

  // Extract option list dynamically for filters
  const brands = ["all", ...Array.from(new Set(products.map(p => p.brand)))];
  const voltages = ["all", ...Array.from(new Set(products.map(p => p.voltage)))];
  const capacities = ["all", ...Array.from(new Set(products.map(p => p.capacity)))];

  // Filter and sort products
  const filteredProducts = products.filter(prod => {
    const matchesCategory = activeCategory === "all" || prod.category === activeCategory;
    const matchesBrand = filterBrand === "all" || prod.brand === filterBrand;
    const matchesVoltage = filterVoltage === "all" || prod.voltage === filterVoltage;
    const matchesCapacity = filterCapacity === "all" || prod.capacity === filterCapacity;
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prod.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesBrand && matchesVoltage && matchesCapacity && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === "newest") return b.id.localeCompare(a.id); // Mock new
    if (sortBy === "oldest") return a.id.localeCompare(b.id);
    return 0;
  });

  const handleSelectProduct = (product: any) => {
    setSelectedProduct(product);
    setActiveDetailImage(product.image);
    setSearchParams({ select: product.id });
  };

  const handleCloseDetail = () => {
    setSelectedProduct(null);
    setActiveDetailImage("");
    setSearchParams({});
  };

  const resetFilters = () => {
    setFilterBrand("all");
    setFilterVoltage("all");
    setFilterCapacity("all");
    setSearchQuery("");
    setActiveCategory("all");
  };

  const handleRequestQuote = (productName: string) => {
    setQuoteProductName(productName);
    setIsQuoteModalOpen(true);
  };

  return (
    <div id="products-page" className="pb-20 relative bg-[#050505]">
      
      {/* 1. HERO BANNER - FULL SCREEN / HIGH QUALITY MATCHING HOMEPAGE & ABOUT */}
      <section className="relative min-h-[45vh] lg:min-h-[55vh] flex items-center overflow-hidden bg-black pt-16 lg:pt-24 pb-16 lg:pb-24 mb-12">
        {/* Full-screen Background Banner Image */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img 
            src="/images/san-pham.webp" 
            alt="Voltara Products Banner Background" 
            className="w-full h-full object-cover object-center transform scale-100 opacity-80"
            referrerPolicy="no-referrer"
          />
          {/* Overlay to ensure maximum text readability and aesthetic integration */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 lg:from-black/95 lg:via-black/75 lg:to-transparent/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          {/* Breadcrumb navigation */}
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-gray-400 mb-6">
            <Link to="/" className="hover:text-gold-light pointer-events-auto transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-gold-dark">Sản phẩm</span>
          </div>

          <div className="max-w-3xl flex flex-col items-start text-left">
            <span className="text-xs font-display font-semibold tracking-[0.25em] text-gold-light uppercase mb-2">
              MÀNG LƯỚI NĂNG LƯỢNG
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black leading-tight text-white uppercase mb-6 glow-text">
              SẢN PHẨM VOLTARA
            </h1>
            
            <div className="h-[2px] bg-gradient-to-r from-gold-dark to-transparent w-28 mb-6" />

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-2xl backdrop-blur-[1px]">
              Voltara cung cấp đa dạng các hệ pin Lithium, UPS cửa cuốn và tủ ắc quy điện áp cao, được đo kiểm nghiêm ngặt, cách điện toàn mạch an toàn cho gia đình đến công trường.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 2. BODY LAYOUT - SIDEBAR & PRODUCTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar on left - Hidden on mobile, visible on desktop */}
          <div className="hidden lg:block lg:col-span-3 space-y-6" id="products-sidebar">
            
            {/* Search Input inline */}
            <div className="bg-[#121212] border border-white/5 p-4 rounded-lg">
              <h4 className="text-[11px] font-display font-bold text-gold-light uppercase tracking-wider mb-3">TÌM KIẾM SẢN PHẨM</h4>
              <div className="flex items-center bg-black border border-white/10 px-3 h-10">
                <Search className="w-4 h-4 text-gray-500 shrink-0 mr-2" />
                <input
                  type="text"
                  placeholder="Nhập từ khóa cần tìm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-[#ECECEC] placeholder-gray-600 focus:outline-none w-full"
                />
              </div>
            </div>

            {/* A. CATEGORIES SIDEBAR LIST */}
            <div className="bg-[#121212] border border-white/5 p-4 rounded-lg">
              <h4 className="text-[11px] font-display font-bold text-[#ECECEC] uppercase tracking-wider mb-3">Danh Mục Sản Phẩm</h4>
              <div className="flex flex-col gap-1.5 font-display text-[10.5px]">
                {sidebarCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full text-left px-3 py-2.5 transition-all flex items-center justify-between group ${
                      activeCategory === cat.id
                        ? "bg-[#D89A2B] text-black font-extrabold"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-sm ${activeCategory === cat.id ? "bg-black/20 text-black font-bold" : "bg-white/5 text-gray-600"}`}>
                      {cat.id === "all" ? products.length : products.filter(p => p.category === cat.id).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* B. BRAND PROMISE INFO BOX (CAM KẾT VOLTARA) */}
            <div className="bg-[#121212] border border-white/5 p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-gold-light">
                <ShieldCheck className="w-16 h-16" />
              </div>
              <h4 className="text-[11px] font-display font-extrabold text-gold-light uppercase tracking-widest border-b border-white/5 pb-2.5 mb-3 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-gold-dark" />
                <span>CAM KẾT VOLTARA</span>
              </h4>
              <ul className="space-y-2 text-[10.5px] text-gray-400">
                <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-gold-light shrink-0 mt-0.5" /> <span>Dung lượng thực chuẩn 100%</span></li>
                <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-gold-light shrink-0 mt-0.5" /> <span>Hóa chất cell pin nhập khẩu cao cấp</span></li>
                <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-gold-light shrink-0 mt-0.5" /> <span>Phiếu bảo hành minh bạch minh bạch</span></li>
                <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-gold-light shrink-0 mt-0.5" /> <span>Đội ngũ kỹ thuật hỗ trợ tận tâm 24/7</span></li>
                <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-gold-light shrink-0 mt-0.5" /> <span>Giao vận màng lưới toàn quốc</span></li>
              </ul>
            </div>

            {/* C. DIRECT HOTLINE ADVISOR CAN TU VAN? */}
            <div className="border border-gold-dark/20 bg-gold-dark/5 p-5 text-center">
              <h4 className="text-[11px] font-display font-bold text-white uppercase tracking-wider mb-1">CẦN TƯ VẤN SẢN PHẨM?</h4>
              <p className="text-[10px] text-gray-500 mb-3.5">Hỗi trợ kỹ thuật giải đáp 24/7 miễn phí cuộc gọi.</p>
              <a href="tel:19001234" className="inline-flex items-center gap-2 bg-gold-dark text-black font-mono font-extrabold text-sm px-4 py-2.5 rounded-md shadow-[0_0_10px_rgba(216,154,43,0.3)] hover:bg-gold-light transition-all">
                <Phone className="w-4 h-4" />
                <span>1900 1234</span>
              </a>
              <span className="block text-[8.5px] text-gray-600 mt-2 font-mono">(8h00 - 17h30, Thứ 2 - Thứ 7)</span>
            </div>

          </div>

          {/* Product grid pane on right */}
          <div className="lg:col-span-9 space-y-6" id="products-grid-pane">
            
            {/* Top Toolbar: Filters & Toggle View modes */}
            <div className="bg-[#121212] border border-white/5 p-3 md:p-4 flex flex-col gap-4">
              
              {/* Mobile quick action filter trigger row (Only visible below lg screens) */}
              <div className="flex lg:hidden flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                {/* Search Bar for Mobile */}
                <div className="flex-1 flex items-center bg-black border border-white/10 px-3 h-10">
                  <Search className="w-4 h-4 text-gray-500 shrink-0 mr-2" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-xs text-[#ECECEC] placeholder-gray-600 focus:outline-none w-full"
                  />
                </div>

                <div className="flex items-center gap-2 justify-between">
                  {/* Trigger mobile filter panel */}
                  <button
                    onClick={() => setIsMobileFiltersOpen(true)}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 h-10 px-4 text-xs font-display font-bold uppercase tracking-wider border cursor-pointer select-none transition-all ${
                      activeFiltersCount > 0 
                        ? "bg-gold-dark border-transparent text-black" 
                        : "bg-black border-white/10 text-gray-300 hover:border-gold-light"
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>Bộ Lọc</span>
                    {activeFiltersCount > 0 && (
                      <span className="bg-black text-white text-[9px] font-mono px-1.5 py-0.5 rounded-full font-black ml-1">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>

                  {/* Reset button if filter is active */}
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={resetFilters}
                      className="h-10 w-10 flex items-center justify-center bg-black border border-white/10 text-gray-400 hover:text-gold-light active:scale-95 transition-all"
                      title="Xóa tất cả bộ lọc"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}

                  {/* View Mode controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`h-10 w-10 flex items-center justify-center border ${viewMode === "grid" ? "bg-[#D89A2B] border-transparent text-black" : "bg-black border-white/10 text-gray-500"}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`h-10 w-10 flex items-center justify-center border ${viewMode === "list" ? "bg-[#D89A2B] border-transparent text-black" : "bg-black border-white/10 text-gray-500"}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Desktop Filters (Always visible on lg screens) */}
              <div className="hidden lg:flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                
                {/* Filter inputs dropdowns */}
                <div className="flex flex-wrap items-center gap-3">
                  
                  {/* Brand */}
                  <div className="flex flex-col">
                    <label className="text-[8.5px] font-display font-bold text-gray-600 uppercase mb-1">Thương hiệu</label>
                    <select
                      value={filterBrand}
                      onChange={(e) => setFilterBrand(e.target.value)}
                      className="bg-black border border-white/10 text-xs text-gray-300 h-9 px-3 rounded-md focus:outline-none focus:border-gold-light"
                    >
                      <option value="all">Tất cả thương hiệu</option>
                      {brands.filter(b => b !== "all").map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  {/* Voltage */}
                  <div className="flex flex-col">
                    <label className="text-[8.5px] font-display font-bold text-gray-600 uppercase mb-1">Điện áp</label>
                    <select
                      value={filterVoltage}
                      onChange={(e) => setFilterVoltage(e.target.value)}
                      className="bg-black border border-white/10 text-xs text-gray-300 h-9 px-3 rounded-md focus:outline-none focus:border-gold-light"
                    >
                      <option value="all">Tất cả điện áp</option>
                      {voltages.filter(v => v !== "all").map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>

                  {/* Capacity */}
                  <div className="flex flex-col">
                    <label className="text-[8.5px] font-display font-bold text-gray-600 uppercase mb-1">Dung lượng</label>
                    <select
                      value={filterCapacity}
                      onChange={(e) => setFilterCapacity(e.target.value)}
                      className="bg-black border border-white/10 text-xs text-gray-300 h-9 px-3 rounded-md focus:outline-none focus:border-gold-light"
                    >
                      <option value="all">Tất cả dung lượng</option>
                      {capacities.filter(c => c !== "all").map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Reset button only shows if filtered */}
                  {(filterBrand !== "all" || filterVoltage !== "all" || filterCapacity !== "all" || searchQuery) && (
                    <button
                      onClick={resetFilters}
                      className="mt-4 p-2 text-gray-500 hover:text-gold-light transition-colors"
                      title="Xóa bộ lọc"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}

                </div>

                {/* View options grid/list and sorting */}
                <div className="flex items-center justify-between md:justify-end gap-4">
                  
                  <div className="flex flex-col">
                    <label className="text-[8.5px] font-display font-bold text-gray-600 uppercase mb-1 text-left md:text-right">Sắp xếp</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-black border border-white/10 text-xs text-gray-300 h-9 px-3 rounded-md focus:outline-none focus:border-gold-light"
                    >
                      <option value="newest">Sản phẩm mới nhất</option>
                      <option value="oldest">Sản phẩm cũ nhất</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 mt-4">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 border ${viewMode === "grid" ? "bg-[#D89A2B] border-transparent text-black" : "bg-black border-white/10 text-gray-500"}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 border ${viewMode === "list" ? "bg-[#D89A2B] border-transparent text-black" : "bg-black border-white/10 text-gray-500"}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>

              {/* Mobile sorting option (separated row for compactness) */}
              <div className="flex lg:hidden items-center justify-between border-t border-white/5 pt-3">
                <span className="text-[10px] font-mono uppercase text-gray-500">Sắp xếp kết quả</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-black border border-white/10 text-[11px] text-[#ECECEC] h-8 px-2 rounded-md focus:outline-none focus:border-gold-light"
                >
                  <option value="newest">Mới nhất trước</option>
                  <option value="oldest">Cũ nhất trước</option>
                </select>
              </div>

            </div>

            {/* Dynamic filtered count indicator */}
            <div className="text-xs text-gray-500 select-none flex items-center justify-between">
              <span>Đang hiển thị <strong>{filteredProducts.length}</strong> sản phẩm lọc tương thích</span>
              {searchQuery && (
                <span>Kết quả tìm kiếm cho: &ldquo;<strong className="text-gray-300">{searchQuery}</strong>&rdquo;</span>
              )}
            </div>

            {/* Grid / List render */}
            {filteredProducts.length > 0 ? (
              viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((prod) => (
                    <div key={prod.id}>
                      <ProductCard product={prod} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProducts.map((prod) => (
                    <Link
                      key={prod.id}
                      to={getProductHref(prod.id)}
                      className="bg-[#111] hover:bg-[#161616] border border-white/5 hover:border-gold-dark/20 p-5 rounded-lg flex flex-col sm:flex-row items-center gap-6 cursor-pointer group transition-all"
                    >
                      <div className="w-32 h-24 bg-black flex items-center justify-center p-2 border border-white/5 shrink-0 relative">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="max-h-full max-w-full object-contain filter drop-shadow-md"
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-3 text-[10px] text-gray-600 mb-1">
                          <span className="text-gold-light font-display uppercase tracking-wider">{prod.brand}</span>
                          <span>•</span>
                          <span>{prod.voltage} • {prod.capacity}</span>
                        </div>
                        <h3 className="text-xs font-display font-extrabold text-[#ECECEC] uppercase mb-2 group-hover:text-gold-light transition-colors">
                          {prod.name}
                        </h3>
                        <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                          {prod.description}
                        </p>
                      </div>
                      <span className="text-[10px] font-display font-bold text-gold-light hover:text-white uppercase shrink-0">
                        XEM CHI TIẾT &rarr;
                      </span>
                    </Link>
                  ))}
                </div>
              )
            ) : (
              <div className="py-20 text-center border border-dashed border-white/10 text-gray-500 text-xs">
                Không tìm thấy sản phẩm tương hợp. Vui lòng thử lại với các lựa chọn bộ lọc khác.
              </div>
            )}

          </div>

        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 2.5 FEATURE VALUE PROPOSITION BAR (CÔNG NGHỆ, AN TOÀN, HIỆU SUẤT, MÔI TRƯỜNG) */}
        <div className="mt-16 border border-white/5 py-10 px-6 bg-[#0c0c0c]" id="product-features-bar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Item 1 */}
            <div className="flex items-center gap-4 text-left group">
              <div className="flex items-center justify-center w-12 h-12 rounded-full border border-gold-dark/30 bg-[#121212] group-hover:border-gold-light group-hover:shadow-[0_0_15px_rgba(216,154,43,0.2)] transition-all shrink-0">
                <Cpu className="w-5 h-5 text-gold-light group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[11px] font-display font-extrabold text-[#ECECEC] uppercase tracking-wider group-hover:text-gold-light transition-colors">
                  CÔNG NGHỆ HIỆN ĐẠI
                </h4>
                <p className="text-[10.5px] text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
                  Ứng dụng công nghệ tiên tiến trong từng sản phẩm
                </p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex items-center gap-4 text-left group">
              <div className="flex items-center justify-center w-12 h-12 rounded-full border border-gold-dark/30 bg-[#121212] group-hover:border-gold-light group-hover:shadow-[0_0_15px_rgba(216,154,43,0.2)] transition-all shrink-0">
                <Shield className="w-5 h-5 text-gold-light group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[11px] font-display font-extrabold text-[#ECECEC] uppercase tracking-wider group-hover:text-gold-light transition-colors">
                  AN TOÀN TUYỆT ĐỐI
                </h4>
                <p className="text-[10.5px] text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
                  Hệ thống bảo vệ đa lớp, chống cháy nổ
                </p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex items-center gap-4 text-left group">
              <div className="flex items-center justify-center w-12 h-12 rounded-full border border-gold-dark/30 bg-[#121212] group-hover:border-gold-light group-hover:shadow-[0_0_15px_rgba(216,154,43,0.2)] transition-all shrink-0">
                <Zap className="w-5 h-5 text-gold-light group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[11px] font-display font-extrabold text-[#ECECEC] uppercase tracking-wider group-hover:text-gold-light transition-colors">
                  HIỆU SUẤT CAO
                </h4>
                <p className="text-[10.5px] text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
                  Tối ưu hiệu suất, tiết kiệm năng lượng
                </p>
              </div>
            </div>

            {/* Item 4 */}
            <div className="flex items-center gap-4 text-left group">
              <div className="flex items-center justify-center w-12 h-12 rounded-full border border-gold-dark/30 bg-[#121212] group-hover:border-gold-light group-hover:shadow-[0_0_15px_rgba(216,154,43,0.2)] transition-all shrink-0">
                <Leaf className="w-5 h-5 text-gold-light group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[11px] font-display font-extrabold text-[#ECECEC] uppercase tracking-wider group-hover:text-gold-light transition-colors">
                  THÂN THIỆN MÔI TRƯỜNG
                </h4>
                <p className="text-[10.5px] text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
                  Pin Lithium không chì, không độc hại, dễ tái chế
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 3. COMPREHENSIVE FLOATING PRODUCT DETAIL OVERLAY (MODAL DETAILED SPEC) */}
      {selectedProduct && (
        <div id="product-detail-modal" className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D0D0D] border border-gold-dark/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-xl relative shadow-2xl">
            
            {/* Close button modal */}
            <button
              onClick={handleCloseDetail}
              className="absolute top-4 right-4 p-2 bg-black/80 hover:bg-gold-dark hover:text-black border border-white/5 hover:border-transparent text-gray-400 z-10"
              title="Đóng chi tiết"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                
                {/* Modal image panel */}
                <div className="flex flex-col gap-3">
                  <div className="bg-[#050505] border border-white/5 p-6 aspect-square flex flex-col items-center justify-center relative">
                    {selectedProduct.tag && (
                      <span className="absolute top-3 left-3 bg-gold-dark text-black text-[9px] font-display font-bold px-2.5 py-1 uppercase tracking-wider">
                        {selectedProduct.tag}
                      </span>
                    )}
                    {/* Soft background energy ring */}
                    <div className="absolute inset-x-0 h-1/2 bottom-0 bg-gradient-to-t from-gold-dark/5 to-transparent blur-xl" />
                    
                    <img
                      src={activeDetailImage || selectedProduct.image}
                      alt={selectedProduct.name}
                      referrerPolicy="no-referrer"
                      className="max-h-[90%] max-w-[90%] object-contain filter drop-shadow-[0_15px_20px_rgba(0,0,0,0.8)] transition-all duration-300"
                    />
                  </div>

                  {/* Thumbnail Row */}
                  {selectedProduct.images && selectedProduct.images.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 font-sans">
                      <button
                        type="button"
                        onClick={() => setActiveDetailImage(selectedProduct.image)}
                        className={`w-12 h-12 bg-black border p-1 shrink-0 flex items-center justify-center cursor-pointer transition-all ${
                          (activeDetailImage === selectedProduct.image || !activeDetailImage)
                            ? "border-gold-light shadow-[0_0_8px_rgba(216,154,43,0.3)]"
                            : "border-white/5 hover:border-white/20"
                        }`}
                      >
                        <img src={selectedProduct.image} alt="Original" className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                      </button>
                      {selectedProduct.images.map((img: string, idx: number) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveDetailImage(img)}
                          className={`w-12 h-12 bg-black border p-1 shrink-0 flex items-center justify-center cursor-pointer transition-all ${
                            activeDetailImage === img
                              ? "border-gold-light shadow-[0_0_8px_rgba(216,154,43,0.3)]"
                              : "border-white/5 hover:border-white/20"
                          }`}
                        >
                          <img src={img} alt={`Extra ${idx}`} className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Modal specs detail description panel */}
                <div className="text-left space-y-4">
                  
                  <div className="text-[10px] text-gold-light uppercase font-display font-bold tracking-[0.2em]">
                    {selectedProduct.brand} • {selectedProduct.category.replace(/-/g, " ")}
                  </div>

                  <div>
                    <h2 className="text-base sm:text-lg font-display font-black text-white uppercase leading-normal">
                      {selectedProduct.name}
                    </h2>
                    
                    {/* Price tag */}
                    <div className="inline-flex items-baseline gap-2 bg-gold-dark/5 border border-gold-dark/15 px-3 py-1 mt-1 font-sans">
                      <span className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Giá bán lẻ:</span>
                      <span className="text-sm font-display font-black text-gold-light tracking-wide">
                        {selectedProduct.price && selectedProduct.price.trim() !== "" ? selectedProduct.price : "Liên hệ"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="h-[1.5px] bg-gradient-to-r from-gold-dark to-transparent w-20" />

                  <div 
                    className="text-xs text-gray-300 leading-relaxed font-sans mt-2 whitespace-normal break-words"
                    dangerouslySetInnerHTML={{ __html: formatDescriptionToHtml(selectedProduct.description) }}
                  />

                  {/* Technical Specifications list */}
                  <div>
                    <h4 className="text-[10.5px] font-display font-extrabold text-white uppercase mb-2 tracking-wider">THÔNG SỐ KỸ THUẬT</h4>
                    <div className="divide-y divide-white/5 border-t border-white/5">
                      {Object.entries(selectedProduct.specs).map(([key, value]: any) => (
                        <div key={key} className="flex justify-between py-2 text-[11px] font-sans">
                          <span className="text-gray-500">{key}:</span>
                          <span className="text-gray-300 font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Guarantee tags */}
                  <div className="flex items-center gap-4 py-2 border-t border-b border-white/5 text-[10.5px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-gold-dark" />
                      <span>Bảo hành {selectedProduct.warranty}</span>
                    </span>
                    <span>•</span>
                    <span>Chính hãng Voltara</span>
                  </div>

                  {/* Supplementary quick contact info strip */}
                  <div className="p-3 bg-gold-dark/5 border border-gold-dark/15 space-y-1 text-left rounded-md">
                    <div className="text-[10px] uppercase font-display font-black text-gold-light tracking-wider flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-gold-dark shrink-0" />
                      <span>LIÊN HỆ ĐẶT HÀNG & TƯ VẤN CHIẾT KHẤU</span>
                    </div>
                    <div className="text-[11px] text-gray-300">
                      Tổng đài: <strong className="text-white">1900 1234</strong> | Zalo kỹ thuật: <strong className="text-gold-light">0945 123 456</strong>
                    </div>
                    <div className="text-[10px] text-gray-500">
                      Giao hàng hỏa tốc và hỗ trợ cấu hình mạch sạc xả BMS riêng cho từng dòng phụ tải.
                    </div>
                  </div>

                  {/* Actions buttons quote / order */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={() => handleRequestQuote(selectedProduct.name)}
                      className="flex-1 bg-gradient-to-r from-gold-dark to-gold-light text-black font-display font-bold py-3 text-xs tracking-widest uppercase hover:opacity-90 active:scale-95 transition-all text-center flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(216,154,43,0.3)]"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>YÊU CẦU BÁO GIÁ ĐẠI LÝ</span>
                    </button>
                    
                    <button
                      onClick={handleCloseDetail}
                      className="border border-white/10 hover:border-white/25 bg-transparent text-gray-400 hover:text-white px-5 py-3 text-xs font-display uppercase tracking-widest"
                    >
                      ĐÓNG
                    </button>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* 4. MOBILE SLIDEOUT FILTER PANEL (SIDE SHEET DRAWER) */}
      {isMobileFiltersOpen && (
        <div id="mobile-filter-drawer" className="fixed inset-0 z-50 lg:hidden flex justify-end bg-black/80 backdrop-blur-sm animate-fade-in animate-duration-200">
          {/* Backdrop click dismiss */}
          <div className="absolute inset-0" onClick={() => setIsMobileFiltersOpen(false)} />

          <div className="relative w-full max-w-[310px] h-full bg-[#101010] border-l border-white/10 flex flex-col z-10 shadow-2xl animate-fade-in">
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#0A0A0A]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gold-light" />
                <h3 className="font-display font-extrabold text-xs text-white uppercase tracking-wider">
                  BỘ LỌC TÌM KIẾM
                </h3>
              </div>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-1 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Contents representing Categories + Filters */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
              {/* Category selector buttons list */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-display font-bold text-gray-400 uppercase tracking-wider border-l-2 border-gold-light pl-2">
                  DANH MỤC SẢN PHẨM
                </h4>
                <div className="flex flex-col gap-1.5 font-display text-[11px]">
                  {sidebarCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full text-left px-3 py-2.5 transition-all flex items-center justify-between cursor-pointer ${
                        activeCategory === cat.id
                          ? "bg-gold-dark text-black font-extrabold"
                          : "bg-black border border-white/5 text-gray-400 hover:text-white"
                      }`}
                    >
                      <span className="truncate pr-1">{cat.name}</span>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-sm shrink-0 ${
                        activeCategory === cat.id ? "bg-black/20 text-black font-bold" : "bg-white/5 text-gray-600"
                      }`}>
                        {cat.id === "all" ? products.length : products.filter(p => p.category === cat.id).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands Selectors */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-display font-bold text-gray-400 uppercase tracking-wider border-l-2 border-gold-light pl-2">
                  THƯƠNG HIỆU
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {brands.map((b) => (
                    <button
                      key={b}
                      onClick={() => setFilterBrand(b)}
                      className={`px-2.5 py-1.5 text-[10px] font-display uppercase tracking-wider border cursor-pointer ${
                        filterBrand === b
                          ? "bg-gold-light border-transparent text-black font-bold"
                          : "bg-black border-white/10 text-gray-400"
                      }`}
                    >
                      {b === "all" ? "Tất cả" : b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voltage Selectors */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-display font-bold text-gray-400 uppercase tracking-wider border-l-2 border-gold-light pl-2">
                  ĐIỆN ÁP (V)
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {voltages.map((v) => (
                    <button
                      key={v}
                      onClick={() => setFilterVoltage(v)}
                      className={`px-2.5 py-1.5 text-[10px] font-display tracking-wider border cursor-pointer ${
                        filterVoltage === v
                          ? "bg-gold-light border-transparent text-black font-bold"
                          : "bg-black border-white/10 text-gray-400"
                      }`}
                    >
                      {v === "all" ? "Tất cả" : v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Capacity Selectors */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-display font-bold text-gray-400 uppercase tracking-wider border-l-2 border-gold-light pl-2">
                  DUNG LƯỢNG (Ah)
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {capacities.map((c) => (
                    <button
                      key={c}
                      onClick={() => setFilterCapacity(c)}
                      className={`px-2.5 py-1.5 text-[10px] font-display tracking-wider border cursor-pointer ${
                        filterCapacity === c
                          ? "bg-gold-light border-transparent text-black font-bold"
                          : "bg-black border-white/10 text-gray-400"
                      }`}
                    >
                      {c === "all" ? "Tất cả" : c}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Sticky Action Bar */}
            <div className="p-4 border-t border-white/5 bg-[#0A0A0A] space-y-2">
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full bg-[#161616] hover:bg-gold-dark/10 hover:text-gold-light border border-white/10 text-white font-display text-xs font-bold uppercase tracking-wider py-2.5 cursor-pointer"
              >
                Xem {filteredProducts.length} Kết quả
              </button>
              {activeFiltersCount > 0 && (
                <button
                  onClick={() => {
                    resetFilters();
                    setIsMobileFiltersOpen(false);
                  }}
                  className="w-full text-center text-[10px] font-mono uppercase text-gray-500 hover:text-gold-light block py-1 cursor-pointer"
                >
                  Xóa tất cả bộ lọc
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Dynamic Gold-themed Quote Request Modal */}
      <QuoteRequestModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        prepopulatedProduct={quoteProductName}
      />

    </div>
  );
}
