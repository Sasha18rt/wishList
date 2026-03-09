"use client";

import { useRef, useState, Fragment, useEffect, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import toast from "react-hot-toast";
import { wishSchema } from "@/app/validation/schemas";
import { CURRENCIES, SUPPORTED_CURRENCY_CODES } from "@/libs/currencies";
import type { KeyboardEvent } from "react";

interface AddWishModalProps {
  wishlistId: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onWishAdded: () => void;
}

const ALLOWED_EXT = ["jpg", "jpeg", "png", "gif", "webp", "avif"] as const;
const ALLOWED_TYPE = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
] as const;
const MAX_MB = 10;

function validateImage(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";

  if (!ALLOWED_EXT.includes(ext as (typeof ALLOWED_EXT)[number])) {
    throw new Error(
      "Upload failed: supported formats are JPG, PNG, GIF, WEBP, AVIF."
    );
  }

  if (!ALLOWED_TYPE.includes(file.type as (typeof ALLOWED_TYPE)[number])) {
    throw new Error("Upload failed: invalid file type.");
  }

  const mb = file.size / 1024 / 1024;
  if (mb > MAX_MB) {
    throw new Error(`Upload failed: file is too large (> ${MAX_MB} MB).`);
  }

  return true;
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

  const data = await res.json().catch((): null => null);

  if (!res.ok) {
    throw new Error(data?.error || "Image upload failed");
  }

  return {
    imageUrl: data.imageUrl,
    image_public_id: data.image_public_id,
  };
}

type AddWishPayload = {
  name: string;
  description?: string;
  product_url?: string;
  price: string;
  currency?: string | null;
  image_url?: string | null;
  image_public_id?: string | null;
};

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
  const [productUrl, setProductUrl] = useState("");
  const [priceRaw, setPriceRaw] = useState("");
  const [currency, setCurrency] = useState<string>("EUR");
  const [loading, setLoading] = useState(false);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const isTextarea = (e.target as HTMLElement)?.tagName === "TEXTAREA";

    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (!loading) void handleAddWish();
      return;
    }

    if (!isTextarea && e.key === "Enter") {
      e.preventDefault();
      if (!loading) void handleAddWish();
    }
  };

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

  const priceValue = useMemo(() => {
    const normalized = priceRaw.replace(",", ".").replace(/[^\d.]/g, "");
    const num = Number(normalized);
    return Number.isFinite(num) ? num : NaN;
  }, [priceRaw]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setImageFile(null);
    setProductUrl("");
    setPriceRaw("");
    setCurrency("EUR");
  };

  const pickFile = (file?: File | null) => {
    if (!file) return;

    try {
      validateImage(file);
      setImageFile(file);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleAddWish = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setLoading(true);

    try {
      let image_url: string | null = null;
      let image_public_id: string | null = null;

      if (imageFile) {
        validateImage(imageFile);
        const upload = await handleUploadImage(imageFile);
        image_url = upload.imageUrl;
        image_public_id = upload.image_public_id;
      }

      const hasPrice = Number.isFinite(priceValue);
      const priceString = hasPrice ? String(priceValue) : "";

      const payload: AddWishPayload = {
        name: name.trim(),
        description: description.trim(),
        product_url: productUrl.trim(),
        price: priceString,
        image_url,
        image_public_id,
        currency: hasPrice ? currency.toUpperCase() : null,
      };

      const result = wishSchema.safeParse(payload);
      if (!result.success) {
        toast.error(result.error.errors[0].message);
        return;
      }

      const res = await fetch(`/api/wishlists/${wishlistId}/wishes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch((): null => null);

      if (!res.ok) {
        throw new Error(data?.error || "Failed to add wish");
      }

      toast.success("Wish added successfully!");
      setIsOpen(false);
      onWishAdded();
      resetForm();
    } catch (err) {
      toast.error((err as Error).message || "Something went wrong");
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

        <div className="fixed inset-0 overflow-y-auto" onKeyDown={onKeyDown}>
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
                <div className="mb-4 flex items-center justify-between">
                  <Dialog.Title className="text-xl font-semibold">
                    Add New Wish
                  </Dialog.Title>
                  <button
                    className="btn btn-square btn-ghost btn-sm focus:outline-none"
                    onClick={close}
                    aria-label="Close"
                    disabled={loading}
                  >
                    ✕
                  </button>
                </div>

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

                  <div className="flex flex-col gap-3">
                    <label
                      ref={dropRef}
                      htmlFor="imageUpload"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        pickFile(e.dataTransfer.files?.[0] || null);
                      }}
                      className="w-full cursor-pointer rounded-xl border-2 border-dashed border-base-content/20 p-4 text-center transition hover:border-primary"
                    >
                      {imageFile ? (
                        <img
                          src={URL.createObjectURL(imageFile)}
                          alt="Preview"
                          className="h-40 w-full rounded-md object-cover"
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
                      accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
                      className="hidden"
                      onChange={(e) => pickFile(e.target.files?.[0] || null)}
                    />

                    {imageFile && (
                      <button
                        type="button"
                        className="btn btn-xs btn-outline btn-error w-fit"
                        onClick={() => setImageFile(null)}
                      >
                        Remove image
                      </button>
                    )}
                  </div>

                  <input
                    type="url"
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                    className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="Product URL (optional)"
                  />

                  <div className="grid grid-cols-3 items-start gap-3">
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

                  <button
                    onClick={handleAddWish}
                    className="btn btn-primary w-full"
                    disabled={loading || !name.trim()}
                  >
                    {loading ? "Adding..." : "Add Wish"}
                  </button>

                  <p className="hidden text-center text-[11px] text-base-content/60 md:block">
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