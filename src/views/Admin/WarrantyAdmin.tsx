/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { WarrantyRecord } from "../../types";
import { Plus, Trash2, Edit, Save, X, Search, ShieldCheck, Heart, Settings, BatteryCharging } from "lucide-react";

export default function WarrantyAdmin() {
  const { warranties, addWarranty, updateWarranty, deleteWarranty, showToast } = useApp();

  const [searchText, setSearchText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [formData, setFormData] = useState<Omit<WarrantyRecord, "id">>({
    serial: "",
    productName: "",
    customerName: "",
    customerPhone: "",
    activatedDate: "",
    termMonths: 12,
    expiryDate: "",
    status: "Đang bảo hành chính hãng",
    specNotes: "Lõi cell hoạt động an toàn SOH 100%, sạc xả cân bằng chuẩn hãng."
  });

  const resetForm = () => {
    setFormData({
      serial: "",
      productName: "",
      customerName: "",
      customerPhone: "",
      activatedDate: new Date().toLocaleDateString("vi-VN"),
      termMonths: 12,
      expiryDate: "",
      status: "Đang bảo hành chính hãng",
      specNotes: "Lõi cell hoạt động an toàn SOH 105%, sạc xả cân bằng chuẩn hãng."
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleStartEdit = (w: WarrantyRecord) => {
    setEditingId(w.id);
    setFormData({
      serial: w.serial,
      productName: w.productName,
      customerName: w.customerName,
      customerPhone: w.customerPhone,
      activatedDate: w.activatedDate,
      termMonths: w.termMonths,
      expiryDate: w.expiryDate,
      status: w.status,
      specNotes: w.specNotes
    });
    setIsAdding(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serial || !formData.productName || !formData.customerName) {
      showToast("Vui lòng điền mã Serial, tên máy/bình pin lithium và tên khách hàng!", "warning");
      return;
    }

    // Auto-calculate expiryDate if not explicitly defined
    let calculatedExpiry = formData.expiryDate;
    if (!calculatedExpiry && formData.activatedDate) {
      try {
        const parts = formData.activatedDate.split("/");
        if (parts.length === 3) {
          const actDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          actDate.setMonth(actDate.getMonth() + Number(formData.termMonths));
          
          const d = String(actDate.getDate()).padStart(2, "0");
          const m = String(actDate.getMonth() + 1).padStart(2, "0");
          const y = actDate.getFullYear();
          calculatedExpiry = `${d}/${m}/${y}`;
        }
      } catch (err) {
        calculatedExpiry = "Vô thời hạn";
      }
    }

    const payload = {
      ...formData,
      serial: formData.serial.trim().toUpperCase(),
      expiryDate: calculatedExpiry || "Vô thời hạn"
    };

    if (editingId) {
      updateWarranty({
        id: editingId,
        ...payload
      });
      showToast("Cập nhật đăng ký bảo hành thành công!", "success");
    } else {
      const exists = warranties.some(w => w.serial.trim().toUpperCase() === payload.serial);
      if (exists) {
        showToast(`Mã số sê-ri '${payload.serial}' đã tồn tại khế ước bảo hiểm bảo hành trước đó trên hệ thống!`, "error");
        return;
      }

      addWarranty({
        id: "w-rec-" + Date.now(),
        ...payload
      });
      showToast("Cấp chứng thư bảo hành điện tử thành công!", "success");
    }
    resetForm();
  };

  const handleDelete = (id: string, serialCode: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn hủy thu hồi chứng nhận bảo hành của sê-ri '${serialCode}'?`)) {
      deleteWarranty(id);
    }
  };

  const filteredWarranties = warranties.filter(w => 
    w.serial.toLowerCase().includes(searchText.toLowerCase()) ||
    w.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
    w.productName.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="bg-[#0A0A0A] border border-white/5 p-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-sm font-display font-black tracking-widest text-gold-light uppercase mb-1">
            HỘ SƠ KÍCH HOẠT & BẢO HÀNH ĐIỆN TỬ
          </h2>
          <p className="text-[11px] text-gray-400">
            Cấp phép, kiểm tra, sửa sửa trực tiếp các chứng nhận điện ly sụt dòng sạc pin Lithium và UPS Voltara cho người tiêu dùng Việt Nam
          </p>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-gold-dark text-black text-[11px] font-display font-extrabold tracking-wider uppercase hover:bg-gold-light transition-all flex items-center gap-2 rounded-md self-start"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            CẤP BẢO HÀNH GIA CHỦ
          </button>
        )}
      </div>

      {/* Dynamic Action Entry Form (Add/Edit) */}
      {(isAdding || editingId) && (
        <form onSubmit={handleSave} className="mb-10 p-6 bg-black border border-gold-dark/25 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-3">
            <h3 className="text-xs font-display font-black text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-gold-light" />
              {editingId ? `SỬA HỒ SƠ BẢO HÀNH` : "CẤP MỚI KHẾ ƯỚC BẢO HÀNH ĐIỆN TỬ"}
            </h3>
            <button type="button" onClick={resetForm} className="text-gray-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[9px] font-display font-bold text-gray-550 uppercase mb-1 block">Mã Serial / Sê-ri sạc *</label>
              <input
                type="text"
                required
                disabled={!!editingId}
                value={formData.serial}
                onChange={e => setFormData(prev => ({ ...prev, serial: e.target.value }))}
                placeholder="Ví dụ: VOLTARA-20V-5AH"
                className="w-full bg-[#121212] border border-white/10 px-3 py-2 text-xs text-white uppercase font-mono tracking-wider focus:outline-none focus:border-gold-light disabled:opacity-50"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[9px] font-display font-bold text-gray-550 uppercase mb-1 block">Tên sản phẩm Voltara tương ứng *</label>
              <input
                type="text"
                required
                value={formData.productName}
                onChange={e => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                placeholder="Ví dụ: Pin Lithium Di Động 20V dòng Makita"
                className="w-full bg-[#121212] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-light"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-display font-bold text-gray-550 uppercase mb-1 block">Họ tên khách hàng mua hàng *</label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={e => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="Ví dụ: Nguyễn Văn Hải"
                className="w-full bg-[#121212] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-light"
              />
            </div>
            <div>
              <label className="text-[9px] font-display font-bold text-gray-550 uppercase mb-1 block">Số điện thoại liên hệ</label>
              <input
                type="text"
                value={formData.customerPhone}
                onChange={e => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                placeholder="Ví dụ: 0912345678"
                className="w-full bg-[#121212] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-light"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-[9px] font-display font-bold text-gray-550 uppercase mb-1 block">Ngày kích hoạt *</label>
              <input
                type="text"
                required
                value={formData.activatedDate}
                onChange={e => setFormData(prev => ({ ...prev, activatedDate: e.target.value }))}
                placeholder="DD/MM/YYYY (Ví dụ: 20/05/2026)"
                className="w-full bg-[#121212] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-light font-mono"
              />
            </div>
            <div>
              <label className="text-[9px] font-display font-bold text-gray-550 uppercase mb-1 block">Hạn bảo hành (Tháng)</label>
              <input
                type="number"
                required
                value={formData.termMonths}
                onChange={e => setFormData(prev => ({ ...prev, termMonths: Number(e.target.value) }))}
                placeholder="Ví dụ: 12, 18, 24, 36"
                className="w-full bg-[#121212] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-light"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[9px] font-display font-bold text-gray-550 uppercase mb-1 block">Trạng thái bảo trì hiển thị *</label>
              <input
                type="text"
                required
                value={formData.status}
                onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
                placeholder="Đang bảo hành chính hãng / Sắp hết hạn..."
                className="w-full bg-[#121212] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-light"
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] font-display font-bold text-gray-550 uppercase mb-1 block">Ghi chú đo lường / Nhật ký SOH pin lithium</label>
            <textarea
              rows={2}
              value={formData.specNotes}
              onChange={e => setFormData(prev => ({ ...prev, specNotes: e.target.value }))}
              placeholder="Nhập ghi chú độ sụt áp, robot quang học đo kiểm SOH% pin hoặc ghi chú dịch vụ bổ sung..."
              className="w-full bg-[#121212] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-light"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-white/10 text-gray-400 text-[10px] font-display font-black hover:text-white transition-all"
            >
              HỦY THAO TÁC
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gold-dark text-black text-[10px] font-display font-black tracking-widest uppercase hover:bg-gold-light transition-all flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" /> LƯU CHỨNG THƯ
            </button>
          </div>
        </form>
      )}

      {/* Listing warranties table and filters */}
      <div className="space-y-4">
        {/* Search header bar info */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Tìm theo sê-ri mã, tên gia chủ sạc, tên sản phẩm Voltara..."
            className="w-full bg-black border border-white/5 pl-9 pr-3 py-2.5 text-xs text-[#ECECEC] focus:outline-none focus:border-gold-dark font-sans"
          />
        </div>

        {/* Warranties grid split table lists */}
        <div className="border border-white/5 bg-black/45">
          <div className="bg-white/5 border-b border-white/5 p-3 flex justify-between text-[10px] font-mono text-gray-400 uppercase tracking-widest font-semibold">
            <span>Danh mục sổ bảo hành của Voltara ({filteredWarranties.length} bản ghi)</span>
            <span>Live Sync Database</span>
          </div>

          {filteredWarranties.length === 0 ? (
            <div className="p-10 text-center text-xs text-gray-500">
              Không tìm thấy hồ sơ bảo hành nào phù hợp theo màng lưới số liệu.
            </div>
          ) : (
            <div className="divide-y divide-white/5 max-h-[460px] overflow-y-auto">
              {filteredWarranties.map((w) => (
                <div key={w.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-white/[0.015] transition-colors">
                  <div className="text-left space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-mono font-black text-gold-light tracking-wide bg-gold-light/5 border border-gold-dark/25 px-2 py-0.5">
                        {w.serial}
                      </span>
                      <span className="text-xs text-white font-display font-medium uppercase">{w.productName}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-1 gap-x-6 text-[10.5px] text-gray-400">
                      <p>Gia chủ bảo hiểm: <strong className="text-gray-200">{w.customerName}</strong> {w.customerPhone ? `(${w.customerPhone})` : ""}</p>
                      <p>Kích hoạt ngày: <span className="font-mono text-gray-300">{w.activatedDate}</span> ({w.termMonths} tháng)</p>
                      <p>Khế bảo hành đến: <span className="font-mono text-gray-300">{w.expiryDate}</span></p>
                    </div>

                    {w.specNotes && (
                      <p className="text-[10px] text-gray-500 italic bg-white/[0.02] border-l border-gold-dark/50 pl-2 py-0.5 mt-1">
                        SOH Log: {w.specNotes}
                      </p>
                    )}
                  </div>

                  {/* Actions buttons and status pill */}
                  <div className="flex items-center gap-3 self-end md:self-center">
                    <span className="text-[10px] font-extrabold uppercase font-sans text-emerald-400 bg-emerald-400/5 px-2.5 py-1 border border-emerald-500/10 rounded-md">
                      {w.status}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleStartEdit(w)}
                        className="p-1 px-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[10.5px] font-bold uppercase transition-all"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(w.id, w.serial)}
                        className="p-1 px-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 text-[10.5px] font-bold uppercase transition-all"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
