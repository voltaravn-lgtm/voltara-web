'use client';

import React, { useMemo, useState } from 'react';
import { Copy, Eye, EyeOff, Layers3, LibraryBig, MousePointer, PackagePlus, Search, Trash2, ArrowUp, ArrowDown, Settings2 } from 'lucide-react';
import { LandingBlock, LandingBlockType, LandingPage } from '../../../types/landing';
import { getLandingBlockRegistry, LANDING_BLOCK_REGISTRY_LIST } from './blockRegistry';

type SidebarTab = 'sections' | 'elements' | 'layers';

const GROUPS: Array<{ key: string; label: string; types: LandingBlockType[] }> = [
  { key: 'content', label: 'Nội dung', types: ['hero', 'banner', 'video', 'benefits', 'features', 'reviews', 'faq', 'spacer'] },
  { key: 'product', label: 'Sản phẩm', types: ['gallery', 'specifications', 'warranty'] },
  { key: 'sales', label: 'Bán hàng', types: ['price', 'combo', 'gift', 'countdown', 'cta', 'order-form'] },
  { key: 'contact', label: 'Liên hệ', types: ['contact-button'] },
];

interface Props {
  page: LandingPage;
  activeTab: SidebarTab;
  selectedBlockId: string | null;
  onTabChange: (tab: SidebarTab) => void;
  onSelectLanding: () => void;
  onSelectBlock: (id: string, scroll?: boolean) => void;
  onAddBlock: (type: LandingBlockType) => void;
  onRenameBlock: (id: string, label: string) => void;
  onToggleBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onDeleteBlock: (id: string) => void;
  onMoveBlock: (id: string, direction: -1 | 1) => void;
}

