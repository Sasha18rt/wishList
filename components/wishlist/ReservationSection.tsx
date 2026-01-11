"use client";

import React, { memo } from "react";

type Props = {
  wishId: string;
  isOwner: boolean;
  isLoggedIn: boolean;
  isReserved: boolean;
  isMine: boolean;
  reservedUserId?: string;
  reservedUserLabel?: string;

  onReserve: (wishId: string, e: React.MouseEvent<HTMLButtonElement>) => void;
  onCancel: (wishId: string) => void;
  onShowUserInfo: (userId: string, e?: React.MouseEvent<HTMLButtonElement>) => void;

  // ✅ новий проп для тостера/логіки логіну
  onRequireLogin?: () => void;
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
  onRequireLogin,
}: Props) {
  if (!isReserved) {
    if (isOwner) return <p className="text-base-content/60">Not reserved</p>;

    return (
      <button
        type="button"
        className="btn btn-primary btn-sm w-full"
        onClick={(e) => {
          e.stopPropagation();

          if (!isLoggedIn) {
            onRequireLogin?.(); // ✅ показати тост "please log in"
            return;
          }

          onReserve(wishId, e);
        }}
      >
        Reserve
      </button>
    );
  }

  if (isMine) {
    return (
      <button
        type="button"
        className="btn btn-accent btn-sm normal-case w-full"
        onClick={(e) => {
          e.stopPropagation();
          onCancel(wishId);
        }}
      >
        Cancel reservation
      </button>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center text-success font-semibold gap-2">
        Reserved
        <span
          className="tooltip text-base-content/40"
          data-tip="Log in to see who reserved"
        >
          ⓘ
        </span>
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
        onClick={(e) => {
          e.stopPropagation();
          if (reservedUserId) onShowUserInfo(reservedUserId, e);
        }}
      >
        {reservedUserLabel ?? (
          <span className="loading loading-spinner loading-xs" />
        )}
      </button>
    </p>
  );
});

export default ReservationSection;
