import React, { useRef } from "react";
import "./Button.css";

export default function Button({
  children,
  variant = "gold",
  size = "md",
  onClick,
  className = "",
  ...props
}) {
  const btnRef = useRef(null);

  const handleClick = (e) => {
    /* ripple effect */
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "btn-ripple";
      const diameter = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${diameter}px`;
      ripple.style.left = `${e.clientX - rect.left - diameter / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - diameter / 2}px`;
      btnRef.current.appendChild(ripple);
      setTimeout(() => ripple.remove(), 500);
    }
    onClick?.(e);
  };

  return (
    <button
      ref={btnRef}
      className={`btn btn-${variant} btn-${size} font-display ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}
