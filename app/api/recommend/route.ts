import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// 패션의류(여성의류/남성의류/슈즈)는 호불호가 강해 제외.
// 레저(런닝복·스포츠웨어 포함), 가방·액세서리·주얼리는 유지.
const CATEGORY_WEIGHTS: Record<string, Record<string, string[]>> = {
  teen: {
    F: ["뷰티", "여성가방", "여성주얼리", "여성액세서리", "레저"],
    M: ["레저", "컴퓨터/디지털", "남성액세서리", "주방/생활"],
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

  const ageGroup = getAgeGroup(age);
  const categories = CATEGORY_WEIGHTS[ageGroup]?.[gender] ?? CATEGORY_WEIGHTS.twenties.F;

  // 가격 조건 SQL 조각
  const priceRange = PRICE_RANGES[priceRangeKey];
  const priceSql = priceRange
    ? `AND display_price >= ${priceRange[0]} AND display_price <= ${priceRange[1]}`
    : "";

  const db = getDb();
  const collected: Row[] = [];
  const usedIds = new Set<number>();

  const perCatCounts = [3, 2, 1];
  for (let i = 0; i < Math.min(3, categories.length); i++) {
    const cat = categories[i];
    const need = perCatCounts[i];

    // RANDOM() 으로 다양한 pool 구성 → 사이트 편향 없음
    // weighted random으로 rarity 높은 상품을 자연스럽게 우선 선발
    const pool = db
      .prepare(
        `SELECT ${COLS} FROM products
         WHERE is_sold_out = 0
           AND thumbnail_url IS NOT NULL
           AND display_price > 0
           AND large_category_name = ?
           AND rarity_score > 0
           ${priceSql}
         ORDER BY RANDOM()
         LIMIT ?`
      )
      .all(cat, need * 25) as Row[];

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
        `SELECT ${COLS} FROM products
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
  });
}
