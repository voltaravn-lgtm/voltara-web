'use client';

import React, { useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Loader2, PackagePlus, Trash2, X } from 'lucide-react';
import { Product } from '../../../types';
import { uploadImageToCloudinary } from '../../../lib/cloudinary';
import ProductPicker from './ProductPicker';

export const inputClass = 'w-full border border-white/10 bg-black px-3 py-2.5 text-sm normal-case text-white outline-none focus:border-gold-light';
export const labelClass = 'block space-y-2 text-[9px] font-bold uppercase tracking-wider text-gray-500';

export function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className={labelClass}>{label}{children}</label>; }

export function ImageUrlField({ label, value, onChange }: { label: string; value?: string; onChange: (value: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try { onChange(await uploadImageToCloudinary(file)); } catch (error) { window.alert(error instanceof Error ? error.message : 'Không thể tải ảnh.'); } finally { setUploading(false); }
  };
  return <div className="space-y-2"><span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">{label}</span>{value && <img src={value} alt="" className="h-24 w-full border border-white/10 bg-white object-contain" />}<div className="flex gap-2"><input value={value || ''} onChange={(event) => onChange(event.target.value)} placeholder="URL ảnh" className={inputClass} /><button type="button" disabled={uploading} onClick={() => inputRef.current?.click()} className="shrink-0 border border-white/10 px-3 text-gold-light">{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}</button>{value && <button type="button" onClick={() => onChange('')} className="shrink-0 border border-red-500/20 px-3 text-red-400"><X className="h-4 w-4" /></button>}</div><input ref={inputRef} type="file" accept="image/*" hidden onChange={(event) => { void upload(event.target.files?.[0]); event.target.value = ''; }} /></div>;
}

export function ItemActions({ index, count, onMove, onDelete }: { index: number; count: number; onMove: (direction: -1 | 1) => void; onDelete: () => void }) {
  return <div className="flex gap-1"><button type="button" disabled={index === 0} onClick={() => onMove(-1)} className="p-1.5 text-gray-400 disabled:opacity-20"><ArrowUp className="h-3.5 w-3.5" /></button><button type="button" disabled={index === count - 1} onClick={() => onMove(1)} className="p-1.5 text-gray-400 disabled:opacity-20"><ArrowDown className="h-3.5 w-3.5" /></button><button type="button" onClick={onDelete} className="p-1.5 text-red-400"><Trash2 className="h-3.5 w-3.5" /></button></div>;
}

export function moveItem<T>(items: T[], index: number, direction: -1 | 1) { const next = [...items]; const target = index + direction; if (target < 0 || target >= next.length) return next; [next[index], next[target]] = [next[target], next[index]]; return next; }

export function ProductPickerDialog({ products, selectedId, title = 'Chọn sản phẩm', onSelect, onClose }: { products: Product[]; selectedId?: string; title?: string; onSelect: (product: Product) => void; onClose: () => void }) {
  return <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-3" onMouseDown={onClose}><section className="max-h-[92vh] w-full max-w-4xl overflow-auto border border-gold-dark/40 bg-[#0d0d0d] p-4" onMouseDown={(event) => event.stopPropagation()}><div className="mb-4 flex items-center justify-between"><h3 className="flex items-center gap-2 text-sm font-black uppercase text-white"><PackagePlus className="h-4 w-4 text-gold-light" />{title}</h3><button type="button" onClick={onClose}><X className="h-5 w-5 text-gray-400" /></button></div><ProductPicker products={products} loading={false} selectedId={selectedId} onSelect={onSelect} /></section></div>;
}

export function AddButton({ label, onClick }: { label: string; onClick: () => void }) { return <button type="button" onClick={onClick} className="flex w-full items-center justify-center gap-2 border border-dashed border-gold-dark/40 py-2.5 text-[10px] font-bold uppercase text-gold-light"><PackagePlus className="h-4 w-4" />{label}</button>; }
