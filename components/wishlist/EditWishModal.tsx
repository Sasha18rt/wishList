"use client";

import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import toast from "react-hot-toast";

interface EditWishModalProps {
  wishlistId: string;
  wish: Wish;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onWishUpdated: (updatedWish?: Wish) => void; 
}

interface Wish {
  _id: string;
  name: string;
  description?: string;
  image_url?: string;
  product_url?: string;
  price?: string;
  added_at?: string;
}

export default function EditWishModal({
  wishlistId,
  wish,
  isOpen,
  setIsOpen,
  onWishUpdated,
}: EditWishModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [errors, setErrors] = useState<{
    name?: string;
    imageUrl?: string;
    productUrl?: string;
    price?: string;
  }>({});

  useEffect(() => {
    if (wish) {
      setName(wish.name);
      setDescription(wish.description || "");
      setImageUrl(wish.image_url || "");
      setProductUrl(wish.product_url || "");
      setPrice(wish.price?.toString() || "");
    }
  }, [wish]);

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  const validateInputs = (): boolean => {
    let isValid = true;
    const newErrors: {
      name?: string;
      imageUrl?: string;
      productUrl?: string;
      price?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = "Name is required.";
      isValid = false;
    }

    if (imageUrl && !isValidUrl(imageUrl)) {
      newErrors.imageUrl = "Please enter a valid image URL.";
      isValid = false;
    }

    if (productUrl && !isValidUrl(productUrl)) {
      newErrors.productUrl = "Please enter a valid product URL.";
      isValid = false;
    }

    if (price) {
      const priceNumber = parseFloat(price);
      if (isNaN(priceNumber)) {
        newErrors.price = "Price must be a valid number.";
        isValid = false;
      } else if (priceNumber < 0) {
        newErrors.price = "Price cannot be negative.";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleUpdateWish = async () => {
    if (!validateInputs()) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/wishlists/${wishlistId}/wishes/${wish._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          image_url: imageUrl,
          product_url: productUrl,
          price: parseFloat(price || "0"),
        }),
      });
      if (!response.ok) throw new Error("Failed to update wish");
      const updatedWish = await response.json();
      toast.success("Wish updated successfully!");
      setIsOpen(false);
      onWishUpdated(updatedWish);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWish = async () => {
    if (!confirm("Are you sure you want to delete this wish?")) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/wishlists/${wishlistId}/wishes/${wish._id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete wish");
      toast.success("Wish deleted successfully!");
      setIsOpen(false);
      onWishUpdated({ ...wish, deleted: true } as any);
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
                    Edit Wish
                  </Dialog.Title>
                  <button className="btn btn-square btn-ghost btn-sm" onClick={() => setIsOpen(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-6 h-6" viewBox="0 0 20 20">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                </div>
                <div className="flex flex-col gap-4">
                  <div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input input-bordered w-full"
                      placeholder="Name*"
                    />
                    {errors.name && <p className="text-error text-xs mt-1">{errors.name}</p>}
                  </div>

                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="textarea textarea-bordered w-full"
                    placeholder="Description (optional)"
                  />

                  <div>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="input input-bordered w-full"
                      placeholder="Image URL (optional)"
                    />
                    {errors.imageUrl && <p className="text-error text-xs mt-1">{errors.imageUrl}</p>}
                  </div>

                  <div>
                    <input
                      type="url"
                      value={productUrl}
                      onChange={(e) => setProductUrl(e.target.value)}
                      className="input input-bordered w-full"
                      placeholder="Product URL (optional)"
                    />
                    {errors.productUrl && <p className="text-error text-xs mt-1">{errors.productUrl}</p>}
                  </div>

                  <div>
                    <input
                      type="number"
                      step="0.1"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="input input-bordered w-full"
                      placeholder="Price (optional)"
                    />
                    {errors.price && <p className="text-error text-xs mt-1">{errors.price}</p>}
                  </div>

                  <div className="flex gap-4">
                    <button onClick={handleDeleteWish} className="btn btn-error w-1/2">
                      Delete
                    </button>
                    <button onClick={handleUpdateWish} className="btn btn-success w-1/2" disabled={loading}>
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
