"use client";

import { wishListSchema } from "@/app/validation/schemas";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import toast from "react-hot-toast";

export default function CreateWishlistModal({
  isModalOpen,
  setIsModalOpen,
}: {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  onCreated: (newWishlist: any) => void;
}) {
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("default");
  const [visibility, setVisibility] = useState("private");
  const [loading, setLoading] = useState(false);

  const handleCreateWishlist = async () => {

    const result = wishListSchema.safeParse({ title });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    setLoading(true);

    try {
      const response = await fetch("/api/wishlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, theme, visibility }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create wishlist");
      }

      toast.success("Wishlist created successfully!");
      setTitle("");

      setIsModalOpen(false)

    } catch (error) {
      console.error("Error:", error);
      let errorMessage = "Something went wrong!";

      if (error.message.includes("This wishlist name is already taken")) {
        toast.error("Name already taken. Try another one!");
      } else {
        try {
          const parsedError = JSON.parse(error.message);
          errorMessage = parsedError.error;
        } catch (e) {
          errorMessage = error.message;
        }

        toast.error(` ${errorMessage}`);
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
        onClose={() => setIsModalOpen(false)}
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
          <div className="flex min-h-full items-start md:items-center justify-center p-2">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-lg overflow-visible transform text-left align-middle shadow-xl transition-all rounded-xl bg-base-100 p-6 md:p-8">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h2" className="font-semibold">
                    Create Wishlist
                  </Dialog.Title>
                  <button
                    className="btn btn-square btn-ghost btn-sm"
                    onClick={() => setIsModalOpen(false)}
                  >
                    ✕
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  <input
                    type="text"
                    placeholder="Wishlist Title"
                    className="input input-bordered w-full"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />

                  <select
                    className="select select-bordered w-full"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                  >
                    <option value="default">Default</option>
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>

                  <select
                    className="select select-bordered w-full"
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                  >
                    <option value="private">Private</option>

                    <option value="private">Private</option>
                  </select>

                  <button
                    className={`btn btn-primary w-full ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={handleCreateWishlist}
                    disabled={loading}
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
