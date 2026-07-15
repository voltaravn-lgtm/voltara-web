'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { LandingBlock, LandingBlockType, LandingPage, LandingPageStatus, LandingPreviewMode } from '../../../types/landing';
import { createDefaultLandingBlock, createLandingEntityId } from '../../../lib/landing/landingDefaults';
import { getLandingPageById, isLandingSlugAvailable, saveLandingPage } from '../../../lib/landing/landingPageRepository';
import { validateLandingPage, validateLandingPageForPublish } from '../../../lib/landing/landingValidation';
import { revalidateLandingCache } from '../../../lib/landing/landingCacheClient';
import { materializeLandingTemplateDefaults } from '../../../lib/landing/landingTemplates';
import { useApp } from '../../../context/AppContext';
import VisualBuilderTopbar from './VisualBuilderTopbar';
import VisualBuilderSidebar from './VisualBuilderSidebar';
import VisualBuilderCanvas from './VisualBuilderCanvas';
import VisualBuilderInspector from './VisualBuilderInspector';

type MobilePanel = 'library' | 'canvas' | 'inspector';
type SidebarTab = 'sections' | 'elements' | 'layers';

const HISTORY_LIMIT = 40;

function clonePage(page: LandingPage) {
  return JSON.parse(JSON.stringify(page)) as LandingPage;
}

function findNearestBlockId(blocks: LandingBlock[], removedIndex: number) {
  if (!blocks.length) return null;
  return blocks[Math.min(Math.max(removedIndex, 0), blocks.length - 1)]?.id || blocks[blocks.length - 1]?.id || null;
}

function normalizeSelection(page: LandingPage | null, selectedBlockId: string | null) {
  if (!page) return null;
  if (selectedBlockId && page.blocks.some((block) => block.id === selectedBlockId)) return selectedBlockId;
  return page.blocks[0]?.id || null;
}

