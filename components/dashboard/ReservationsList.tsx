"use client";

import useSWR, { mutate } from "swr";
import { useRouter } from "next/navigation";
import Image from "next/image"; // ✅ replace <img> with Next Image

// Типи
export type Reservation = {
  _id?: string;     // може бути відсутнім, якщо toJSON вже замінив на id
  id?: string;      // після toJSON
  wishId: string;
  wishTitle?: string;
  wishlistId: string;
  wishlistTitle?: string;
  wishImage?: string;
  reservedAt: string; // ISO
  note?: string | null;
};

// ✅ rename to avoid clash with component name
type ReservationList = Reservation[];

const KEY_RES = "/api/reservations";

const fetcher = async (url: string) => {
  const r = await fetch(url, { credentials: "include", cache: "no-store" });
  if (!r.ok) {
    let msg = "Request failed";
    try {
      const j = await r.json();
      msg = j?.error || msg;
    } catch (_e){void 0;}
    const err = new Error(msg) as Error & { status?: number };
    err.status = r.status;
    throw err;
  }
  return r.json();
};

// Уніфікуємо ідентифікатор резервації (_id або id)
function getReservationId(r: Reservation): string | undefined {
  return r._id ?? r.id;
}

export default function ReservationsList() {
  const router = useRouter();

  const {
    data: resData,
    error: resError,
    isLoading: resLoading,
    isValidating: resValidating,
  } = useSWR<ReservationList>(KEY_RES, fetcher, {
    revalidateOnFocus: true,
    keepPreviousData: true,
  });

  // Unreserve by reservation document id
  const handleUnreserve = async (reservationId?: string) => {
    if (!reservationId) {
      console.warn("Missing reservation id for unreserve");
      alert("Oops, can't unreserve: missing reservation id.");
      return;
    }

    const ok = confirm("Are you sure you want to cancel this reservation?");
    if (!ok) return;

    // оптимістично прибираємо з кешу по нормалізованому id
    mutate(
      KEY_RES,
      (prev?: ReservationList) =>
        prev ? prev.filter((r) => getReservationId(r) !== reservationId) : prev,
      false
    );

    try {
      const res = await fetch(`/api/reservations/${reservationId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to unreserve");
      mutate(KEY_RES); // фонове оновлення
    } catch {
      mutate(KEY_RES); // відкат у разі помилки
    }
  };

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Your reservations</h2>

      {resError && (
        <div className="alert alert-error">
          <span>{(resError as Error).message}</span>
          <button className="btn btn-sm ml-auto" onClick={() => mutate(KEY_RES)}>
            Retry
          </button>
        </div>
      )}

      {resLoading ? (
        <ReservationsSkeleton />
      ) : (resData?.length ?? 0) === 0 ? (
        <ReservationsEmpty />
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {resData!.map((r) => {
            const id = getReservationId(r); // нормалізований id
            return (
              <li
                key={id ?? r.wishId /* fallback щоб React мав ключ */}
                onClick={() => router.push(`/wishlist/${r.wishlistId}`)}
                className="group flex gap-4 rounded-xl bg-base-100 border border-base-300 
                           shadow-sm hover:shadow-lg hover:border-primary/40 transition-all duration-200 
                           hover:-translate-y-1 cursor-pointer p-4"
              >
                {/* Ліва частина: зображення (ховаємо на телефонах) */}
                {r.wishImage && (
                  <div className="hidden sm:block w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-base-200">
                    <Image
                      src={r.wishImage}
                      alt={r.wishTitle ?? "Gift image"}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Права частина */}
                <div className="flex flex-col justify-between flex-1">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
                      {r.wishTitle ?? "Reserved gift"}
                    </h3>
                    <p className="text-xs text-base-content/70">
                      In wishlist:{" "}
                      <span className="font-medium">
                        {r.wishlistTitle ?? r.wishlistId}
                      </span>
                    </p>
                    <p className="text-xs text-base-content/60">
                      Reserved: {new Date(r.reservedAt).toLocaleDateString()}
                    </p>
                    {r.note && (
                      <p className="text-xs text-base-content/80 italic line-clamp-2">
                        Note: “{r.note}”
                      </p>
                    )}
                  </div>

                  <div
                    className="mt-2 flex justify-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="btn btn-accent btn-xs w-full"
                      onClick={() => handleUnreserve(id)}
                    >
                      Unreserve
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {resValidating && (
        <div className="text-center text-xs text-base-content/60" aria-live="polite">
          Updating…
        </div>
      )}
    </section>
  );
}

// ---- Допоміжні компоненти ----

function ReservationsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="skeleton h-20 w-full rounded-xl" />
      ))}
    </div>
  );
}

function ReservationsEmpty() {
  return (
    <div className="text-center border border-dashed border-base-300 rounded-2xl p-8">
      <h3 className="text-lg font-semibold mb-1">No reservations yet</h3>
      <p className="text-base-content/70">
        When you reserve a gift in someone’s wishlist, it will appear here.
      </p>
    </div>
  );
}
