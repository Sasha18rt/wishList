"use client";

import { getProviders, signIn } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function SignInPage() {
  const [providers, setProviders] = useState<Record<string, any> | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    getProviders().then(setProviders);
  }, []);

  // Куди повертати після логіна:
  const callbackUrl = useMemo(() => {
    // 1) якщо прийшли на /signin?callbackUrl=...
    const fromQuery = searchParams?.get("callbackUrl");
    if (fromQuery) return fromQuery;

    // 2) спробувати повернути на той самий домен з реферера
    if (typeof window !== "undefined" && document.referrer) {
      try {
        const ref = new URL(document.referrer);
        if (ref.origin === window.location.origin) {
          return `${ref.pathname}${ref.search}${ref.hash}`;
        }
      } catch {}
    }

    // 3) фолбек
    return "/";
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <div className="avatar mb-4">
            <div className="w-20 rounded-full ring ring-primary">
              <img src="/icon.png" alt="Wishlify Logo" />
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
            >
              <img
                src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.3/icons/google.svg"
                className="h-5 w-5 mr-2"
                alt="Google"
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
