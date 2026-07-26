"use client";

import { useEffect, useState } from "react";
import { Article } from "../lib/types";

export default function FashionWeekSlideshow({
  articles,
}: {
  articles: Article[];
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (articles.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % articles.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [articles.length]);

  if (articles.length === 0) return null;

  const article = articles[index];

  return (
    <div className="mb-10 pb-10 border-b-2 border-black">
      <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-zinc-500 mb-4">
        Runway Calendar
      </p>
      <div className="min-h-[9rem]">
        <h2 className="font-serif text-black mb-3 text-3xl sm:text-4xl leading-tight">
          {article.title}
        </h2>
        <p className="text-zinc-600 text-base mb-3 max-w-2xl">
          {article.summary}
        </p>
        <div className="text-xs text-zinc-400 flex items-center gap-3">
          <span className="uppercase tracking-wide font-medium text-zinc-500">
            {article.source}
          </span>
          {article.url && (
            <>
              <span>·</span>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="uppercase tracking-wide font-medium text-black hover:underline"
              >
                Read
              </a>
            </>
          )}
        </div>
      </div>

      {articles.length > 1 && (
        <div className="flex gap-2 mt-6">
          {articles.map((_, i) => (
            <button
              key={i}
              aria-label={`Show slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-black" : "w-1.5 bg-zinc-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
