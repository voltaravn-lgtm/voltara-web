"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import type { CatalogDefinition, CatalogPage as CatalogPageData } from "@/src/lib/catalog/catalogConfig";
import CatalogToolbar, { type CatalogViewMode } from "./CatalogToolbar";
import styles from "./catalog.module.css";

const HTMLFlipBook = dynamic(() => import("react-pageflip"), {
  ssr: false,
  loading: () => <div className={styles.loading}>Đang mở catalog…</div>,
});

const PAGE_RATIO = 1786 / 2526;

interface PageFlipApi {
  flipNext: (corner?: "top" | "bottom") => void;
  flipPrev: (corner?: "top" | "bottom") => void;
}

interface FlipBookHandle {
  pageFlip: () => PageFlipApi;
}

interface FlipEvent {
  data: number;
}

interface CatalogFlipbookProps {
  catalog: CatalogDefinition;
}

interface CatalogPageProps {
  page: CatalogPageData;
  pageNumber: number;
  shouldLoad: boolean;
}

interface CatalogSize {
  pageWidth: number;
  pageHeight: number;
  bookWidth: number;
  singlePageWidth: number;
  isMobile: boolean;
}

const TRANSPARENT_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

const CatalogPage = forwardRef<HTMLDivElement, CatalogPageProps>(
  function CatalogPage({ page, pageNumber, shouldLoad }, ref) {
    return (
      <div ref={ref} className={styles.page} data-density="soft">
        <div className={styles.pageInner}>
          <Image
            src={shouldLoad ? page.src : TRANSPARENT_PIXEL}
            alt={page.alt}
            fill
            priority={pageNumber <= 2}
            loading={pageNumber <= 2 ? "eager" : "lazy"}
            sizes="(max-width: 767px) calc(100vw - 16px), 590px"
            unoptimized
            draggable={false}
          />
          <span className={styles.pageNumber} aria-hidden="true">{pageNumber}</span>
        </div>
      </div>
    );
  },
);

