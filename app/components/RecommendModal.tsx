"use client";

import { useState, useEffect, useRef } from "react";
import ProductCard from "./ProductCard";
import type { ApiProduct } from "../page";

interface RecommendResult {
  products: ApiProduct[];
  age: number;
  gender: string;
  categories: string[];
  priceLabel: string;
}

interface Props {
  onClose: () => void;
}

const GENDER_OPTIONS = [
  { value: "F", label: "여성" },
  { value: "M", label: "남성" },
];

const PRICE_OPTIONS = [
  { value: "", label: "전체" },
  { value: "0-30000", label: "~3만원" },
  { value: "30000-50000", label: "3~5만원" },
  { value: "50000-100000", label: "5~10만원" },
  { value: "100000-200000", label: "10~20만원" },
  { value: "200000+", label: "20만원+" },
];

const OCCASION_OPTIONS = [
  { value: "birthday",     label: "생일" },
  { value: "wedding",      label: "결혼" },
  { value: "housewarming", label: "집들이" },
  { value: "promotion",    label: "승진·취업" },
  { value: "graduation",   label: "졸업·입학" },
  { value: "holiday",      label: "명절" },
  { value: "thank",        label: "답례" },
];

const MOOD_OPTIONS = [
  { value: "cute",    label: "귀여움" },
  { value: "chic",    label: "시크·모던" },
  { value: "unique",  label: "유니크" },
  { value: "natural", label: "내추럴" },
  { value: "warm",    label: "따뜻함" },
  { value: "vintage", label: "빈티지" },
];

const RELATIONSHIP_OPTIONS = [
  { value: "self",      label: "본인" },
  { value: "parent",    label: "부모님" },
  { value: "partner",   label: "연인" },
  { value: "friend",    label: "친구" },
  { value: "colleague", label: "동료" },
  { value: "boss",      label: "상사" },
  { value: "child",     label: "조카·아이" },
  { value: "sibling",   label: "형제자매" },
];

function pickOne(current: string, v: string): string {
  return current === v ? "" : v;
}

