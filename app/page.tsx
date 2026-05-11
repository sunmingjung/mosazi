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
  sort: "rarity",
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight shrink-0">🎁 Mosazi</h1>
          {/* 검색바 */}
          <div className="flex-1 max-w-md relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="기타, 캔들, 키링, 도자기..."
              className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-all"
            />
            {searchInput && (
              <button
                onClick={() => { setSearchInput(""); handleSearchChange(""); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
          <button
            onClick={() => setShowRecommend(true)}
            className="ml-auto shrink-0 bg-black text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-800 active:scale-[0.97] transition-all"
          >
            🎲 추천받기
          </button>
        </div>
      </header>

      {showRecommend && <RecommendModal onClose={() => setShowRecommend(false)} />}

      <FilterBar filters={filters} onChange={handleFilterChange} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-medium text-gray-700">
            {loading ? "로딩 중..." : `총 ${total.toLocaleString()}개`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <p className="text-4xl mb-3">{filters.q ? "🔍" : "😶"}</p>
            <p>{filters.q ? `"${filters.q}" 검색 결과가 없어요` : "조건에 맞는 상품이 없어요"}</p>
            {filters.q && (
              <p className="text-xs mt-1">다른 키워드로 검색해보세요 (예: guitar, 향수, keychain)</p>
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
          <div className="flex justify-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border text-sm disabled:opacity-30 hover:bg-gray-100"
            >
              이전
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg border text-sm disabled:opacity-30 hover:bg-gray-100"
            >
              다음
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
