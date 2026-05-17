import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// 패션의류·슈즈 제외 (호불호 강함)
const CATEGORY_WEIGHTS: Record<string, Record<string, string[]>> = {
  teen: {
    F: ["뷰티", "여성가방", "여성주얼리", "여성액세서리", "문구/사무", "레저"],
    M: ["레저", "컴퓨터/디지털", "남성액세서리", "문구/사무", "주방/생활"],
  },
  twenties: {
    F: ["뷰티", "여성가방", "여성주얼리", "여성액세서리", "레저", "주방/생활"],
    M: ["레저", "컴퓨터/디지털", "남성가방", "남성액세서리", "주방/생활"],
  },
  thirties: {
    F: ["여성가방", "뷰티", "주방/생활", "가구/인테리어", "여성주얼리", "레저"],
    M: ["주방/생활", "레저", "가구/인테리어", "남성가방", "가전", "컴퓨터/디지털"],
  },
  forties: {
    F: ["주방/생활", "뷰티", "가구/인테리어", "푸드", "여성가방", "레저"],
    M: ["주방/생활", "가구/인테리어", "레저", "가전", "푸드"],
  },
  senior: {
    F: ["주방/생활", "푸드", "가구/인테리어", "뷰티"],
    M: ["주방/생활", "푸드", "가구/인테리어", "가전", "레저"],
  },
};

const PRICE_RANGES: Record<string, [number, number]> = {
  "0-30000":       [0,      30000],
  "30000-50000":   [30000,  50000],
  "50000-100000":  [50000,  100000],
  "100000-200000": [100000, 200000],
  "200000+":       [200000, 99999999],
};

const PRICE_LABELS: Record<string, string> = {
  "0-30000":       "~3만원",
  "30000-50000":   "3~5만원",
  "50000-100000":  "5~10만원",
  "100000-200000": "10~20만원",
  "200000+":       "20만원+",
};

// 상황(occasion) → item_name 매칭 키워드
const OCCASION_KEYWORDS: Record<string, string[]> = {
  birthday:     ["생일", "birthday", "bday"],
  wedding:      ["결혼", "wedding", "신혼"],
  housewarming: ["집들이", "입주", "홈"],
  promotion:    ["승진", "취업", "오피스"],
  graduation:   ["졸업", "입학"],
  holiday:      ["명절", "추석", "설", "선물세트", "기프트"],
  thank:        ["답례", "감사"],
};

// 분위기(mood) → item_name + brand_name 매칭 키워드 / 브랜드
const MOOD_KEYWORDS: Record<string, string[]> = {
  cute:     ["귀여", "뽀짝", "키치", "kitsch", "캐릭터", "오이뮤", "withsome"],
  chic:     ["미니멀", "minimal", "모던", "modern", "시크", "chic", "오브스큐라", "ecru"],
  unique:   ["유니크", "unique", "독특", "한정", "limited", "edition"],
  natural:  ["내추럴", "natural", "리넨", "linen", "우드", "wood", "린넨"],
  warm:     ["따뜻", "코지", "cozy", "포근", "울", "wool"],
  vintage:  ["빈티지", "vintage", "레트로", "retro"],
};

// 관계(relationship) → 카테고리 boost
const RELATIONSHIP_CATEGORIES: Record<string, string[]> = {
  self:      ["뷰티", "여성주얼리", "여성액세서리", "주방/생활"],
  parent:    ["주방/생활", "푸드", "가구/인테리어", "뷰티"],
  partner:   ["여성주얼리", "여성가방", "뷰티", "여성액세서리"],
  friend:    ["주방/생활", "뷰티", "여성액세서리", "문구/사무"],
  colleague: ["주방/생활", "문구/사무", "푸드", "여성액세서리"],
  boss:      ["가구/인테리어", "주방/생활", "푸드"],
  child:     ["문구/사무", "키즈", "여성액세서리"],
  sibling:   ["뷰티", "여성액세서리", "주방/생활"],
};

function buildScoreSql(occasions: string[], moods: string[], baseScoreCol: string = "rarity_score"): { scoreSql: string; params: (string | number)[] } {
  // SQL CASE WHEN 으로 가산점 계산
  const parts: string[] = [baseScoreCol];
  const params: (string | number)[] = [];

  for (const o of occasions) {
    for (const kw of OCCASION_KEYWORDS[o] || []) {
      parts.push("CASE WHEN LOWER(item_name) LIKE ? OR LOWER(search_text) LIKE ? THEN 20 ELSE 0 END");
      params.push(`%${kw.toLowerCase()}%`, `%${kw.toLowerCase()}%`);
    }
  }
  for (const m of moods) {
    for (const kw of MOOD_KEYWORDS[m] || []) {
      parts.push("CASE WHEN LOWER(item_name) LIKE ? OR LOWER(COALESCE(brand_name,'')) LIKE ? THEN 15 ELSE 0 END");
      params.push(`%${kw.toLowerCase()}%`, `%${kw.toLowerCase()}%`);
    }
  }
  return { scoreSql: parts.join(" + "), params };
}

