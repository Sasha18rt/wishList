"use client";

import React, { useMemo, useCallback, memo } from "react";
import clsx from "clsx";
import type { Wish, WishlistData } from "@/types/wishlist";

type Props = {
  wishlist: WishlistData;
  viewMode: "split" | "card";
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

/** Секція статусу/дій по резервації одного айтема */
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
        className="btn btn-sm btn-error normal-case mt-2"
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
  // Швидкий доступ до резервацій по wishId
  const reservationsByWishId = useMemo(() => {
    const map = new Map<string, { user_id: string }>();
    (wishlist.reservations || []).forEach((r) =>
      map.set(r.wish_id, { user_id: r.user_id })
    );
    return map;
  }, [wishlist.reservations]);

  // Форматери
  const fmtDate = useCallback(
    (d: string) =>
      new Intl.DateTimeFormat("lt-LT", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }).format(new Date(d)),
    []
  );

  const fmtPrice = useCallback((p?: string) => {
    if (!p) return "";
    const n = Number(p);
    if (Number.isFinite(n)) {
      try {
        return new Intl.NumberFormat("lt-LT", {
          style: "currency",
          currency: "EUR",
        }).format(n);
      } catch {
        /* ignore */
      }
    }
    return `€${p}`; // фолбек якщо прийшов текст типу "15-20"
  }, []);

  const safeExternalLink = (url?: string) =>
    !!url && /^https?:\/\//i.test(url);

  const items = wishlist.wishes.slice(0, Math.max(0, visibleCount));

  if (!items.length) {
    return (
      <div className="rounded-xl border bg-base-100 p-6 text-center text-base-content/70">
       There are no wishes yet.
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {items.map((wish) => {
        const r = reservationsByWishId.get(wish._id);
        const isReserved = !!r;
        const isMine = r?.user_id === sessionUserId;

        // Ліва частина контенту (загальна для обох режимів)
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
                href={wish.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className="link text-sm"
                aria-label="Open product link"
              >
                View product ↗
              </a>
            )}
            {wish.price && <p className="text-sm">💰 {fmtPrice(wish.price)}</p>}
            <p className="text-xs text-base-content/60">
              Added: {fmtDate(wish.added_at)}
            </p>
          </>
        );

        // Дії/статус
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

        if (viewMode === "split") {
          return (
            <li
              key={wish._id}
              className="flex items-stretch gap-4 border rounded-lg bg-base-100 shadow-md p-4 hover:shadow-lg transition"
            >
              <div className="flex flex-col justify-between flex-1">
                <div className="space-y-1">{CoreInfo}</div>
                <div className="flex flex-col gap-x-2">{Actions}</div>
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

        // Card view
        return (
          <li
            key={wish._id}
            className={clsx(
              "rounded-xl p-4 bg-base-100 shadow-md space-y-2 transition-all",
              isMine ? "border-2 border-primary" : "border"
            )}
          >
            {CoreInfo}
            {wish.image_url && (
              <img
                src={wish.image_url}
                alt={wish.name}
                className="w-full h-auto rounded"
                loading="lazy"
              />
            )}
            {Actions}
          </li>
        );
      })}
    </ul>
  );
}
