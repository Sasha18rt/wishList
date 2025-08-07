// app/auth/signin/page.tsx
"use client";

import { getProviders, signIn } from "next-auth/react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

export const dynamic = "force-dynamic"; // ← важливо

function SignInInner() {
  const [providers, setProviders] = useState<Record<string, any> | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    getProviders()
      .then(setProviders)
      .catch((err) => console.error("getProviders failed:", err));
  }, []);

  const callbackUrl = useMemo(() => {
    const fromQuery = searchParams?.get("callbackUrl");
    if (fromQuery) return fromQuery;
    if (typeof window !== "undefined" && document.referrer) {
      try {
        const ref = new URL(document.referrer);
        if (ref.origin === window.location.origin) {
          return `${ref.pathname}${ref.search}${ref.hash}`;
        }
      } catch (e) {
        console.warn("Bad referrer URL:", e);
      }
    }
    return "/";
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <div className="avatar mb-4">
            <div className="w-20 rounded-full ring ring-primary">
              <Image src="/icon.png" alt="Wishlify Logo" width={80} height={80} priority />
            </div>
          </div>

          <h1 className="text-4xl font-bold">Wishlify 🎁</h1>
          <p className="text-sm text-gray-600 mb-6">
            Create, share, and reserve gifts anonymously.
          </p>

          {providers?.google && (
            <button
              onClick={() => signIn("google", { callbackUrl })}
              className="btn btn-primary w-full flex items-center justify-center mb-4"
              type="button"
            >
              {/* можна замінити на локальну іконку щоб не додавати domains */}
              <Image
                src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.3/icons/google.svg"
                alt="Google"
                width={20}
                height={20}
                className="mr-2"
              />
              Sign in with Google
            </button>
          )}

          <p className="text-xs text-gray-500">Only Google sign-in is supported.</p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="p-8"><span className="loading loading-spinner" /></div>}>
      <SignInInner />
    </Suspense>
  );
}