export default function RecommendModal({ onClose }: Props) {
  const [age, setAge] = useState(28);
  const [gender, setGender] = useState<"F" | "M">("F");
  const [priceRange, setPriceRange] = useState("");
  const [occasion, setOccasion] = useState("");
  const [mood, setMood] = useState("");
  const [relationship, setRelationship] = useState("");
  const [result, setResult] = useState<RecommendResult | null>(null);
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleSubmit() {
    setLoading(true);
    setResult(null);
    const params = new URLSearchParams({ age: String(age), gender });
    if (priceRange) params.set("price_range", priceRange);
    if (occasion) params.set("occasion", occasion);
    if (mood) params.set("mood", mood);
    if (relationship) params.set("relationship", relationship);
    const res = await fetch(`/api/recommend?${params}`);
    const data: RecommendResult = await res.json();
    setResult(data);
    setLoading(false);
  }

  const ageLabel = () => {
    if (age < 20) return "10s";
    if (age < 30) return "20s";
    if (age < 40) return "30s";
    if (age < 55) return "40s";
    return "50s+";
  };

  const chipCls = (selected: boolean) =>
    `px-3.5 py-1.5 rounded-none text-xs border transition-colors ${
      selected
        ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]"
        : "rule-hairline text-[var(--muted)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
    }`;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[var(--ink)]/30 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className="bg-[var(--bg)] w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto flex flex-col border rule-hairline">
        <div className="sticky top-0 bg-[var(--bg)] z-10 px-10 pt-10 pb-6 border-b rule-hairline">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-caps text-[var(--muted)] mb-3">
                Track 01 <span className="text-[var(--subtle)] mx-1.5">·</span> Quick Curation
              </p>
              <h2 className="font-serif text-[32px] sm:text-[40px] leading-[1.05] tracking-display-tight italic">
                1초 만에<br />골라드릴게요
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-[var(--muted)] hover:text-[var(--ink)] text-xl leading-none w-8 h-8 flex items-center justify-center"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="px-8 py-7 space-y-8">
          <section>
            <p className="text-[10px] uppercase tracking-caps text-[var(--muted)] mb-3">
              Gender
            </p>
            <div className="flex gap-2">
              {GENDER_OPTIONS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGender(g.value as "F" | "M")}
                  className={`flex-1 h-11 border text-sm transition-colors ${
                    gender === g.value
                      ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]"
                      : "rule-hairline text-[var(--muted)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-baseline justify-between mb-3">
              <p className="text-[10px] uppercase tracking-caps text-[var(--muted)]">Age</p>
              <p className="text-sm num-tabular">
                <span className="text-[var(--ink)]">{age}</span>
                <span className="text-[var(--subtle)] ml-2 text-[10px] uppercase tracking-caps">{ageLabel()}</span>
              </p>
            </div>
            <input
              type="range"
              min={10}
              max={70}
              step={1}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full accent-[var(--ink)]"
            />
            <div className="flex justify-between text-[10px] text-[var(--subtle)] mt-1 num-tabular">
              <span>10</span><span>20</span><span>30</span><span>40</span><span>50</span><span>70</span>
            </div>
          </section>

          <section>
            <p className="text-[10px] uppercase tracking-caps text-[var(--muted)] mb-3">Budget</p>
            <div className="grid grid-cols-3 gap-2">
              {PRICE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPriceRange(opt.value)}
                  className={`py-2.5 px-3 border text-xs transition-colors ${
                    priceRange === opt.value
                      ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]"
                      : "rule-hairline text-[var(--muted)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          <div className="pt-4 border-t rule-hairline">
            <p className="text-[10px] uppercase tracking-caps text-[var(--muted)]">
              Optional · 채울수록 정교한 추천
              <span className="ml-2 text-[var(--ink)] num-tabular">
                {(relationship ? 1 : 0) + (occasion ? 1 : 0) + (mood ? 1 : 0)}/3
              </span>
            </p>
          </div>

          <section>
            <p className="text-[10px] uppercase tracking-caps text-[var(--muted)] mb-3">Relationship</p>
            <div className="flex flex-wrap gap-2">
              {RELATIONSHIP_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRelationship(pickOne(relationship, opt.value))}
                  className={chipCls(relationship === opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <p className="text-[10px] uppercase tracking-caps text-[var(--muted)] mb-3">Occasion</p>
            <div className="flex flex-wrap gap-2">
              {OCCASION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setOccasion(pickOne(occasion, opt.value))}
                  className={chipCls(occasion === opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <p className="text-[10px] uppercase tracking-caps text-[var(--muted)] mb-3">Mood</p>
            <div className="flex flex-wrap gap-2">
              {MOOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setMood(pickOne(mood, opt.value))}
                  className={chipCls(mood === opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-12 bg-[var(--ink)] text-[var(--bg)] text-xs uppercase tracking-caps hover:opacity-80 transition-opacity disabled:opacity-40"
          >
            {loading ? "Curating..." : "추천 받기"}
          </button>
        </div>

        {loading && (
          <div className="px-8 pb-8">
            <div className="grid grid-cols-2 gap-x-5 gap-y-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-[var(--border)]/40 aspect-[4/5] animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {result && !loading && (
          <div className="px-8 pb-10">
            <div className="flex items-baseline gap-3 mb-6 pb-3 border-b rule-hairline flex-wrap">
              <p className="text-[10px] uppercase tracking-caps text-[var(--muted)]">For</p>
              <p className="text-sm num-tabular">
                {result.age}, {result.gender === "F" ? "여성" : "남성"}
                {result.priceLabel && <span className="text-[var(--muted)]"> · {result.priceLabel}</span>}
              </p>
              {result.categories.length > 0 && (
                <div className="flex gap-2 flex-wrap ml-auto">
                  {result.categories.map((c) => (
                    <span key={c} className="text-[10px] uppercase tracking-caps text-[var(--muted)]">
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-x-5 gap-y-10">
              {result.products.map((p) => (
                <ProductCard key={p.item_id} product={p} />
              ))}
            </div>

            <button
              onClick={handleSubmit}
              className="w-full mt-8 h-11 border border-[var(--ink)] text-xs uppercase tracking-caps hover:bg-[var(--ink)] hover:text-[var(--bg)] transition-colors"
            >
              다시 추천받기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
