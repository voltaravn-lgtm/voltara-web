'use client';

import React, { useState } from 'react';
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { LandingBlock } from '../../../types/landing';
import { getLandingBlockRegistry } from './blockRegistry';

interface BlockListProps {
  blocks: LandingBlock[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggle: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export default function BlockList({ blocks, selectedId, onSelect, onAdd, onDelete, onDuplicate, onToggle, onMove, onReorder }: BlockListProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  return <div className="flex h-full min-h-0 flex-col">
    <div className="flex items-center justify-between border-b border-white/10 p-3">
      <div>
        <b className="text-xs uppercase text-white">Cấu trúc trang</b>
        <p className="mt-1 text-[9px] text-gray-600">{blocks.length} section</p>
      </div>
      <button type="button" onClick={onAdd} className="flex items-center gap-1 bg-gold-light px-3 py-2 text-[9px] font-black uppercase text-black">
        <Plus className="h-3.5 w-3.5" /> Thêm section
      </button>
    </div>

    <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
      {blocks.map((block, index) => {
        const registry = getLandingBlockRegistry(block.type);
        const Icon = registry.Icon;
        const selected = block.id === selectedId;

        return <article
          key={block.id}
          draggable
          onDragStart={() => setDragIndex(index)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            if (dragIndex !== null && dragIndex !== index) onReorder(dragIndex, index);
            setDragIndex(null);
          }}
          onDragEnd={() => setDragIndex(null)}
          onClick={() => onSelect(block.id)}
          className={`cursor-grab border p-3 transition active:cursor-grabbing ${selected ? 'border-gold-light bg-gold-dark/10' : 'border-white/10 bg-black hover:border-gold-dark/30'} ${dragIndex === index ? 'opacity-40' : ''} ${block.hidden ? 'opacity-50' : ''}`}
        >
          <div className="flex items-start gap-2">
            <span className={`mt-0.5 p-1.5 ${selected ? 'bg-gold-light text-black' : 'bg-white/5 text-gold-light'}`}><Icon className="h-3.5 w-3.5" /></span>
            <div className="min-w-0 flex-1">
              <b className="block truncate text-[11px] uppercase text-white">{block.label || registry.label}</b>
              <span className="font-mono text-[8px] text-gray-700">{index + 1}. {block.type}</span>
            </div>
            {block.hidden && <EyeOff className="h-3.5 w-3.5 text-gray-600" />}
          </div>

          <div className="mt-3 grid grid-cols-5 gap-1 border-t border-white/5 pt-2">
            <button type="button" disabled={index === 0} onClick={(event) => { event.stopPropagation(); onMove(block.id, -1); }} title="Di chuyển lên" className="p-1.5 text-gray-500 hover:bg-white/5 hover:text-white disabled:opacity-20"><ArrowUp className="mx-auto h-3.5 w-3.5" /></button>
            <button type="button" disabled={index === blocks.length - 1} onClick={(event) => { event.stopPropagation(); onMove(block.id, 1); }} title="Di chuyển xuống" className="p-1.5 text-gray-500 hover:bg-white/5 hover:text-white disabled:opacity-20"><ArrowDown className="mx-auto h-3.5 w-3.5" /></button>
            <button type="button" onClick={(event) => { event.stopPropagation(); onDuplicate(block.id); }} title="Nhân bản" className="p-1.5 text-blue-400 hover:bg-blue-500 hover:text-white"><Copy className="mx-auto h-3.5 w-3.5" /></button>
            <button type="button" onClick={(event) => { event.stopPropagation(); onToggle(block.id); }} title={block.hidden ? 'Hiện section' : 'Ẩn section'} className="p-1.5 text-emerald-400 hover:bg-emerald-500 hover:text-black">{block.hidden ? <Eye className="mx-auto h-3.5 w-3.5" /> : <EyeOff className="mx-auto h-3.5 w-3.5" />}</button>
            <button type="button" onClick={(event) => { event.stopPropagation(); onDelete(block.id); }} title="Xóa" className="p-1.5 text-red-400 hover:bg-red-500 hover:text-white"><Trash2 className="mx-auto h-3.5 w-3.5" /></button>
          </div>
        </article>;
      })}

      {blocks.length === 0 && <div className="flex min-h-52 flex-col items-center justify-center border border-dashed border-white/10 px-4 text-center">
        <p className="text-xs text-gray-500">Trang chưa có section.</p>
        <button type="button" onClick={onAdd} className="mt-3 text-[10px] font-bold uppercase text-gold-light">+ Thêm section đầu tiên</button>
      </div>}
    </div>
  </div>;
}
