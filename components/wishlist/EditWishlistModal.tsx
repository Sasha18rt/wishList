"use client";

import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import toast from "react-hot-toast";
import { wishListSchema } from "@/app/validation/schemas";

interface EditWishlistModalProps {
  wishlistId: string;
  initialTitle: string;
  initialTheme: string;
  initialVisibility: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onUpdate: (updatedWishlist: Wishlist) => void;
}

export interface Wishlist {
  deleted?: any;
  _id: string;
  title: string;
  theme: string;
  visibility: string;
  created_at: string;
}

export default function EditWishlistModal({
  wishlistId,
  initialTitle,
  initialTheme,
  initialVisibility,
  isOpen,
  setIsOpen,
  onUpdate,
}: EditWishlistModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [theme, setTheme] = useState(initialTheme);
  const [visibility, setVisibility] = useState(initialVisibility);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    try {
      const result = wishListSchema.safeParse({ title });
      if (!result.success) {
        toast.error(result.error.errors[0].message);
        return;
      }
      setLoading(true);
      const response = await fetch(`/api/wishlists/${wishlistId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, theme, visibility }),
      });

      if (!response.ok) throw new Error("Failed to update wishlist");

      const updatedWishlist: Wishlist = await response.json();
      toast.success("Wishlist updated successfully!");
      setIsOpen(false);
      onUpdate(updatedWishlist);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this wishlist?")) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/wishlists/${wishlistId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete wishlist");

      toast.success("Wishlist deleted successfully!");
      setIsOpen(false);
      onUpdate({
        _id: wishlistId,
        title: "",
        theme: "",
        visibility: "",
        created_at: "",
        deleted: true,
      });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => setIsOpen(false)}
      >
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
              <Dialog.Panel className="relative w-full sm:w-[90%] max-w-lg transform text-left align-middle shadow-xl transition-all rounded-xl bg-base-100 p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h2" className="font-semibold text-xl">
                    Edit Wishlist
                  </Dialog.Title>
                  <button
                    className="btn btn-square btn-ghost btn-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-6 h-6"
                    >
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                </div>

                {/* Form */}
                <div className="flex flex-col gap-4">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="Wishlist Title"
                  />

                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="select select-bordered w-full"
                  >
                    <option value="default">Default</option>
                    <option value="halloween">Halloween</option>
                    <option value="pastel">Pastel</option>
                    <option value="retro">Retro</option>
                    <option value="bumblebee">Bumblebee</option>
                    <option value="coffee">Coffee</option>
                    <option value="autumn">Autumn</option>
                  </select>

                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="select select-bordered w-full"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>

                  {/* Buttons */}
                  <div className="flex gap-1">
                    <button
                      onClick={handleDelete}
                      className="btn btn-error w-1/2"
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Delete"}
                    </button>
                    <button
                      onClick={handleUpdate}
                      className="btn btn-success w-1/2"
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Update"}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
