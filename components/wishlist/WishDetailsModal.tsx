"use client";

import React, { Fragment, memo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import clsx from "clsx";
import type { Wish } from "@/types/wishlist";
import ReservationSection from "./ReservationSection";

function shouldShowPrice(p?: string) {
  if (!p) return false;
  const normalized = p.trim().replace(/\s+/g, "").replace(",", ".");
  const n = Number(normalized);
  if (Number.isFinite(n)) return n !== 0;
  return true;
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  wish: Wish | null;

  isOwner: boolean;
  isLoggedIn: boolean;
  isReserved: boolean;
  isMine: boolean;

  reservedUserId?: string;
  reservedUserLabel?: string;

  onReserve: (wishId: string, e: React.MouseEvent<HTMLButtonElement>) => void;
  onCancel: (wishId: string) => void;
  onEdit: (wish: Wish) => void;
  onShowUserInfo: (userId: string, e?: React.MouseEvent<HTMLButtonElement>) => void;

  fmtPrice: (p?: string, c?: string) => string;
  fmtDate: (d?: string) => string;
  outboundLink: (wishId?: string) => string;
  safeExternalLink: (url?: string) => boolean;
};

const WishDetailsModal = memo(function WishDetailsModal({
  isOpen,
  onClose,
  wish,
  isOwner,
  isLoggedIn,
  isReserved,
  isMine,
  reservedUserId,
  reservedUserLabel,
  onReserve,
  onCancel,
  onEdit,
  onShowUserInfo,
  fmtPrice,
  fmtDate,
  outboundLink,
  safeExternalLink,
}: Props) {
  if (!wish) return null;

  const hasProduct = safeExternalLink((wish as any).product_url);
  const currency = (wish as any).currency;
  const addedAt = (wish as any).added_at;

  const desc = (wish.description ?? "").trim();
  const compact = !desc || desc.length < 80;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="modal modal-open" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-120"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="modal-backdrop bg-black/60" />
        </Transition.Child>

        <Transition.Child
          as={Fragment}
          enter="ease-out duration-150"
          enterFrom="opacity-0 translate-y-2 scale-[0.98]"
          enterTo="opacity-100 translate-y-0 scale-100"
          leave="ease-in duration-120"
          leaveFrom="opacity-100 translate-y-0 scale-100"
          leaveTo="opacity-0 translate-y-2 scale-[0.98]"
        >
          <Dialog.Panel
            className={clsx(
              "modal-box w-11/12 max-w-3xl p-0 overflow-hidden",
              "max-h-[92dvh] flex flex-col"
            )}
          >
            {/* HEADER (fixed) */}
            <div className="shrink-0 px-5 sm:px-6 py-4 border-b border-base-200 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Dialog.Title className="text-lg sm:text-xl font-semibold leading-tight">
                  {wish.name}
                </Dialog.Title>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {shouldShowPrice(wish.price) && (
                    <span className="badge badge-outline">
                      {fmtPrice(wish.price, currency)}
                    </span>
                  )}

                  {isReserved && (
                    <span
                      className={clsx(
                        "badge",
                        isMine ? "badge-primary" : "badge-success"
                      )}
                    >
                      {isMine ? "You reserved" : "Reserved"}
                    </span>
                  )}

                  {addedAt && (
                    <span className="text-xs text-base-content/60">
                      Added: {fmtDate(addedAt)}
                    </span>
                  )}
                </div>
              </div>

              {/* close (no weird square) */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="p-2 -m-2 rounded-full opacity-70 hover:opacity-100 hover:bg-base-200 focus:outline-none"
              >
                ✕
              </button>
            </div>

            {/* BODY (scroll only here) */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5">
              <div
                className={clsx(
                  "grid grid-cols-1 gap-5",
                  !compact && "sm:grid-cols-2"
                )}
              >
                {/* image */}
                <div className="rounded-2xl overflow-hidden bg-base-200">
                  {wish.image_url ? (
                    <div className="w-full flex items-center justify-center">
                      <img
                        src={wish.image_url}
                        alt={wish.name}
                        className="max-w-full h-auto object-contain"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-64 flex items-center justify-center text-base-content/50">
                      No image
                    </div>
                  )}
                </div>

                {/* description */}
                {!compact ? (
                  <div className="text-sm text-base-content/80 whitespace-pre-wrap">
                    {desc}
                  </div>
                ) : (
                  !!desc && (
                    <div className="text-sm text-base-content/80 whitespace-pre-wrap">
                      {desc}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* FOOTER (fixed, buttons never cut) */}
            <div className="shrink-0 px-5 sm:px-6 py-4 border-t border-base-200 bg-base-100">
              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end sm:items-center">
                {hasProduct && (
                  <a
                    href={outboundLink(wish._id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm w-full sm:w-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View product
                  </a>
                )}

                {isOwner && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm w-full sm:w-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(wish);
                    }}
                  >
                    Edit Wish
                  </button>
                )}

                <div className="w-full sm:w-auto sm:min-w-[220px]">
                  <ReservationSection
                    wishId={wish._id}
                    isOwner={isOwner}
                    isLoggedIn={isLoggedIn}
                    isReserved={isReserved}
                    isMine={isMine}
                    reservedUserId={reservedUserId}
                    reservedUserLabel={reservedUserLabel}
                    onReserve={onReserve}
                    onCancel={onCancel}
                    onShowUserInfo={onShowUserInfo}
                  />
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
});

export default WishDetailsModal;
