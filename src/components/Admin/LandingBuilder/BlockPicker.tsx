'use client';

import React from 'react';
import { X } from 'lucide-react';
import { LandingBlock } from '../../../types/landing';
import { LANDING_BLOCK_REGISTRY_LIST } from './blockRegistry';

export default function BlockPicker({ onClose, onPick }: { onClose: () => void; onPick: (block: LandingBlock) => void }) {
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm" onMouseDown={onClose}>
    <section onMouseDown={(event) => event.stopPropagation()} className="max-h-[90vh] w-full max-w-4xl overflow-y-auto border border-gold-dark/30 bg-[#0d0d0d]">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0d0d0d] p-5">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-gold-light">Section Registry</p>
          <h3 className="mt-1 text-lg font-black uppercase">Thêm section</h3>
        </div>
        <button type="button" onClick={onClose} className="p-2 text-gray-500"><X className="h-5 w-5" /></button>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {LANDING_BLOCK_REGISTRY_LIST.map((entry) => {
          const Icon = entry.Icon;
          return <button type="button" key={entry.type} onClick={() => onPick(entry.createDefault())} className="border border-white/10 bg-black p-4 text-left hover:border-gold-light">
            <Icon className="h-6 w-6 text-gold-light" />
            <b className="mt-3 block text-xs uppercase text-white">{entry.label}</b>
            <p className="mt-2 min-h-10 text-[10px] leading-5 text-gray-500">{entry.description}</p>
            <span className="mt-3 inline-block font-mono text-[8px] text-gray-700">{entry.type}</span>
          </button>;
        })}
      </div>
    </section>
  </div>;
}
