"use client";

import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import toast from "react-hot-toast";
import { wishSchema } from "@/app/validation/schemas";

interface AddWishModalProps {
  wishlistId: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onWishAdded: () => void;
}

export default function AddWishModal({ wishlistId, isOpen, setIsOpen, onWishAdded }: AddWishModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddWish = async () => {
    const result = wishSchema.safeParse({ name, description, price, image_url: imageUrl, product_url: productUrl });
    if (!result.success) {
      const errorMessage = result.error.errors[0].message;
      toast.error(errorMessage);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/wishlists/${wishlistId}/wishes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          image_url: imageUrl,
          product_url: productUrl,
          price,
        }),
      });

      if (!response.ok) throw new Error("Failed to add wish");

      toast.success("Wish added successfully!");
      setIsOpen(false);
      onWishAdded();

      setName("");
      setDescription("");
      setImageUrl("");
      setProductUrl("");
      setPrice("");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
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
              <Dialog.Panel className="relative w-full sm:w-[90%] max-w-md transform text-left align-middle shadow-xl transition-all rounded-xl bg-base-100 p-6">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h2" className="font-semibold text-xl">
                    Add New Wish
                  </Dialog.Title>
                  <button className="btn btn-square btn-ghost btn-sm" onClick={() => setIsOpen(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="Name*"
                  />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="textarea textarea-bordered w-full"
                    placeholder="Description (optional)"
                  />
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="Image URL (optional)"
                  />
                  <input
                    type="url"
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="Product URL (optional)"
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="Price (optional)"
                  />

                  <button onClick={handleAddWish} className="btn btn-primary w-full" disabled={loading}>
                    {loading ? "Adding..." : "Add Wish"}
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
