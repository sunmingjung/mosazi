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
  { value: "F", label: "여성", emoji: "👩" },
  { value: "M", label: "남성", emoji: "👨" },
];

const PRICE_OPTIONS = [
  { value: "", label: "전체", emoji: "🌈" },
  { value: "0-30000", label: "~3만원", emoji: "🌷" },
  { value: "30000-50000", label: "3~5만원", emoji: "🌸" },
  { value: "50000-100000", label: "5~10만원", emoji: "💝" },
  { value: "100000-200000", label: "10~20만원", emoji: "💎" },
  { value: "200000+", label: "20만원+", emoji: "👑" },
];

const OCCASION_OPTIONS = [
  { value: "birthday",     emoji: "🎂", label: "생일" },
  { value: "wedding",      emoji: "💍", label: "결혼" },
  { value: "housewarming", emoji: "🏠", label: "집들이" },
  { value: "promotion",    emoji: "🎉", label: "승진/취업" },
  { value: "graduation",   emoji: "🎓", label: "졸업/입학" },
  { value: "holiday",      emoji: "🌙", label: "명절" },
  { value: "thank",        emoji: "💌", label: "답례" },
];

const MOOD_OPTIONS = [
  { value: "cute",    emoji: "🧸", label: "귀여움" },
  { value: "chic",    emoji: "🖤", label: "시크" },
  { value: "unique",  emoji: "🦄", label: "유니크" },
  { value: "natural", emoji: "🌿", label: "내추럴" },
  { value: "warm",    emoji: "☕", label: "따뜻함" },
  { value: "vintage", emoji: "🌸", label: "빈티지" },
];

