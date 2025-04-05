"use client";

import React from "react";

interface ShowMoreButtonProps {
  currentCount: number;
  total: number;
  onShowMore: () => void;
}

export default function ShowMoreButton({
  currentCount,
  total,
  onShowMore,
}: ShowMoreButtonProps) {
  if (currentCount >= total) return null;
  return (
    <button className="btn btn-outline btn-primary w-full" onClick={onShowMore}>
      Show More
    </button>
  );
}
