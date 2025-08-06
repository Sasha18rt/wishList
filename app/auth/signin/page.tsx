"use client";

import { getProviders, signIn } from "next-auth/react";
import { useEffect, useState } from "react";

export default function SignInPage() {
  const [providers, setProviders] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    getProviders().then(setProviders);
  }, []);

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
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="btn  btn-primary w-full flex items-center justify-center mb-4"
            >
              <img
                src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.3/icons/google.svg"
                className="h-5 w-5 mr-2"
                alt="Google"
              />
              Sign in with Google
            </button>
          )}

          <p className="text-xs text-gray-500">
            Only Google sign-in is supported.
          </p>
        </div>
      </div>
    </div>
  );
}
