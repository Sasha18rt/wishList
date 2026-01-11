"use client";
import WishDetailsModal from "./WishDetailsModal";
import ReservationSection from "./ReservationSection";
import React, { useMemo, useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import type { Wish, WishlistData } from "@/types/wishlist";
import {
  SUPPORTED_CURRENCY_CODES,
  CURRENCY_SYMBOL_FALLBACK,
} from "@/libs/currencies";
type ViewMode = "list" | "grid" | "gallery";
function shouldShowPrice(p?: string) {
  if (!p) return false;

  const normalized = p.trim().replace(/\s+/g, "").replace(",", ".");
  const n = Number(normalized);

  // якщо це число — ховаємо тільки 0
  if (Number.isFinite(n)) return n !== 0;

  // якщо не число (наприклад "free") — показуємо як було
  return true;
}
function truncateWords(text: string, maxWords: number) {
  const words = (text ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "…";
}

type Props = {
  wishlist: WishlistData;
  viewMode: ViewMode;
  visibleCount: number;
  isOwner: boolean;
  isLoggedIn: boolean;
  sessionUserId?: string | null;
  reservationUsers: Record<string, string>;
  onReserve: (wishId: string, e: React.MouseEvent<HTMLButtonElement>) => void;
  onCancel: (wishId: string) => void;
  onEdit: (wish: Wish) => void;
  onShowUserInfo: (
    userId: string,
    e?: React.MouseEvent<HTMLButtonElement>
  ) => void;
};

export default function WishesList({
  wishlist,
  viewMode,
  visibleCount,
  isOwner,
  isLoggedIn,
  sessionUserId,
  reservationUsers,
  onReserve,
  onCancel,
  onEdit,
  onShowUserInfo,
}: Props) {
  const reservationsByWishId = useMemo(() => {
    const map = new Map<string, { user_id: string }>();
    (wishlist.reservations || []).forEach((r) =>
      map.set(r.wish_id, { user_id: r.user_id })
    );
    return map;
  }, [wishlist.reservations]);

  const fmtDate = useCallback(
    (d?: string) =>
      d
        ? new Intl.DateTimeFormat("lt-LT", {
            year: "numeric",
            month: "short",
            day: "2-digit",
          }).format(new Date(d))
        : "",
    []
  );

  const fmtPrice = useCallback((p?: string, c?: string) => {
    if (!p) return "";
    const normalized = p.trim().replace(/\s+/g, "").replace(",", ".");
    const n = Number(normalized);

    const raw = (c ?? "").toUpperCase();
    const code = SUPPORTED_CURRENCY_CODES.has(raw) ? raw : "EUR";

    if (!Number.isFinite(n)) return c ? `${p} (${c})` : p;

    let parts = new Intl.NumberFormat("lt-LT", {
      style: "currency",
      currency: code,
      currencyDisplay: "symbol",
      maximumFractionDigits: 2,
    }).formatToParts(n);

    let currPart = parts.find((x) => x.type === "currency")?.value;

    if (!currPart || currPart.toUpperCase() === code) {
      parts = new Intl.NumberFormat("lt-LT", {
        style: "currency",
        currency: code,
        currencyDisplay: "narrowSymbol",
        maximumFractionDigits: 2,
      }).formatToParts(n);
      currPart = parts.find((x) => x.type === "currency")?.value;
    }

    const symbol =
      currPart && currPart.toUpperCase() !== code
        ? currPart
        : CURRENCY_SYMBOL_FALLBACK[code] || code;

    return parts
      .map((p) => (p.type === "currency" ? symbol : p.value))
      .join("");
  }, []);

  const safeExternalLink = (url?: string) => {
    if (!url) return false;
    try {
      const u = new URL(url);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  const wishlistId = (wishlist as any)._id ?? (wishlist as any).id ?? "";
  const [activeWishId, setActiveWishId] = useState<string | null>(null);

  const activeWish = useMemo(() => {
    if (!activeWishId) return null;
    return (wishlist.wishes || []).find((w) => w._id === activeWishId) ?? null;
  }, [activeWishId, wishlist.wishes]);

  const closeWishModal = useCallback(() => setActiveWishId(null), []);

  const outboundLink = (wishId?: string) =>
    wishId
      ? `/go?wishId=${encodeURIComponent(
          wishId
        )}&wishlistId=${encodeURIComponent(wishlistId)}`
      : "";

  const items = useMemo(() => {
    const arr = (wishlist.wishes || []).slice(0, Math.max(0, visibleCount));

    arr.sort((a, b) => {
      const ra = reservationsByWishId.get(a._id);
      const rb = reservationsByWishId.get(b._id);

      const aReserved = ra ? 1 : 0;
      const bReserved = rb ? 1 : 0;

      // 1) спочатку НЕ зарезервовані (0), потім зарезервовані (1)
      if (aReserved !== bReserved) return aReserved - bReserved;

      // 2) (опційно) якщо обидва зарезервовані — твої вище
      const aMine = ra?.user_id === sessionUserId ? 0 : 1;
      const bMine = rb?.user_id === sessionUserId ? 0 : 1;
      if (aMine !== bMine) return aMine - bMine;

      // 3) (опційно) стабільний порядок: новіші/старіші
      const aAdded = new Date((a as any).added_at ?? 0).getTime();
      const bAdded = new Date((b as any).added_at ?? 0).getTime();
      return bAdded - aAdded; // новіші вище
    });

    return arr;
  }, [wishlist.wishes, visibleCount, reservationsByWishId, sessionUserId]);

  // анти-флеш hover у gallery
  const [galleryReady, setGalleryReady] = useState(false);

  useEffect(() => {
    if (viewMode !== "gallery") {
      setGalleryReady(false);
      return;
    }
    let raf1 = 0,
      raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setGalleryReady(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      setGalleryReady(false);
    };
  }, [viewMode]);

  if (!items.length) {
    return (
      <div className="rounded-xl border bg-base-100 p-6 text-center text-base-content/70">
        There are no wishes yet.
      </div>
    );
  }

  return (
    <>
      <ul
        role="list"
        className={clsx(
          viewMode === "gallery"
            ? "grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
            : viewMode === "grid"
            ? "grid grid-cols-2 sm:grid-cols-2 gap-4"
            : "space-y-4"
        )}
      >
        {items.map((wish) => {
          const r = reservationsByWishId.get(wish._id);
          const isReserved = !!r;
          const isMine = !!r && r.user_id === sessionUserId;

          const CoreInfo = (
            <>
              <h3 className="text-lg font-semibold">{wish.name}</h3>
              {wish.description && (
                <p className="text-sm text-base-content/70">
                  {wish.description}
                </p>
              )}
              {safeExternalLink(wish.product_url) && (
                <a
                  href={outboundLink(wish._id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link text-sm"
                  aria-label="Open product link"
                >
                  View product
                </a>
              )}

              {shouldShowPrice(wish.price) && (
                <p className="text-sm">
                  {fmtPrice(wish.price, (wish as any).currency)}
                </p>
              )}
              <p className="text-xs text-base-content/60">
                Added: {fmtDate((wish as any).added_at)}
              </p>
            </>
          );

          const Actions = (
            <>
              <ReservationSection
                wishId={wish._id}
                isOwner={isOwner}
                isLoggedIn={isLoggedIn}
                isReserved={isReserved}
                isMine={!!isMine}
                reservedUserId={r?.user_id}
                reservedUserLabel={reservationUsers[wish._id]}
                onReserve={onReserve}
                onCancel={onCancel}
                onShowUserInfo={onShowUserInfo}
              />
              {isOwner && (
                <button
                  type="button"
                  className="btn btn-sm btn-primary normal-case w-40"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(wish);
                  }}
                >
                  Edit Wish
                </button>
              )}
            </>
          );

          if (viewMode === "list") {
            return (
              <li
                key={wish._id}
                data-reserved={isReserved ? "true" : "false"}
                data-mine={isMine ? "true" : "false"}
                className={clsx(
                  "flex items-stretch gap-4 rounded-lg bg-base-100 p-4 transition border shadow-md hover:shadow-lg",
                  // базовий бордер
                  "border-base-200",
                  // glow, коли зарезервовано
                  "data-[reserved=true]:border-base-300 ",
                  // інший колір glow, якщо зарезервував саме ти
                  "data-[mine=true]:border-primary data-[mine=true]:shadow-[0_0_18px_2px_hsl(var(--p)/.35)]"
                  // "data-[reserved=true]:animate-pulse"
                )}
              >
                <div className="flex flex-col justify-between flex-1">
                  <div className="space-y-1">{CoreInfo}</div>
                  <div
                    className={clsx(
                      "flex flex-col gap-2",
                      !wish.image_url && "max-w-[calc(100%-7rem)]"
                    )}
                  >
                    {Actions}
                  </div>
                </div>
                {wish.image_url && (
                  <div className="w-24 flex-shrink-0 overflow-hidden rounded-md h-full">
                    <img
                      src={wish.image_url}
                      alt={wish.name}
                      className="cursor-pointer w-full h-full object-cover"
                      loading="lazy"
                      onClick={() => setActiveWishId(wish._id)}
                    />
                  </div>
                )}
              </li>
            );
          }

          if (viewMode === "grid") {
            return (
              <li
                key={wish._id}
                data-reserved={isReserved ? "true" : "false"}
                data-mine={isMine ? "true" : "false"}
                className={clsx(
                  "group bg-base-100 rounded-xl border shadow-sm hover:shadow-md transition overflow-hidden flex flex-col",
                  "border-base-200",
                  // glow, коли зарезервовано
                  "data-[reserved=true]:border-base-300 ",
                  // "data-[reserved=true]:border-secondary data-[reserved=true]:shadow-[0_0_18px_2px_hsl(var(--s)/.35)]",
                  "data-[mine=true]:border-primary data-[mine=true]:shadow-[0_0_18px_2px_hsl(var(--p)/.35)]"
                )}
              >
                {wish.image_url ? (
                  <img
                    src={wish.image_url}
                    alt={wish.name}
                    onClick={() => setActiveWishId(wish._id)}
                    className="cursor-pointer w-full aspect-[4/3] object-cover will-change-transform transition duration-300 group-hover:scale-[1.02]"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="w-full aspect-[4/3] bg-base-200 flex items-center justify-center text-base-content/50">
                    No image
                  </div>
                )}

                <div className="flex flex-col justify-between p-3 sm:p-4 gap-3 flex-1">
                  <div className="space-y-1.5">
                    <h3 className="text-base sm:text-lg font-semibold line-clamp-2">
                      {wish.name}
                    </h3>
                    {wish.description && (
                      <p className="text-xs sm:text-sm text-base-content/70 line-clamp-2">
                        {wish.description}
                      </p>
                    )}
                    {safeExternalLink(wish.product_url) && (
                      <a
                        href={outboundLink(wish._id)}
                        onClick={(e) => e.stopPropagation()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link text-xs sm:text-sm"
                        aria-label="Open product link"
                      >
                        View product
                      </a>
                    )}

                    {shouldShowPrice(wish.price) && (
                      <p className="text-xs sm:text-sm">
                        {fmtPrice(wish.price, (wish as any).currency)}
                      </p>
                    )}
                    <p className="text-[11px] sm:text-xs text-base-content/60">
                      Added: {fmtDate((wish as any).added_at)}
                    </p>
                  </div>

                  <div className="mt-1 flex flex-col gap-2 items-stretch [&_.btn]:w-full">
                    {Actions}
                  </div>
                </div>
              </li>
            );
          }

          // gallery
          const hasLink = safeExternalLink(wish.product_url);

          return (
            <li
              key={wish._id}
              data-ready={galleryReady ? "true" : "false"}
              data-reserved={isReserved ? "true" : "false"}
              data-mine={isMine ? "true" : "false"}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveWishId(wish._id);
                }
              }}
              className={clsx(
                "relative group overflow-visible rounded-xl border bg-base-100 shadow-sm hover:shadow-md transition cursor-pointer",
                "data-[ready=false]:pointer-events-none",
                "border-base-200",
                "data-[reserved=true]:border-base-300"
              )}
            >
              {/* медіа-обгортач */}
              <div className="relative rounded-xl overflow-hidden">
                {wish.image_url ? (
                  <img
                    src={wish.image_url}
                    alt={wish.name}
                    onClick={() => setActiveWishId(wish._id)}
                    className="
            w-full aspect-square object-cover will-change-transform
            transition-transform duration-300
            group-data-[ready=true]:group-hover:scale-[1.03]
            group-data-[preview=true]:scale-[1.03] cursor-pointer
          "
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="w-full aspect-square bg-base-200 flex items-center justify-center text-base-content/50">
                    No image
                  </div>
                )}

                {/* overlay: тільки інфа (без кнопок) */}
                <div
                  className="
    absolute inset-0
    bg-gradient-to-b from-black/85 via-black/35 to-black/85
    invisible opacity-0 translate-y-1
    transition-opacity duration-300
    flex flex-col justify-between p-3 text-white pointer-events-none
    group-data-[ready=true]:group-hover:visible group-data-[ready=true]:group-hover:opacity-100 group-data-[ready=true]:group-hover:translate-y-0
    group-data-[preview=true]:visible group-data-[preview=true]:opacity-100 group-data-[preview=true]:translate-y-0
  "
                >
                  <div className="absolute inset-0 bg-black/30 pointer-events-none" />

                  {/* top */}
                  <h3 className="text-[11px] sm:text-xs font-semibold leading-snug drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                    {truncateWords(wish.name, 8)}
                  </h3>

                  {/* bottom */}
                  {shouldShowPrice(wish.price) && (
                    <p className="text-[10px] sm:text-[11px] text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      {fmtPrice(wish.price, (wish as any).currency)}
                    </p>
                  )}
                </div>
              </div>

              {isReserved && (
                <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <span
                    className={clsx(
                      "inline-flex text-primary items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold leading-none",
                      "whitespace-nowrap w-max shadow-sm ring-1 ring-base-300 bg-base-100"
                    )}
                    aria-label={isMine ? "You reserved" : "Reserved"}
                  >
                    {isMine ? "You reserved" : "Reserved"}
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <WishDetailsModal
        isOpen={!!activeWishId}
        onClose={closeWishModal}
        wish={activeWish}
        isOwner={isOwner}
        isLoggedIn={isLoggedIn}
        isReserved={!!(activeWishId && reservationsByWishId.get(activeWishId))}
        isMine={
          !!activeWishId &&
          !!reservationsByWishId.get(activeWishId) &&
          reservationsByWishId.get(activeWishId)!.user_id === sessionUserId
        }
        reservedUserId={
          activeWishId
            ? reservationsByWishId.get(activeWishId)?.user_id
            : undefined
        }
        reservedUserLabel={
          activeWishId ? reservationUsers[activeWishId] : undefined
        }
        onReserve={onReserve}
        onCancel={onCancel}
        onEdit={onEdit}
        onShowUserInfo={onShowUserInfo}
        fmtPrice={fmtPrice}
        fmtDate={fmtDate}
        outboundLink={outboundLink}
        safeExternalLink={safeExternalLink}
      />
    </>
  );
}
