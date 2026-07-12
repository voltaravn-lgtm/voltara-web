'use client';

import React from 'react';
import { Check, LayoutTemplate } from 'lucide-react';
import { LANDING_TEMPLATES, LandingTemplateDefinition } from '../../../lib/landing/landingTemplates';

interface TemplatePickerProps {
  selectedId?: string;
  onSelect: (template: LandingTemplateDefinition) => void;
}

export default function TemplatePicker({ selectedId, onSelect }: TemplatePickerProps) {
  return <div className="grid max-h-[55vh] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">{LANDING_TEMPLATES.map((template) => {
    const selected = selectedId === template.templateId;
    return <button type="button" key={template.templateId} onClick={() => onSelect(template)} className={`relative border p-4 text-left transition ${selected ? 'border-gold-light bg-gold-dark/10 ring-1 ring-gold-light' : 'border-white/10 bg-black hover:border-gold-dark/40'}`}>{selected && <span className="absolute right-3 top-3 rounded-full bg-gold-light p-1 text-black"><Check className="h-3 w-3" /></span>}<LayoutTemplate className="h-6 w-6 text-gold-light" /><b className="mt-3 block pr-8 text-sm uppercase text-white">{template.name}</b><p className="mt-2 min-h-10 text-xs leading-5 text-gray-500">{template.description}</p><div className="mt-3 flex flex-wrap gap-1">{template.blockTypes.slice(0, 6).map((type) => <span key={type} className="border border-white/10 px-1.5 py-1 text-[8px] uppercase text-gray-500">{type}</span>)}{template.blockTypes.length > 6 && <span className="px-1.5 py-1 text-[8px] text-gold-light">+{template.blockTypes.length - 6}</span>}</div><p className="mt-3 font-mono text-[9px] text-gray-700">{template.templateId} · v{template.templateVersion}</p></button>;
  })}</div>;
}
