// app/dashboard/page.tsx
"use client";

import React, { useEffect, useMemo, useState, useDeferredValue } from "react";
import useSWR, { mutate } from "swr";
import { useRouter, usePathname } from "next/navigation";
import CreateWishlistModal from "@/components/wishlist/CreateWishlistModal";
import WishlistList from "@/components/wishlist/WishlistList";
import ReservationsList from "@/components/dashboard/ReservationsList";
import RecentlyViewedList from "@/components/dashboard/RecentlyViewedList";

// ——— типи
export type Visibility = "public" | "link" | "private" | string;
export type Wishlist = {
  _id: string;
  title: string;
  slug?: string;
  coverUrl?: string;
  visibility?: Visibility;
  theme?: string;
  updatedAt?: string;
  createdAt?: string;
  created_at?: string;
};
type ApiList = Wishlist[];

type Reservation = {
  _id: string;
  wishId: string;
  wishTitle?: string;
  wishlistId: string;
  wishlistTitle?: string;
  wishImage?: string;
  reservedAt: string;
  note?: string | null;
};
type ReservationList = Reservation[];
// ——— константи
const KEY_WL = "/api/wishlists";
const KEY_RES = "/api/reservations?mine=1";

const fetcher = async (url: string) => {
  const r = await fetch(url, { credentials: "include", cache: "no-store" });
  if (!r.ok) {
    let msg = "Request failed";
    try {
      const j = await r.json();
      msg = j?.error || msg;
    } catch(_e) {void 0;}
    const err: any = new Error(msg);
    (err.status as number | undefined) = r.status;
    throw err;
  }
  return r.json();
};

export default function Dashboard() {
  const router = useRouter();
  const pathname = usePathname();

  // ——— UI: пошук із debounce
  const [rawQ] = useState("");
  const deferredQ = useDeferredValue(rawQ);
  const [q, setQ] = useState("");
  useEffect(() => {
    const id = setTimeout(() => setQ(deferredQ.trim()), 250);
    return () => clearTimeout(id);
  }, [deferredQ]);

  const [visibility, setVisibility] = useState<Visibility | "all">("all");
  const [sort, setSort] = useState<"updatedAt:desc" | "updatedAt:asc">("updatedAt:desc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [limit, setLimit] = useState(12);

  // ——— СИНХРОНІЗАЦІЯ ФІЛЬТРІВ У URL (правильна)
  useEffect(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (visibility !== "all") p.set("visibility", String(visibility));
    if (sort !== "updatedAt:desc") p.set("sort", sort);

    const nextUrl = p.toString() ? `${pathname}?${p.toString()}` : pathname;
    const currentUrl = `${pathname}${window.location.search}`;

    if (nextUrl !== currentUrl) {
      router.replace(nextUrl, { scroll: false });
    }
  }, [q, visibility, sort, pathname, router]);

  // ——— Дані: вішлисти
  const {
    data: wlData,
    error: wlError,
    isLoading: wlLoading,
  } = useSWR<ApiList>(KEY_WL, fetcher, {
    revalidateOnMount: true,
    revalidateIfStale: true,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    keepPreviousData: true,
  });

  // ——— Дані: мої бронювання
  useSWR<ReservationList>(KEY_RES, fetcher, {
    revalidateOnMount: true,
    revalidateIfStale: true,
    revalidateOnFocus: true,
    keepPreviousData: true,
  });

  // ——— Клієнтський фільтр/пошук/сортування
  const filtered = useMemo(() => {
    const base = (wlData ?? []).slice();
    const qLower = q.toLowerCase();

    let arr = qLower
      ? base.filter((w) => (w.title ?? "").toLowerCase().includes(qLower))
      : base;

    if (visibility !== "all") {
      arr = arr.filter((w) => (w.visibility ?? "").toString() === visibility);
    }

    const getTime = (w: Wishlist) => {
      const iso = w.updatedAt ?? w.createdAt ?? w.created_at;
      const t = iso ? Date.parse(iso) : NaN;
      return Number.isNaN(t) ? -Infinity : t;
    };

    arr.sort((a, b) => (sort === "updatedAt:desc" ? getTime(b) - getTime(a) : getTime(a) - getTime(b)));
    return arr;
  }, [wlData, q, visibility, sort]);

  const hasAny = (wlData?.length ?? 0) > 0;
  const nothingFound = !wlLoading && hasAny && filtered.length === 0;

  // ——— дії
  const handleSelect = (id: string) => router.push(`/wishlist/${id}`);

  const handleCreated = (newWishlist: Wishlist) => {
    mutate(
      KEY_WL,
      (prev?: ApiList) => (prev ? [newWishlist, ...prev] : [newWishlist]),
      false
    );
    mutate(KEY_WL);
    setIsModalOpen(false);
  };

  const pageData = useMemo(() => filtered.slice(0, limit), [filtered, limit]);

  return (
    <main className="min-h-screen p-6 md:p-8">
      <section className="max-w-6xl mx-auto space-y-10">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold">Dashboard</h1>
            <p className="text-base-content/70">Manage your wishlists, gifts and reservations.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              className="select select-bordered hidden sm:block focus:outline-none focus:ring-2 focus:ring-primary/40"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as any)}
            >
              <option value="all">All</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>

            <select
              className="select select-bordered hidden sm:block focus:outline-none focus:ring-2 focus:ring-primary/40"
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
            >
              <option value="updatedAt:desc">Recently updated</option>
              <option value="updatedAt:asc">Oldest updated</option>
            </select>

            <button
              className="btn btn-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              onClick={() => setIsModalOpen(true)}
            >
              Create Wishlist
            </button>
          </div>
        </header>

        <section className="space-y-4">
          {wlError && (
            <div className="alert alert-error">
              <span>{(wlError as Error).message}</span>
              <button className="btn btn-sm ml-auto" onClick={() => mutate(KEY_WL)}>
                Retry
              </button>
            </div>
          )}

          {wlLoading ? (
            <SkeletonGrid />
          ) : nothingFound ? (
            <NoMatches />
          ) : !hasAny ? (
            <EmptyState onCreate={() => setIsModalOpen(true)} />
          ) : (
            <>
              <WishlistList
                wishlists={pageData}
                isLoading={false}
                setWishlists={(updater) => {
                  mutate(
                    KEY_WL,
                    (prev?: ApiList) => {
                      if (!prev) return prev;
                      return typeof updater === "function" ? (updater as any)(prev) : updater;
                    },
                    false
                  );
                }}
                onSelectWishlist={handleSelect}
              />
              {pageData.length > 0 && pageData.length < filtered.length && (
                <div className="text-center">
                  <button className="btn btn-outline" onClick={() => setLimit((l) => l + 12)}>
                    Load more
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <ReservationsList />
        <RecentlyViewedList />

        <CreateWishlistModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          onCreated={handleCreated}
        />
      </section>
    </main>
  );
}

// ——— допоміжні
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton h-28 w-full rounded-xl" />
      ))}
    </div>
  );
}

function NoMatches() {
  return (
    <div className="text-center border border-dashed border-base-300 rounded-2xl p-10">
      <h3 className="text-xl font-semibold mb-2">No matches</h3>
      <p className="text-base-content/70">Try changing your search or filters.</p>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="text-center border border-dashed border-base-300 rounded-2xl p-10">
      <h3 className="text-xl font-semibold mb-2">No wishlists yet</h3>
      <p className="text-base-content/70 mb-4">Start by creating your first wishlist.</p>
      <button className="btn btn-primary" onClick={onCreate}>
        Create Wishlist
      </button>
    </div>
  );
}
