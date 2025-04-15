"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

interface Props {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  wishlists: any[];
  onSelect: (wishlistId: string) => void;
}

export default function SelectWishlistModal({
  isOpen,
  setIsOpen,
  wishlists,
  onSelect,
}: Props) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-neutral-focus bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-xl bg-base-100 p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h3" className="text-lg font-bold">
                    Select a Wishlist
                  </Dialog.Title>
                  <button
                    className="btn btn-sm btn-ghost btn-square"
                    onClick={() => setIsOpen(false)}
                  >
                    ✕
                  </button>
                </div>

                {/* Wishlist Buttons */}
                <div className="space-y-2">
                  {wishlists.map((w) => (
                    <button
                      key={w._id}
                      onClick={() => {
                        onSelect(w._id);
                        setIsOpen(false);
                      }}
                      className="btn btn-primary btn-outline w-full"
                    >
                      {w.title || w.name || "Untitled"}
                    </button>
                  ))}
                </div>

                {/* Cancel */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="btn btn-ghost btn-outline  btn-sm btn-soft mt-6 w-full"
                >
                  Cancel
                </button>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
