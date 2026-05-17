"use client";

import type { Filters } from "../page";

const CATEGORIES = [
  "향/프래그런스",
  "세라믹/식기",
  "리빙/홈데코",
  "문구/아트",
  "패션/의류",
  "뷰티",
  "식품/음료",
  "편집샵",
  "액세서리",
  "패브릭/텍스타일",
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
  { label: "DB 입력순", value: "first_seen" },
  { label: "감도 순", value: "rarity" },
  { label: "신상품 순", value: "new" },
  { label: "좋아요 순", value: "like_count" },
  { label: "리뷰 순", value: "review_count" },
  { label: "낮은 가격순", value: "price_asc" },
  { label: "높은 가격순", value: "price_desc" },
];

interface Props {
  filters: Filters;
  onChange: (next: Partial<Filters>) => void;
}

const selectCls =
  "h-8 rounded-none border-0 border-b border-[var(--border)] bg-transparent px-0 pr-6 text-xs uppercase tracking-[0.15em] text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] cursor-pointer appearance-none";

export default function FilterBar({ filters, onChange }: Props) {
  return (
    <div className="bg-[var(--bg)] border-b border-[var(--border)] sticky top-[var(--header-h,120px)] z-10">
      <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center gap-x-8 gap-y-2">
        <select
          value={filters.category}
          onChange={(e) => onChange({ category: e.target.value })}
          className={selectCls}
        >
          <option value="">전체 카테고리</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={filters.price_range}
          onChange={(e) => onChange({ price_range: e.target.value })}
          className={selectCls}
        >
          {PRICE_RANGES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        <select
          value={filters.sort}
          onChange={(e) => onChange({ sort: e.target.value })}
          className={selectCls}
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <button
          onClick={() => onChange({ new_only: !filters.new_only })}
          className={`text-[10px] uppercase tracking-[0.2em] pb-0.5 border-b transition-colors ${
            filters.new_only
              ? "border-[var(--ink)] text-[var(--ink)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          New Arrivals
        </button>
      </div>
    </div>
  );
}
