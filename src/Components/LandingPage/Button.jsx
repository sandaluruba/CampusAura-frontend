import React from "react";

export default function Button({ text, type = "primary", onClick }) {
  // text → button label (Login, Sign In, Click Me, etc.)
  // type → "primary" or "outline" (style)
  // onClick → function when button is clicked

  return (
    <button
      className={type === "primary" ? "btn-primary" : "btn-outline"}
      onClick={onClick}
    >
      {text}
    </button>
  );
}
