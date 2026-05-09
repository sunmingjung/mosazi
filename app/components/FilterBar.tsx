"use client";

import type { Filters } from "../page";

const CATEGORIES = [
  "여성의류",
  "여성가방",
  "여성주얼리",
  "여성액세서리",
  "여성슈즈",
  "남성의류",
  "남성가방",
  "남성액세서리",
  "남성슈즈",
  "뷰티",
  "주방/생활",
  "가구/인테리어",
  "문구/사무",
  "레저",
  "컴퓨터/디지털",
  "가전",
  "푸드",
  "키즈",
];

const PRICE_RANGES = [
  { label: "전체 가격", value: "" },
  { label: "~3만원", value: "0-30000" },
  { label: "3~5만원", value: "30000-50000" },
  { label: "5~10만원", value: "50000-100000" },
  { label: "10~20만원", value: "100000-200000" },
  { label: "20만원+", value: "200000+" },
];

const SORT_OPTIONS = [
  { label: "✦ 감도 순", value: "rarity" },
  { label: "신상품 우선", value: "new" },
  { label: "좋아요 순", value: "like_count" },
  { label: "리뷰 순", value: "review_count" },
  { label: "낮은 가격순", value: "price_asc" },
  { label: "높은 가격순", value: "price_desc" },
];

interface Props {
  filters: Filters;
  onChange: (next: Partial<Filters>) => void;
}

export default function FilterBar({ filters, onChange }: Props) {
  return (
    <div className="bg-white border-b border-gray-100 sticky top-[57px] z-10">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
        {/* Category */}
        <select
          value={filters.category}
          onChange={(e) => onChange({ category: e.target.value })}
          className="h-9 rounded-lg border border-gray-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
        >
          <option value="">전체 카테고리</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Price Range */}
        <select
          value={filters.price_range}
          onChange={(e) => onChange({ price_range: e.target.value })}
          className="h-9 rounded-lg border border-gray-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
        >
          {PRICE_RANGES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={filters.sort}
          onChange={(e) => onChange({ sort: e.target.value })}
          className="h-9 rounded-lg border border-gray-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {/* New Only Toggle */}
        <button
          onClick={() => onChange({ new_only: !filters.new_only })}
          className={`h-9 px-4 rounded-lg text-sm font-medium border transition-colors ${
            filters.new_only
              ? "bg-black text-white border-black"
              : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
          }`}
        >
          ✨ 신상품만
        </button>
      </div>
    </div>
  );
}
