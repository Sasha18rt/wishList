"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

type SearchItem = {
  wishlistId: string;
  title: string;
  href: string;
  owner: {
    name?: string;
    nickname: string;
    instagramHandle?: string;
    image?: string;
  };
};

const normalizeSearchValue = (value: string) =>
  value.trim().toLowerCase().replace(/^@/, "");

export default function SearchWishlistsInput() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [q, setQ] = useState("");
  const [items, setItems] = useState<SearchItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [expanded, setExpanded] = useState(false);

  const isExpanded = expanded || !!q || loading || open;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);

        if (!q.trim()) {
          setExpanded(false);
          setMessage("");
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [q]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const normalized = normalizeSearchValue(q);

    setItems([]);
    setMessage("");
    setOpen(false);
    setExpanded(true);

    if (normalized.length < 3) {
      setMessage("Enter at least 3 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `/api/search/wishlists?q=${encodeURIComponent(normalized)}`,
        { cache: "no-store" },
      );

      const data = await res.json();
      const nextItems = Array.isArray(data?.items) ? data.items : [];

      if (nextItems.length === 1) {
        router.push(nextItems[0].href);
        return;
      }

      if (nextItems.length > 1) {
        setItems(nextItems);
        setOpen(true);
        return;
      }

      setMessage("No public wishlists found");
    } catch (error) {
      console.error(error);
      setMessage("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQ("");
    setItems([]);
    setMessage("");
    setOpen(false);
    setExpanded(false);
  };

  const openSearch = () => {
    if (!isExpanded) {
      setExpanded(true);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      return;
    }

    handleSubmit();
  };

  return (
    <div
      ref={rootRef}
      className="relative flex w-full justify-start md:justify-center"
    >
      {" "}
      <form
        onSubmit={handleSubmit}
        className={[
          "flex h-10 items-center overflow-hidden rounded-full border border-base-300/70 bg-base-100 shadow-sm transition-all duration-300",
          "focus-within:border-primary/40 focus-within:shadow-md",
          isExpanded ? "w-full max-w-full px-3 md:max-w-[280px]" : "w-10 px-0",
          "md:w-full md:px-3",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={openSearch}
          aria-label="Open search"
          className="flex h-10 w-10 shrink-0 items-center justify-center text-base-content/55 transition hover:text-base-content"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </button>

        <input
          ref={inputRef}
          type="text"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setItems([]);
            setMessage("");
            setOpen(false);
          }}
          onFocus={() => setExpanded(true)}
          placeholder="Find wishlist"
          className={[
            "min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-base-content/45 transition-all duration-200",
            isExpanded
              ? "w-full px-1 opacity-100"
              : "w-0 px-0 opacity-0 pointer-events-none",
            "md:w-full md:px-1 md:opacity-100 md:pointer-events-auto",
          ].join(" ")}
        />

        {(q || isExpanded) && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Clear search"
            className={[
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base-content/50 transition hover:bg-base-200 hover:text-base-content",
              isExpanded ? "opacity-100" : "opacity-0 pointer-events-none",
              "md:opacity-100 md:pointer-events-auto",
            ].join(" ")}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>
      {(open || message) && isExpanded && (
        <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-2xl border border-base-300/70 bg-base-100 shadow-xl">
          {items.length > 0 ? (
            <ul className="max-h-80 overflow-y-auto py-2">
              {items.map((item) => {
                const handle =
                  item.owner.instagramHandle || item.owner.nickname;

                return (
                  <li key={item.wishlistId}>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        router.push(item.href);
                      }}
                      className="w-full px-4 py-3 text-left transition hover:bg-base-200/70"
                    >
                      <div className="truncate text-sm font-semibold text-base-content">
                        {item.title}
                      </div>
                      <div className="mt-1 truncate text-xs text-base-content/60">
                        @{handle}
                        {item.owner.name ? ` · ${item.owner.name}` : ""}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-4 py-4 text-sm text-base-content/60">
              {message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
