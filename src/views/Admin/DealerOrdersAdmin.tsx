'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { collection, doc, limit, onSnapshot, query as firestoreQuery, setDoc } from 'firebase/firestore';
import { ChevronDown, PackageCheck, Search } from 'lucide-react';
import { db } from '../../lib/firebase';
import { DealerOrderRecord } from '../../types';
import { useApp } from '../../context/AppContext';

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
const statusLabels: Record<DealerOrderRecord['status'], string> = {
  new: 'Đơn mới',
  confirmed: 'Đã xác nhận',
  contacting: 'Sale đang liên hệ',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
};

export default function DealerOrdersAdmin() {
  const { showToast } = useApp();
  const [orders, setOrders] = useState<DealerOrderRecord[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | DealerOrderRecord['status']>('all');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(() => new Set());

  useEffect(() => onSnapshot(firestoreQuery(collection(db, 'dealerOrders'), limit(50)), (snapshot) => {
    const items = snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as DealerOrderRecord));
    setOrders(items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }, (error) => {
    console.error(error);
    showToast('Không đọc được đơn hàng đại lý.', 'error');
  }), [showToast]);

  const filtered = useMemo(() => orders.filter((order) => {
    const matchesText = `${order.dealerName} ${order.dealerCode} ${order.recipientName} ${order.recipientPhone} ${order.id}`.toLowerCase().includes(query.toLowerCase());
    return matchesText && (status === 'all' || order.status === status);
  }), [orders, query, status]);

  const updateStatus = async (order: DealerOrderRecord, nextStatus: DealerOrderRecord['status']) => {
    await setDoc(doc(db, 'dealerOrders', order.id), { status: nextStatus, updatedAt: new Date().toISOString() }, { merge: true });
    showToast('Đã cập nhật trạng thái đơn hàng.', 'success');
  };

  const toggleOrder = (orderId: string) => {
    setExpandedOrders((current) => {
      const next = new Set(current);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  return <div className="space-y-5">
    <div>
      <h2 className="flex items-center gap-2 font-display text-lg font-black uppercase text-gold-light"><PackageCheck className="h-5 w-5" /> Đơn hàng đại lý</h2>
      <p className="mt-1 text-xs text-gray-400">Tiếp nhận đơn, xem thông tin giao hàng và cập nhật trạng thái để đại lý theo dõi.</p>
    </div>

    <div className="grid gap-3 border border-white/10 bg-black p-4 sm:grid-cols-[1fr_220px_auto]">
      <label className="flex items-center gap-2 border border-white/10 bg-[#111] px-3"><Search className="h-4 w-4 text-gray-500" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm đại lý, SĐT, mã đơn..." className="w-full bg-transparent py-3 text-base outline-none sm:text-xs" /></label>
      <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="border border-white/10 bg-[#111] px-3 py-3 text-xs"><option value="all">Tất cả trạng thái</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      <div className="flex items-center border border-white/10 px-4 text-xs text-gray-400">{filtered.length}/{orders.length} đơn</div>
    </div>

    <div className="space-y-3">
      {filtered.length === 0 ? <div className="border border-white/10 bg-black py-14 text-center text-xs text-gray-500">Chưa có đơn hàng phù hợp.</div> : filtered.map((order) => {
        const isExpanded = expandedOrders.has(order.id);
        const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

        return <article key={order.id} className="border border-white/10 bg-black">
          <div className={`grid gap-4 p-4 lg:grid-cols-[1.2fr_1fr_220px] ${isExpanded ? 'border-b border-white/10' : ''}`}>
            <div>
              <div className="flex flex-wrap items-center gap-2"><b className="font-mono text-xs text-gold-light">#{order.id.slice(-8).toUpperCase()}</b><span className="border border-gold-dark/25 px-2 py-1 text-[9px] font-bold uppercase text-gold-light">{order.dealerCode} · Cấp {order.dealerLevel}</span></div>
              <h3 className="mt-2 text-sm font-black uppercase">{order.dealerName}</h3>
              <p className="mt-1 text-[10px] text-gray-500">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
            </div>
            <div className="flex items-center text-xs text-gray-400"><span><b className="text-white">{order.items.length} sản phẩm</b> · Tổng {totalQuantity} món</span></div>
            <div>
              <select value={order.status} onClick={(event) => event.stopPropagation()} onChange={(e) => updateStatus(order, e.target.value as DealerOrderRecord['status'])} className="w-full border border-white/10 bg-[#111] px-3 py-2 text-xs">{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
              <b className="mt-3 block text-right text-lg text-gold-light">{money.format(order.total)}</b>
              <button type="button" aria-expanded={isExpanded} onClick={() => toggleOrder(order.id)} className="mt-2 flex w-full items-center justify-end gap-1 text-[10px] font-bold uppercase text-gold-light hover:text-white">{isExpanded ? 'Thu gọn' : 'Xem chi tiết'}<ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} /></button>
            </div>
          </div>

          {isExpanded && <div>
            <div className="grid gap-4 border-b border-white/10 px-4 py-3 text-xs leading-5 md:grid-cols-2">
              <div><span className="text-[9px] font-bold uppercase text-gray-500">Người nhận</span><p><b>{order.recipientName}</b> · {order.recipientPhone}</p></div>
              <div><span className="text-[9px] font-bold uppercase text-gray-500">Địa chỉ giao hàng</span><p className="text-gray-300">{order.deliveryAddress}</p>{order.note && <p className="text-gold-light">Ghi chú: {order.note}</p>}</div>
            </div>
            <div className="divide-y divide-white/5 px-4">{order.items.map((item) => <div key={item.productId} className="flex items-center gap-3 py-3"><img src={item.image} alt="" className="h-11 w-11 bg-white object-contain" /><div className="min-w-0 flex-1"><b className="line-clamp-1 text-xs">{item.name}</b><span className="block font-mono text-[9px] text-gray-500">{item.sku}</span></div><span className="text-xs text-gray-400">{item.quantity} × {money.format(item.dealerPrice)}</span><b className="w-28 text-right text-xs">{money.format(item.quantity * item.dealerPrice)}</b></div>)}</div>
            <div className="border-t border-white/10 px-4 py-3 text-right text-[10px] text-emerald-400">Tiết kiệm {money.format(order.discountTotal)}</div>
          </div>}
        </article>;
      })}
    </div>
  </div>;
}
