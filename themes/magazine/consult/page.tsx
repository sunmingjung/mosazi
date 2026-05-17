"use client";

import { useState } from "react";
import Link from "next/link";

interface ConsultProduct {
  item_id: number;
  item_name: string;
  brand_name: string | null;
  display_price: number;
  shop_category: string | null;
  thumbnail_url: string | null;
  product_url: string | null;
  reason: string;
}

interface ConsultResponse {
  products: ConsultProduct[];
  overall_note: string;
  query: string;
}

const EXAMPLES = [
  "30대 여자친구 결혼 5주년 10만원 미니멀한 선물",
  "어머니 환갑 도자기 좋아하시는 분 15만원",
  "친구 집들이 향초나 디퓨저 3만원대",
  "직장 후배 승진 축하 격식 있는 5만원대",
];

export default function ConsultPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConsultResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(q: string) {
    if (!q.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `오류 (${res.status})`);
        return;
      }
      const data: ConsultResponse = await res.json();
      setResult(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
          >
            ← Mosazi
          </Link>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">
            Track 02 · 직접 입력하기
          </p>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-14">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-serif text-3xl sm:text-4xl leading-tight mb-3">
            오래 고민하신 선물,
            <br />
            함께 찾아드릴게요
          </h2>
        </div>

        <div className="mb-10">
          <div className="relative border-b border-[var(--ink)] focus-within:border-[var(--ink)]">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(query);
              }}
              placeholder="예. 30대 여자친구 결혼 5주년 10만원 미니멀한 선물"
              rows={3}
              className="w-full p-0 pr-28 py-3 text-sm bg-transparent border-0 focus:outline-none resize-none placeholder:text-[var(--subtle)]"
              disabled={loading}
              maxLength={500}
            />
            <button
              onClick={() => submit(query)}
              disabled={loading || !query.trim()}
              className="absolute right-0 bottom-3 text-[10px] uppercase tracking-[0.3em] text-[var(--ink)] hover:opacity-60 disabled:opacity-30 transition-opacity"
            >
              {loading ? "Curating..." : "Submit →"}
            </button>
          </div>

          {!result && !loading && (
            <div className="mt-6">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted)] mb-3">Examples</p>
              <div className="space-y-2">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => { setQuery(ex); submit(ex); }}
                    className="block w-full text-left text-xs text-[var(--muted)] hover:text-[var(--ink)] transition-colors py-1 border-b border-[var(--border)]"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="py-16 text-center">
            <p className="font-serif italic text-lg text-[var(--muted)]">
              큐레이터가 카탈로그를 살펴보고 있습니다…
            </p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--subtle)] mt-3">Max 30s</p>
          </div>
        )}

        {error && (
          <div className="border-t border-b border-[var(--ink)] py-4 text-sm">
            {error}
          </div>
        )}

        {result && result.products.length > 0 && (
          <div>
            {result.overall_note && (
              <div className="mb-8 border-y border-[var(--border)] py-5">
                <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted)] mb-2">Editor's note</p>
                <p className="font-serif text-base text-[var(--ink)] leading-relaxed">
                  {result.overall_note}
                </p>
              </div>
            )}
            <div className="divide-y divide-[var(--border)]">
              {result.products.map((p, i) => (
                <a
                  key={p.item_id}
                  href={p.product_url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex gap-5 py-6 first:pt-0"
                >
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[var(--subtle)] num-tabular pt-1 w-6 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {p.thumbnail_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.thumbnail_url}
                      alt={p.item_name}
                      className="w-28 h-32 object-cover shrink-0 bg-[var(--border)]/40"
                    />
                  )}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    {p.brand_name && (
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                        {p.brand_name}
                      </p>
                    )}
                    <p className="text-sm leading-snug text-[var(--ink)] group-hover:underline">
                      {p.item_name}
                    </p>
                    <p className="text-sm num-tabular">
                      {p.display_price.toLocaleString()}원
                    </p>
                    <p className="font-serif italic text-[12px] text-[var(--muted)] leading-relaxed pt-1">
                      “{p.reason}”
                    </p>
                    {p.shop_category && (
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--subtle)] pt-1">
                        {p.shop_category}
                      </p>
                    )}
                  </div>
                </a>
              ))}
            </div>
            <button
              onClick={() => { setResult(null); setQuery(""); }}
              className="mt-10 w-full py-3 border border-[var(--ink)] text-xs uppercase tracking-[0.3em] hover:bg-[var(--ink)] hover:text-[var(--bg)] transition-colors"
            >
              다시 찾기
            </button>
          </div>
        )}

        {result && result.products.length === 0 && (
          <div className="py-16 text-center">
            <p className="font-serif italic text-lg text-[var(--muted)]">
              {result.overall_note || "조건에 맞는 상품을 찾지 못했습니다."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