export default function CatalogFlipbook({ catalog }: CatalogFlipbookProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<CatalogViewMode>("flip");
  const [catalogSize, setCatalogSize] = useState<CatalogSize>({
    pageWidth: 590,
    pageHeight: 835,
    bookWidth: 1180,
    singlePageWidth: 900,
    isMobile: false,
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const bookRef = useRef<FlipBookHandle | null>(null);
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollPageRefs = useRef<Array<HTMLDivElement | null>>([]);

  const totalPages = catalog.pages.length;
  const currentPage = Math.min(currentPageIndex + 1, totalPages);

  const playFlipSound = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  }, []);

  const goToScrollPage = useCallback((index: number) => {
    const nextIndex = Math.min(totalPages - 1, Math.max(0, index));
    setCurrentPageIndex(nextIndex);
    scrollPageRefs.current[nextIndex]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [totalPages]);

  const goPrevious = useCallback(() => {
    if (viewMode === "scroll") {
      goToScrollPage(currentPageIndex - 1);
      return;
    }
    bookRef.current?.pageFlip().flipPrev("bottom");
  }, [currentPageIndex, goToScrollPage, viewMode]);

  const goNext = useCallback(() => {
    if (viewMode === "scroll") {
      goToScrollPage(currentPageIndex + 1);
      return;
    }
    bookRef.current?.pageFlip().flipNext("bottom");
  }, [currentPageIndex, goToScrollPage, viewMode]);

  useEffect(() => {
    const updateCatalogSize = () => {
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      const availableWidth = Math.max(280, window.innerWidth - (isMobile ? 16 : 80));
      const bookWidth = isMobile ? availableWidth : Math.min(1180, availableWidth);
      const pageWidth = Math.floor(bookWidth / (isMobile ? 1 : 2));

      setCatalogSize({
        pageWidth,
        pageHeight: Math.round(pageWidth / PAGE_RATIO),
        bookWidth: pageWidth * (isMobile ? 1 : 2),
        singlePageWidth: Math.min(900, availableWidth),
        isMobile,
      });
    };

    updateCatalogSize();
    window.addEventListener("resize", updateCatalogSize);
    return () => window.removeEventListener("resize", updateCatalogSize);
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === viewerRef.current);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    if (viewMode !== "scroll") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const index = Number((visibleEntry?.target as HTMLElement | undefined)?.dataset.pageIndex);
        if (Number.isInteger(index)) setCurrentPageIndex(index);
      },
      { rootMargin: "-18% 0px -48%", threshold: [0.2, 0.5, 0.8] },
    );

    scrollPageRefs.current.forEach((page) => {
      if (page) observer.observe(page);
    });

    return () => observer.disconnect();
  }, [viewMode]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, [contenteditable='true']")) return;

      if (event.key === "ArrowLeft" || (viewMode === "scroll" && event.key === "ArrowUp")) {
        event.preventDefault();
        goPrevious();
      }
      if (event.key === "ArrowRight" || (viewMode === "scroll" && event.key === "ArrowDown")) {
        event.preventDefault();
        goNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrevious, viewMode]);

  useEffect(() => {
    if (viewMode !== "flip") return;

    const preloadIndexes = [currentPageIndex - 2, currentPageIndex - 1, currentPageIndex + 1, currentPageIndex + 2];
    const preloadedImages = preloadIndexes
      .filter((index) => index >= 0 && index < totalPages)
      .map((index) => {
        const image = new window.Image();
        image.src = catalog.pages[index].src;
        return image;
      });

    return () => {
      preloadedImages.forEach((image) => {
        image.onload = null;
        image.onerror = null;
      });
    };
  }, [catalog.pages, currentPageIndex, totalPages, viewMode]);

  const handleFlip = useCallback((event: FlipEvent) => {
    setCurrentPageIndex(event.data);
    playFlipSound();
  }, [playFlipSound]);

  const changeZoom = useCallback((delta: number) => {
    setZoom((value) => Math.min(1.75, Math.max(0.75, Number((value + delta).toFixed(2)))));
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!viewerRef.current) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await viewerRef.current.requestFullscreen();
      }
    } catch {
      setIsFullscreen(false);
    }
  }, []);

  const toolbar = (
    <CatalogToolbar
      currentPage={currentPage}
      totalPages={totalPages}
      zoom={zoom}
      canGoPrevious={currentPageIndex > 0}
      canGoNext={currentPageIndex < totalPages - 1}
      isFullscreen={isFullscreen}
      viewMode={viewMode}
      onPrevious={goPrevious}
      onNext={goNext}
      onZoomIn={() => changeZoom(0.25)}
      onZoomOut={() => changeZoom(-0.25)}
      onResetZoom={() => setZoom(1)}
      onToggleFullscreen={toggleFullscreen}
      onViewModeChange={(mode) => {
        setZoom(1);
        setViewMode(mode);
      }}
    />
  );

  return (
    <section ref={viewerRef} className={styles.viewer} aria-label={catalog.title}>
      {catalog.pageSound ? (
        <audio ref={audioRef} src={catalog.pageSound} preload="auto" aria-hidden="true" />
      ) : null}

      {viewMode === "flip" ? (
        <>
          <div className={styles.bookViewport} style={{ width: catalogSize.bookWidth, height: catalogSize.pageHeight }}>
            <div className={styles.bookScaler} style={{ width: catalogSize.bookWidth, height: catalogSize.pageHeight, transform: `scale(${zoom})` }}>
              <HTMLFlipBook
                key={`${catalogSize.pageWidth}-${catalogSize.pageHeight}-${catalogSize.isMobile ? "portrait" : "landscape"}`}
                ref={bookRef}
                className={styles.book}
                style={{}}
                width={catalogSize.pageWidth}
                height={catalogSize.pageHeight}
                size="fixed"
                minWidth={catalogSize.pageWidth}
                maxWidth={catalogSize.pageWidth}
                minHeight={catalogSize.pageHeight}
                maxHeight={catalogSize.pageHeight}
                startPage={currentPageIndex}
                drawShadow
                flippingTime={750}
                usePortrait={catalogSize.isMobile}
                startZIndex={10}
                autoSize={false}
                maxShadowOpacity={0.35}
                showCover={false}
                mobileScrollSupport
                clickEventForward
                useMouseEvents
                swipeDistance={24}
                showPageCorners
                disableFlipByClick={false}
                onFlip={handleFlip}
              >
                {catalog.pages.map((page, index) => (
                  <CatalogPage key={page.id} page={page} pageNumber={index + 1} shouldLoad={Math.abs(index - currentPageIndex) <= 3 || index <= 1} />
                ))}
              </HTMLFlipBook>
            </div>
          </div>

          <div
            className={styles.toolbarDock}
            style={{ width: catalogSize.bookWidth }}
            tabIndex={0}
            aria-label="Hiện thanh điều khiển catalog"
          >
            <span className={styles.toolbarPeek}>Điều khiển</span>
            {toolbar}
          </div>
        </>
      ) : (
        <>
          <div
            className={`${styles.toolbarDock} ${styles.scrollToolbarDock}`}
            tabIndex={0}
            aria-label="Hiện thanh điều khiển catalog"
          >
            <span className={styles.toolbarPeek}>Điều khiển</span>
            {toolbar}
          </div>
          <div className={styles.pdfScrollViewport}>
            <div className={styles.pdfDocument} style={{ width: catalogSize.singlePageWidth * zoom }}>
              {catalog.pages.map((page, index) => (
                <div
                  key={page.id}
                  ref={(element) => { scrollPageRefs.current[index] = element; }}
                  className={styles.pdfPage}
                  data-page-index={index}
                  style={{ aspectRatio: `${1786} / ${2526}` }}
                >
                  <Image src={page.src} alt={page.alt} fill priority={index === 0} loading={index === 0 ? "eager" : "lazy"} sizes="(max-width: 767px) calc(100vw - 16px), 900px" unoptimized />
                  <span className={styles.pdfPageNumber}>{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