export default function LandingBuilder({ pageId, onBack }: { pageId: string; onBack: () => void }) {
  const { showToast } = useApp();
  const [page, setPage] = useState<LandingPage | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState('');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<LandingPreviewMode>('desktop');
  const [previewOnly, setPreviewOnly] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('sections');
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('canvas');
  const [historyPast, setHistoryPast] = useState<LandingPage[]>([]);
  const [historyFuture, setHistoryFuture] = useState<LandingPage[]>([]);
  const [scrollSignal, setScrollSignal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError('');
    getLandingPageById(pageId).then((result) => {
      if (cancelled) return;
      if (!result) throw new Error('Landing Page không tồn tại.');
      const source = clonePage(result);
      const draft = materializeLandingTemplateDefaults(source);
      setPage(draft);
      setSavedSnapshot(JSON.stringify(source));
      setSelectedBlockId(draft.blocks[0]?.id || null);
      setHistoryPast([]);
      setHistoryFuture([]);
      setLoading(false);
    }).catch((error) => {
      if (cancelled) return;
      console.error('Could not load Landing Builder:', error);
      setLoadError(error instanceof Error ? error.message : 'Không tải được Landing Page.');
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [pageId]);

  const dirty = useMemo(() => Boolean(page && savedSnapshot && JSON.stringify(page) !== savedSnapshot), [page, savedSnapshot]);
  const selectedBlock = page?.blocks.find((block) => block.id === selectedBlockId) || null;

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const pushHistory = useCallback((current: LandingPage) => {
    setHistoryPast((items) => [...items.slice(-(HISTORY_LIMIT - 1)), clonePage(current)]);
    setHistoryFuture([]);
  }, []);

  const commitPage = useCallback((next: LandingPage, nextSelectedId?: string | null, shouldScroll = false) => {
    setPage((current) => {
      if (!current) return current;
      pushHistory(current);
      return clonePage(next);
    });
    if (nextSelectedId !== undefined) setSelectedBlockId(nextSelectedId);
    if (shouldScroll) setScrollSignal((value) => value + 1);
  }, [pushHistory]);

  const leaveBuilder = () => {
    if (dirty && !window.confirm('Bạn có thay đổi chưa lưu. Rời Builder và bỏ các thay đổi này?')) return;
    onBack();
  };

  const selectBlock = (id: string | null, shouldScroll = false) => {
    setSelectedBlockId(id);
    if (id) {
      setSidebarTab('layers');
      if (shouldScroll) setScrollSignal((value) => value + 1);
    }
  };

  const updatePage = (nextPage: LandingPage) => {
    if (!page) return;
    commitPage(nextPage, normalizeSelection(nextPage, selectedBlockId));
  };

  const updateBlock = (nextBlock: LandingBlock) => {
    if (!page) return;
    const nextPage = { ...page, blocks: page.blocks.map((block) => block.id === nextBlock.id ? nextBlock : block) };
    commitPage(nextPage, nextBlock.id);
  };

  const renameBlock = (id: string, label: string) => {
    if (!page) return;
    const nextPage = { ...page, blocks: page.blocks.map((block) => block.id === id ? { ...block, label: label || undefined } as LandingBlock : block) };
    commitPage(nextPage, id);
  };

  const addBlock = (type: LandingBlockType) => {
    if (!page) return;
    const block = createDefaultLandingBlock(type);
    const selectedIndex = selectedBlockId ? page.blocks.findIndex((item) => item.id === selectedBlockId) : -1;
    const insertAt = selectedIndex >= 0 ? selectedIndex + 1 : page.blocks.length;
    const nextBlocks = [...page.blocks];
    nextBlocks.splice(insertAt, 0, block);
    const nextPage = { ...page, blocks: nextBlocks };
    commitPage(nextPage, block.id, true);
    setSidebarTab('layers');
    setMobilePanel('inspector');
  };

  const deleteBlock = (id: string) => {
    if (!page) return;
    const index = page.blocks.findIndex((block) => block.id === id);
    const target = page.blocks[index];
    if (index < 0 || !target || !window.confirm(`Xóa section “${target.label || target.type}”?`)) return;
    const nextBlocks = page.blocks.filter((block) => block.id !== id);
    const nextSelectedId = selectedBlockId === id ? findNearestBlockId(nextBlocks, index) : selectedBlockId;
    commitPage({ ...page, blocks: nextBlocks }, nextSelectedId, Boolean(nextSelectedId));
  };

  const duplicateBlock = (id: string) => {
    if (!page) return;
    const index = page.blocks.findIndex((block) => block.id === id);
    if (index < 0) return;
    const copy = clonePage({ ...page, blocks: [page.blocks[index]] }).blocks[0];
    copy.id = createLandingEntityId('block');
    copy.label = copy.label ? `${copy.label} (Bản sao)` : undefined;
    const nextBlocks = [...page.blocks];
    nextBlocks.splice(index + 1, 0, copy);
    commitPage({ ...page, blocks: nextBlocks }, copy.id, true);
    setSidebarTab('layers');
    setMobilePanel('inspector');
  };

  const toggleBlock = (id: string) => {
    if (!page) return;
    const nextPage = { ...page, blocks: page.blocks.map((block) => block.id === id ? { ...block, hidden: !block.hidden } as LandingBlock : block) };
    commitPage(nextPage, id);
  };

  const moveBlock = (id: string, direction: -1 | 1) => {
    if (!page) return;
    const index = page.blocks.findIndex((block) => block.id === id);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= page.blocks.length) return;
    const nextBlocks = [...page.blocks];
    [nextBlocks[index], nextBlocks[targetIndex]] = [nextBlocks[targetIndex], nextBlocks[index]];
    commitPage({ ...page, blocks: nextBlocks }, id, true);
  };

  const undo = () => {
    if (!page || !historyPast.length) return;
    const previous = historyPast[historyPast.length - 1];
    setHistoryPast((items) => items.slice(0, -1));
    setHistoryFuture((items) => [clonePage(page), ...items].slice(0, HISTORY_LIMIT));
    setPage(clonePage(previous));
    setSelectedBlockId((current) => normalizeSelection(previous, current));
  };

  const redo = () => {
    if (!page || !historyFuture.length) return;
    const next = historyFuture[0];
    setHistoryFuture((items) => items.slice(1));
    setHistoryPast((items) => [...items.slice(-(HISTORY_LIMIT - 1)), clonePage(page)]);
    setPage(clonePage(next));
    setSelectedBlockId((current) => normalizeSelection(next, current));
  };

  const persist = async (status: LandingPageStatus) => {
    if (!page) return;
    const candidate = { ...page, status };
    if (status === 'published') {
      const validation = validateLandingPageForPublish(candidate);
      if (!validation.valid) return showToast(validation.errors[0], 'error');
      if (validation.warnings.length && !window.confirm(`Landing có ${validation.warnings.length} cảnh báo trước khi publish:\n\n${validation.warnings.slice(0, 8).join('\n')}\n\nBạn vẫn muốn publish?`)) return;
    } else {
      const validation = validateLandingPage(candidate);
      if (!validation.valid) return showToast(validation.errors[0], 'error');
    }
    setSaving(true);
    try {
      if (!await isLandingSlugAvailable(candidate.slug, candidate.id)) throw new Error('Slug đã được sử dụng hoặc nằm trong lịch sử URL của Landing khác.');
      const saved = await saveLandingPage(candidate);
      await revalidateLandingCache([page.slug, saved.slug, ...(saved.slugHistory || [])]);
      const next = clonePage(saved);
      setPage(next);
      setSavedSnapshot(JSON.stringify(next));
      setSelectedBlockId((current) => normalizeSelection(next, current));
      setHistoryPast([]);
      setHistoryFuture([]);
      showToast(status === 'published' ? 'Đã publish Landing Page.' : 'Đã lưu Landing Page dưới dạng bản nháp.', 'success');
    } catch (error) {
      console.error('Could not save Landing Builder:', error);
      showToast(error instanceof Error ? error.message : 'Không thể lưu Landing Page.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="fixed inset-0 z-[85] flex items-center justify-center bg-[#080808]">
      <Loader2 className="mr-3 h-6 w-6 animate-spin text-gold-light" />
      <span className="text-xs uppercase tracking-widest text-gray-500">Đang tải Visual Builder</span>
    </div>;
  }

  if (loadError || !page) {
    return <div className="fixed inset-0 z-[85] flex flex-col items-center justify-center bg-[#080808] px-5 text-center">
      <p className="text-sm text-red-300">{loadError || 'Landing Page không tồn tại.'}</p>
      <button type="button" onClick={onBack} className="mt-5 border border-white/10 px-5 py-3 text-xs uppercase text-white">Quay lại danh sách</button>
    </div>;
  }

  return <div className="fixed inset-0 z-[85] flex flex-col overflow-hidden bg-[#080808] text-white">
    <VisualBuilderTopbar
      page={page}
      dirty={dirty}
      saving={saving}
      previewOnly={previewOnly}
      canUndo={historyPast.length > 0}
      canRedo={historyFuture.length > 0}
      mode={previewMode}
      onBack={leaveBuilder}
      onUndo={undo}
      onRedo={redo}
      onModeChange={setPreviewMode}
      onPreviewToggle={() => setPreviewOnly((value) => !value)}
      onPersist={persist}
    />

    {!previewOnly && <nav className="grid shrink-0 grid-cols-3 border-b border-white/10 bg-[#111] lg:hidden">
      {([
        ['library', 'Library/Layers'],
        ['canvas', 'Canvas'],
        ['inspector', 'Inspector'],
      ] as const).map(([key, label]) => <button
        type="button"
        key={key}
        onClick={() => setMobilePanel(key)}
        className={`py-3 text-[9px] font-bold uppercase ${mobilePanel === key ? 'bg-gold-dark/10 text-gold-light' : 'text-gray-500'}`}
      >
        {label}
      </button>)}
    </nav>}

    <div className={`${previewOnly ? 'block' : 'lg:grid lg:grid-cols-[320px_minmax(360px,1fr)_360px]'} min-h-0 flex-1`}>
      {!previewOnly && <div className={`${mobilePanel === 'library' ? 'block' : 'hidden'} h-full min-h-0 lg:block`}>
        <VisualBuilderSidebar
          page={page}
          selectedBlockId={selectedBlockId}
          activeTab={sidebarTab}
          onTabChange={setSidebarTab}
          onSelectLanding={() => { setSelectedBlockId(null); setMobilePanel('inspector'); }}
          onSelectBlock={(id) => { selectBlock(id, true); setMobilePanel('inspector'); }}
          onAddBlock={addBlock}
          onRenameBlock={renameBlock}
          onDeleteBlock={deleteBlock}
          onDuplicateBlock={duplicateBlock}
          onToggleBlock={toggleBlock}
          onMoveBlock={moveBlock}
        />
      </div>}

      <div className={`${previewOnly || mobilePanel === 'canvas' ? 'block' : 'hidden'} h-full min-h-0 lg:block`}>
        <VisualBuilderCanvas
          page={page}
          mode={previewMode}
          selectedBlockId={selectedBlockId}
          previewOnly={previewOnly}
          scrollSignal={scrollSignal}
          onSelectBlock={(id) => { selectBlock(id); if (window.innerWidth < 1024) setMobilePanel('inspector'); }}
          onEditBlock={(id) => { selectBlock(id, true); setMobilePanel('inspector'); }}
          onMoveBlock={moveBlock}
          onDuplicateBlock={duplicateBlock}
          onToggleBlock={toggleBlock}
          onDeleteBlock={deleteBlock}
        />
      </div>

      {!previewOnly && <div className={`${mobilePanel === 'inspector' ? 'block' : 'hidden'} h-full min-h-0 lg:block`}>
        <VisualBuilderInspector
          page={page}
          block={selectedBlock}
          onPageChange={updatePage}
          onBlockChange={updateBlock}
        />
      </div>}
    </div>
  </div>;
}
