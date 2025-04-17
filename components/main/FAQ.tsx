"use client";

import { useRef, useState } from "react";
import type { JSX } from "react";

// <FAQ> component is a lsit of <Item> component
// Just import the FAQ & add your FAQ content to the const faqList arrayy below.

interface FAQItemProps {
  question: string;
  answer: JSX.Element;
}

const faqList: FAQItemProps[] = [
  {
    question: "What is Wishlify?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        Wishlify is a simple tool to create, manage, and share wishlists. Whether it’s for a birthday, wedding, or personal goals – we make it easy to organize your wishes in one place.
      </div>
    ),
  },
  {
    question: "Do I need to create an account?",
    answer: (
      <p>
        You can browse public wishlists without logging in, but to create and save your own wishlist, you’ll need to sign in.
      </p>
    ),
  },
  {
    question: "Can I share my wishlist with friends?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        Absolutely! You can share your wishlist via a unique link. On mobile, use the share button to quickly send it via apps like Messenger, WhatsApp, or Email.
      </div>
    ),
  },
  {
    question: "Can others add items to my wishlist?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        No – only the wishlist owner can add or edit items. However, friends can reserve items (if enabled), so others know what’s already taken.
      </div>
    ),
  },
  {
    question: "Is it free to use?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        Yes! Wishlify is free to use. We may introduce premium features in the future, but basic wishlist creation and sharing will always be free.
      </div>
    ),
  },
  {
    question: "What if I have a problem or suggestion?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        You can contact our support via email at <a className="link link-primary" href="mailto:support@wishlify.me">support@wishlify.me</a> – we’re happy to help!
      </div>
    ),
  },
];



const FaqItem = ({ item }: { item: FAQItemProps }) => {
  const accordion = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <li>
      <button
        className="relative flex gap-2 items-center w-full py-5 text-base font-semibold text-left border-t md:text-lg border-base-content/10"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
      >
        <span
          className={`flex-1 text-base-content ${isOpen ? "text-primary" : ""}`}
        >
          {item?.question}
        </span>
        <svg
          className={`flex-shrink-0 w-4 h-4 ml-auto fill-current`}
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            className={`transform origin-center transition duration-200 ease-out ${
              isOpen && "rotate-180"
            }`}
          />
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            className={`transform origin-center rotate-90 transition duration-200 ease-out ${
              isOpen && "rotate-180 hidden"
            }`}
          />
        </svg>
      </button>

      <div
        ref={accordion}
        className={`transition-all duration-300 ease-in-out opacity-80 overflow-hidden`}
        style={
          isOpen
            ? { maxHeight: accordion?.current?.scrollHeight, opacity: 1 }
            : { maxHeight: 0, opacity: 0 }
        }
      >
        <div className="pb-5 leading-relaxed">{item?.answer}</div>
      </div>
    </li>
  );
};

const FAQ = () => {
  return (
    <section className="bg-base-200" id="faq">
      <div className="py-24 px-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
        <div className="flex flex-col text-left basis-1/2">
          <p className="inline-block font-semibold text-primary mb-4">FAQ</p>
          <p className="sm:text-4xl text-3xl font-extrabold text-base-content">
            Frequently Asked Questions
          </p>
        </div>

        <ul className="basis-1/2">
          {faqList.map((item, i) => (
            <FaqItem key={i} item={item} />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default FAQ;
