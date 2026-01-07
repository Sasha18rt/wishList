"use client";

import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [ok, setOk] = useState(false);

  return (
    <button
      type="button"
      className={`btn btn-xs ${ok ? "btn-success" : "btn-ghost"}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setOk(true);
          setTimeout(() => setOk(false), 900);
        } catch {}
      }}
      title="Copy"
      aria-label="Copy"
    >
      {ok ? "Copied" : "Copy"}
    </button>
  );
}
