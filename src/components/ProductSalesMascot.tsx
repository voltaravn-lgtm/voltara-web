'use client';

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const SALES_FRAME_COUNT = 41;
const SALES_FRAME_INTERVAL_MS = 118;
const SALES_APPEAR_DELAY_MS = 30_000;

export default function ProductSalesMascot() {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [frame, setFrame] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const isProductArea = pathname === "/san-pham" || pathname.startsWith("/san-pham/");

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isProductArea) {
      setIsVisible(false);
      setIsDismissing(false);
      setIsDismissed(false);
      setFrame(0);
      return;
    }

    if (!isReady || isDismissed) {
      setIsVisible(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setFrame(0);
      setIsDismissing(false);
      setIsVisible(true);
    }, SALES_APPEAR_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [isDismissed, isProductArea, isReady]);

  useEffect(() => {
    if (!isVisible) return;

    let currentFrame = 0;
    let hideTimer: number | undefined;

    const timer = window.setInterval(() => {
      currentFrame += 1;

      if (currentFrame >= SALES_FRAME_COUNT) {
        window.clearInterval(timer);
        setIsDismissing(true);
        hideTimer = window.setTimeout(() => {
          setIsVisible(false);
          setIsDismissed(true);
        }, 220);
        return;
      }

      setFrame(currentFrame);
    }, SALES_FRAME_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
      if (hideTimer !== undefined) {
        window.clearTimeout(hideTimer);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!isVisible || !audio) return;
    const audioElement = audio;

    let fallbackAttached = false;

    function removeAudioFallback() {
      if (!fallbackAttached) return;
      window.removeEventListener("pointerdown", retryAudio);
      window.removeEventListener("keydown", retryAudio);
      fallbackAttached = false;
    }

    function retryAudio(event: Event) {
      if (event.target instanceof Element && event.target.closest(".product-sales-mascot")) {
        return;
      }

      removeAudioFallback();
      audioElement.currentTime = 0;
      void audioElement.play().catch(() => undefined);
    }

    audioElement.currentTime = 0;
    void audioElement.play().catch(() => {
      fallbackAttached = true;
      window.addEventListener("pointerdown", retryAudio);
      window.addEventListener("keydown", retryAudio);
    });

    return () => {
      removeAudioFallback();
      audioElement.pause();
      audioElement.currentTime = 0;
    };
  }, [isVisible]);

  const dismissMascot = () => {
    setIsDismissing(true);
    window.setTimeout(() => {
      setIsVisible(false);
      setIsDismissed(true);
    }, 220);
  };

  const column = frame % 7;
  const row = Math.floor(frame / 7);

  return (
    <>
      <style>{`
        .product-sales-mascot {
          position: fixed;
          z-index: 60;
          left: 50%;
          bottom: 0;
          width: clamp(178px, 18vw, 252px);
          aspect-ratio: 280 / 270;
          padding: 0;
          border: 0;
          background: transparent;
          cursor: pointer;
          filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.58));
          transform: translateX(-50%);
          transition: opacity 220ms ease, transform 220ms ease, filter 220ms ease;
          -webkit-tap-highlight-color: transparent;
        }
        .product-sales-mascot:hover {
          filter: drop-shadow(0 12px 22px rgba(216, 154, 43, 0.3));
          transform: translateX(-50%) translateY(-3px) scale(1.02);
        }
        .product-sales-mascot:focus-visible {
          outline: 2px solid #f5c45a;
          outline-offset: 3px;
          border-radius: 14px;
        }
        .product-sales-mascot--hiding {
          opacity: 0;
          pointer-events: none;
          transform: translateX(-50%) translateY(24px) scale(0.86);
        }
        .product-sales-mascot__sprite {
          display: block;
          width: 100%;
          height: 100%;
          background-image: url("/mua-hang-1960x1620-7x6-41frame.webp");
          background-repeat: no-repeat;
          background-size: 700% 600%;
          will-change: background-position;
        }
        @media (max-width: 767px) {
          .product-sales-mascot {
            width: clamp(142px, 45vw, 184px);
          }
        }
      `}</style>
      <audio ref={audioRef} src="/mua-hang.mp3" preload="auto" />
      {isVisible && (
        <button
          type="button"
          className={`product-sales-mascot ${isDismissing ? "product-sales-mascot--hiding" : ""}`}
          onClick={dismissMascot}
          aria-label="Ẩn mascot bán hàng Voltara"
          title="Nhấp để ẩn"
        >
          <span
            aria-hidden="true"
            className="product-sales-mascot__sprite"
            style={{
              backgroundPosition: `${column * (100 / 6)}% ${row * 20}%`,
            }}
          />
        </button>
      )}
    </>
  );
}
