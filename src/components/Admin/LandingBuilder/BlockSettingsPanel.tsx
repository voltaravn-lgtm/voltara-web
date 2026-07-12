'use client';
import React from 'react';
import { LandingBlock } from '../../../types/landing';
import { useApp } from '../../../context/AppContext';
import { CommonBlockEditor } from './BlockEditors';
import { Field, inputClass } from './BlockEditorFields';
import { getLandingBlockRegistry } from './blockRegistry';

export default function BlockSettingsPanel({ block, primaryProductId, onChange }: { block: LandingBlock; primaryProductId?: string; onChange: (block: LandingBlock) => void }) {
  const { products } = useApp(); const registry = getLandingBlockRegistry(block.type); const Editor = registry.Editor; const primaryProduct = products.find((product) => product.id === primaryProductId) || null;
  return <div className="space-y-6"><div><span className="font-mono text-[9px] uppercase text-gray-600">{block.type} · {block.id}</span><h3 className="mt-1 text-sm font-black uppercase text-white">{block.label || registry.label}</h3></div><Field label="Animation"><select value={block.animation || 'none'} onChange={(event) => onChange({ ...block, animation: event.target.value as LandingBlock['animation'] } as LandingBlock)} className={inputClass}><option value="none">Không</option><option value="fade">Fade</option><option value="zoom">Zoom</option></select></Field><Editor block={block} onChange={onChange} products={products} primaryProduct={primaryProduct} /><CommonBlockEditor block={block} onChange={onChange} /></div>;
}
