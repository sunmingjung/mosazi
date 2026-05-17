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
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-white/70 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="text-sm text-[var(--muted)] hover:text-[var(--lavender-deep)] font-rounded transition-colors"
          >
            ← Mosazi
          </Link>
          <p className="font-pixel text-[9px] text-[var(--lavender)]">
            ✦ MOSAZI ૮ • ﻌ - ა
          </p>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-5 py-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="font-pixel text-[10px] text-white bg-grad-magic px-2.5 py-1 rounded -rotate-1">
              ✦ TRACK 02
            </span>
            <span className="font-pixel text-[9px] text-[var(--lavender)]">DETAIL · BESPOKE</span>
          </div>
          <h2 className="font-rounded text-3xl sm:text-4xl text-grad-magic leading-tight">
            오래 고민하신 선물,
            <br />
            함께 찾아드릴게요
            <span className="text-[var(--lavender-deep)] ml-2 text-2xl select-none" aria-hidden>૮₍´˶• . • ⑅ ₎ა</span>
          </h2>
        </div>

        <div className="mb-8">
          <div className="relative bg-white rounded-3xl border-2 border-[var(--border)] focus-within:border-[var(--lavender)] transition-colors p-1" style={{ boxShadow: "0 4px 20px -6px rgba(155, 134, 224, 0.25)" }}>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(query);
              }}
              placeholder="예) 30대 여자친구 결혼 5주년 10만원 미니멀한 선물"
              rows={3}
              className="w-full p-4 pr-28 text-sm bg-transparent border-0 focus:outline-none resize-none placeholder:text-[var(--subtle)] font-rounded"
              disabled={loading}
              maxLength={500}
            />
            <button
              onClick={() => submit(query)}
              disabled={loading || !query.trim()}
              className="absolute right-3 bottom-3 bg-[var(--lavender-deep)] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-[var(--lavender)] disabled:opacity-30 transition-colors"
              style={{ boxShadow: "0 4px 14px -4px rgba(106, 79, 199, 0.35)" }}
            >
              {loading ? "FINDING..." : "추천받기 →"}
            </button>
          </div>

          {!result && !loading && (
            <div className="mt-6">
              <p className="font-pixel text-[9px] text-[var(--lavender)] mb-3">EXAMPLES</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => { setQuery(ex); submit(ex); }}
                    className="text-xs px-3.5 py-1.5 rounded-full bg-white border border-[var(--border)] text-[var(--muted)] hover:border-[var(--lavender)] hover:text-[var(--lavender-deep)] transition-colors"
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
            <p className="font-pixel text-[10px] text-[var(--lavender)] mb-3 animate-shimmer">FINDING . . .</p>
            <p className="font-rounded text-xl text-grad-magic">
              큐레이터가 살펴보고 있어요
            </p>
            <p className="font-pixel text-[8px] mt-3 text-[var(--subtle)]">MAX 30s</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-[var(--lavender-soft)] text-[var(--lavender-deep)] text-sm border border-[var(--lavender)]">
            {error}
          </div>
        )}

        {result && result.products.length > 0 && (
          <div>
            {result.overall_note && (
              <div className="mb-6 p-5 rounded-3xl bg-grad-magic text-white" style={{ boxShadow: "0 6px 20px -6px rgba(155, 134, 224, 0.4)" }}>
                <p className="font-pixel text-[9px] text-white/90 mb-2">EDITOR'S NOTE</p>
                <p className="text-sm leading-relaxed font-rounded">
                  {result.overall_note}
                </p>
              </div>
            )}
            <div className="space-y-4">
              {result.products.map((p, i) => (
                <a
                  key={p.item_id}
                  href={p.product_url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white rounded-3xl overflow-hidden hover:-translate-y-0.5 transition-transform"
                  style={{ boxShadow: "0 4px 16px -6px rgba(155, 134, 224, 0.25)" }}
                >
                  <div className="flex gap-4 p-3.5">
                    {p.thumbnail_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.thumbnail_url}
                        alt={p.item_name}
                        className="w-28 h-28 object-cover rounded-2xl shrink-0 bg-[var(--lavender-soft)]"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-pixel text-[9px] text-[var(--lavender-deep)]">{String(i + 1).padStart(2, "0")}</span>
                        <span className="font-pixel text-[8px] text-[var(--lavender)] bg-[var(--lavender-soft)] px-2 py-1 rounded">{p.shop_category}</span>
                      </div>
                      {p.brand_name && (
                        <p className="font-pixel text-[8px] text-[var(--lavender)] mb-0.5">{p.brand_name}</p>
                      )}
                      <p className="text-sm font-semibold leading-snug line-clamp-2 mb-1.5">
                        {p.item_name}
                      </p>
                      <p className="text-sm font-bold text-[var(--ink)] mb-2 num-tabular">
                        {p.display_price.toLocaleString()}원
                      </p>
                      <p className="text-[11px] text-[var(--muted)] leading-relaxed italic font-rounded">
                        “{p.reason}”
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
            <button
              onClick={() => { setResult(null); setQuery(""); }}
              className="mt-6 w-full py-3 rounded-full bg-white border-2 border-[var(--lavender)] text-[var(--lavender-deep)] text-sm font-semibold hover:bg-[var(--lavender-soft)] transition-colors"
            >
              다시 찾기
            </button>
          </div>
        )}

        {result && result.products.length === 0 && (
          <div className="py-16 text-center">
            <p className="font-pixel text-[10px] text-[var(--lavender)] mb-3">NO RESULTS</p>
            <p className="font-rounded text-lg text-[var(--muted)]">
              {result.overall_note || "조건에 맞는 선물을 찾지 못했어요"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
