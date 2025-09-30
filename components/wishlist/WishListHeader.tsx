"use client";

import Image from "next/image";
import Link from "next/link";
import { Settings, Plus  } from "lucide-react";
import config from "@/config";
import logo from "@/app/icon.png";
import toast from "react-hot-toast";
import React from "react";
import ShareWishlistButton from "@/components/wishlist/ShareWishlistButton";

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
    <div className="navbar">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl">
          <Image
            src={logo}
            alt={`${config.appName} logo`}
            className="w-10"
            placeholder="blur"
            priority
          />
          <span className="ml-2 hidden sm:inline">{config.appName}</span>

        </Link>
      </div>

      <div className="flex-none">
        <div className="flex items-center space-x-2">
          {isOwner && (
  <>
    <button onClick={onEditWishlist} className="btn btn-ghost btn-circle" aria-label="Edit wishlist">
      <Settings className="w-6 h-6" />
    </button>
    <button onClick={onAddWish} className="btn btn-ghost btn-circle" aria-label="Add wish">
      <Plus className="w-6 h-6" />
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
