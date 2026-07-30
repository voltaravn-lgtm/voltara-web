'use client';

import { useEffect, useRef, useState } from "react";
import { ORDER_SUCCESS_EVENT } from "../lib/orderSuccess";

const THANK_YOU_FRAME_COUNT = 32;
const THANK_YOU_FRAME_INTERVAL_MS = 125;

export default function OrderThankYouMascot() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [frame, setFrame] = useState(0);
  const [playbackToken, setPlaybackToken] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isHiding, setIsHiding] = useState(false);

  useEffect(() => {
    const playThankYou = () => {
      setFrame(0);
      setIsHiding(false);
      setIsVisible(true);
      setPlaybackToken((current) => current + 1);
    };

    window.addEventListener(ORDER_SUCCESS_EVENT, playThankYou);
    return () => window.removeEventListener(ORDER_SUCCESS_EVENT, playThankYou);
  }, []);

  useEffect(() => {
    if (!playbackToken) return;

    let currentFrame = 0;
    let hideTimer: number | undefined;
    const timer = window.setInterval(() => {
      currentFrame += 1;

      if (currentFrame >= THANK_YOU_FRAME_COUNT) {
        window.clearInterval(timer);
        setIsHiding(true);
        hideTimer = window.setTimeout(() => setIsVisible(false), 220);
        return;
      }

      setFrame(currentFrame);
    }, THANK_YOU_FRAME_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
      if (hideTimer !== undefined) window.clearTimeout(hideTimer);
    };
  }, [playbackToken]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!playbackToken || !audio) return;
    const audioElement = audio;
    let fallbackAttached = false;

    function removeAudioFallback() {
      if (!fallbackAttached) return;
      window.removeEventListener("pointerdown", retryAudio);
      window.removeEventListener("keydown", retryAudio);
      fallbackAttached = false;
    }

    function retryAudio() {
      removeAudioFallback();
      audioElement.currentTime = 0;
      void audioElement.play().catch(() => undefined);
    }

    audioElement.currentTime = 0;
    void audioElement.play().catch(() => {
      fallbackAttached = true;
      window.addEventListener("pointerdown", retryAudio, { once: true });
      window.addEventListener("keydown", retryAudio, { once: true });
    });

    return () => {
      removeAudioFallback();
      audioElement.pause();
      audioElement.currentTime = 0;
    };
  }, [playbackToken]);

  const column = frame % 6;
  const row = Math.floor(frame / 6);

  return (
    <>
      <style>{`
        .order-thank-you-mascot {
          position: fixed;
          z-index: 100;
          left: 50%;
          bottom: 0;
          width: clamp(112px, 10vw, 152px);
          aspect-ratio: 134 / 246;
          pointer-events: none;
          filter: drop-shadow(0 12px 22px rgba(0, 0, 0, 0.62));
          transform: translateX(-50%);
          transition: opacity 220ms ease, transform 220ms ease;
        }
        .order-thank-you-mascot--hiding {
          opacity: 0;
          transform: translateX(-50%) translateY(20px) scale(0.9);
        }
        .order-thank-you-mascot__sprite {
          display: block;
          width: 100%;
          height: 100%;
          background-image: url("/cam-on-804x1476-6x6-32frame.webp");
          background-repeat: no-repeat;
          background-size: 600% 600%;
          will-change: background-position;
        }
        @media (max-width: 767px) {
          .order-thank-you-mascot {
            bottom: calc(64px + env(safe-area-inset-bottom));
            width: clamp(92px, 27vw, 122px);
          }
        }
      `}</style>
      <audio ref={audioRef} src="/cam-on.mp3" preload="auto" />
      {isVisible && (
        <div
          className={`order-thank-you-mascot ${isHiding ? "order-thank-you-mascot--hiding" : ""}`}
          role="status"
          aria-live="polite"
          aria-label="Cảm ơn bạn đã đặt hàng tại Voltara"
        >
          <span
            aria-hidden="true"
            className="order-thank-you-mascot__sprite"
            style={{ backgroundPosition: `${column * 20}% ${row * 20}%` }}
          />
        </div>
      )}
    </>
  );
}
