"use client";

import Image from "next/image";
import Link from "next/link";
import { Settings, Plus } from "lucide-react";
import config from "@/config";
import logo from "@/app/icon.png";
import React from "react";
import ShareWishlistButton from "@/components/wishlist/ShareWishlistButton";
import SearchWishlistsInput from "./SearchWishlistsInput";

interface Props {
  isOwner: boolean;
  session: any;
  onEditWishlist: () => void;
  onAddWish: () => void;
  userMenu?: React.ReactNode;
}

const WishlistHeader = ({
  isOwner,
  onEditWishlist,
  onAddWish,
  userMenu,
}: Props) => {
  return (
    <div className="navbar flex-nowrap items-center gap-2 sm:gap-3">
      <div className="flex-none">
        <Link href="/" className="btn btn-ghost px-2 text-xl">
          <Image
            src={logo}
            alt={`${config.appName} logo`}
            className="w-10 shrink-0"
            placeholder="blur"
            priority
          />
          <span className="ml-2 hidden sm:inline whitespace-nowrap">
            {config.appName}
          </span>
        </Link>
      </div>

  <div className="min-w-0 flex-1 px-1 sm:px-2">
  <div className="mr-auto ml-1 w-full max-w-full sm:max-w-[240px] md:mx-auto md:max-w-md">
    <SearchWishlistsInput />
  </div>
</div>

      <div className="flex-none">
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {isOwner && (
            <>
              <button
                onClick={onEditWishlist}
                className="btn btn-ghost btn-circle"
                aria-label="Edit wishlist"
              >
                <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <button
                onClick={onAddWish}
                className="btn btn-ghost btn-circle"
                aria-label="Add wish"
              >
                <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <ShareWishlistButton />
            </>
          )}

          {userMenu}
        </div>
      </div>
    </div>
  );
};

export default WishlistHeader;