const RELATIONSHIP_OPTIONS = [
  { value: "self",      emoji: "✨", label: "본인" },
  { value: "parent",    emoji: "👨‍👩‍👧", label: "부모님" },
  { value: "partner",   emoji: "💕", label: "연인" },
  { value: "friend",    emoji: "🧑‍🤝‍🧑", label: "친구" },
  { value: "colleague", emoji: "💼", label: "동료" },
  { value: "boss",      emoji: "🤝", label: "상사" },
  { value: "child",     emoji: "👶", label: "조카/아이" },
  { value: "sibling",   emoji: "👫", label: "형제자매" },
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
    if (age < 20) return "10대";
    if (age < 30) return "20대";
    if (age < 40) return "30대";
    if (age < 55) return "40대";
    return "50대+";
  };

  const chipCls = (selected: boolean) =>
    `px-3.5 py-1.5 rounded-full text-xs font-rounded transition-all ${
      selected
        ? "bg-grad-strawberry text-white shadow-sm scale-[1.03]"
        : "bg-white text-[var(--muted)] border border-[var(--border)] hover:border-[var(--pink)] hover:text-[var(--pink-deep)]"
    }`;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[var(--ink)]/35 backdrop-blur-md p-0 sm:p-4"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className="bg-[var(--bg)] w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl max-h-[92vh] overflow-y-auto flex flex-col"
        style={{ boxShadow: "0 24px 64px -12px rgba(255, 90, 154, 0.35)" }}
      >
        <div className="sticky top-0 bg-grad-magic z-10 px-7 pt-7 pb-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-pixel text-[10px] text-white/90 mb-2 -rotate-1 inline-block bg-white/15 px-2 py-1 rounded">
                ✦ TRACK 01 · QUICK PICK
              </p>
              <h2 className="font-rounded text-2xl sm:text-3xl text-white leading-tight mt-1 font-bold">
                1초 만에 골라드릴게요
              </h2>
              <p className="font-pixel text-[8px] text-white/70 mt-2">SELECT · INSTANT · DICE</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-xl w-9 h-9 rounded-full hover:bg-white/20 flex items-center justify-center"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="px-7 py-6 space-y-6">
          <section>
            <p className="font-pixel text-[9px] text-[var(--lavender)] mb-2.5">RECIPIENT</p>
            <div className="flex gap-2">
              {GENDER_OPTIONS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGender(g.value as "F" | "M")}
                  className={`flex-1 h-12 rounded-2xl text-sm font-rounded transition-all ${
                    gender === g.value
                      ? "bg-grad-strawberry text-white shadow-sm scale-[1.02]"
                      : "bg-white border-2 border-[var(--border)] text-[var(--muted)] hover:border-[var(--pink)]"
                  }`}
                >
                  {g.emoji} {g.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-baseline justify-between mb-2.5">
              <p className="font-pixel text-[9px] text-[var(--lavender)]">AGE</p>
              <p className="num-tabular">
                <span className="text-grad-strawberry font-bold text-base">{age}</span>
                <span className="font-pixel text-[var(--subtle)] ml-2 text-[8px]">{ageLabel()}</span>
              </p>
            </div>
            <input
              type="range"
              min={10}
              max={70}
              step={1}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full accent-[var(--pink-deep)]"
            />
          </section>

          <section>
            <p className="font-pixel text-[9px] text-[var(--lavender)] mb-2.5">BUDGET</p>
            <div className="grid grid-cols-3 gap-2">
              {PRICE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPriceRange(opt.value)}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-rounded transition-all ${
                    priceRange === opt.value
                      ? "bg-grad-strawberry text-white shadow-sm scale-[1.02]"
                      : "bg-white border-2 border-[var(--border)] text-[var(--muted)] hover:border-[var(--pink)]"
                  }`}
                >
                  <span className="mr-1">{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          <div className="pt-3 border-t-2 border-dotted border-[var(--border)]">
            <p className="font-pixel text-[9px] text-[var(--muted)]">
              OPTIONAL · 채울수록 정교한 추천 [
              {["●","●","●"].map((d, i) => (
                <span key={i} className={i < ((relationship?1:0)+(occasion?1:0)+(mood?1:0)) ? "text-[var(--pink-deep)]" : "text-[var(--border)]"}>{d}</span>
              ))}
              ]
            </p>
          </div>

          <section>
            <p className="font-pixel text-[9px] text-[var(--lavender)] mb-2.5">RELATIONSHIP</p>
            <div className="flex flex-wrap gap-2">
              {RELATIONSHIP_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRelationship(pickOne(relationship, opt.value))}
                  className={chipCls(relationship === opt.value)}
                >
                  {opt.emoji} {opt.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <p className="font-pixel text-[9px] text-[var(--lavender)] mb-2.5">OCCASION</p>
            <div className="flex flex-wrap gap-2">
              {OCCASION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setOccasion(pickOne(occasion, opt.value))}
                  className={chipCls(occasion === opt.value)}
                >
                  {opt.emoji} {opt.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <p className="font-pixel text-[9px] text-[var(--lavender)] mb-2.5">MOOD</p>
            <div className="flex flex-wrap gap-2">
              {MOOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setMood(pickOne(mood, opt.value))}
                  className={chipCls(mood === opt.value)}
                >
                  {opt.emoji} {opt.label}
                </button>
              ))}
            </div>
          </section>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-13 bg-grad-strawberry text-white font-rounded font-bold text-base py-3.5 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50"
            style={{ boxShadow: "0 6px 20px -6px rgba(255, 90, 154, 0.5)" }}
          >
            {loading ? "FINDING..." : "감도 높은 선물 추천받기"}
          </button>
        </div>

        {loading && (
          <div className="px-7 pb-7">
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-[var(--pink-soft)] rounded-3xl aspect-[3/4] animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {result && !loading && (
          <div className="px-7 pb-8">
            <div className="flex items-baseline gap-2 mb-5 pb-3 border-b border-dotted border-[var(--border)] flex-wrap">
              <p className="font-pixel text-[9px] text-[var(--lavender)]">FOR</p>
              <span className="text-sm text-[var(--muted)]">
                <span className="font-bold text-grad-strawberry text-base">
                  {result.age} · {result.gender === "F" ? "여성" : "남성"}
                </span>
                {result.priceLabel && (
                  <span className="ml-1 font-semibold text-[var(--ink)]">· {result.priceLabel}</span>
                )}
              </span>
              <div className="flex gap-1.5 flex-wrap ml-auto">
                {result.categories.map((c) => (
                  <span key={c} className="font-pixel text-[8px] bg-[var(--lavender-soft)] text-[var(--lavender)] px-2 py-1 rounded">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {result.products.map((p) => (
                <ProductCard key={p.item_id} product={p} />
              ))}
            </div>

            <button
              onClick={handleSubmit}
              className="w-full mt-6 py-3 rounded-full bg-white border-2 border-[var(--pink)] text-[var(--pink-deep)] font-rounded font-semibold text-sm hover:bg-[var(--pink-soft)] transition-colors"
            >
              다시 추천받기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
