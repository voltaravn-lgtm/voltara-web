'use client';

import React, { useMemo, useState } from 'react';
import { Battery, Loader2, Search } from 'lucide-react';
import { Product } from '../../../types';

function parsePrice(value?: string) {
  return Number(String(value || '').replace(/[^0-9]/g, '')) || 0;
}

function productPrice(product: Product) {
  const direct = parsePrice(product.salePrice || product.retailPrice || product.price);
  if (direct) return direct;
  const variants = (product.variants || []).map((variant) => parsePrice(variant.salePrice || variant.price)).filter(Boolean);
  return variants.length ? Math.min(...variants) : 0;
}

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
const stockLabels: Record<string, string> = { 'in-stock': 'Còn hàng', 'low-stock': 'Sắp hết', 'out-of-stock': 'Hết hàng', preorder: 'Đặt trước' };

interface ProductPickerProps {
  products: Product[];
  loading: boolean;
  selectedId?: string;
  onSelect: (product: Product) => void;
}

export default function ProductPicker({ products, loading, selectedId, onSelect }: ProductPickerProps) {
  const [queryText, setQueryText] = useState('');
  const filtered = useMemo(() => {
    const keyword = queryText.trim().toLowerCase();
    return products.filter((product) => !product.hidden && (!keyword || `${product.name} ${product.id} ${product.sku || ''}`.toLowerCase().includes(keyword)));
  }, [products, queryText]);

  if (loading) return <div className="flex min-h-80 items-center justify-center border border-white/10 bg-black text-xs uppercase tracking-wider text-gray-500"><Loader2 className="mr-2 h-5 w-5 animate-spin text-gold-light" /> Đang tải sản phẩm</div>;

  return <div className="space-y-3"><label className="flex items-center gap-2 border border-white/10 bg-black px-3"><Search className="h-4 w-4 text-gold-light" /><input autoFocus value={queryText} onChange={(event) => setQueryText(event.target.value)} placeholder="Tìm tên, mã sản phẩm hoặc SKU..." className="w-full bg-transparent py-3 text-base text-white outline-none md:text-sm" /></label><div className="max-h-[52vh] overflow-y-auto border border-white/10 bg-black p-2"><div className="grid gap-2 sm:grid-cols-2">{filtered.map((product) => {
    const selected = selectedId === product.id;
    const price = productPrice(product);
    return <button type="button" key={product.id} onClick={() => onSelect(product)} className={`flex gap-3 border p-3 text-left transition ${selected ? 'border-gold-light bg-gold-dark/10 ring-1 ring-gold-light' : 'border-white/10 hover:border-gold-dark/40'}`}><img src={product.image || '/images/voltara_banner.webp'} alt="" className="h-20 w-20 shrink-0 bg-white object-contain" /><div className="min-w-0 flex-1"><span className="font-mono text-[9px] text-gold-light">{product.sku || product.id}</span><b className="mt-1 line-clamp-2 block text-xs uppercase text-white">{product.name}</b><div className="mt-2 flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-bold text-gold-light">{price ? money.format(price) : 'Liên hệ'}</span><span className={`text-[9px] font-bold uppercase ${product.stockStatus === 'out-of-stock' ? 'text-red-400' : 'text-emerald-400'}`}>{stockLabels[product.stockStatus || ''] || (product.stockQuantity ? `Tồn ${product.stockQuantity}` : 'Chưa cập nhật kho')}</span></div></div></button>;
  })}</div>{filtered.length === 0 && <div className="flex min-h-64 flex-col items-center justify-center text-center"><Battery className="mb-3 h-9 w-9 text-gray-700" /><b className="text-sm uppercase text-gray-300">Không tìm thấy sản phẩm</b><p className="mt-2 text-xs text-gray-500">Kiểm tra lại tên, mã sản phẩm hoặc SKU.</p></div>}</div><p className="text-right text-[10px] text-gray-600">{filtered.length}/{products.filter((item) => !item.hidden).length} sản phẩm</p></div>;
}
