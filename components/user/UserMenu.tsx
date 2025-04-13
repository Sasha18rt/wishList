"use client";

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import toast from "react-hot-toast";
import Image from "next/image";
import UserProfileModal from "@/components/user/UserProfileModal";
import { LogOut, User, List } from "lucide-react";

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const isAuthenticated = status === "authenticated";

  const handleShowUserInfo = async (userId: string) => {
    try {
      const res = await fetch(`/api/user/${userId}`);
      if (!res.ok) throw new Error("Failed to load user info");
      const user = await res.json();
      setSelectedUser(user);
      setIsUserModalOpen(true);
    } catch (err) {
      toast.error("Cannot load user info");
    }
  };

  if (!isAuthenticated) {
    return (
      <button onClick={() => signIn()} className="btn btn-primary">
        Sign in
      </button>
    );
  }

  return (
    <>
      <div className="dropdown dropdown-end">
        <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
          <div className="w-10 rounded-full overflow-hidden">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="bg-base-300 flex items-center justify-center w-full h-full text-base-content text-sm font-medium">
                {session?.user?.name?.charAt(0)?.toUpperCase() ||
                  session?.user?.email?.charAt(0)?.toUpperCase()}
              </div>
            )}
          </div>
        </label>
        <ul
  tabIndex={0}
  className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
>
  <li>
    <button
      onClick={() => handleShowUserInfo(session.user.id)}
      className="w-full text-left flex items-center gap-2"
    >
      <User className="w-4 h-4" />
      Profile
    </button>
  </li>
  <li>
    <a href="/dashboard" className="flex items-center gap-2">
      <List className="w-4 h-4" />
      My Wishlists
    </a>
  </li>
  <li>
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="hover:bg-error/20 hover:text-error w-full text-left flex items-center gap-2"
    >
      <LogOut className="w-4 h-4" />
      Logout
    </button>
  </li>
</ul>

      </div>

      {selectedUser && (
        <UserProfileModal
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          user={selectedUser}
        />
      )}
    </>
  );
}
