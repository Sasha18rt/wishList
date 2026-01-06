"use client";

import React, { useState, useEffect, Fragment, useRef, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import toast from "react-hot-toast";
import { wishSchema } from "@/app/validation/schemas";
import { CURRENCIES, SUPPORTED_CURRENCY_CODES } from "@/libs/currencies";

// --------- Константи/утиліти ---------
const ALLOWED_EXT = ["jpg", "jpeg", "png", "gif"] as const;
const ALLOWED_TYPE = ["image/jpeg", "image/png", "image/gif"] as const;
const MAX_MB = 10;

function validateImage(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (!ALLOWED_EXT.includes(ext as any))
    throw new Error("Upload failed: only JPG, PNG, GIF.");
  if (!ALLOWED_TYPE.includes(file.type as any))
    throw new Error("Upload failed: invalid file type.");
  const mb = file.size / 1024 / 1024;
  if (mb > MAX_MB)
    throw new Error(`Upload failed: file is too large (> ${MAX_MB} MB).`);
  return true;
}

async function uploadImage(
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

// --------- Типи пропів ---------
interface Wish {
  _id: string;
  name: string;
  description?: string;
  image_url?: string;
  image_public_id?: string;
  product_url?: string;

  price?: string; // "199.99" або ""
  currency?: string; // "EUR" | "USD" | ...

  added_at?: string;
}

interface EditWishModalProps {
  wishlistId: string;
  wish: Wish;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onWishUpdated: (updatedWish?: Wish) => void;
}

export default function EditWishModal({
  wishlistId,
  wish,
  isOpen,
  setIsOpen,
  onWishUpdated,
}: EditWishModalProps) {
  const dropRef = useRef<HTMLLabelElement | null>(null);

  // поля
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePublicId, setImagePublicId] = useState("");
  const [productUrl, setProductUrl] = useState("");

  // значення ціни користувача (сирий інпут) і валюта
  const [priceRaw, setPriceRaw] = useState("");
  const [currency, setCurrency] = useState<string>("EUR");

  // новий файл для завантаження
  const [imageFile, setImageFile] = useState<File | null>(null);

  // стани
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // початкове заповнення
  useEffect(() => {
    if (!wish) return;

    setName(wish.name ?? "");
    setDescription(wish.description || "");
    setImageUrl(wish.image_url || "");
    setImagePublicId(wish.image_public_id || "");
    setProductUrl(wish.product_url || "");

    // 1) Сучасний випадок: price окремо, currency окремо
    const hasLegacySuffix = !!wish.price && /\s[A-Z]{3}$/.test(wish.price);
    if (wish.price && !hasLegacySuffix) {
      setPriceRaw(wish.price);
      const c = (wish.currency ?? "").toUpperCase();
      if (SUPPORTED_CURRENCY_CODES.has(c)) setCurrency(c);
      else setCurrency("EUR");
      return;
    }

    // 2) Legacy: "199.99 USD"
    const priceStr = wish.price || "";
    const [v, c] = priceStr.split(" ").filter(Boolean);
    if (v && !Number.isNaN(Number(v))) setPriceRaw(v);
    const cc = (c ?? "").toUpperCase();
    if (SUPPORTED_CURRENCY_CODES.has(cc)) setCurrency(cc);
    else setCurrency("EUR");
  }, [wish]);

  // підставляємо останню обрану валюту при відкритті (якщо wish.currency не задана)
  useEffect(() => {
    if (!isOpen) return;

    // якщо у вішки вже є currency — не чіпаємо
    const wishCur = (wish?.currency ?? "").toUpperCase();
    if (wishCur && SUPPORTED_CURRENCY_CODES.has(wishCur)) return;

    const saved = localStorage.getItem("wishlify:lastCurrency");
    const normalized = (saved ?? "").toUpperCase();

    if (SUPPORTED_CURRENCY_CODES.has(normalized)) setCurrency(normalized);
  }, [isOpen, wish?.currency]);

  useEffect(() => {
    localStorage.setItem("wishlify:lastCurrency", currency.toUpperCase());
  }, [currency]);

  // нормалізація ціни
  const priceValue = useMemo(() => {
    const normalized = priceRaw.replace(",", ".").replace(/[^\d.]/g, "");
    const num = Number(normalized);
    return Number.isFinite(num) ? num : NaN;
  }, [priceRaw]);

  const close = () => {
    if (!saving && !deleting) setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (!saving && !deleting) void handleUpdateWish();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    isOpen,
    saving,
    deleting,
    wishlistId,
    wish?._id,
    name,
    description,
    productUrl,
    priceRaw,
    currency,
    imageFile,
    imageUrl,
    imagePublicId,
  ]);

  // вибір файлу
  const pickFile = (file?: File | null) => {
    if (!file) return;
    try {
      validateImage(file);
      setImageFile(file);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  // збереження
  const handleUpdateWish = async () => {
    // сформуємо поля картинки
    let nextImageUrl = imageUrl;
    let nextPublicId = imagePublicId;

    try {
      if (imageFile) {
        validateImage(imageFile);
        const uploaded = await uploadImage(imageFile);
        nextImageUrl = uploaded.imageUrl;
        nextPublicId = uploaded.image_public_id;
      }
    } catch (err) {
      toast.error((err as Error).message);
      return;
    }

    // price — лише число рядком, currency — окремо (лише якщо ціна валідна)
    const hasPrice = Number.isFinite(priceValue);
    const priceString = hasPrice ? String(priceValue) : "";
    const currencyUpper = currency.toUpperCase();

    const toValidate: Record<string, unknown> = {
      name,
      description,
      price: priceString,
      image_url: nextImageUrl,
      product_url: productUrl,
      image_public_id: nextPublicId,
    };
    if (hasPrice) toValidate.currency = currencyUpper;

    const parsed = wishSchema.safeParse(toValidate);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name,
        description,
        image_url: nextImageUrl,
        image_public_id: nextPublicId,
        product_url: productUrl,
        price: priceString,
      };
      if (hasPrice) body.currency = currencyUpper;

      const res = await fetch(
        `/api/wishlists/${wishlistId}/wishes/${wish._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) throw new Error("Failed to update wish");

      const updatedWish = await res.json();
      toast.success("Wish updated successfully!");
      setIsOpen(false);
      onWishUpdated(updatedWish);
    } catch (err) {
      toast.error((err as Error).message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  // видалення
  const handleDeleteWish = async () => {
    if (!confirm(`Delete “${wish?.name || "this wish"}”?`)) return;

    setDeleting(true);
    try {
      const res = await fetch(
        `/api/wishlists/${wishlistId}/wishes/${wish._id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Failed to delete wish");

      toast.success("Wish deleted successfully!");
      setIsOpen(false);
      onWishUpdated({ ...wish, deleted: true } as any);
    } catch (err) {
      toast.error((err as Error).message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  // очистити картинку (прибрати існуючу)
  const clearImage = () => {
    setImageFile(null);
    setImageUrl("");
    setImagePublicId("");
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

        <div className="fixed inset-0 overflow-y-auto" >
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
              <Dialog.Panel className="relative w-full sm:w-[90%] max-w-md transform text-left align-middle shadow-xl rounded-xl bg-base-100 p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h2" className="font-semibold text-xl">
                    Edit Wish
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
                        pickFile(e.dataTransfer.files?.[0] || null);
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
                          alt="Current image"
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
                      onChange={(e) => pickFile(e.target.files?.[0] || null)}
                    />

                    {(imageFile || imageUrl) && (
                      <div className="flex gap-2">
                        {imageFile && (
                          <button
                            type="button"
                            className="btn btn-xs btn-outline w-fit"
                            onClick={() => setImageFile(null)}
                          >
                            Reset new file
                          </button>
                        )}
                        {imageUrl && (
                          <button
                            type="button"
                            className="btn btn-xs btn-outline btn-error w-fit"
                            onClick={clearImage}
                          >
                            Remove current image
                          </button>
                        )}
                      </div>
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
                    </div>

                    <select
                      className="select select-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary/40"
                      value={currency}
                      onChange={(e) =>
                        setCurrency(e.target.value.toUpperCase())
                      }
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
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleDeleteWish}
                      className="btn btn-error flex-1"
                      disabled={saving || deleting}
                    >
                      {deleting ? "Deleting..." : "Delete"}
                    </button>
                    <button
                      onClick={handleUpdateWish}
                      className="btn btn-success flex-1"
                      disabled={saving || deleting || !name.trim()}
                    >
                      {saving ? "Saving..." : "Update"}
                    </button>
                  </div>

                  <p className="text-[11px] hidden md:block text-base-content/60 text-center">
                    Tip: Press <kbd className="kbd kbd-xs">Ctrl</kbd>+
                    <kbd className="kbd kbd-xs">Enter</kbd> to save quickly.
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
