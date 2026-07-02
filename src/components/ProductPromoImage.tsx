import React from "react";
import { useApp } from "../context/AppContext";

interface ProductPromoImageProps {
  src: string;
  alt: string;
  imgClassName?: string;
  className?: string;
}

function classNames(...items: Array<string | false | undefined>) {
  return items.filter(Boolean).join(" ");
}

function isPromoOverlayActive(enabled: boolean, imageUrl: string, endDate?: string) {
  if (!enabled || !imageUrl) return false;
  if (!endDate) return true;

  const end = new Date(`${endDate}T23:59:59`);
  if (Number.isNaN(end.getTime())) return true;
  return end >= new Date();
}

function getOverlaySizingClasses(imgClassName = "") {
  const sizeClasses = imgClassName
    .split(/\s+/)
    .filter((item) => /^(max-h-|max-w-|h-|w-|object-)/.test(item));

  return classNames(...sizeClasses, "object-contain");
}

export default function ProductPromoImage({ src, alt, imgClassName, className }: ProductPromoImageProps) {
  const { promoOverlaySettings } = useApp();
  const active = isPromoOverlayActive(
    promoOverlaySettings.enabled,
    promoOverlaySettings.imageUrl,
    promoOverlaySettings.endDate,
  );

  return (
    <div className={classNames("relative flex h-full w-full items-center justify-center", className)}>
      <img src={src} alt={alt} referrerPolicy="no-referrer" className={imgClassName} />
      {active && (
        <img
          src={promoOverlaySettings.imageUrl}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className={classNames(
            "pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2",
            getOverlaySizingClasses(imgClassName),
          )}
        />
      )}
    </div>
  );
}
