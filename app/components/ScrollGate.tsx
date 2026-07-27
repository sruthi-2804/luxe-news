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
        <div className="fixed inset-0 bg-ink/60 flex items-center justify-center px-4 z-50">
          <div className="w-full max-w-sm bg-paper rounded-lg p-8 text-center">
            <h2 className="text-xl font-bold tracking-[-0.03em] text-ink mb-2">
              Keep reading Luxe News
            </h2>
            <p className="text-muted mb-6">
              Sign in or create an account to see the rest of today&apos;s
              curated stories.
            </p>
            <Link
              href="/login"
              className="block rounded-full bg-ink text-paper px-4 py-2.5 text-sm font-medium hover:opacity-[0.82]"
            >
              Sign In / Create Account
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