function getAgeGroup(age: number): string {
  if (age < 20) return "teen";
  if (age < 30) return "twenties";
  if (age < 40) return "thirties";
  if (age < 55) return "forties";
  return "senior";
}

interface Row {
  item_id: number;
  rarity_score: number;
  [key: string]: unknown;
}

const COLS = `item_id, item_name, brand_name, brand_name_eng, display_price, original_price,
              sale_rate, is_new_arrival, is_recently_launched, review_score, review_count,
              like_count, large_category_name, middle_category_name, thumbnail_url, product_url,
              text_badges, feed_contexts, rarity_score`;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const age = Math.min(100, Math.max(10, parseInt(searchParams.get("age") || "25", 10)));
  const gender = searchParams.get("gender")?.toUpperCase() === "M" ? "M" : "F";
  const priceRangeKey = searchParams.get("price_range") || "";

  // 선택 옵션 (multi, 빈 배열 가능)
  const occasions = (searchParams.get("occasion") || "").split(",").map(s => s.trim()).filter(Boolean);
  const moods = (searchParams.get("mood") || "").split(",").map(s => s.trim()).filter(Boolean);
  const relationships = (searchParams.get("relationship") || "").split(",").map(s => s.trim()).filter(Boolean);

  const ageGroup = getAgeGroup(age);
  let categories = CATEGORY_WEIGHTS[ageGroup]?.[gender] ?? CATEGORY_WEIGHTS.twenties.F;

  // 관계 입력 시 관련 카테고리 prepend (가중치 ↑)
  if (relationships.length > 0) {
    const boost = new Set<string>();
    for (const r of relationships) {
      for (const c of (RELATIONSHIP_CATEGORIES[r] || [])) boost.add(c);
    }
    categories = [...boost, ...categories.filter(c => !boost.has(c))];
  }

  // 가격 조건 SQL 조각
  const priceRange = PRICE_RANGES[priceRangeKey];
  const priceSql = priceRange
    ? `AND display_price >= ${priceRange[0]} AND display_price <= ${priceRange[1]}`
    : "";

  // 스코어 SQL (선택 옵션이 있으면 가산점 부여)
  const { scoreSql, params: scoreParams } = buildScoreSql(occasions, moods);
  const hasCustomScore = occasions.length > 0 || moods.length > 0;

  const db = getDb();
  const collected: Row[] = [];
  const usedIds = new Set<number>();

  const perCatCounts = [3, 2, 1];
  for (let i = 0; i < Math.min(3, categories.length); i++) {
    const cat = categories[i];
    const need = perCatCounts[i];

    // 옵션 있으면 score 기준 정렬, 없으면 RANDOM() (기존 동작)
    const orderBy = hasCustomScore
      ? `(${scoreSql}) DESC, RANDOM()`
      : `RANDOM()`;

    const pool = db
      .prepare(
        `SELECT ${COLS} FROM items
         WHERE is_sold_out = 0
           AND thumbnail_url IS NOT NULL
           AND display_price > 0
           AND large_category_name = ?
           AND rarity_score > 0
           ${priceSql}
         ORDER BY ${orderBy}
         LIMIT ?`
      )
      .all(...scoreParams, cat, need * 25) as Row[];

    const weighted = pool.map((r) => ({
      ...r,
      _w: Math.random() ** (1 / Math.max(1, r.rarity_score)),
    }));
    weighted.sort((a, b) => b._w - a._w);

    for (const p of weighted.slice(0, need)) {
      if (!usedIds.has(p.item_id)) {
        collected.push(p);
        usedIds.add(p.item_id);
      }
    }
  }

  // 6개 미달 시 보충
  if (collected.length < 6) {
    const need = 6 - collected.length;
    const catIn = categories.map(() => "?").join(",");
    const excl = usedIds.size > 0 ? [...usedIds].map(() => "?").join(",") : "NULL";

    const extras = db
      .prepare(
        `SELECT ${COLS} FROM items
         WHERE rarity_score > 0
           AND is_sold_out = 0
           AND thumbnail_url IS NOT NULL
           AND display_price > 0
           AND large_category_name IN (${catIn})
           AND item_id NOT IN (${excl})
           ${priceSql}
         ORDER BY RANDOM()
         LIMIT ?`
      )
      .all(...categories, ...[...usedIds], need) as Row[];

    collected.push(...extras);
  }

  return Response.json({
    products: collected.sort(() => Math.random() - 0.5),
    age,
    gender,
    ageGroup,
    categories: categories.slice(0, 3),
    priceLabel: PRICE_LABELS[priceRangeKey] || "",
    occasions, moods, relationships,
  });
}
