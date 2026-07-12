'use client';

import React, { useMemo, useState } from 'react';
import { LandingBlock, LandingPage } from '../../../types/landing';
import { useApp } from '../../../context/AppContext';
import { CommonBlockEditor } from './BlockEditors';
import { Field, inputClass } from './BlockEditorFields';
import { getLandingBlockRegistry } from './blockRegistry';
import LandingSettingsPanel from './LandingSettingsPanel';

type InspectorTab = 'content' | 'style' | 'responsive' | 'advanced';

interface Props {
  page: LandingPage;
  block: LandingBlock | null;
  onPageChange: (page: LandingPage) => void;
  onBlockChange: (block: LandingBlock) => void;
}

export default function VisualBuilderInspector({ page, block, onPageChange, onBlockChange }: Props) {
  const { products } = useApp();
  const [tab, setTab] = useState<InspectorTab>('content');
  const registry = block ? getLandingBlockRegistry(block.type) : null;
  const Editor = registry?.Editor;
  const primaryProduct = useMemo(() => products.find((product) => product.id === page.primaryProductId) || null, [products, page.primaryProductId]);

  const style = block?.style || {};
  const updateStyle = (patch: Partial<NonNullable<LandingBlock['style']>>) => {
    if (!block) return;
    onBlockChange({ ...block, style: { ...style, ...patch } } as LandingBlock);
  };

  return <aside className="flex h-full min-h-0 flex-col border-l border-white/10 bg-[#0d0d0d] text-white">
    <div className="border-b border-white/10 p-4">
      <span className="font-mono text-[9px] uppercase text-gray-600">{block ? `${block.type} · ${block.id}` : 'Landing'}</span>
      <h2 className="mt-1 truncate text-sm font-black uppercase">{block ? (block.label || registry?.label) : 'Landing Settings'}</h2>
    </div>
    <div className="grid grid-cols-4 border-b border-white/10">
      {(['content', 'style', 'responsive', 'advanced'] as const).map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={`py-3 text-[9px] font-bold uppercase ${tab === item ? 'bg-gold-dark/10 text-gold-light' : 'text-gray-500 hover:text-white'}`}>{item}</button>)}
    </div>

    <div className="min-h-0 flex-1 overflow-y-auto p-4">
      {!block && <LandingSettingsPanel page={page} onChange={onPageChange} />}

      {block && tab === 'content' && Editor && <div className="space-y-5"><Editor block={block} onChange={onBlockChange} products={products} primaryProduct={primaryProduct} /></div>}

      {block && tab === 'style' && <div className="space-y-5">
        <Field label="Màu nền"><input type="color" value={style.backgroundColor || '#111111'} onChange={(event) => updateStyle({ backgroundColor: event.target.value })} className="h-10 w-full border border-white/10 bg-black p-1" /></Field>
        <Field label="Màu chữ"><input type="color" value={style.textColor || '#ffffff'} onChange={(event) => updateStyle({ textColor: event.target.value })} className="h-10 w-full border border-white/10 bg-black p-1" /></Field>
        <Field label="Căn lề"><select value={style.alignment || 'left'} onChange={(event) => updateStyle({ alignment: event.target.value as 'left' | 'center' | 'right' })} className={inputClass}><option value="left">Trái</option><option value="center">Giữa</option><option value="right">Phải</option></select></Field>
        <div className="grid grid-cols-2 gap-3"><Field label="Padding trên"><input type="number" min="0" max="300" value={style.paddingTop ?? 48} onChange={(event) => updateStyle({ paddingTop: Number(event.target.value) })} className={inputClass} /></Field><Field label="Padding dưới"><input type="number" min="0" max="300" value={style.paddingBottom ?? 48} onChange={(event) => updateStyle({ paddingBottom: Number(event.target.value) })} className={inputClass} /></Field></div>
        <div className="border-t border-white/10 pt-5"><CommonBlockEditor block={block} onChange={onBlockChange} products={products} primaryProduct={primaryProduct} /></div>
      </div>}

      {block && tab === 'responsive' && <div className="space-y-4">
        <label className="flex items-center justify-between text-xs text-gray-300"><span>Hiển thị Desktop</span><input type="checkbox" checked={block.desktopVisible !== false} onChange={(event) => onBlockChange({ ...block, desktopVisible: event.target.checked } as LandingBlock)} className="h-4 w-4 accent-[#f5c45a]" /></label>
        <label className="flex items-center justify-between text-xs text-gray-300"><span>Hiển thị Tablet</span><span className="text-[9px] uppercase text-gray-600">Theo Desktop</span></label>
        <label className="flex items-center justify-between text-xs text-gray-300"><span>Hiển thị Mobile</span><input type="checkbox" checked={block.mobileVisible !== false} onChange={(event) => onBlockChange({ ...block, mobileVisible: event.target.checked } as LandingBlock)} className="h-4 w-4 accent-[#f5c45a]" /></label>
      </div>}

      {block && tab === 'advanced' && <div className="space-y-4">
        <Field label="Tên nội bộ"><input value={block.label || ''} onChange={(event) => onBlockChange({ ...block, label: event.target.value || undefined } as LandingBlock)} placeholder={registry?.label} className={inputClass} /></Field>
        <Field label="Animation"><select value={block.animation || 'none'} onChange={(event) => onBlockChange({ ...block, animation: event.target.value as LandingBlock['animation'] } as LandingBlock)} className={inputClass}><option value="none">Không</option><option value="fade">Fade</option><option value="zoom">Zoom</option></select></Field>
        <div className="space-y-2 border border-white/10 bg-black p-3 text-[10px] text-gray-500">
          <p><b className="text-gray-300">ID:</b> {block.id}</p>
          <p><b className="text-gray-300">Loại section:</b> {block.type}</p>
          <p><b className="text-gray-300">Ẩn:</b> {block.hidden ? 'Có' : 'Không'}</p>
        </div>
      </div>}
    </div>
  </aside>;
}
