import React from 'react';
import { LandingDesignTokens, LandingPage } from '../../types/landing';

export const DARK_LANDING_DESIGN: LandingDesignTokens = {
  primaryColor: '#f5b91f', accentColor: '#ffd76a', backgroundColor: '#070707', surfaceColor: '#121212', textColor: '#ffffff', mutedTextColor: '#a1a1aa',
  headingFont: 'display', bodyFont: 'sans', radius: 0, shadow: 'soft', containerWidth: 1180, sectionSpacing: 48, buttonStyle: 'solid',
};

export const LIGHT_LANDING_DESIGN: LandingDesignTokens = {
  ...DARK_LANDING_DESIGN, backgroundColor: '#ffffff', surfaceColor: '#f4f4f5', textColor: '#151515', mutedTextColor: '#626262', shadow: 'soft',
};

export function getLandingDesign(page: LandingPage): LandingDesignTokens {
  return { ...(page.layout.theme === 'light' ? LIGHT_LANDING_DESIGN : DARK_LANDING_DESIGN), ...(page.design || {}) };
}

const fontMap = { sans: 'Arial, Helvetica, sans-serif', display: 'var(--font-display, Arial Black, Arial, sans-serif)', serif: 'Georgia, Times New Roman, serif' };
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
