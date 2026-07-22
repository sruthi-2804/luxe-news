"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ScrollGate({
  isLoggedIn,
  children,
}: {
  isLoggedIn: boolean;
  children: React.ReactNode;
}) {
  const [showGate, setShowGate] = useState(false);

  useEffect(() => {
    if (isLoggedIn) return;

    function handleScroll() {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;

      if (scrolled >= 0.6) {
        setShowGate(true);
      }
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoggedIn]);

  useEffect(() => {
    document.body.style.overflow = showGate ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showGate]);

  return (
    <>
      {children}
      {showGate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-50">
          <div className="w-full max-w-sm bg-white rounded-lg p-8 text-center">
            <h2 className="text-xl font-bold text-zinc-900 mb-2">
              Keep reading Luxe News
            </h2>
            <p className="text-zinc-500 mb-6">
              Sign in or create an account to see the rest of today&apos;s
              curated stories.
            </p>
            <Link
              href="/login"
              className="block rounded bg-zinc-900 text-white px-4 py-2 text-sm font-medium hover:bg-zinc-700"
            >
              Sign In / Create Account
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
