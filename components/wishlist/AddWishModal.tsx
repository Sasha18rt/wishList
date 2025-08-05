"use client";

import { useRef, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import toast from "react-hot-toast";
import { wishSchema } from "@/app/validation/schemas";

interface AddWishModalProps {
  wishlistId: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onWishAdded: () => void;
}

// Upload image via backend API
async function handleUploadImage(file: File): Promise<{ imageUrl: string; image_public_id: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload-image", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Image upload failed");
  }

  const data = await res.json();
  return {
    imageUrl: data.imageUrl,
    image_public_id: data.image_public_id,
  };
}

export default function AddWishModal({
  wishlistId,
  isOpen,
  setIsOpen,
  onWishAdded,
}: AddWishModalProps) {
  const dropRef = useRef<HTMLLabelElement | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageimage_public_id, setImageimage_public_id] = useState<string | null>(null);
  const [productUrl, setProductUrl] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddWish = async () => {
  setLoading(true);

  try {
    // 1) Якщо є файл — завантажуємо, якщо ні — лишаємо пусті рядки
    let imageUrl = "";
    let image_public_id = "";
    if (imageFile) {
      const uploadResult = await handleUploadImage(imageFile);
      imageUrl = uploadResult.imageUrl;
      image_public_id = uploadResult.image_public_id;
    }

    // 2) Формуємо payload з рядками (сама схема очікує string)
    const payload = {
      name,
      description,
      product_url: productUrl,
      price,
      image_url: imageUrl,           // "" якщо без картинки
      image_public_id: image_public_id, // "" якщо без картинки
    };

    // 3) Валідація
    const result = wishSchema.safeParse(payload);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    // 4) POST запит
    const response = await fetch(
      `/api/wishlists/${wishlistId}/wishes`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (!response.ok) throw new Error("Failed to add wish");

    toast.success("Wish added successfully!");
    setIsOpen(false);
    onWishAdded();

    // 5) Скидаємо форму
    setName("");
    setDescription("");
    setImageFile(null);
    setProductUrl("");
    setPrice("");
  } catch (err: any) {
    toast.error(err.message || "Something went wrong");
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

                  {/* Upload only (with drag & drop) */}
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
                          setImageimage_public_id(null);
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

                  <button
                    onClick={handleAddWish}
                    className="btn btn-primary w-full"
                    disabled={loading}
                  >
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
