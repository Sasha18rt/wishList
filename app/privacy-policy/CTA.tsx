"use client";

import Image from "next/image";
import config from "@/config";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

const CTA = () => {
  const router = useRouter();

  const handleClick = () => {
    if (status === "authenticated") {
      router.push(config.auth.callbackUrl);
    } else {
      signIn(undefined, { callbackUrl: config.auth.callbackUrl });
    }
  };

  return (
    <section className="relative hero overflow-hidden min-h-screen">
      <Image
        src="https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3540&q=80"
        alt="Background"
        className="object-cover w-full"
        fill
      />
      <div className="relative hero-overlay bg-neutral bg-opacity-70"></div>
      <div className="relative hero-content text-center text-neutral-content p-8">
        <div className="flex flex-col items-center max-w-xl p-8 md:p-0">
          <h2 className="font-bold text-3xl md:text-5xl tracking-tight mb-8 md:mb-12">
          Create the Wishlist of Your Dreams
                    </h2>
          <p className="text-lg opacity-80 mb-12 md:mb-16">
          Share your lists, get the perfect gifts – all with Wishlify!
          </p>

          <button className="btn btn-primary btn-wide" onClick={handleClick}>
          Get Started
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
