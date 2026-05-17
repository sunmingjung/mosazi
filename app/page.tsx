"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import ProductCard from "./components/ProductCard";
import FilterBar from "./components/FilterBar";
import RecommendModal from "./components/RecommendModal";

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
      <header className="bg-[var(--bg)]/90 backdrop-blur-md border-b rule-hairline sticky top-0 z-20">
        <div className="max-w-[1400px] mx-auto px-8 sm:px-12 pt-4 pb-4 flex items-end justify-between gap-8">
          <Link href="/" className="block group">
            <h1 className="font-serif text-[26px] sm:text-[32px] leading-none tracking-display group-hover:opacity-70 transition-opacity">
              MOSAZI
            </h1>
            <p className="text-[10px] uppercase tracking-caps text-[var(--muted)] mt-2.5">
              Curated Gifts <span className="text-[var(--subtle)] mx-1.5">·</span> Independent Brands
            </p>
          </Link>
          <nav className="hidden sm:flex items-stretch divide-x divide-[var(--hairline)] pb-1">
            <button
              onClick={() => setShowRecommend(true)}
              className="group text-left px-6 first:pl-0 transition-opacity"
            >
              <p className="text-[9px] uppercase tracking-caps text-[var(--muted)] mb-2 group-hover:text-[var(--ink)] transition-colors">Track 01</p>
              <p className="font-serif text-[16px] text-[var(--ink)] leading-none inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                <span>🎲</span>
                <span className="border-b border-[var(--ink)] pb-1">빠르게 고르기</span>
                <span className="text-[12px]">→</span>
              </p>
              <p className="text-[10px] text-[var(--subtle)] mt-2 tracking-wide italic font-serif">선택만으로 1초 추천</p>
            </button>
            <a
              href="/consult"
              className="group text-left px-6 last:pr-0 transition-opacity"
            >
              <p className="text-[9px] uppercase tracking-caps text-[var(--muted)] mb-2 group-hover:text-[var(--ink)] transition-colors">Track 02</p>
              <p className="font-serif text-[16px] text-[var(--ink)] leading-none inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                <span>✨</span>
                <span className="border-b border-[var(--ink)] pb-1">직접 입력하기</span>
                <span className="text-[12px]">→</span>
              </p>
              <p className="text-[10px] text-[var(--subtle)] mt-2 tracking-wide italic font-serif">맞춤형 큐레이션</p>
            </a>
          </nav>
        </div>

        <div className="max-w-[1400px] mx-auto px-8 sm:px-12 pb-5 flex items-center gap-6">
          <div className="flex-1 max-w-md relative">
            <svg
              className="absolute left-0 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              aria-hidden
            >
              <circle cx="7" cy="7" r="5" />
              <line x1="10.6" y1="10.6" x2="14" y2="14" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="기타, 캔들, 키링, 도자기"
              className="w-full pl-6 pr-6 py-2.5 text-[15px] font-serif border-0 border-b rule-hairline bg-transparent placeholder:text-[var(--subtle)] placeholder:italic focus:outline-none focus:border-[var(--ink)] transition-colors"
            />
            {searchInput && (
              <button
                onClick={() => { setSearchInput(""); handleSearchChange(""); }}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--subtle)] hover:text-[var(--ink)] text-xs"
              >
                ✕
              </button>
            )}
          </div>
          <div className="flex sm:hidden items-center gap-5 shrink-0">
            <button
              onClick={() => setShowRecommend(true)}
              className="font-serif text-[13px] underline underline-offset-[5px] decoration-[0.5px]"
            >
              Track 01
            </button>
            <a
              href="/consult"
              className="font-serif text-[13px] underline underline-offset-[5px] decoration-[0.5px]"
            >
              Track 02
            </a>
          </div>
        </div>
      </header>

      {showRecommend && <RecommendModal onClose={() => setShowRecommend(false)} />}

      <FilterBar filters={filters} onChange={handleFilterChange} />

      <main className="max-w-[1400px] mx-auto px-8 sm:px-12 py-10 fade-up">
        <div className="flex items-center justify-between mb-8 border-b rule-hairline pb-3">
          <p className="text-[10px] uppercase tracking-caps text-[var(--muted)]">Catalogue</p>
          <p className="text-[10px] uppercase tracking-caps text-[var(--muted)] num-tabular">
            {loading ? "—" : `${total.toLocaleString()} Items`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-14">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-[var(--border)]/50 aspect-[4/5] animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-32 text-center">
            <p className="text-[10px] uppercase tracking-caps text-[var(--muted)] mb-4">No Results</p>
            <p className="font-serif text-2xl sm:text-3xl italic">
              {filters.q ? `"${filters.q}"에 해당하는 결과가 없습니다` : "조건에 맞는 상품이 없습니다"}
            </p>
            {filters.q && (
              <p className="text-xs text-[var(--muted)] mt-4 tracking-wide">다른 키워드를 시도해 보세요</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-14">
            {products.map((p) => (
              <ProductCard key={p.item_id} product={p} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-10 mt-24 border-t rule-hairline pt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-[10px] uppercase tracking-caps disabled:opacity-20 hover:opacity-60 transition-opacity"
            >
              ← Previous
            </button>
            <span className="font-serif italic text-[15px] text-[var(--muted)] num-tabular">
              {page} <span className="text-[var(--subtle)] mx-1">of</span> {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="text-[10px] uppercase tracking-caps disabled:opacity-20 hover:opacity-60 transition-opacity"
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
