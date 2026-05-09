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
  { value: "", label: "상관없음", sub: "전체 가격대" },
  { value: "0-30000", label: "~3만원", sub: "가벼운 선물" },
  { value: "30000-50000", label: "3~5만원", sub: "무난한 선물" },
  { value: "50000-100000", label: "5~10만원", sub: "제법 특별한" },
  { value: "100000-200000", label: "10~20만원", sub: "진심 담은" },
  { value: "200000+", label: "20만원+", sub: "럭셔리" },
];

export default function RecommendModal({ onClose }: Props) {
  const [age, setAge] = useState(28);
  const [gender, setGender] = useState<"F" | "M">("F");
  const [priceRange, setPriceRange] = useState("");
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

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl max-h-[92vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">🎲 선물 추천받기</h2>
              <p className="text-sm text-gray-500 mt-0.5">받는 분 정보만 입력하면 감도 높은 선물을 골라드려요</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 text-2xl leading-none w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-6">
          {/* 성별 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">선물 받을 분</label>
            <div className="flex gap-3">
              {GENDER_OPTIONS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGender(g.value as "F" | "M")}
                  className={`flex-1 h-12 rounded-xl border-2 text-sm font-medium transition-all ${
                    gender === g.value
                      ? "border-black bg-black text-white"
                      : "border-gray-200 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {g.emoji} {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* 나이 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              나이{" "}
              <span className="text-black font-bold">{age}세</span>{" "}
              <span className="text-gray-400 font-normal">({ageLabel()})</span>
            </label>
            <input
              type="range"
              min={10}
              max={70}
              step={1}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full accent-black"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>10세</span>
              <span>20</span>
              <span>30</span>
              <span>40</span>
              <span>50</span>
              <span>70세</span>
            </div>
          </div>

          {/* 가격대 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">예산</label>
            <div className="grid grid-cols-3 gap-2">
              {PRICE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPriceRange(opt.value)}
                  className={`py-2.5 px-3 rounded-xl border-2 text-left transition-all ${
                    priceRange === opt.value
                      ? "border-black bg-black text-white"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <div className="text-sm font-semibold">{opt.label}</div>
                  <div className={`text-[11px] mt-0.5 ${priceRange === opt.value ? "text-gray-300" : "text-gray-400"}`}>
                    {opt.sub}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-12 rounded-xl bg-black text-white font-semibold text-base hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? "추천 중..." : "✨ 감도 높은 선물 추천받기"}
          </button>
        </div>

        {/* Results */}
        {loading && (
          <div className="px-6 pb-6">
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl aspect-[3/4] animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {result && !loading && (
          <div className="px-6 pb-8">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-sm text-gray-500">
                <span className="font-semibold text-black">
                  {result.age}세 {result.gender === "F" ? "여성"  : "남성"}
                </span>
                {result.priceLabel && (
                  <span className="ml-1 text-black font-semibold">· {result.priceLabel}</span>
                )}
                을 위한
              </span>
              <div className="flex gap-1 flex-wrap">
                {result.categories.map((c) => (
                  <span key={c} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
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
              className="w-full mt-5 h-11 rounded-xl border-2 border-black text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              🔄 다시 추천받기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
