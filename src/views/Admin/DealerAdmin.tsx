/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Branch, Dealer } from "../../types";
import { Plus, Trash2, Edit, Save, X, MapPin, Building, Phone, Mail } from "lucide-react";

export default function DealerAdmin() {
  const { 
    branches, addBranch, updateBranch, deleteBranch,
    dealers, addDealer, updateDealer, deleteDealer,
    showToast
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<"branches" | "dealers">("branches");

  // Form states for Branch
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [isAddingBranch, setIsAddingBranch] = useState(false);
  const [branchFormData, setBranchFormData] = useState<Omit<Branch, "id">>({
    name: "",
    type: "CHI NHÁNH",
    address: "",
    phone: "",
    email: "",
    image: ""
  });

  // Form states for Dealer
  const [editingDealerId, setEditingDealerId] = useState<string | null>(null);
  const [isAddingDealer, setIsAddingDealer] = useState(false);
  const [dealerFormData, setDealerFormData] = useState<Omit<Dealer, "id">>({
    name: "",
    province: "",
    district: "",
    address: "",
    phone: "",
    isHQ: false
  });

  // Reset helpers
  const resetBranchForm = () => {
    setBranchFormData({
      name: "",
      type: "CHI NHÁNH",
      address: "",
      phone: "",
      email: "",
      image: ""
    });
    setEditingBranchId(null);
    setIsAddingBranch(false);
  };

  const resetDealerForm = () => {
    setDealerFormData({
      name: "",
      province: "",
      district: "",
      address: "",
      phone: "",
      isHQ: false
    });
    setEditingDealerId(null);
    setIsAddingDealer(false);
  };

  // Branch operations
  const handleStartEditBranch = (br: Branch) => {
    setEditingBranchId(br.id);
    setBranchFormData({
      name: br.name,
      type: br.type,
      address: br.address,
      phone: br.phone,
      email: br.email,
      image: br.image
    });
    setIsAddingBranch(false);
  };

  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchFormData.name || !branchFormData.address) {
      showToast("Vui lòng nhập đầy đủ tên và địa chỉ hiển thị!", "warning");
      return;
    }

    if (editingBranchId) {
      updateBranch({
        id: editingBranchId,
        ...branchFormData
      });
      showToast("Cập nhật Chi nhánh thành công!", "success");
    } else {
      const newId = "branch-" + Date.now();
      addBranch({
        id: newId,
        ...branchFormData
      });
      showToast("Đăng ký Chi nhánh thành công!", "success");
    }
    resetBranchForm();
  };

  const handleDeleteBranch = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa Chi nhánh '${name}' khỏi danh sách?`)) {
      deleteBranch(id);
    }
  };

  // Dealer operations
  const handleStartEditDealer = (dl: Dealer) => {
    setEditingDealerId(dl.id);
    setDealerFormData({
      name: dl.name,
      province: dl.province,
      district: dl.district,
      address: dl.address,
      phone: dl.phone,
      isHQ: dl.isHQ ?? false
    });
    setIsAddingDealer(false);
  };

  const handleSaveDealer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealerFormData.name || !dealerFormData.province || !dealerFormData.address) {
      showToast("Vui lòng điền tên, tỉnh thành và địa chỉ bán hàng!", "warning");
      return;
    }

    if (editingDealerId) {
      updateDealer({
        id: editingDealerId,
        ...dealerFormData
      });
      showToast("Cập nhật đại lý thành công!", "success");
    } else {
      const newId = "dealer-" + Date.now();
      addDealer({
        id: newId,
        ...dealerFormData
      });
      showToast("Thêm Đại lý mới thành công!", "success");
    }
    resetDealerForm();
  };

  const handleDeleteDealer = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa Đại lý ủy quyền '${name}'?`)) {
      deleteDealer(id);
    }
  };

  return (
    <div className="bg-[#0A0A0A] border border-white/5 p-6 text-left">
      {/* Top Description and subtabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5 mb-6">
        <div>
          <h2 className="text-sm font-display font-black tracking-widest text-gold-light uppercase mb-1">
            QUẢN LÝ HỆ THỐNG PHÂN PHỐI & CỬA HÀNG
          </h2>
          <p className="text-[11px] text-gray-400">
            Quản trị các cơ sở, văn phòng chính thức, và mạng lưới đại lý lắp đặt sạc Lithium trên toàn quốc
          </p>
        </div>

        {/* Subtabs switcher */}
        <div className="flex bg-black/40 border border-[#1A1A1A] p-0.5">
          <button
            onClick={() => { setActiveSubTab("branches"); resetBranchForm(); resetDealerForm(); }}
            className={`px-4 py-1.5 font-display text-[10px] tracking-wider uppercase font-extrabold transition-all ${
              activeSubTab === "branches"
                ? "bg-gold-dark text-black"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Văn phòng & Chi nhánh ({branches.length})
          </button>
          <button
            onClick={() => { setActiveSubTab("dealers"); resetBranchForm(); resetDealerForm(); }}
            className={`px-4 py-1.5 font-display text-[10px] tracking-wider uppercase font-extrabold transition-all ${
              activeSubTab === "dealers"
                ? "bg-gold-dark text-black"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Đại lý ủy quyền ({dealers.length})
          </button>
        </div>
      </div>

      {/* ======================= TÂN TRANG CHI NHÁNH CHỦ ======================= */}
      {activeSubTab === "branches" && (
        <div className="space-y-6">
          <div className="flex justify-end">
            {!isAddingBranch && !editingBranchId && (
              <button
                onClick={() => setIsAddingBranch(true)}
                className="px-3 py-1.5 bg-gold-dark text-black text-[10px] font-display font-black tracking-widest uppercase hover:bg-gold-light hover:scale-102 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3 h-3 stroke-[3]" /> KHỞI TẠO CHI NHÁNH
              </button>
            )}
          </div>

          {(isAddingBranch || editingBranchId) && (
            <form onSubmit={handleSaveBranch} className="p-6 bg-black border border-gold-dark/20 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-3">
                <h3 className="text-xs font-display font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Building className="w-4 h-4 text-gold-light" />
                  {editingBranchId ? "CHỈNH SỬA VĂN PHÒNG" : "KHỞI TẠO VĂN PHÒNG CHÍNH THỨC"}
                </h3>
                <button type="button" onClick={resetBranchForm} className="text-gray-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-display font-bold text-gray-500 uppercase mb-1 block">Tên cơ sở chi nhánh *</label>
                  <input
                    type="text"
                    required
                    value={branchFormData.name}
                    onChange={e => setBranchFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ví dụ: VĂN PHÒNG GIAO DỊCH MIỀN BẮC - HÀ NỘI"
                    className="w-full bg-[#121212] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-light"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-display font-bold text-gray-550 uppercase mb-1 block">Phân vị định danh *</label>
                  <select
                    value={branchFormData.type}
                    onChange={e => setBranchFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full bg-[#121212] border border-white/10 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold-light"
                  >
                    <option value="TRỤ SỞ CHÍNH">TRỤ SỞ CHÍNH</option>
                    <option value="CHI NHÁNH">CHI NHÁNH</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="text-[9px] font-display font-bold text-gray-500 uppercase mb-1 block">Địa chỉ chi tiết *</label>
                  <input
                    type="text"
                    required
                    value={branchFormData.address}
                    onChange={e => setBranchFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Ví dụ: Số 12 Khu đô thị mới cầu Giấy, Hà Nội"
                    className="w-full bg-[#121212] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-light"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-display font-bold text-gray-550 uppercase mb-1 block">Số điện thoại *</label>
                  <input
                    type="text"
                    required
                    value={branchFormData.phone}
                    onChange={e => setBranchFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Hotline bàn giao"
                    className="w-full bg-[#121212] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-light"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-display font-bold text-gray-500 uppercase mb-1 block">Địa chỉ E-mail liên hệ</label>
                  <input
                    type="email"
                    value={branchFormData.email}
                    onChange={e => setBranchFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="mail@voltara.vn"
                    className="w-full bg-[#121212] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-light"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-display font-bold text-gray-550 uppercase mb-1 block">Hình ảnh mặt tiền showroom (URL)</label>
                  <input
                    type="text"
                    value={branchFormData.image}
                    onChange={e => setBranchFormData(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="https://..."
                    className="w-full bg-[#121212] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-light"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetBranchForm}
                  className="px-3.5 py-2 border border-white/10 text-gray-400 text-[10px] font-display font-extrabold hover:text-white transition-all"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gold-dark text-black text-[10px] font-display font-black tracking-widest uppercase hover:bg-gold-light transition-all flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> HOÀN THÀNH LƯU
                </button>
              </div>
            </form>
          )}

          {/* Render Branches list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {branches.map(br => (
              <div key={br.id} className="bg-black/35 border border-white/5 p-4 flex flex-col justify-between hover:border-gold-dark/20 transition-all">
                <div>
                  <div className="flex justify-between items-start border-b border-white/5 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[8.5px] font-mono font-bold px-2 py-0.5 border ${
                        br.type === "TRỤ SỞ CHÍNH"
                          ? "bg-gold-light/10 text-gold-light border-gold-dark/30 shadow-[0_0_8px_rgba(216,154,43,0.1)]"
                          : "bg-white/5 text-gray-450 border-white/10"
                      }`}>
                        {br.type}
                      </span>
                      <h4 className="text-[11.5px] font-display font-bold text-white uppercase">{br.name}</h4>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleStartEditBranch(br)}
                        className="p-1 px-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-[10.5px] transition-all"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteBranch(br.id, br.name)}
                        className="p-1 px-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-500 text-[10.5px] border border-red-500/5 transition-all"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-gray-400">
                    <p className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gold-light shrink-0 mt-0.5" />
                      <span>{br.address}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gold-light shrink-0" />
                      <span>Hotline: <strong className="text-white font-mono font-medium">{br.phone}</strong></span>
                    </p>
                    {br.email && (
                      <p className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-gold-light shrink-0" />
                        <span>Thư điện tử: <span className="text-white font-medium">{br.email}</span></span>
                      </p>
                    )}
                  </div>
                </div>

                {br.image && (
                  <div className="mt-4 aspect-[16/7] border border-white/5 overflow-hidden filter grayscale brightness-75 hover:grayscale-0 transition-all duration-300">
                    <img src={br.image} alt={br.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================= MẠNG LƯỚI ĐẠI LÝ LẮP ĐẶT ======================= */}
      {activeSubTab === "dealers" && (
        <div className="space-y-6">
          <div className="flex justify-end">
            {!isAddingDealer && !editingDealerId && (
              <button
                onClick={() => setIsAddingDealer(true)}
                className="px-3 py-1.5 bg-gold-dark text-black text-[10px] font-display font-black tracking-widest uppercase hover:bg-gold-light hover:scale-102 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3 h-3 stroke-[3]" /> THÊM ĐẠI LÝ PHÂN PHỐI
              </button>
            )}
          </div>

          {(isAddingDealer || editingDealerId) && (
            <form onSubmit={handleSaveDealer} className="p-6 bg-black border border-gold-dark/20 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-3">
                <h3 className="text-xs font-display font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gold-light" />
                  {editingDealerId ? "CẬP NHẬT ĐẠI LÝ ỦY QUYỀN" : "KÝ HỢP ĐỒNG ĐẠI LÝ PHÂN PHỐI MỚI"}
                </h3>
                <button type="button" onClick={resetDealerForm} className="text-gray-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-display font-bold text-gray-500 uppercase mb-1 block">Tên đại lý lắp đặt *</label>
                  <input
                    type="text"
                    required
                    value={dealerFormData.name}
                    onChange={e => setDealerFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ví dụ: ĐẠI LÝ LITHIUM QUANG MINH"
                    className="w-full bg-[#121212] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-light"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-display font-bold text-gray-550 uppercase mb-1 block">Tỉnh / Thành phố *</label>
                  <input
                    type="text"
                    required
                    value={dealerFormData.province}
                    onChange={e => setDealerFormData(prev => ({ ...prev, province: e.target.value }))}
                    placeholder="Ví dụ: Hà Nội, Lâm Đồng, Đồng Nai..."
                    className="w-full bg-[#121212] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-light"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[9px] font-display font-bold text-gray-500 uppercase mb-1 block">Quận / Huyện</label>
                  <input
                    type="text"
                    value={dealerFormData.district}
                    onChange={e => setDealerFormData(prev => ({ ...prev, district: e.target.value }))}
                    placeholder="Ví dụ: Quận Cầu Giấy"
                    className="w-full bg-[#121212] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-light"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[9px] font-display font-bold text-gray-550 uppercase mb-1 block">Địa chỉ mặt bằng chi tiết *</label>
                  <input
                    type="text"
                    required
                    value={dealerFormData.address}
                    onChange={e => setDealerFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Ví dụ: Số 230 Hoàng Quốc Việt"
                    className="w-full bg-[#121212] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-light"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-display font-bold text-gray-500 uppercase mb-1 block">Điện thoại lắp đặt chính thức *</label>
                  <input
                    type="text"
                    required
                    value={dealerFormData.phone}
                    onChange={e => setDealerFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Ví dụ: 0912123123"
                    className="w-full bg-[#121212] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-light"
                  />
                </div>
                <div className="flex items-center pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                    <input
                      type="checkbox"
                      checked={dealerFormData.isHQ}
                      onChange={e => setDealerFormData(prev => ({ ...prev, isHQ: e.target.checked }))}
                      className="rounded-sm accent-gold-dark border-white/10 bg-[#121212] w-4 h-4 text-xs"
                    />
                    <span>Đặt làm trung tâm phân phối ủy quyền kỹ thuật chính</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetDealerForm}
                  className="px-3.5 py-2 border border-white/10 text-gray-400 text-[10px] font-display font-extrabold hover:text-white transition-all"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gold-dark text-black text-[10px] font-display font-black tracking-widest uppercase hover:bg-gold-light transition-all flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> LƯU ĐẠI LÝ LẮP ĐẶT
                </button>
              </div>
            </form>
          )}

          {/* Render Dealers list with simple structural lookup */}
          <div className="border border-white/5 bg-black/45">
            <div className="bg-white/5 border-b border-white/5 p-3 flex justify-between text-[10.5px] font-mono text-gray-400 uppercase tracking-wider">
              <span>Hệ thống đại lý bán lẻ</span>
              <span>Tổng cộng: {dealers.length} đại lý</span>
            </div>
            
            <div className="divide-y divide-white/5 max-h-[450px] overflow-y-auto">
              {dealers.map((dl, index) => (
                <div key={dl.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-gold-dark font-black">#{index + 1}</span>
                      <h4 className="text-[11px] font-display font-black text-white hover:text-gold-light transition-colors uppercase">{dl.name}</h4>
                      {dl.isHQ && (
                        <span className="text-[8px] tracking-wider uppercase bg-gold-dark/15 border border-gold-dark/35 text-gold-light font-bold px-1.5 py-0.2 ml-1">
                          Trung tâm chủ
                        </span>
                      )}
                    </div>
                    <p className="text-[10.5px] text-gray-450 flex items-center gap-1.5 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-gold-dark" />
                      <span>{dl.address} – Tỉnh <strong className="text-white">{dl.province}</strong> ({dl.district || "Tất cả vùng"})</span>
                    </p>
                    <p className="text-[10.5px] text-gray-500">
                      Đường dây hỗ trợ kĩ thuật: <strong className="font-mono text-gray-300">{dl.phone}</strong>
                    </p>
                  </div>
                  <div className="flex gap-2 self-start sm:self-center">
                    <button
                      onClick={() => handleStartEditDealer(dl)}
                      className="px-2 py-1 text-[10px] bg-white/5 hover:bg-white/10 text-gray-305 transition-all text-center uppercase font-bold"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteDealer(dl.id, dl.name)}
                      className="px-2 py-1 text-[10px] bg-red-500/10 hover:bg-red-550/25 text-red-400 transition-all text-center uppercase font-bold"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
