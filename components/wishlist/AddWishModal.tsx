"use client";

import { useRef, useState, Fragment, useEffect, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import toast from "react-hot-toast";
import { wishSchema } from "@/app/validation/schemas";
import { CURRENCIES, SUPPORTED_CURRENCY_CODES } from "@/libs/currencies";

interface AddWishModalProps {
  wishlistId: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onWishAdded: () => void;
}

async function handleUploadImage(
  file: File
): Promise<{ imageUrl: string; image_public_id: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload-image", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Image upload failed");
  const data = await res.json();
  return { imageUrl: data.imageUrl, image_public_id: data.image_public_id };
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
  const [imagePublicId, setImagePublicId] = useState<string | null>(null);
  const [productUrl, setProductUrl] = useState("");
  const [priceRaw, setPriceRaw] = useState(""); // користувацьке введення
  const [currency, setCurrency] = useState<string>("EUR");
  const [loading, setLoading] = useState(false);

  // Підставляємо останню обрану валюту
  useEffect(() => {
    if (!isOpen) return;
    const saved = localStorage.getItem("wishlify:lastCurrency");
    const normalized = (saved ?? "").toUpperCase();

    if (SUPPORTED_CURRENCY_CODES.has(normalized)) {
      setCurrency(normalized);
    } else {
      setCurrency("EUR");
    }
  }, [isOpen]);

  useEffect(() => {
    localStorage.setItem("wishlify:lastCurrency", currency.toUpperCase());
  }, [currency]);

  // Нормалізація ціни
  const priceValue = useMemo(() => {
    const normalized = priceRaw.replace(",", ".").replace(/[^\d.]/g, "");
    const num = Number(normalized);
    return Number.isFinite(num) ? num : NaN;
  }, [priceRaw]);

  const formattedPreview = useMemo(() => {
    if (!Number.isFinite(priceValue)) return "";
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
      }).format(priceValue);
    } catch {
      return `${priceValue} ${currency}`;
    }
  }, [priceValue, currency]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setImageFile(null);
    setImagePublicId(null);
    setProductUrl("");
    setPriceRaw("");
  };

  const handleAddWish = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setLoading(true);
    try {
      // 1) upload image (опціонально)
      let image_url = "";
      let image_public_id = "";
      if (imageFile) {
        const upload = await handleUploadImage(imageFile);
        image_url = upload.imageUrl;
        image_public_id = upload.image_public_id;
        setImagePublicId(image_public_id);
      }

      // 2) Формуємо price (рядок) та currency (окремо)
      const hasPrice = Number.isFinite(priceValue);
      const priceString = hasPrice ? String(priceValue) : ""; // зберігаємо тільки число рядком

      // payload, який очікує бекенд/схема
      const payload: any = {
        name,
        description,
        product_url: productUrl,
        price: priceString, // ← рядок ("" якщо порожньо)
        image_url,
        image_public_id,
      };
      // додаємо currency лише якщо є ціна
      if (hasPrice) payload.currency = currency.toUpperCase();

      // 3) Валідація Zod (додай currency в wishSchema, якщо ще ні)
      const result = wishSchema.safeParse(payload);
      if (!result.success) {
        toast.error(result.error.errors[0].message);
        return;
      }

      // 4) POST
      const res = await fetch(`/api/wishlists/${wishlistId}/wishes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to add wish");
      console.log(payload);
      toast.success("Wish added successfully!");
      setIsOpen(false);
      onWishAdded();
      resetForm();
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    if (!loading) setIsOpen(false);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={close}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-base-content/30 backdrop-blur-[2px]" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-1 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-1 sm:scale-95"
            >
              <Dialog.Panel className="w-full sm:w-[90%] max-w-md rounded-xl bg-base-100 p-6 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="font-semibold text-xl">
                    Add New Wish
                  </Dialog.Title>
                  <button
                    className="btn btn-square btn-ghost btn-sm focus:outline-none"
                    onClick={close}
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                {/* Form */}
                <div className="flex flex-col gap-4">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="Name*"
                  />

                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="textarea textarea-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="Description (optional)"
                    rows={3}
                  />

                  {/* Image upload */}
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
                        <span className="text-sm opacity-70">
                          Drag & drop or click to upload image
                        </span>
                      )}
                    </label>

                    <input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        setImageFile(e.target.files?.[0] || null)
                      }
                    />

                    {imageFile && (
                      <button
                        type="button"
                        className="btn btn-xs btn-outline btn-error w-fit"
                        onClick={() => {
                          setImageFile(null);
                          setImagePublicId(null);
                        }}
                      >
                        Remove image
                      </button>
                    )}
                  </div>

                  {/* Product URL */}
                  <input
                    type="url"
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                    className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="Product URL (optional)"
                  />

                  {/* Price + Currency */}
                  <div className="grid grid-cols-3 gap-3 items-start">
                    <div className="col-span-2">
                      <input
                        inputMode="decimal"
                        value={priceRaw}
                        onChange={(e) => setPriceRaw(e.target.value)}
                        className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary/40"
                        placeholder="Price (e.g. 199.99)"
                      />
                      <div className="mt-1 text-xs text-base-content/60 h-4">
                        {Number.isFinite(priceValue) && formattedPreview
                          ? `≈ ${formattedPreview}`
                          : ""}
                      </div>
                    </div>

                    <select
                      className="select select-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary/40"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                      disabled={!Number.isFinite(priceValue)}
                      title={
                        !Number.isFinite(priceValue)
                          ? "Enter price to select currency"
                          : "Currency"
                      }
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={handleAddWish}
                    className="btn btn-primary w-full"
                    disabled={loading || !name.trim()}
                  >
                    {loading ? "Adding..." : "Add Wish"}
                  </button>

                  <p className="text-[11px] hidden md:block text-base-content/60 text-center">
                    Tip: Press <kbd className="kbd kbd-xs">Ctrl</kbd>+
                    <kbd className="kbd kbd-xs">Enter</kbd> to add quickly.
                  </p>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
