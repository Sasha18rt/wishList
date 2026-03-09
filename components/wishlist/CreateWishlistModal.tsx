"use client";

import { wishListSchema } from "@/app/validation/schemas";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import toast from "react-hot-toast";

type Wishlist = {
  _id: string;
  title: string;
  description: string;
  theme: string;
  visibility: string;
};

export default function CreateWishlistModal({
  isModalOpen,
  setIsModalOpen,
  onCreated,
}: {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  onCreated: (newWishlist: Wishlist) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState("default");
  const [visibility, setVisibility] = useState("public");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isModalOpen) return;

    setTitle("");
    setDescription("");
    setTheme("default");
    setVisibility("public");
  }, [isModalOpen]);

  const handleCreateWishlist = async () => {
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

    try {
      const response = await fetch("/api/wishlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch((): null => null);

      if (!response.ok) {
        throw new Error(data?.error || "Failed to create wishlist");
      }

      toast.success("Wishlist created successfully!");
      onCreated(data);
      setIsModalOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";

      if (message.includes("already taken")) {
        toast.error("Name already taken. Try another one!");
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isModalOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => !loading && setIsModalOpen(false)}
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
          <div className="flex min-h-full items-start justify-center p-2 md:items-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-lg transform overflow-visible rounded-xl bg-base-100 p-6 text-left align-middle shadow-xl transition-all md:p-8">
                <div className="mb-4 flex items-center justify-between">
                  <Dialog.Title as="h2" className="font-semibold">
                    Create Wishlist
                  </Dialog.Title>
                  <button
                    className="btn btn-square btn-ghost btn-sm"
                    onClick={() => setIsModalOpen(false)}
                    disabled={loading}
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  <input
                    type="text"
                    placeholder="Wishlist title"
                    className="input input-bordered w-full"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />

                  <textarea
                    placeholder="Description (optional)"
                    className="textarea textarea-bordered w-full"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    maxLength={500}
                  />

                  <select
                    className="select select-bordered w-full"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
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
                    className="select select-bordered w-full"
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>

                  <button
                    className={`btn btn-primary w-full ${
                      loading ? "cursor-not-allowed opacity-50" : ""
                    }`}
                    onClick={handleCreateWishlist}
                    disabled={loading || !title.trim()}
                  >
                    {loading ? "Creating..." : "Create Wishlist"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}