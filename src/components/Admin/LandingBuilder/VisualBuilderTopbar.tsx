'use client';

import React from 'react';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2, Monitor, Redo2, Save, Smartphone, Tablet, Undo2 } from 'lucide-react';
import { LandingPage, LandingPageStatus, LandingPreviewMode } from '../../../types/landing';

interface Props {
  page: LandingPage;
  dirty: boolean;
  saving: boolean;
  previewOnly: boolean;
  canUndo: boolean;
  canRedo: boolean;
  mode: LandingPreviewMode;
  onBack: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onModeChange: (mode: LandingPreviewMode) => void;
  onPreviewToggle: () => void;
  onPersist: (status: LandingPageStatus) => void;
}

export default function VisualBuilderTopbar({ page, dirty, saving, previewOnly, canUndo, canRedo, mode, onBack, onUndo, onRedo, onModeChange, onPreviewToggle, onPersist }: Props) {
  return <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#090909] px-3 text-white">
    <div className="flex min-w-0 items-center gap-3">
      <button type="button" onClick={onBack} title="Quay lại" className="border border-white/10 p-2 text-gray-400 hover:border-gold-light hover:text-gold-light"><ArrowLeft className="h-4 w-4" /></button>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="truncate text-sm font-black uppercase">{page.name}</h1>
          <span className={`shrink-0 border px-2 py-1 text-[8px] font-bold uppercase ${page.status === 'published' ? 'border-emerald-500/30 text-emerald-400' : 'border-amber-500/30 text-amber-300'}`}>{page.status === 'published' ? 'Published' : 'Draft'}</span>
          <span className={`hidden shrink-0 text-[9px] font-bold uppercase sm:inline ${dirty ? 'text-amber-300' : 'text-emerald-400'}`}>{dirty ? 'Chưa lưu' : 'Đã lưu'}</span>
        </div>
        <p className="mt-0.5 hidden truncate font-mono text-[9px] text-gray-600 md:block">/landing/{page.slug}</p>
      </div>
    </div>

    <div className="flex items-center gap-1">
      <button type="button" disabled={!canUndo || saving} onClick={onUndo} title="Undo" className="border border-white/10 p-2 text-gray-400 hover:text-white disabled:opacity-30"><Undo2 className="h-4 w-4" /></button>
      <button type="button" disabled={!canRedo || saving} onClick={onRedo} title="Redo" className="border border-white/10 p-2 text-gray-400 hover:text-white disabled:opacity-30"><Redo2 className="h-4 w-4" /></button>
      <div className="ml-1 hidden border border-white/10 bg-black p-1 sm:flex">
        {([['desktop', Monitor], ['tablet', Tablet], ['mobile', Smartphone]] as const).map(([key, Icon]) => <button key={key} type="button" onClick={() => onModeChange(key)} title={key} className={`p-1.5 ${mode === key ? 'bg-gold-light text-black' : 'text-gray-500 hover:text-white'}`}><Icon className="h-4 w-4" /></button>)}
      </div>
      <button type="button" onClick={onPreviewToggle} className={`ml-1 hidden items-center gap-2 border px-3 py-2 text-[9px] font-bold uppercase md:flex ${previewOnly ? 'border-gold-light bg-gold-light text-black' : 'border-white/10 text-gray-300 hover:text-white'}`}><Eye className="h-3.5 w-3.5" />{previewOnly ? 'Chỉnh sửa' : 'Preview'}</button>
      <button type="button" disabled={saving} onClick={() => onPersist('draft')} className="ml-1 hidden items-center gap-2 border border-white/10 px-3 py-2 text-[9px] font-bold uppercase text-gray-300 hover:text-white disabled:opacity-40 sm:flex"><Save className="h-3.5 w-3.5" />Lưu nháp</button>
      {page.status === 'published' && <button type="button" disabled={saving} onClick={() => onPersist('draft')} className="hidden items-center gap-2 border border-amber-500/20 px-3 py-2 text-[9px] font-bold uppercase text-amber-300 disabled:opacity-40 lg:flex"><EyeOff className="h-3.5 w-3.5" />Unpublish</button>}
      <button type="button" disabled={saving} onClick={() => onPersist('published')} className="flex min-w-24 items-center justify-center gap-2 bg-gold-light px-3 py-2 text-[9px] font-black uppercase text-black disabled:opacity-40">{saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : page.status === 'published' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}{page.status === 'published' ? 'Publish' : 'Publish'}</button>
    </div>
  </header>;
}
