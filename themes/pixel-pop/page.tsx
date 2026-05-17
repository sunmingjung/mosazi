"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import ProductCard from "./components/ProductCard";
import FilterBar from "./components/FilterBar";
import RecommendModal from "./components/RecommendModal";
import PixelBubble from "./components/PixelBubble";

export interface ApiProduct {
  item_id: number;
  item_name: string;
  brand_name: string | null;
  brand_name_eng: string | null;
  display_price: number | null;
  original_price: number | null;
  sale_rate: number | null;
  is_new_arrival: number;
  is_recently_launched: number;
  review_score: number | null;
  review_count: number | null;
  like_count: number | null;
  large_category_name: string | null;
  middle_category_name: string | null;
  thumbnail_url: string | null;
  product_url: string | null;
  text_badges: string | null;
  feed_contexts: string | null;
  currency?: string | null;
}

interface ApiResponse {
  products: ApiProduct[];
  total: number;
  page: number;
  totalPages: number;
}

export interface Filters {
  category: string;
  price_range: string;
  new_only: boolean;
  sort: string;
  q: string;
}

const DEFAULT_FILTERS: Filters = {
  category: "",
  price_range: "",
  new_only: false,
  sort: "first_seen",
  q: "",
};

export default function Home() {
  const [showRecommend, setShowRecommend] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchProducts = useCallback(async (f: Filters, p: number) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (f.category) params.set("category", f.category);
    if (f.price_range) params.set("price_range", f.price_range);
    if (f.new_only) params.set("new_only", "1");
    if (f.sort) params.set("sort", f.sort);
    if (f.q) params.set("q", f.q);
    params.set("page", String(p));

    const res = await fetch(`/api/products?${params}`);
    const data: ApiResponse = await res.json();
    setProducts(data.products);
    setTotal(data.total);
    setTotalPages(data.totalPages);
    setLoading(false);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, q: value }));
    }, 350);
  };

  useEffect(() => {
    setPage(1);
    fetchProducts(filters, 1);
  }, [filters, fetchProducts]);

  useEffect(() => {
    if (page > 1) fetchProducts(filters, page);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (next: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...next }));
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white/70 backdrop-blur-md border-b border-[var(--border)] sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-5 pt-5 pb-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-end gap-2.5">
            <Link
              href="/"
              className="font-pixel text-2xl sm:text-3xl text-[var(--ink)] leading-none hover:text-[var(--lavender-deep)] transition-colors"
            >
              MOSAZI
            </Link>
            <span className="text-lg sm:text-xl text-[var(--lavender-deep)] pb-0.5 leading-none select-none" aria-hidden>
              ૮ • ﻌ - ა
            </span>
            <PixelBubble width={22} className="text-[var(--lavender-deep)] pb-0.5 self-end" />
            <div className="hidden md:flex flex-col gap-0.5 pb-1 ml-1">
              <span className="font-pixel text-[8px] text-[var(--lavender)]">CURATED · GIFTS</span>
              <span className="font-pixel text-[8px] text-[var(--subtle)]">2026 · KR</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* 빠르게 고르기 — 클로우 카드 */}
            <button
              onClick={() => setShowRecommend(true)}
              className="clow-card relative bg-grad-magic text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg border-2 border-white/70"
              style={{ boxShadow: "0 4px 14px -4px rgba(155, 134, 224, 0.55), inset 0 0 0 1px rgba(255,255,255,0.45)" }}
            >
              <span className="clow-twinkle absolute top-1 right-1.5 text-[10px] text-white">✦</span>
              <span className="clow-twinkle delay absolute bottom-1 left-1.5 text-[9px] text-white">✧</span>
              <span className="relative z-10 flex items-center gap-1.5">
                <span className="text-base">🎲</span>
                <span>빠르게 고르기</span>
              </span>
            </button>

            {/* 직접 입력하기 — 라벤더 톤 */}
            <a
              href="/consult"
              className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--lavender-deep)] bg-[var(--lavender-soft)] border border-[var(--lavender)]/50 px-4 py-2.5 rounded-lg hover:bg-white transition-colors"
            >
              <span className="text-base">✨</span>
              <span>직접 입력하기</span>
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-5 pb-4 flex items-center gap-3">
          <div className="flex-1 max-w-xl relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--lavender)] text-sm">🔎</span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="기타, 캔들, 키링, 도자기..."
              className="w-full pl-10 pr-9 py-2.5 text-sm rounded-full border-2 border-[var(--border)] bg-white/80 placeholder:text-[var(--subtle)] focus:outline-none focus:border-[var(--lavender)] focus:bg-white transition-all"
            />
            {searchInput && (
              <button
                onClick={() => { setSearchInput(""); handleSearchChange(""); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--subtle)] hover:text-[var(--lavender-deep)] text-xs"
                aria-label="Clear"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </header>

      {showRecommend && <RecommendModal onClose={() => setShowRecommend(false)} />}

      <FilterBar filters={filters} onChange={handleFilterChange} />

      <main className="max-w-7xl mx-auto px-5 py-8">
        <div className="flex items-end justify-between mb-7 border-b border-dotted border-[var(--border)] pb-4">
          <div>
            <p className="font-pixel text-[var(--ink)] text-xl sm:text-2xl leading-none">
              CATA<span className="text-[var(--lavender-deep)]">LOGUE</span>
            </p>
            <p className="font-pixel text-[8px] text-[var(--lavender)] mt-2">
              ALL ITEMS · SORTED BY LATEST
            </p>
          </div>
          <div className="text-right">
            <p className="font-pixel text-[var(--lavender-deep)] text-xl sm:text-2xl num-tabular leading-none">
              {loading ? "—" : total.toLocaleString()}
            </p>
            <p className="font-pixel text-[8px] text-[var(--lavender)] mt-2">ITEMS IN STOCK</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-[var(--lavender-soft)] rounded-3xl aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-pixel text-base sm:text-lg text-[var(--lavender)] mb-3">⌧  NO RESULTS  ⌧</p>
            <p className="font-rounded text-2xl text-[var(--ink)]">
              {filters.q ? `"${filters.q}" 찾는 선물이 없어요` : "조건에 맞는 선물이 없어요"}
            </p>
            {filters.q && (
              <p className="font-pixel text-[9px] mt-3 text-[var(--muted)]">TRY ANOTHER KEYWORD</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.item_id} product={p} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-full bg-white/80 border border-[var(--border)] text-sm disabled:opacity-30 hover:bg-[var(--lavender-soft)] hover:border-[var(--lavender)] transition-colors"
            >
              ← 이전
            </button>
            <span className="text-sm text-[var(--muted)] num-tabular px-2">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-full bg-white/80 border border-[var(--border)] text-sm disabled:opacity-30 hover:bg-[var(--lavender-soft)] hover:border-[var(--lavender)] transition-colors"
            >
              다음 →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
