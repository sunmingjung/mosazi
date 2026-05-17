"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
      <header className="bg-[var(--bg)]/85 backdrop-blur-md border-b border-[var(--border)] sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 pt-6 pb-3 flex items-end justify-between gap-6">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl tracking-display leading-none">MOSAZI</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)] mt-2">
              Curated Gifts · Independent Brands
            </p>
          </div>
          <div className="hidden sm:flex items-start gap-8 pb-1">
            <button
              onClick={() => setShowRecommend(true)}
              className="group text-left hover:opacity-60 transition-opacity"
            >
              <div className="flex items-center gap-1.5 text-[15px] text-[var(--ink)]">
                <span className="text-base leading-none">🎲</span>
                <span className="underline underline-offset-[6px] decoration-[1px]">빠르게 고르기</span>
              </div>
              <p className="text-[10px] text-[var(--muted)] mt-1.5 tracking-wide">선택만으로 1초 추천</p>
            </button>
            <a
              href="/consult"
              className="group text-left hover:opacity-60 transition-opacity"
            >
              <div className="flex items-center gap-1.5 text-[15px] text-[var(--ink)]">
                <span className="text-base leading-none">✨</span>
                <span className="underline underline-offset-[6px] decoration-[1px]">직접 입력하기</span>
              </div>
              <p className="text-[10px] text-[var(--muted)] mt-1.5 tracking-wide">맞춤형 큐레이션</p>
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-4 flex items-center gap-3">
          <div className="flex-1 max-w-xl relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="기타, 캔들, 키링, 도자기..."
              className="w-full px-0 py-2 text-sm border-0 border-b border-[var(--border)] bg-transparent placeholder:text-[var(--subtle)] focus:outline-none focus:border-[var(--ink)] transition-colors"
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
          <div className="flex sm:hidden items-center gap-4 shrink-0">
            <button
              onClick={() => setShowRecommend(true)}
              className="flex items-center gap-1 text-[13px]"
            >
              <span className="text-sm leading-none">🎲</span>
              <span className="underline underline-offset-[5px] decoration-[1px]">빠르게 고르기</span>
            </button>
            <a
              href="/consult"
              className="flex items-center gap-1 text-[13px]"
            >
              <span className="text-sm leading-none">✨</span>
              <span className="underline underline-offset-[5px] decoration-[1px]">직접 입력하기</span>
            </a>
          </div>
        </div>
      </header>

      {showRecommend && <RecommendModal onClose={() => setShowRecommend(false)} />}

      <FilterBar filters={filters} onChange={handleFilterChange} />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-baseline justify-between mb-8 border-b border-[var(--border)] pb-3">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted)]">
            Catalogue
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] num-tabular">
            {loading ? "—" : `${total.toLocaleString()} items`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-5 gap-y-10">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-[var(--border)]/50 aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-serif text-2xl mb-2">
              {filters.q ? `"${filters.q}"에 해당하는 결과가 없습니다` : "조건에 맞는 상품이 없습니다"}
            </p>
            {filters.q && (
              <p className="text-xs text-[var(--muted)]">다른 키워드를 시도해 보세요</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-5 gap-y-10">
            {products.map((p) => (
              <ProductCard key={p.item_id} product={p} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-6 mt-16 border-t border-[var(--border)] pt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-xs uppercase tracking-[0.2em] disabled:opacity-20 hover:opacity-60 transition-opacity"
            >
              ← Prev
            </button>
            <span className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] num-tabular">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="text-xs uppercase tracking-[0.2em] disabled:opacity-20 hover:opacity-60 transition-opacity"
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