export default function VisualBuilderSidebar({ page, activeTab, selectedBlockId, onTabChange, onSelectLanding, onSelectBlock, onAddBlock, onRenameBlock, onToggleBlock, onDuplicateBlock, onDeleteBlock, onMoveBlock }: Props) {
  const [query, setQuery] = useState('');
  const keyword = query.trim().toLowerCase();
  const entries = useMemo(() => LANDING_BLOCK_REGISTRY_LIST.filter((entry) => !keyword || `${entry.label} ${entry.description} ${entry.type}`.toLowerCase().includes(keyword)), [keyword]);

  return <aside className="flex h-full min-h-0 flex-col border-r border-white/10 bg-[#0d0d0d] text-white">
    <div className="grid grid-cols-3 border-b border-white/10">
      {([
        ['sections', LibraryBig, 'Sections'],
        ['elements', MousePointer, 'Elements'],
        ['layers', Layers3, 'Layers'],
      ] as const).map(([tab, Icon, label]) => <button key={tab} type="button" onClick={() => onTabChange(tab)} className={`flex flex-col items-center gap-1 px-2 py-3 text-[9px] font-bold uppercase ${activeTab === tab ? 'bg-gold-dark/10 text-gold-light' : 'text-gray-500 hover:text-white'}`}><Icon className="h-4 w-4" />{label}</button>)}
    </div>

    {activeTab === 'sections' && <div className="min-h-0 flex-1 overflow-y-auto p-3">
      <label className="mb-3 flex items-center gap-2 border border-white/10 bg-black px-3"><Search className="h-4 w-4 text-gray-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm section..." className="w-full bg-transparent py-2.5 text-sm outline-none" /></label>
      <div className="space-y-4">
        {GROUPS.map((group) => {
          const groupEntries = entries.filter((entry) => group.types.includes(entry.type));
          if (!groupEntries.length) return null;
          return <section key={group.key} className="space-y-2">
            <h3 className="text-[9px] font-black uppercase tracking-wider text-gray-500">{group.label}</h3>
            {groupEntries.map((entry) => {
              const Icon = entry.Icon;
              return <button key={entry.type} type="button" onClick={() => onAddBlock(entry.type)} className="flex w-full gap-3 border border-white/10 bg-black p-3 text-left hover:border-gold-light hover:bg-gold-dark/10">
                <span className="shrink-0 bg-white/5 p-2 text-gold-light"><Icon className="h-4 w-4" /></span>
                <span className="min-w-0">
                  <b className="block text-[11px] uppercase text-white">{entry.label}</b>
                  <span className="mt-1 line-clamp-2 text-[10px] leading-4 text-gray-500">{entry.description}</span>
                </span>
              </button>;
            })}
          </section>;
        })}
      </div>
    </div>}

    {activeTab === 'elements' && <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-6 text-center">
      <PackagePlus className="mb-4 h-10 w-10 text-gold-light" />
      <h3 className="text-sm font-black uppercase">Basic Elements</h3>
      <p className="mt-3 text-xs leading-5 text-gray-500">Text, Image, Button và Custom Section sẽ được bổ sung ở Task 11B.</p>
    </div>}

    {activeTab === 'layers' && <div className="min-h-0 flex-1 overflow-y-auto p-3">
      <button type="button" onClick={onSelectLanding} className={`mb-3 flex w-full items-center gap-2 border p-3 text-left ${!selectedBlockId ? 'border-gold-light bg-gold-dark/10' : 'border-white/10 bg-black hover:border-gold-dark/30'}`}><Settings2 className="h-4 w-4 text-gold-light" /><span><b className="block text-[11px] uppercase">Landing Settings</b><span className="text-[9px] text-gray-600">{page.slug}</span></span></button>
      <div className="space-y-2">
        {page.blocks.map((block, index) => {
          const registry = getLandingBlockRegistry(block.type);
          const Icon = registry.Icon;
          const selected = block.id === selectedBlockId;
          return <article key={block.id} onClick={() => onSelectBlock(block.id, true)} className={`border p-3 ${selected ? 'border-gold-light bg-gold-dark/10' : 'border-white/10 bg-black hover:border-gold-dark/30'} ${block.hidden ? 'opacity-55' : ''}`}>
            <div className="flex items-start gap-2">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold-light" />
              <div className="min-w-0 flex-1">
                <input value={block.label || registry.label} onClick={(event) => event.stopPropagation()} onChange={(event) => onRenameBlock(block.id, event.target.value)} className="w-full bg-transparent text-[11px] font-bold uppercase text-white outline-none" />
                <span className="font-mono text-[8px] text-gray-700">{index + 1}. {block.type}</span>
              </div>
              {block.hidden && <EyeOff className="h-3.5 w-3.5 text-gray-600" />}
            </div>
            <div className="mt-2 grid grid-cols-5 gap-1 border-t border-white/5 pt-2">
              <button type="button" disabled={index === 0} onClick={(event) => { event.stopPropagation(); onMoveBlock(block.id, -1); }} className="p-1.5 text-gray-500 hover:text-white disabled:opacity-20"><ArrowUp className="mx-auto h-3.5 w-3.5" /></button>
              <button type="button" disabled={index === page.blocks.length - 1} onClick={(event) => { event.stopPropagation(); onMoveBlock(block.id, 1); }} className="p-1.5 text-gray-500 hover:text-white disabled:opacity-20"><ArrowDown className="mx-auto h-3.5 w-3.5" /></button>
              <button type="button" onClick={(event) => { event.stopPropagation(); onDuplicateBlock(block.id); }} className="p-1.5 text-blue-400 hover:text-white"><Copy className="mx-auto h-3.5 w-3.5" /></button>
              <button type="button" onClick={(event) => { event.stopPropagation(); onToggleBlock(block.id); }} className="p-1.5 text-emerald-400 hover:text-white">{block.hidden ? <Eye className="mx-auto h-3.5 w-3.5" /> : <EyeOff className="mx-auto h-3.5 w-3.5" />}</button>
              <button type="button" onClick={(event) => { event.stopPropagation(); onDeleteBlock(block.id); }} className="p-1.5 text-red-400 hover:text-white"><Trash2 className="mx-auto h-3.5 w-3.5" /></button>
            </div>
          </article>;
        })}
      </div>
    </div>}
  </aside>;
}
