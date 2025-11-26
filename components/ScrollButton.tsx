"use client";

import { useEffect, useState } from "react";

export default function ScrollButton() {
  const [atBottom, setAtBottom] = useState(false);
  const [isScrolling, SetIsScrolling] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const threshold = 50;
      const scrolledToBottom =
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - threshold;
      setAtBottom(scrolledToBottom);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    if (atBottom) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollBy({
        top: (window.innerHeight * 2) / 3,
        behavior: "smooth",
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={atBottom ? "Scroll to top" : "Scroll down"}
      className="fixed bottom-4 left-4 z-50 rounded-full bg-black/60 p-2 text-white backdrop-blur-sm hover:bg-black/80 cursor-pointer hover:scale-105 transition-all duration-200"
    >
      {atBottom ? <ArrowUp /> : <ArrowDown />}
    </button>
  );
}

const iconProps = {
  className: "h-5 w-5 md:h-6 md:w-6",
  fill: "none" as const,
  stroke: "currentColor" as const,
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function ArrowDown() {
  return (
    <svg viewBox="0 0 24 24" {...iconProps}>
      <path d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function ArrowUp() {
  return (
    <svg viewBox="0 0 24 24" {...iconProps}>
      <path d="M5 15l7-7 7 7" />
    </svg>
  );
}
