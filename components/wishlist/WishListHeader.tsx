"use client";

import Image from "next/image";
import Link from "next/link";
import { signIn, signOut } from "next-auth/react";
import { Settings, Plus } from "lucide-react";
import config from "@/config";
import logo from "@/app/icon.png";

interface Props {
  isOwner: boolean;
  session: any;
  onEditWishlist: () => void;
  onAddWish: () => void;
  onShowUserProfile: () => void;
}

const WishlistHeader = ({
  isOwner,
  session,
  onEditWishlist,
  onAddWish,
  onShowUserProfile,
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
          <span className="ml-2">{config.appName}</span>
        </Link>
      </div>

      <div className="flex-none">
        {isOwner ? (
          <div className="flex items-center space-x-2">
            <button
              onClick={onEditWishlist}
              className="btn btn-ghost btn-circle"
              aria-label="Edit wishlist"
            >
              <Settings className="w-6 h-6" />
            </button>
            <button
              onClick={onAddWish}
              className="btn btn-ghost btn-circle"
              aria-label="Add wish"
            >
              <Plus className="w-6 h-6" />
            </button>
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar"
              >
                <div className="w-10 rounded-full">
                  <img
                    src={session.user.image}
                    alt={session.user.name}
                  />
                </div>
              </div>
               <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box mt-3 w-52 p-2 shadow">
    <li><a href="/dashboard">My wishlists</a></li>
    <li><button onClick={onShowUserProfile}>Profile</button></li>
    <li><button onClick={() => signOut()}>Logout</button></li>
  </ul>
            </div>
          </div>
        ) : (
          <div className="dropdown dropdown-end">
            {session?.user ? (
              <>
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost btn-circle avatar"
                >
                  <div className="w-10 rounded-full">
                    <img src={session.user.image} alt={session.user.name} />
                  </div>
                </div>
                <ul className="menu menu-sm dropdown-content bg-base-100 rounded-box mt-3 w-52 p-2 shadow">
                  <li><a href="/dashboard">My wishlists</a></li>
                  <li><button onClick={onShowUserProfile}>Profile</button></li>
                  <li><button onClick={() => signOut()}>Logout</button></li>
                </ul>
              </>
            ) : (
              <button onClick={() => signIn()} className="btn btn-primary">
                Sign in
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistHeader;
