"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import toast from "react-hot-toast";

interface UserProfile {
  _id?: string;
  name?: string;
  email?: string;
  image?: string;
  createdAt?: string;
  role?: string;
  nickname?: string;
  googleId?: string;
  instagramHandle?: string;
  premiumStatus?: boolean;
  emailVerified?: boolean | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

export default function UserProfileModal({ isOpen, onClose, user }: Props) {
  const { data: session } = useSession();
  const isOwner = session?.user?.email === user.email;

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  // Declare state for editing
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(user.nickname || "");
  const [instagramHandle, setInstagramHandle] = useState(user.instagramHandle || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNickname(user.nickname || "");
    setInstagramHandle(user.instagramHandle || "");
  }, [user]);

  const handleSave = async () => {
    if (!user._id) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/user/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname,
          instagramHandle,
        }),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      toast.success("Profile updated");
      setIsEditing(false);
      onClose();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-neutral-focus bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-sm bg-base-100 rounded-xl p-6 shadow-xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title className="text-xl font-semibold">
                    User Profile
                  </Dialog.Title>
                  <button
                    className="btn btn-square btn-ghost btn-sm"
                    onClick={onClose}
                  >
                    ✕
                  </button>
                </div>

                {/* User Info */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="avatar">
                    <div className="w-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                      <img
                        src={user.image || "/default-avatar.png"}
                        alt={`${user.name || "User"}'s avatar`}
                      />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {user.name}{" "}
                      {user.nickname && (
                        <span className="text-sm text-gray-500">
                          (@{user.nickname})
                        </span>
                      )}
                    </h2>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-2 text-sm">
                  {user.email && (
                    <div>
                      <span className="font-semibold">Email:</span> {user.email}
                    </div>
                  )}
                  {user.instagramHandle && (
                    <div>
                      <span className="font-semibold">Instagram:</span>{" "}
                      <a
                        href={`https://instagram.com/${user.instagramHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link"
                      >
                        @{user.instagramHandle}
                      </a>
                    </div>
                  )}
                  {user.role && (
                    <div>
                      <span className="font-semibold">Role:</span> {user.role}
                    </div>
                  )}
                  {user.googleId && (
                    <div>
                      <span className="font-semibold">Google ID:</span>{" "}
                      {user.googleId}
                    </div>
                  )}
                  {formattedDate && (
                    <div>
                      <span className="font-semibold">Account Created:</span>{" "}
                      {formattedDate}
                    </div>
                  )}
                  <div className="flex gap-2 mt-2">
                    {user.premiumStatus !== undefined &&
                      (user.premiumStatus ? (
                        <div className="badge badge-primary">Premium</div>
                      ) : (
                        <div className="badge badge-warning badge-outline">
                          Free User
                        </div>
                      ))}
                  </div>
                </div>

                {/* Actions */}
                {isOwner && (
                  <div className="mt-4">
                    {isEditing ? (
                      <>
                        <input
                          className="input input-sm input-bordered w-full mb-2"
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          placeholder="Nickname"
                        />
                        <input
                          className="input input-sm input-bordered w-full mb-2"
                          value={instagramHandle}
                          onChange={(e) => setInstagramHandle(e.target.value)}
                          placeholder="@handle"
                        />
                        <button
                          onClick={handleSave}
                          className="btn btn-success w-full"
                          disabled={isSaving}
                        >
                          {isSaving ? "Saving..." : "Save"}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="btn btn-primary w-full"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

