'use client';

import { useEffect, useRef, useState } from "react";
import { Check, PackageCheck } from "lucide-react";
import { ORDER_SUCCESS_EVENT } from "../lib/orderSuccess";

const ANIMATION_DURATION_MS = 7200;
const EXIT_DURATION_MS = 320;
const PACKING_PHASE_MS = 2100;
const SUCCESS_PHASE_MS = 5200;

const SOURCE_COPY = {
  product: "Sản phẩm của bạn đã được ghi nhận",
  cart: "Giỏ hàng của bạn đã được ghi nhận",
  dealer: "Đơn hàng đại lý đã được ghi nhận",
  landing: "Yêu cầu của bạn đã được ghi nhận",
} as const;

type OrderSource = keyof typeof SOURCE_COPY;
type AnimationPhase = "receiving" | "packing" | "success";

export default function OrderThankYouMascot() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playbackToken, setPlaybackToken] = useState(0);
  const [source, setSource] = useState<OrderSource>("product");
  const [phase, setPhase] = useState<AnimationPhase>("receiving");
  const [isVisible, setIsVisible] = useState(false);
  const [isHiding, setIsHiding] = useState(false);

  useEffect(() => {
    const playOrderAnimation = (event: Event) => {
      const nextSource = (event as CustomEvent<{ source?: OrderSource }>).detail?.source;
      if (nextSource && nextSource in SOURCE_COPY) setSource(nextSource);
      setPhase("receiving");
      setIsHiding(false);
      setIsVisible(true);
      setPlaybackToken((current) => current + 1);
    };

    window.addEventListener(ORDER_SUCCESS_EVENT, playOrderAnimation);
    return () => window.removeEventListener(ORDER_SUCCESS_EVENT, playOrderAnimation);
  }, []);

  useEffect(() => {
    if (!playbackToken) return;

    const packingTimer = window.setTimeout(() => setPhase("packing"), PACKING_PHASE_MS);
    const successTimer = window.setTimeout(() => setPhase("success"), SUCCESS_PHASE_MS);
    const exitTimer = window.setTimeout(() => setIsHiding(true), ANIMATION_DURATION_MS);
    const hideTimer = window.setTimeout(
      () => setIsVisible(false),
      ANIMATION_DURATION_MS + EXIT_DURATION_MS,
    );

    return () => {
      window.clearTimeout(packingTimer);
      window.clearTimeout(successTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(hideTimer);
    };
  }, [playbackToken]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!playbackToken || !audio) return;

    audio.currentTime = 0;
    void audio.play().catch(() => undefined);

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [playbackToken]);

  return (
    <>
      <style>{`
        .order-journey {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: grid;
          place-items: center;
          padding: 20px;
          pointer-events: none;
          background: radial-gradient(circle at 50% 45%, rgba(244, 184, 32, 0.1), transparent 34%), rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          animation: orderJourneyBackdrop 320ms ease both;
        }
        .order-journey--hiding {
          animation: orderJourneyBackdropOut ${EXIT_DURATION_MS}ms ease both;
        }
        .order-journey__card {
          position: relative;
          width: min(440px, 100%);
          overflow: hidden;
          border: 1px solid rgba(244, 184, 32, 0.34);
          border-radius: 22px;
          padding: 28px 28px 24px;
          color: #fff;
          text-align: center;
          background: linear-gradient(145deg, #171717 0%, #090909 62%, #12100b 100%);
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.72), 0 0 40px rgba(244, 184, 32, 0.08);
          animation: orderJourneyCardIn 500ms cubic-bezier(.2,.9,.2,1) both;
        }
        .order-journey__card::before {
          content: "";
          position: absolute;
          inset: 0 0 auto;
          height: 3px;
          background: linear-gradient(90deg, transparent, #f4b820 32%, #ffe49a 50%, #f4b820 68%, transparent);
        }
        .order-journey__brand {
          margin: 0;
          color: #f4b820;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .3em;
          text-transform: uppercase;
        }
        .order-journey__scene {
          position: relative;
          height: 112px;
          margin: 18px 0 12px;
          overflow: hidden;
          border-radius: 14px;
          background: linear-gradient(180deg, rgba(244, 184, 32, 0.035), rgba(255, 255, 255, 0.018));
        }
        .order-journey__road {
          position: absolute;
          right: 16px;
          bottom: 23px;
          left: 16px;
          height: 2px;
          background: rgba(255, 255, 255, 0.11);
        }
        .order-journey__road::after {
          content: "";
          position: absolute;
          top: -1px;
          left: 0;
          width: 200%;
          height: 2px;
          background: repeating-linear-gradient(90deg, #f4b820 0 10px, transparent 10px 22px);
          opacity: .45;
          animation: orderRoad 1000ms linear 2s 3 both;
        }
        .order-journey__parcel {
          --parcel-load-distance: 154px;
          position: absolute;
          z-index: 2;
          left: 36px;
          bottom: 27px;
          width: 34px;
          height: 30px;
          border-radius: 4px;
          background: linear-gradient(145deg, #ffd769, #d89408);
          box-shadow: inset 0 -5px 0 rgba(0, 0, 0, .1), 0 8px 18px rgba(244, 184, 32, .2);
          animation: orderParcel 6.1s cubic-bezier(.65,0,.25,1) both;
        }
        .order-journey__parcel::before {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: 14px;
          width: 6px;
          background: rgba(255, 247, 213, .55);
        }
        .order-journey__truck {
          position: absolute;
          z-index: 3;
          right: -112px;
          bottom: 26px;
          width: 106px;
          height: 52px;
          animation: orderTruck 6.1s cubic-bezier(.55,0,.22,1) both;
        }
        .order-journey__truck-box {
          position: absolute;
          left: 0;
          bottom: 7px;
          width: 68px;
          height: 41px;
          border: 1px solid rgba(255,255,255,.28);
          border-radius: 6px 2px 2px 6px;
          background: linear-gradient(145deg, #f4b820, #b97200);
        }
        .order-journey__truck-box::after {
          content: "V";
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          color: #151515;
          font-size: 20px;
          font-weight: 1000;
        }
        .order-journey__cab {
          position: absolute;
          right: 5px;
          bottom: 7px;
          width: 36px;
          height: 36px;
          border-radius: 4px 12px 5px 3px;
          background: #292929;
          box-shadow: inset -3px 0 0 #f4b820;
        }
        .order-journey__cab::before {
          content: "";
          position: absolute;
          top: 5px;
          right: 5px;
          width: 18px;
          height: 11px;
          border-radius: 2px 7px 2px 2px;
          background: linear-gradient(135deg, #d9f3ff, #5e7780);
        }
        .order-journey__cab::after {
          content: "";
          position: absolute;
          top: 23px;
          right: -3px;
          width: 7px;
          height: 4px;
          border-radius: 4px;
          background: #fff2a8;
          box-shadow: 5px 0 14px #ffe477;
        }
        .order-journey__wheel {
          position: absolute;
          bottom: 0;
          width: 17px;
          height: 17px;
          border: 4px solid #050505;
          border-radius: 50%;
          background: #7d7d7d;
          box-shadow: 0 0 0 1px #4a4a4a;
          animation: orderWheel 6.1s cubic-bezier(.55,0,.22,1) both;
        }
        .order-journey__wheel--back { left: 15px; }
        .order-journey__wheel--front { right: 12px; }
        .order-journey__check {
          position: absolute;
          z-index: 5;
          inset: 50% auto auto 50%;
          display: grid;
          width: 68px;
          height: 68px;
          place-items: center;
          border: 1px solid rgba(244, 184, 32, .58);
          border-radius: 50%;
          color: #090909;
          background: linear-gradient(145deg, #ffe598, #f4b820);
          box-shadow: 0 0 0 9px rgba(244, 184, 32, .08), 0 12px 35px rgba(244, 184, 32, .28);
          opacity: 0;
          transform: translate(-50%, -42%) scale(.45);
          animation: orderCheck 6.1s cubic-bezier(.2,.9,.2,1) both;
        }
        .order-journey__check svg { width: 34px; height: 34px; stroke-width: 3; }
        .order-journey__title {
          margin: 0;
          font-size: clamp(18px, 5vw, 23px);
          font-weight: 950;
          letter-spacing: .055em;
          line-height: 1.2;
          text-transform: uppercase;
          transition: opacity 220ms ease, transform 220ms ease;
        }
        .order-journey__copy {
          min-height: 40px;
          margin: 10px auto 0;
          max-width: 330px;
          color: #a8a8a8;
          font-size: 13px;
          line-height: 1.55;
        }
        .order-journey__copy strong { color: #f4b820; font-weight: 800; }
        .order-journey__steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: 18px;
        }
        .order-journey__step {
          position: relative;
          padding-top: 10px;
          color: #656565;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .09em;
          text-transform: uppercase;
          transition: color 260ms ease;
        }
        .order-journey__step::before {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          left: 0;
          height: 2px;
          border-radius: 9px;
          background: #2c2c2c;
        }
        .order-journey__step::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 0;
          height: 2px;
          border-radius: 9px;
          background: #f4b820;
          transition: width 520ms cubic-bezier(.2,.9,.2,1);
        }
        .order-journey__step--active { color: #d9d9d9; }
        .order-journey__step--active::after { width: 100%; }
        .order-journey__seal {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 17px;
          color: #777;
          font-size: 10px;
        }
        .order-journey__seal svg { width: 14px; height: 14px; color: #f4b820; }

        @keyframes orderJourneyBackdrop { from { opacity: 0; } to { opacity: 1; } }
        @keyframes orderJourneyBackdropOut { to { opacity: 0; } }
        @keyframes orderJourneyCardIn { from { opacity: 0; transform: translateY(18px) scale(.96); } to { opacity: 1; transform: none; } }
        @keyframes orderRoad { to { transform: translateX(-44px); } }
        @keyframes orderWheel {
          0%, 8% { transform: rotate(0); }
          30%, 62% { transform: rotate(-720deg); }
          84%, 100% { transform: rotate(720deg); }
        }
        @keyframes orderTruck {
          0%, 8% { transform: translateX(0); }
          30%, 62% { transform: translateX(-172px); }
          84%, 100% { transform: translateX(40px); }
        }
        @keyframes orderParcel {
          0%, 30% { opacity: 1; transform: translate(0, 0) rotate(0); }
          55% { opacity: 1; transform: translate(var(--parcel-load-distance), -8px) rotate(4deg) scale(.78); }
          60%, 100% { opacity: 0; transform: translate(var(--parcel-load-distance), -8px) rotate(4deg) scale(.65); }
        }
        @keyframes orderCheck {
          0%, 84% { opacity: 0; transform: translate(-50%, -42%) scale(.45); }
          92%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }

        @media (max-width: 520px) {
          .order-journey { padding: 14px; }
          .order-journey__card { border-radius: 18px; padding: 24px 18px 20px; }
          .order-journey__scene { height: 104px; margin-top: 14px; }
          .order-journey__parcel { --parcel-load-distance: 70px; }
          .order-journey__copy { font-size: 12px; }
          .order-journey__step { font-size: 8px; letter-spacing: .04em; }
        }
        @media (prefers-reduced-motion: reduce) {
          .order-journey__road::after, .order-journey__wheel { animation: none; }
        }
      `}</style>

      <audio ref={audioRef} src="/cam-on.mp3" preload="auto" />

      {isVisible && (
        <div
          key={playbackToken}
          className={`order-journey ${isHiding ? "order-journey--hiding" : ""}`}
          role="status"
          aria-live="assertive"
          aria-label="Đặt hàng thành công. Voltara đã tiếp nhận đơn hàng của bạn."
        >
          <div className="order-journey__card">
            <p className="order-journey__brand">VOLTARA · Năng lượng sẵn sàng</p>

            <div className="order-journey__scene" aria-hidden="true">
              <div className="order-journey__road" />
              <div className="order-journey__parcel" />
              <div className="order-journey__truck">
                <div className="order-journey__truck-box" />
                <div className="order-journey__cab" />
                <div className="order-journey__wheel order-journey__wheel--back" />
                <div className="order-journey__wheel order-journey__wheel--front" />
              </div>
              <div className="order-journey__check"><Check /></div>
            </div>

            <h2 className="order-journey__title">
              {phase === "receiving" && "Đang tiếp nhận đơn hàng..."}
              {phase === "packing" && "Đang đóng gói sản phẩm..."}
              {phase === "success" && "Đơn hàng đã được tiếp nhận!"}
            </h2>
            <p className="order-journey__copy">
              {phase === "success" ? (
                <>{SOURCE_COPY[source]}. <strong>VOLTARA sẽ sớm liên hệ xác nhận</strong> và chuẩn bị giao hàng.</>
              ) : (
                <>Vui lòng chờ trong giây lát, <strong>VOLTARA đang xử lý yêu cầu của bạn.</strong></>
              )}
            </p>

            <div className="order-journey__steps" aria-hidden="true">
              <span className="order-journey__step order-journey__step--active">Tiếp nhận</span>
              <span className={`order-journey__step ${phase !== "receiving" ? "order-journey__step--active" : ""}`}>Đóng gói</span>
              <span className={`order-journey__step ${phase === "success" ? "order-journey__step--active" : ""}`}>Xác nhận</span>
            </div>

            <div className="order-journey__seal">
              <PackageCheck /> Thông tin đơn hàng đã được lưu an toàn
            </div>
          </div>
        </div>
      )}
    </>
  );
}
