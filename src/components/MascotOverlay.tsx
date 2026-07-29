'use client';

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const FRAME_COUNT = 32;
const FRAME_INTERVAL_MS = 100;
const HELLO_FRAME_COUNT = 25;
const HELLO_FRAME_INTERVAL_MS = 55;
const HIDDEN_STORAGE_KEY = "voltara-mascot-hidden-v1";

export default function MascotOverlay() {
  const pathname = usePathname();
  const [frame, setFrame] = useState(0);
  const [helloFrame, setHelloFrame] = useState(0);
  const [animationMode, setAnimationMode] = useState<"hello" | "idle">("idle");
  const directionRef = useRef<1 | -1>(1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isHiding, setIsHiding] = useState(false);

  useEffect(() => {
    setIsHidden(window.sessionStorage.getItem(HIDDEN_STORAGE_KEY) === "true");
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isHidden || animationMode === "hello") {
      return;
    }

    const timer = window.setInterval(() => {
      setFrame((currentFrame) => {
        if (currentFrame >= FRAME_COUNT - 1) {
          directionRef.current = -1;
        } else if (currentFrame <= 0) {
          directionRef.current = 1;
        }

        return currentFrame + directionRef.current;
      });
    }, FRAME_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [animationMode, isHidden]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!isReady || isHidden || pathname !== "/") {
      setAnimationMode("idle");
      audio?.pause();
      return;
    }

    let currentFrame = 0;
    let timer: number | undefined;
    let fallbackAttached = false;

    function removeAudioFallback() {
      if (!fallbackAttached) return;
      window.removeEventListener("pointerdown", retryAudio);
      window.removeEventListener("keydown", retryAudio);
      fallbackAttached = false;
    }

    function startHelloAnimation() {
      if (timer !== undefined) {
        window.clearInterval(timer);
      }

      currentFrame = 0;
      setHelloFrame(0);
      setAnimationMode("hello");

      timer = window.setInterval(() => {
        currentFrame += 1;

        if (currentFrame >= HELLO_FRAME_COUNT) {
          window.clearInterval(timer);
          timer = undefined;
          setAnimationMode("idle");
          return;
        }

        setHelloFrame(currentFrame);
      }, HELLO_FRAME_INTERVAL_MS);
    }

    function retryAudio() {
      removeAudioFallback();
      if (audio) {
        audio.currentTime = 0;
        void audio.play().catch(() => undefined);
      }
      startHelloAnimation();
    }

    startHelloAnimation();
    if (audio) {
      audio.currentTime = 0;
      void audio.play().catch(() => {
        fallbackAttached = true;
        window.addEventListener("pointerdown", retryAudio, { once: true });
        window.addEventListener("keydown", retryAudio, { once: true });
      });
    }

    return () => {
      if (timer !== undefined) {
        window.clearInterval(timer);
      }
      removeAudioFallback();
      audio?.pause();
    };
  }, [isHidden, isReady, pathname]);

  const hideMascot = () => {
    setIsHiding(true);
    window.sessionStorage.setItem(HIDDEN_STORAGE_KEY, "true");
    window.setTimeout(() => setIsHidden(true), 220);
  };

  const showMascot = () => {
    window.sessionStorage.removeItem(HIDDEN_STORAGE_KEY);
    directionRef.current = 1;
    setFrame(0);
    setIsHiding(false);
    setIsHidden(false);
  };

  if (!isReady) {
    return null;
  }

  const column = frame % 6;
  const row = Math.floor(frame / 6);
  const isHello = animationMode === "hello";
  const spriteColumn = isHello ? helloFrame % 5 : column;
  const spriteRow = isHello ? Math.floor(helloFrame / 5) : row;
  const spriteStep = isHello ? 25 : 20;

  return (
    <>
      <style>{`
        .voltara-mascot {
          position: fixed;
          z-index: 100;
          left: max(12px, env(safe-area-inset-left));
          bottom: max(14px, env(safe-area-inset-bottom));
          width: clamp(118px, 10vw, 158px);
          aspect-ratio: 232 / 278;
          padding: 0;
          border: 0;
          background: transparent;
          cursor: pointer;
          filter: drop-shadow(0 10px 16px rgba(0, 0, 0, 0.5));
          transition: opacity 220ms ease, transform 220ms ease, filter 220ms ease;
          -webkit-tap-highlight-color: transparent;
        }
        .voltara-mascot:hover {
          transform: translateY(-4px) scale(1.025);
          filter: drop-shadow(0 12px 20px rgba(216, 154, 43, 0.28));
        }
        .voltara-mascot:focus-visible {
          outline: 2px solid #d89a2b;
          outline-offset: 4px;
          border-radius: 12px;
        }
        .voltara-mascot--hiding {
          opacity: 0;
          transform: translate(-16px, 12px) scale(0.86);
          pointer-events: none;
        }
        .voltara-mascot__sprite {
          display: block;
          width: 100%;
          height: 100%;
          background-image: url("/mascot-1392x1668-6x6-32frame.webp");
          background-repeat: no-repeat;
          background-size: 600% 600%;
          will-change: background-position;
        }
        .voltara-mascot--hello {
          aspect-ratio: 236 / 275;
        }
        .voltara-mascot-toggle {
          position: fixed;
          z-index: 100;
          left: max(72px, env(safe-area-inset-left));
          bottom: max(14px, env(safe-area-inset-bottom));
          display: grid;
          place-items: center;
          width: 46px;
          height: 46px;
          padding: 0;
          border: 1px solid rgba(245, 196, 90, 0.65);
          border-radius: 999px;
          color: #f5c45a;
          background: rgba(8, 8, 8, 0.92);
          box-shadow: 0 6px 22px rgba(0, 0, 0, 0.55), 0 0 16px rgba(216, 154, 43, 0.16);
          cursor: pointer;
          transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
          -webkit-tap-highlight-color: transparent;
        }
        .voltara-mascot-toggle:hover {
          transform: translateY(-3px) scale(1.05);
          border-color: #f5c45a;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6), 0 0 20px rgba(245, 196, 90, 0.3);
        }
        .voltara-mascot-toggle:focus-visible {
          outline: 2px solid #f5c45a;
          outline-offset: 3px;
        }
        @media (max-width: 767px) {
          .voltara-mascot,
          .voltara-mascot-toggle {
            left: max(6px, env(safe-area-inset-left));
            bottom: calc(72px + env(safe-area-inset-bottom));
          }
          .voltara-mascot {
            width: clamp(92px, 26vw, 116px);
          }
          .voltara-mascot-toggle {
            width: 42px;
            height: 42px;
          }
        }
      `}</style>
      <audio ref={audioRef} src="/Welcome_to_Voltara.mp3" preload="auto" />
      {isHidden ? (
        <button
          type="button"
          className="voltara-mascot-toggle"
          onClick={showMascot}
          aria-label="Hiện mascot Voltara"
          title="Hiện mascot Voltara"
        >
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M13.1 2 5.6 13.1h5.1L9.9 22l8.5-12.3h-5.3V2Z"
              fill="currentColor"
              stroke="currentColor"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : (
        <button
          type="button"
          className={`voltara-mascot ${isHello ? "voltara-mascot--hello" : ""} ${isHiding ? "voltara-mascot--hiding" : ""}`}
          onClick={hideMascot}
          aria-label="Ẩn mascot Voltara"
          title="Nhấp để ẩn mascot"
        >
          <span
            aria-hidden="true"
            className="voltara-mascot__sprite"
            style={{
              backgroundImage: `url("${isHello ? "/hello-1180x1375-5x5-25frame.webp" : "/mascot-1392x1668-6x6-32frame.webp"}")`,
              backgroundSize: `${isHello ? 500 : 600}% ${isHello ? 500 : 600}%`,
              backgroundPosition: `${spriteColumn * spriteStep}% ${spriteRow * spriteStep}%`,
            }}
          />
        </button>
      )}
    </>
  );
}
