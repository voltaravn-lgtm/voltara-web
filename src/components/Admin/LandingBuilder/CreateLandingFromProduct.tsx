'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Loader2, PackagePlus, X } from 'lucide-react';
import { Product } from '../../../types';
import { LandingPage } from '../../../types/landing';
import { createDefaultLandingPage } from '../../../lib/landing/landingDefaults';
import { LANDING_TEMPLATES, LandingTemplateDefinition, createLandingTemplateData } from '../../../lib/landing/landingTemplates';
import { createLandingPage, isLandingSlugAvailable } from '../../../lib/landing/landingPageRepository';
import { normalizeLandingSlug, sanitizeLandingSlugInput, validateLandingSlug } from '../../../lib/landing/landingValidation';
import ProductPicker from './ProductPicker';
import TemplatePicker from './TemplatePicker';

interface CreateLandingFromProductProps {
  products: Product[];
  onClose: () => void;
  onCreated: (page: LandingPage) => void;
}

const steps = ['Chọn sản phẩm', 'Chọn template', 'Tên và slug', 'Xác nhận'];

function cleanDescription(value?: string) {
  return String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 220);
}

export default function CreateLandingFromProduct({ products, onClose, onCreated }: CreateLandingFromProductProps) {
  const [step, setStep] = useState(1);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<LandingTemplateDefinition>(LANDING_TEMPLATES[0]);
  const [internalName, setInternalName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setLoadingProducts(true);
    const frame = window.requestAnimationFrame(() => {
      setAvailableProducts(products);
      setLoadingProducts(false);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [products]);

  const chooseProduct = (product: Product) => {
    setSelectedProduct(product);
    setInternalName(`Landing - ${product.name}`);
    setSlug(normalizeLandingSlug(product.name));
    setError('');
  };

  const goNext = async () => {
    setError('');
    if (step === 1 && !selectedProduct) return setError('Vui lòng chọn một sản phẩm chính.');
    if (step === 2 && !selectedTemplate) return setError('Vui lòng chọn một template.');
    if (step === 3) {
      if (!internalName.trim()) return setError('Vui lòng nhập tên nội bộ.');
      const validation = validateLandingSlug(slug);
      if (!validation.valid) return setError(validation.errors[0]);
      if (!await isLandingSlugAvailable(slug)) return setError('Slug đã được sử dụng hoặc nằm trong lịch sử URL của Landing Page khác.');
    }
    setStep((current) => Math.min(4, current + 1));
  };

  const createLanding = async () => {
    if (!selectedProduct || !selectedTemplate) return;
    setCreating(true);
    setError('');
    try {
      const normalizedSlug = normalizeLandingSlug(slug);
      if (!await isLandingSlugAvailable(normalizedSlug)) throw new Error('Slug đã được sử dụng hoặc nằm trong lịch sử URL của Landing Page khác.');
      const base = createDefaultLandingPage();
      const templateData = createLandingTemplateData(selectedTemplate, selectedProduct);
      const { createdAt: _createdAt, updatedAt: _updatedAt, ...input } = {
        ...base,
        ...templateData,
        name: internalName.trim(),
        slug: normalizedSlug,
        slugHistory: [],
        status: 'draft' as const,
        seo: {
          title: selectedProduct.name,
          description: cleanDescription(selectedProduct.description),
          image: selectedProduct.image || undefined,
        },
      };
      const page = await createLandingPage(input);
      onCreated(page);
    } catch (caughtError) {
      console.error('Could not create landing from product:', caughtError);
      setError(caughtError instanceof Error ? caughtError.message : 'Không thể tạo Landing Page.');
    } finally {
      setCreating(false);
    }
  };

  return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-3 backdrop-blur-sm" onMouseDown={() => !creating && onClose()}><section role="dialog" aria-modal="true" aria-label="Tạo Landing từ sản phẩm" onMouseDown={(event) => event.stopPropagation()} className="flex max-h-[95vh] w-full max-w-5xl flex-col border border-gold-dark/30 bg-[#0d0d0d] shadow-2xl"><div className="flex shrink-0 items-center justify-between border-b border-white/10 p-5"><div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-gold-light">Landing Page Sales Builder</p><h2 className="mt-1 flex items-center gap-2 text-lg font-black uppercase text-white"><PackagePlus className="h-5 w-5 text-gold-light" /> Tạo Landing từ sản phẩm</h2></div><button type="button" disabled={creating} onClick={onClose} className="p-2 text-gray-500 hover:text-white disabled:opacity-40"><X className="h-5 w-5" /></button></div>

    <div className="shrink-0 border-b border-white/10 px-5 py-3"><div className="grid grid-cols-4 gap-2">{steps.map((label, index) => {
      const number = index + 1;
      const active = number === step;
      const complete = number < step;
      return <div key={label} className={`border px-2 py-2 text-center text-[9px] font-bold uppercase ${active ? 'border-gold-light bg-gold-dark/10 text-gold-light' : complete ? 'border-emerald-500/20 text-emerald-400' : 'border-white/5 text-gray-600'}`}>{complete ? <Check className="mx-auto mb-1 h-3 w-3" /> : <span className="mb-1 block font-mono">0{number}</span>}<span className="hidden sm:inline">{label}</span></div>;
    })}</div></div>

    <div className="min-h-0 flex-1 overflow-y-auto p-5">
      {step === 1 && <ProductPicker products={availableProducts} loading={loadingProducts} selectedId={selectedProduct?.id} onSelect={chooseProduct} />}
      {step === 2 && <TemplatePicker selectedId={selectedTemplate?.templateId} onSelect={setSelectedTemplate} />}
      {step === 3 && <div className="mx-auto max-w-2xl space-y-5"><div className="flex items-center gap-3 border border-white/10 bg-black p-3"><img src={selectedProduct?.image} alt="" className="h-16 w-16 bg-white object-contain" /><div className="min-w-0"><span className="font-mono text-[9px] text-gold-light">{selectedProduct?.sku || selectedProduct?.id}</span><b className="line-clamp-2 block text-xs uppercase text-white">{selectedProduct?.name}</b><p className="mt-1 text-[10px] text-gray-600">Template: {selectedTemplate.name} · v{selectedTemplate.templateVersion}</p></div></div><label className="block space-y-2 text-[10px] font-bold uppercase text-gray-400">Tên nội bộ *<input autoFocus value={internalName} onChange={(event) => setInternalName(event.target.value)} className="w-full border border-white/10 bg-black px-4 py-3 text-base normal-case text-white outline-none focus:border-gold-light" /></label><label className="block space-y-2 text-[10px] font-bold uppercase text-gray-400">Slug *<div className="flex border border-white/10 bg-black focus-within:border-gold-light"><span className="flex items-center border-r border-white/10 px-3 text-xs normal-case text-gray-600">/landing/</span><input value={slug} onChange={(event) => setSlug(sanitizeLandingSlugInput(event.target.value))} className="min-w-0 flex-1 bg-transparent px-4 py-3 text-base normal-case text-white outline-none" /></div></label><p className="text-[10px] leading-5 text-gray-600">Landing được tạo dưới dạng bản nháp. Product ID, template và các block mặc định sẽ được gắn tự động.</p></div>}
      {step === 4 && selectedProduct && <div className="mx-auto max-w-2xl space-y-4"><div className="border border-emerald-500/20 bg-emerald-500/5 p-5"><h3 className="text-sm font-black uppercase text-emerald-400">Sẵn sàng tạo Landing Page</h3><div className="mt-4 grid gap-3 text-xs sm:grid-cols-2"><div><span className="text-[9px] uppercase text-gray-600">Tên nội bộ</span><b className="mt-1 block text-white">{internalName}</b></div><div><span className="text-[9px] uppercase text-gray-600">URL dự kiến</span><b className="mt-1 block font-mono text-gold-light">/landing/{slug}</b></div><div><span className="text-[9px] uppercase text-gray-600">Sản phẩm chính</span><b className="mt-1 block text-white">{selectedProduct.name}</b><span className="font-mono text-[9px] text-gray-600">{selectedProduct.id}</span></div><div><span className="text-[9px] uppercase text-gray-600">Template</span><b className="mt-1 block text-white">{selectedTemplate.name}</b><span className="font-mono text-[9px] text-gray-600">{selectedTemplate.templateId} · v{selectedTemplate.templateVersion}</span></div></div><div className="mt-4 border-t border-white/10 pt-4"><span className="text-[9px] uppercase text-gray-600">Block tự tạo ({selectedTemplate.blockTypes.length})</span><div className="mt-2 flex flex-wrap gap-1">{selectedTemplate.blockTypes.map((type) => <span key={type} className="border border-white/10 px-2 py-1 text-[9px] uppercase text-gray-400">{type}</span>)}</div></div></div><p className="text-xs leading-5 text-gray-500">Sau khi tạo, hệ thống sẽ mở form thông tin cơ bản của Landing vừa tạo. Builder hoàn chỉnh được triển khai ở Task 4.</p></div>}
      {error && <div className="mx-auto mt-4 max-w-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-300">{error}</div>}
    </div>

    <div className="flex shrink-0 items-center justify-between border-t border-white/10 bg-[#0d0d0d] p-5"><button type="button" disabled={step === 1 || creating} onClick={() => { setError(''); setStep((current) => Math.max(1, current - 1)); }} className="flex items-center gap-2 border border-white/10 px-4 py-3 text-xs font-bold uppercase text-gray-400 disabled:opacity-30"><ArrowLeft className="h-4 w-4" /> Quay lại</button>{step < 4 ? <button type="button" onClick={goNext} className="flex items-center gap-2 bg-gold-light px-5 py-3 text-xs font-black uppercase text-black">Tiếp tục <ArrowRight className="h-4 w-4" /></button> : <button type="button" disabled={creating} onClick={createLanding} className="flex min-w-48 items-center justify-center gap-2 bg-gold-light px-5 py-3 text-xs font-black uppercase text-black disabled:opacity-50">{creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackagePlus className="h-4 w-4" />}{creating ? 'Đang tạo...' : 'Tạo Landing Page'}</button>}</div>
  </section></div>;
}
