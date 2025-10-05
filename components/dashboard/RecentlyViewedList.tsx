"use client";

import useSWR, { mutate } from "swr";
import { useRouter } from "next/navigation";
import React from "react";

type RecentWishlist = {
  wishlistId: string;
  title: string;
  theme?: string;
  viewedAt: string;
  owner?: {
    id: string;
    name?: string | null;
    nickname?: string | null;
    image?: string | null;
  } | null;
};

type RecentList = RecentWishlist[];

const KEY_RECENT = "/api/user/recent-wishlists";

const fetcher = async (url: string) => {
  const r = await fetch(url, { credentials: "include", cache: "no-store" });
  if (!r.ok) {
    let msg = "Request failed";
    try {
      const j = await r.json();
      msg = j?.error || msg;
    } catch (_e){void 0;}
    const err: any = new Error(msg);
    (err.status as number | undefined) = r.status;
    throw err;
  }
  return r.json();
};

export default function RecentlyViewedList() {
  const router = useRouter();

  const {
    data: recentData,
    error: recentError,
    isLoading: recentLoading,
    isValidating: recentValidating,
  } = useSWR<RecentList>(KEY_RECENT, fetcher, {
    revalidateOnFocus: true,
    keepPreviousData: true,
  });

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Recently viewed</h2>

      {recentError && (
        <div className="alert alert-error">
          <span>{(recentError as Error).message}</span>
          <button
            className="btn btn-sm ml-auto"
            onClick={() => mutate(KEY_RECENT)}
          >
            Retry
          </button>
        </div>
      )}

      {recentLoading ? (
        <RecentSkeleton />
      ) : !recentData || recentData.length === 0 ? (
        <RecentEmpty />
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentData.map((r) => (
            <li
              key={r.wishlistId}
              onClick={() => router.push(`/wishlist/${r.wishlistId}`)}
              className="cursor-pointer border rounded-lg shadow-sm hover:shadow-lg 
                         hover:border-primary/40 p-4 flex flex-col gap-3 transition"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{r.title}</h3>
              
              </div>
              {r.theme && (
                <p className="text-sm text-base-content/70">Theme: {r.theme}</p>
              )}
              <div className="text-xs text-base-content/60 flex items-center justify-between">
                Viewed: {new Date(r.viewedAt).toLocaleString()}
                  {r.owner && (
                  <div className="flex items-center gap-2">
                    {r.owner.image ? (
                      <img
                        src={r.owner.image}
                        alt={r.owner.nickname ?? r.owner.name ?? "Owner"}
                        className="w-8 h-8 rounded-full object-cover hidden md:block"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center text-xs">
                        {r.owner.nickname?.[0] ??
                          r.owner.name?.[0] ??
                          "?"}
                      </div>
                    )}
                    <span className=" text-sm text-base-content/70">
                      {r.owner.nickname ?? r.owner.name ?? "Unknown"}
                    </span>
                  </div>
                )}
              </div>
              
            </li>
          ))}
        </ul>
      )}

      {recentValidating && (
        <div
          className="text-center text-xs text-base-content/60"
          aria-live="polite"
        >
                  <span className="loading loading-spinner loading-xl"></span>

        </div>
      )}
    </section>
  );
}

// ---- допоміжні

function RecentSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="skeleton h-20 w-full rounded-xl" />
      ))}
    </div>
  );
}

function RecentEmpty() {
  return (
    <div className="text-center border border-dashed border-base-300 rounded-2xl p-8">
      <h3 className="text-lg font-semibold mb-1">No recent wishlists</h3>
      <p className="text-base-content/70">
        Wishlists you visit will appear here.
      </p>
    </div>
  );
}
