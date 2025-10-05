"use client";

import React, { useMemo, useCallback, memo, useEffect, useState } from "react";
import clsx from "clsx";
import type { Wish, WishlistData } from "@/types/wishlist";

type ViewMode = "list" | "grid" | "gallery";

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

const ReservationSection = memo(function ReservationSection({
  wishId,
  isOwner,
  isLoggedIn,
  isReserved,
  isMine,
  reservedUserId,
  reservedUserLabel,
  onReserve,
  onCancel,
  onShowUserInfo,
}: {
  wishId: string;
  isOwner: boolean;
  isLoggedIn: boolean;
  isReserved: boolean;
  isMine: boolean;
  reservedUserId?: string;
  reservedUserLabel?: string;
  onReserve: (wishId: string, e: React.MouseEvent<HTMLButtonElement>) => void;
  onCancel: (wishId: string) => void;
  onShowUserInfo: (
    userId: string,
    e?: React.MouseEvent<HTMLButtonElement>
  ) => void;
}) {
  if (!isReserved) {
    return isOwner ? (
      <p className="text-gray-500">Not reserved</p>
    ) : (
      <button
        type="button"
        className="btn btn-sm btn-primary"
        onClick={(e) => onReserve(wishId, e)}
      >
        Reserve
      </button>
    );
  }

  if (isMine) {
    return (
      <button
        type="button"
        className="btn btn-sm btn-accent normal-case mt-2"
        onClick={() => onCancel(wishId)}
      >
        Cancel reservation
      </button>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-start text-success font-semibold gap-1">
        Reserved
        <div
          className="tooltip h-4 w-4 text-gray-400 hover:text-info transition"
          data-tip="Log in to see who reserved"
          aria-label="Login to see who reserved"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
            />
          </svg>
        </div>
      </div>
    );
  }

  if (isOwner) {
    return <p className="text-success font-semibold">Reserved</p>;
  }

  return (
    <p className="text-success font-semibold">
      Reserved by{" "}
      <button
        type="button"
        className="underline underline-offset-2 hover:text-info transition"
        onClick={(e) => reservedUserId && onShowUserInfo(reservedUserId, e)}
        aria-label="Show reserver profile"
      >
        {reservedUserLabel ?? (
          <span className="loading loading-spinner loading-xs" />
        )}
      </button>
    </p>
  );
});

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
    const n = Number(p);
    const code = (c && /^[A-Z]{3}$/.test(c) ? c : "EUR") as
      | "EUR"
      | "USD"
      | "GBP"
      | "CAD"
      | "UAH"
      | "PLN"
      | "CZK"
      | "TRY";
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
    const FALLBACK: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      CAD: "CA$",
      UAH: "₴",
      PLN: "zł",
      CZK: "Kč",
      TRY: "₺",
    };
    const symbol =
      currPart && currPart.toUpperCase() !== code
        ? currPart
        : FALLBACK[code] || code;

    return parts
      .map((p) => (p.type === "currency" ? symbol : p.value))
      .join("");
  }, []);

  const safeExternalLink = (url?: string) => !!url && /^https?:\/\//i.test(url);
  const items = (wishlist.wishes || []).slice(0, Math.max(0, visibleCount));

  // анти-флеш hover у gallery
const [galleryReady, setGalleryReady] = useState(false);

