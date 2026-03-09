"use client";

import { useState, Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import toast from "react-hot-toast";
import { wishListSchema } from "@/app/validation/schemas";

interface EditWishlistModalProps {
  wishlistId: string;
  initialTitle: string;
  initialTheme: string;
  initialVisibility: string;
  initialDescription: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onUpdate: (updatedWishlist: Wishlist) => void;
}

export interface Wishlist {
  deleted?: boolean;
  _id: string;
  title: string;
  description: string;
  theme: string;
  visibility: string;
  created_at?: string;
}

export default function EditWishlistModal({
  wishlistId,
  initialTitle,
  initialTheme,
  initialVisibility,
  initialDescription,
  isOpen,
  setIsOpen,
  onUpdate,
}: EditWishlistModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription || "");
  const [theme, setTheme] = useState(initialTheme);
  const [visibility, setVisibility] = useState(initialVisibility);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setTitle(initialTitle);
    setDescription(initialDescription || "");
    setTheme(initialTheme);
    setVisibility(initialVisibility);
  }, [
    isOpen,
    initialTitle,
    initialDescription,
    initialTheme,
    initialVisibility,
  ]);

  const handleUpdate = async () => {
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        theme,
        visibility,
      };

      const result = wishListSchema.safeParse(payload);
      if (!result.success) {
        toast.error(result.error.errors[0].message);
        return;
      }

      setLoading(true);

      const response = await fetch(`/api/wishlists/${wishlistId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update wishlist");
      }

      toast.success("Wishlist updated successfully!");
      setIsOpen(false);
      onUpdate(data);
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

      const data = await response.json().catch((): null => null);

      if (!response.ok) {
        throw new Error(data?.error || "Failed to delete wishlist");
      }

      toast.success("Wishlist deleted successfully!");
      setIsOpen(false);

      onUpdate({
        _id: wishlistId,
        title: "",
        description: "",
        theme: "",
        visibility: "",
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
        onClose={() => !loading && setIsOpen(false)}
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
          <div className="fixed inset-0 bg-neutral-focus/50" />
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
              <Dialog.Panel className="relative w-full sm:w-[90%] max-w-lg transform rounded-xl bg-base-100 p-6 text-left align-middle shadow-xl transition-all">
                <div className="mb-4 flex items-center justify-between">
                  <Dialog.Title as="h2" className="text-xl font-semibold">
                    Edit Wishlist
                  </Dialog.Title>

                  <button
                    className="btn btn-square btn-ghost btn-sm"
                    onClick={() => setIsOpen(false)}
                    disabled={loading}
                    aria-label="Close"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-6 w-6"
                    >
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="Wishlist title"
                  />

                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="textarea textarea-bordered w-full"
                    placeholder="Description (optional)"
                    rows={4}
                    maxLength={500}
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

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleDelete}
                      className="btn btn-error w-1/2"
                      disabled={loading}
                    >
                      {loading ? "Please wait..." : "Delete"}
                    </button>

                    <button
                      onClick={handleUpdate}
                      className="btn btn-success w-1/2"
                      disabled={loading || !title.trim()}
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