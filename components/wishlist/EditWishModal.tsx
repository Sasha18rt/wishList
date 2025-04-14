"use client";

import { useState, useEffect, Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import toast from "react-hot-toast";
import { wishSchema } from "@/app/validation/schemas";

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
  image_public_id?: string;
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
  const dropRef = useRef<HTMLLabelElement | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePublicId, setImagePublicId] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; imageUrl?: string; productUrl?: string; price?: string }>({});

  useEffect(() => {
    if (wish) {
      setName(wish.name);
      setDescription(wish.description || "");
      setImageUrl(wish.image_url || "");
      setImagePublicId(wish.image_public_id || "");
      setProductUrl(wish.product_url || "");
      setPrice(wish.price?.toString() || "");
    }
  }, [wish]);

  const handleUploadImage = async (file: File): Promise<{ imageUrl: string; image_public_id: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Image upload failed");
    const data = await res.json();
    return { imageUrl: data.imageUrl, image_public_id: data.image_public_id };
  };

  const handleUpdateWish = async () => {
    let updatedImageUrl = imageUrl;
    let updatedImagePublicId = imagePublicId;

    if (imageFile) {
      try {
        const uploadResult = await handleUploadImage(imageFile);
        updatedImageUrl = uploadResult.imageUrl;
        updatedImagePublicId = uploadResult.image_public_id;
      } catch (err) {
        toast.error((err as Error).message);
        return;
      }
    }

    const result = wishSchema.safeParse({
      name,
      description,
      price,
      image_url: updatedImageUrl,
      product_url: productUrl,
      image_public_id: updatedImagePublicId,
    });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/wishlists/${wishlistId}/wishes/${wish._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          image_url: updatedImageUrl,
          image_public_id: updatedImagePublicId,
          product_url: productUrl,
          price,
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
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-neutral-focus bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
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
                  {/* Image upload section */}
                  <div className="flex flex-col gap-3">
                    <label
                      ref={dropRef}
                      htmlFor="imageUpload"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file?.type.startsWith("image/")) {
                          setImageFile(file);
                        } else {
                          toast.error("Only image files allowed");
                        }
                      }}
                      className="w-full border-2 border-dashed border-base-content/20 rounded-xl cursor-pointer p-4 text-center hover:border-primary transition"
                    >
                      {imageFile ? (
                        <img
                          src={URL.createObjectURL(imageFile)}
                          alt="Preview"
                          className="w-full h-40 object-cover rounded-md"
                        />
                      ) : imageUrl ? (
                        <img
                          src={imageUrl}
                          alt="Current Image"
                          className="w-full h-40 object-cover rounded-md"
                        />
                      ) : (
                        <span className="text-sm opacity-60">
                          Drag & drop or click to upload image
                        </span>
                      )}
                    </label>
                    <input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    />
                    {imageFile && (
                      <button
                        type="button"
                        className="btn btn-xs btn-outline btn-error w-fit"
                        onClick={() => {
                          setImageFile(null);
                        }}
                      >
                        Remove image
                      </button>
                    )}
                  </div>
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
                  <div className="flex gap-4">
                    <button onClick={handleDeleteWish} className="btn btn-error w-1/2"disabled={loading}>
                    {loading ? "Saving..." : "Delete"}

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