useEffect(() => {
  if (viewMode !== "gallery") {
    setGalleryReady(false);
    return;
  }
  let raf1 = 0, raf2 = 0;
  raf1 = requestAnimationFrame(() => {
    raf2 = requestAnimationFrame(() => setGalleryReady(true));
  });
  return () => {
    cancelAnimationFrame(raf1);
    cancelAnimationFrame(raf2);
    setGalleryReady(false);
  };
}, [viewMode]);
  // десь поруч з іншими useState:
  const [previewId, setPreviewId] = useState<string | null>(null);

  // прибираємо превʼю при зміні режиму/переліку
  useEffect(() => setPreviewId(null), [viewMode, items.length]);

  // кліки поза карткою закривають превʼю
  useEffect(() => {
    if (!previewId) return;

    const onDocClick = (ev: MouseEvent) => {
      const active = document.querySelector(
        '[data-preview="true"]'
      ) as HTMLElement | null;
      if (active && ev.target instanceof Node && active.contains(ev.target)) {
        // клік усередині активної картки — нічого не робимо
        return;
      }
      setPreviewId(null);
    };

    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [previewId]);

  // перевірка “чи це торкання” (для десктопів хай відкриває одразу)
  const isTouchEvent = () =>
    typeof window !== "undefined" && matchMedia("(hover: none)").matches;

  if (!items.length) {
    return (
      <div className="rounded-xl border bg-base-100 p-6 text-center text-base-content/70">
        There are no wishes yet.
      </div>
    );
  }

  return (
    <ul
      role="list"
      className={clsx(
        viewMode === "gallery"
          ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
          : viewMode === "grid"
          ? "grid grid-cols-2 sm:grid-cols-2 gap-4"
          : "space-y-4"
      )}
    >
      {items.map((wish) => {
        const r = reservationsByWishId.get(wish._id);
        const isReserved = !!r;
        const isMine = r?.user_id === sessionUserId;

        const CoreInfo = (
          <>
            <h3 className="text-lg font-semibold">{wish.name}</h3>
            {wish.description && (
              <p className="text-sm text-base-content/70">{wish.description}</p>
            )}
            {safeExternalLink(wish.product_url) && (
              <a
                href={wish.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className="link text-sm"
                aria-label="Open product link"
              >
                View product
              </a>
            )}
            {wish.price && (
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
                className="btn btn-sm btn-secondary normal-case w-40"
                onClick={() => onEdit(wish)}
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
              className="flex items-stretch gap-4 border rounded-lg bg-base-100 shadow-md p-4 hover:shadow-lg transition"
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
                    className="w-full h-full object-cover"
                    loading="lazy"
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
              className="group bg-base-100 rounded-xl border shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
            >
              {wish.image_url ? (
                <img
                  src={wish.image_url}
                  alt={wish.name}
                  className="w-full aspect-[4/3] object-cover will-change-transform transition duration-300 group-hover:scale-[1.02]"
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
                      href={wish.product_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link text-xs sm:text-sm"
                      aria-label="Open product link"
                    >
                      View product
                    </a>
                  )}
                  {wish.price && (
                    <p className="text-xs sm:text-sm">
                      {fmtPrice(wish.price, (wish as any).currency)}
                    </p>
                  )}
                  <p className="text-[11px] sm:text-xs text-base-content/60">
                    Added: {fmtDate((wish as any).added_at)}
                  </p>
                </div>

                <div className="mt-1 flex flex-col gap-2 items-start [&_.btn]:w-36 [&_.btn]:min-w-36">
                  {Actions}
                </div>
              </div>
            </li>
          );
        }

        // gallery
        const hasLink = safeExternalLink(wish.product_url);
        const isPreview = previewId === wish._id;

        return (
          <li
            key={wish._id}
            data-ready={galleryReady ? "true" : "false"}
            data-preview={isPreview ? "true" : "false"}
            className="relative group overflow-hidden data-[ready=false]:[&_li]:pointer-events-none rounded-xl border bg-base-100 shadow-sm hover:shadow-md transition"
          >
            {hasLink ? (
              <a
                href={wish.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-full"
                aria-label={`Open ${wish.name}`}
                title={wish.name}
                onClick={(e) => {
                  // мобільний: перший тап показує превʼю, другий — відкриває лінк
                  if (
                    typeof window !== "undefined" &&
                    matchMedia("(hover: none)").matches &&
                    !isPreview
                  ) {
                    e.preventDefault();
                    e.stopPropagation();
                    setPreviewId(wish._id);
                  }
                }}
              >
                {wish.image_url ? (
                  <img
                    src={wish.image_url}
                    alt={wish.name}
                   className="
    w-full aspect-square object-cover
    transition-transform duration-300
    group-data-[ready=true]:group-hover:scale-[1.03]
    group-data-[preview=true]:scale-[1.03]
  "
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="w-full aspect-square bg-base-200 flex items-center justify-center text-base-content/50">
                    No image
                  </div>
                )}
              </a>
            ) : wish.image_url ? (
              <img
                src={wish.image_url}
                alt={wish.name}
                className="
          w-full aspect-square object-cover
          transition-transform duration-300
          group-data-[ready=true]:group-hover:scale-[1.03]
          group-data-[preview=true]:scale-[1.03]
        "
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="w-full aspect-square bg-base-200 flex items-center justify-center text-base-content/50">
                No image
              </div>
            )}

            {/* overlay: показ на hover (desktop) або коли data-preview=true (mobile) */}
          <div
  className="
    absolute inset-0 bg-black/60
    invisible opacity-0
    transition-opacity duration-300
    flex flex-col justify-end p-3 text-white pointer-events-none
    group-data-[ready=true]:group-hover:visible group-data-[ready=true]:group-hover:opacity-100
    group-data-[preview=true]:visible group-data-[preview=true]:opacity-100
  "
>

              <h3 className="text-sm sm:text-base font-semibold line-clamp-2 mb-1">
                {wish.name}
              </h3>
              {wish.price && (
                <p className="text-xs sm:text-sm text-white/90 mb-2">
                  {fmtPrice(wish.price, (wish as any).currency)}
                </p>
              )}

              <div className="flex flex-wrap gap-1 pointer-events-auto">
                {!isOwner && !reservationsByWishId.get(wish._id) && (
                  <button
                    type="button"
                    className="btn btn-xs w-full btn-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReserve(wish._id, e);
                      setPreviewId(null);
                    }}
                  >
                    Reserve
                  </button>
                )}
                {!isOwner && isMine && (
                  <button
                    type="button"
                    className="btn btn-xs w-full btn-accent"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancel(wish._id);
                      setPreviewId(null);
                    }}
                  >
                    Cancel
                  </button>
                )}
                {isOwner && (
                  <button
                    type="button"
                    className="btn btn-xs w-full btn-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(wish);
                    }}
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>

            {reservationsByWishId.get(wish._id) && (
              <span
                className={clsx(
                  "absolute top-2 right-2 z-10 px-2 py-1 rounded-md text-[11px] font-medium shadow-md",
                  isMine
                    ? "bg-primary text-primary-content"
                    : "bg-success text-success-content"
                )}
              >
                {isMine ? "You reserved" : "Reserved"}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
