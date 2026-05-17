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
  "h-9 rounded-none border-0 bg-transparent pl-0 pr-5 text-[11px] uppercase tracking-caps text-[var(--ink)] focus:outline-none cursor-pointer appearance-none hover:text-[var(--muted)] transition-colors";

function SelectField({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative inline-flex items-center border-b rule-hairline hover:border-[var(--ink)] transition-colors">
      {children}
      <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[9px] text-[var(--muted)]">▾</span>
    </div>
  );
}

export default function FilterBar({ filters, onChange }: Props) {
  return (
    <div className="bg-[var(--bg)]/90 backdrop-blur-md border-b rule-hairline sticky top-[var(--header-h,120px)] z-10">
      <div className="max-w-[1400px] mx-auto px-8 sm:px-12 py-3 flex flex-wrap items-center gap-x-8 gap-y-2">
        <SelectField>
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
        </SelectField>

        <SelectField>
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
        </SelectField>

        <SelectField>
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
        </SelectField>

        <button
          onClick={() => onChange({ new_only: !filters.new_only })}
          className={`ml-auto text-[10px] uppercase tracking-caps pb-0.5 border-b transition-colors ${
            filters.new_only
              ? "border-[var(--ink)] text-[var(--ink)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          New Arrivals Only
        </button>
      </div>
    </div>
  );
}
