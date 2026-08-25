"use client";

import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Minus,
  Plus,
  RotateCcw,
  ScrollText,
} from "lucide-react";

export type CatalogViewMode = "flip" | "scroll";

interface CatalogToolbarProps {
  currentPage: number;
  totalPages: number;
  zoom: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isFullscreen: boolean;
  viewMode: CatalogViewMode;
  onPrevious: () => void;
  onNext: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onToggleFullscreen: () => void;
  onViewModeChange: (mode: CatalogViewMode) => void;
}

interface ToolbarButtonProps {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function ToolbarButton({ label, disabled, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className="catalog-toolbar-button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function CatalogToolbar({
  currentPage,
  totalPages,
  zoom,
  canGoPrevious,
  canGoNext,
  isFullscreen,
  viewMode,
  onPrevious,
  onNext,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleFullscreen,
  onViewModeChange,
}: CatalogToolbarProps) {
  return (
    <div className="catalog-toolbar" role="toolbar" aria-label="Điều khiển catalog">
      <div className="catalog-toolbar-group catalog-view-mode-group">
        <button
          type="button"
          className={`catalog-mode-button ${viewMode === "flip" ? "is-active" : ""}`}
          aria-pressed={viewMode === "flip"}
          onClick={() => onViewModeChange("flip")}
        >
          <BookOpen aria-hidden="true" />
          <span>Sách lật</span>
        </button>
        <button
          type="button"
          className={`catalog-mode-button ${viewMode === "scroll" ? "is-active" : ""}`}
          aria-pressed={viewMode === "scroll"}
          onClick={() => onViewModeChange("scroll")}
        >
          <ScrollText aria-hidden="true" />
          <span>Đọc dọc</span>
        </button>
      </div>

      <span className="catalog-toolbar-divider" aria-hidden="true" />

      <div className="catalog-toolbar-group">
        <ToolbarButton label="Trang trước" disabled={!canGoPrevious} onClick={onPrevious}>
          <ChevronLeft aria-hidden="true" />
        </ToolbarButton>
        <span className="catalog-page-indicator" aria-live="polite">
          <strong>{currentPage}</strong>
          <span>/</span>
          <span>{totalPages}</span>
        </span>
        <ToolbarButton label="Trang sau" disabled={!canGoNext} onClick={onNext}>
          <ChevronRight aria-hidden="true" />
        </ToolbarButton>
      </div>

      <span className="catalog-toolbar-divider" aria-hidden="true" />

      <div className="catalog-toolbar-group">
        <ToolbarButton label="Thu nhỏ" disabled={zoom <= 0.75} onClick={onZoomOut}>
          <Minus aria-hidden="true" />
        </ToolbarButton>
        <button
          type="button"
          className="catalog-zoom-value"
          onClick={onResetZoom}
          title="Đặt lại mức phóng"
          aria-label={`Mức phóng ${Math.round(zoom * 100)}%. Đặt lại mức phóng`}
        >
          {zoom === 1 ? <RotateCcw aria-hidden="true" /> : null}
          {Math.round(zoom * 100)}%
        </button>
        <ToolbarButton label="Phóng to" disabled={zoom >= 1.75} onClick={onZoomIn}>
          <Plus aria-hidden="true" />
        </ToolbarButton>
      </div>

      <span className="catalog-toolbar-divider" aria-hidden="true" />

      <ToolbarButton
        label={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
        onClick={onToggleFullscreen}
      >
        {isFullscreen ? <Minimize aria-hidden="true" /> : <Maximize aria-hidden="true" />}
      </ToolbarButton>
    </div>
  );
}
