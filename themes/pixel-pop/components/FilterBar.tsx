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
  { label: "새로 들어온 순", value: "first_seen" },
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
  "h-9 rounded-full border-2 border-[var(--border)] bg-white/80 px-4 pr-8 text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--lavender)] cursor-pointer appearance-none transition-colors font-rounded";

export default function FilterBar({ filters, onChange }: Props) {
  return (
    <div className="bg-white/50 backdrop-blur-sm border-b border-[var(--border)] sticky top-[var(--header-h,124px)] z-10">
      <div className="max-w-7xl mx-auto px-5 py-3 flex flex-wrap items-center gap-2">
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
          className={`h-9 px-4 rounded-full text-sm font-rounded border-2 transition-all ${
            filters.new_only
              ? "bg-[var(--lavender-deep)] text-white border-transparent shadow-sm"
              : "bg-white/80 text-[var(--muted)] border-[var(--border)] hover:border-[var(--lavender)] hover:text-[var(--lavender-deep)]"
          }`}
        >
          신상품만
        </button>
      </div>
    </div>
  );
}
