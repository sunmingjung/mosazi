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
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="text-sm text-gray-500 hover:text-black">← 메인</Link>
          <h1 className="font-bold">💬 큐레이터 상담</h1>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        {/* 입력 영역 */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">어떤 선물을 찾으시나요?</h2>
          <p className="text-sm text-gray-500 mb-4">
            받는 분, 상황, 예산, 분위기를 자유롭게 적어주세요. 큐레이터가 5개를 골라드려요.
          </p>
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(query);
              }}
              placeholder="예: 30대 여자친구 결혼 5주년 10만원 미니멀한 선물"
              rows={4}
              className="w-full p-4 pr-24 text-sm rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:bg-white focus:border-pink-300 resize-none transition-all"
              disabled={loading}
              maxLength={500}
            />
            <button
              onClick={() => submit(query)}
              disabled={loading || !query.trim()}
              className="absolute right-3 bottom-3 bg-pink-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-pink-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "찾는 중…" : "추천받기 →"}
            </button>
          </div>

          {/* 예시 칩 */}
          {!result && !loading && (
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-2">💡 예시</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => { setQuery(ex); submit(ex); }}
                    className="text-xs px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="py-12 text-center text-gray-500">
            <div className="animate-pulse">큐레이터가 카탈로그를 살펴보고 있어요…</div>
            <p className="text-xs mt-2 text-gray-400">최대 30초 소요</p>
          </div>
        )}

        {/* 오류 */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* 결과 */}
        {result && result.products.length > 0 && (
          <div>
            {result.overall_note && (
              <div className="mb-5 p-4 rounded-xl bg-pink-50 border border-pink-100 text-sm text-pink-900">
                {result.overall_note}
              </div>
            )}
            <div className="space-y-4">
              {result.products.map((p, i) => (
                <a
                  key={p.item_id}
                  href={p.product_url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-pink-300 hover:shadow-md transition-all"
                >
                  <div className="flex gap-4 p-3">
                    {p.thumbnail_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.thumbnail_url}
                        alt={p.item_name}
                        className="w-28 h-28 object-cover rounded-xl shrink-0 bg-gray-100"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-xs font-semibold text-pink-500">#{i + 1}</span>
                        <span className="text-xs text-gray-400">{p.shop_category}</span>
                      </div>
                      {p.brand_name && (
                        <p className="text-xs text-gray-500 mb-0.5">{p.brand_name}</p>
                      )}
                      <p className="text-sm font-semibold leading-snug line-clamp-2 mb-1">
                        {p.item_name}
                      </p>
                      <p className="text-sm font-bold mb-2">
                        {p.display_price.toLocaleString()}원
                      </p>
                      <p className="text-xs text-gray-600 leading-relaxed italic">
                        {p.reason}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
            <button
              onClick={() => { setResult(null); setQuery(""); }}
              className="mt-6 w-full py-3 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              다시 찾기
            </button>
          </div>
        )}

        {result && result.products.length === 0 && (
          <div className="py-12 text-center text-gray-500 text-sm">
            {result.overall_note || "조건에 맞는 상품을 찾지 못했어요. 다시 시도해보세요."}
          </div>
        )}
      </main>
    </div>
  );
}
