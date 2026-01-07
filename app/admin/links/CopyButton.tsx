"use client";

import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.error("Copy failed", err);
      // fallback: старий спосіб
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      } catch (e) {
        console.error("Fallback copy failed", e);
      }
    }
  }

  return (
    <button
      type="button"
      className={`btn btn-xs ${copied ? "btn-success" : "btn-ghost"}`}
      onClick={onCopy}
      title="Copy"
      aria-label="Copy"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
