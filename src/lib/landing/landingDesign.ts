import React from 'react';
import { LandingDesignTokens, LandingPage } from '../../types/landing';

export const DARK_LANDING_DESIGN: LandingDesignTokens = {
  primaryColor: '#f5b91f', accentColor: '#ffd76a', backgroundColor: '#070707', surfaceColor: '#121212', textColor: '#ffffff', mutedTextColor: '#a1a1aa',
  headingFont: 'display', bodyFont: 'sans', radius: 0, shadow: 'soft', containerWidth: 1180, sectionSpacing: 48, buttonStyle: 'solid',
};

export const LIGHT_LANDING_DESIGN: LandingDesignTokens = {
  ...DARK_LANDING_DESIGN, primaryColor: '#f5b91f', accentColor: '#8a5600', backgroundColor: '#fffdf8', surfaceColor: '#ffffff', textColor: '#15120d', mutedTextColor: '#625c52', radius: 10, shadow: 'soft',
};

const LIGHT_TEMPLATE_IDS = new Set([
  'dealer-recruitment', 'single-product', 'promotion-product', 'product-combo',
  'consultation-lead', 'shopee-redirect', 'technical-product',
]);

export function usesLightLandingDesign(page: LandingPage) {
  return page.layout.theme === 'light' || (!page.design && LIGHT_TEMPLATE_IDS.has(page.templateId));
}

export function getLandingDesign(page: LandingPage): LandingDesignTokens {
  return { ...(usesLightLandingDesign(page) ? LIGHT_LANDING_DESIGN : DARK_LANDING_DESIGN), ...(page.design || {}) };
}

const vietnameseSans = 'Inter, "Segoe UI", Arial, Helvetica, sans-serif';
const fontMap = { sans: vietnameseSans, display: vietnameseSans, serif: 'Georgia, "Times New Roman", serif' };
const shadowMap = { none: 'none', soft: '0 12px 35px rgba(0,0,0,.16)', strong: '0 18px 55px rgba(0,0,0,.35)' };

export function landingDesignStyle(page: LandingPage): React.CSSProperties {
  const token = getLandingDesign(page);
  return {
    '--landing-primary': token.primaryColor, '--landing-accent': token.accentColor, '--landing-bg': token.backgroundColor,
    '--landing-surface': token.surfaceColor, '--landing-text': token.textColor, '--landing-muted': token.mutedTextColor,
    '--landing-heading-font': fontMap[token.headingFont], '--landing-body-font': fontMap[token.bodyFont],
    '--landing-radius': `${token.radius}px`, '--landing-shadow': shadowMap[token.shadow], '--landing-container': `${token.containerWidth}px`,
    '--landing-section-space': `${token.sectionSpacing}px`,
  } as React.CSSProperties;
}
