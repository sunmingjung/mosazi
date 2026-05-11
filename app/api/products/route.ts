import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

const PRICE_RANGES: Record<string, [number, number]> = {
  "0-30000": [0, 30000],
  "30000-50000": [30000, 50000],
  "50000-100000": [50000, 100000],
  "100000-200000": [100000, 200000],
  "200000+": [200000, 99999999],
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const category = searchParams.get("category") || "";
  const priceRange = searchParams.get("price_range") || "";
  const newOnly = searchParams.get("new_only") === "1";
  const sort = searchParams.get("sort") || "rarity";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = 48;
  const query = (searchParams.get("q") || "").trim();

  const conditions: string[] = [
    "is_sold_out = 0",
    "thumbnail_url IS NOT NULL",
    // KRW 는 5000원 이상, USD 는 5달러 이상 (≒ 7000원)
    "((COALESCE(currency, 'KRW') = 'KRW' AND display_price >= 5000) OR (currency = 'USD' AND display_price >= 5))",
    "shop_category IS NOT NULL",
  ];
  const params: (string | number)[] = [];

  // 검색 동의어: 사용자가 검색하는 단어 → 카테고리 + 아이템명 키워드로 확장
  // 예: "인테리어" 검색 → shop_category="리빙/홈데코" OR item_name 에 시계/꽃병/조명 등 포함
  const SEARCH_SYNONYMS: Record<string, { categories: string[]; keywords: string[] }> = {
    "인테리어":  { categories: ["리빙/홈데코"], keywords: ["오브제", "조명", "시계", "꽃병", "화병", "텀블러", "보틀", "쿠션", "데코", "포스터"] },
    "리빙":      { categories: ["리빙/홈데코"], keywords: ["오브제", "조명"] },
    "홈데코":    { categories: ["리빙/홈데코"], keywords: ["오브제", "데코"] },
    "주방":      { categories: ["세라믹/식기"], keywords: ["주방", "그릇", "머그", "컵", "접시"] },
    "식기":      { categories: ["세라믹/식기"], keywords: ["그릇", "머그", "컵", "접시", "도자"] },
    "향":        { categories: ["향/프래그런스"], keywords: ["향수", "캔들", "디퓨저", "인센스"] },
    "향수":      { categories: ["향/프래그런스"], keywords: ["향수", "퍼퓸"] },
    "캔들":      { categories: ["향/프래그런스"], keywords: ["캔들", "candle"] },
    "문구":      { categories: ["문구/아트"],     keywords: ["노트", "엽서", "포스터", "스티커"] },
    "패션":      { categories: ["패션/의류"],     keywords: ["슈즈", "신발"] },
    "액세서리":  { categories: ["액세서리"],      keywords: ["귀걸이", "목걸이", "반지", "가방"] },
    "주얼리":    { categories: ["액세서리"],      keywords: ["귀걸이", "목걸이", "반지", "팔찌", "주얼리"] },
    "가방":      { categories: ["액세서리"],      keywords: ["가방", "백", "파우치"] },
    "패브릭":    { categories: ["패브릭/텍스타일"], keywords: ["쿠션", "담요", "러그"] },
    "뷰티":      { categories: ["뷰티"],          keywords: ["스킨", "세럼", "립밤"] },
    "식품":      { categories: ["식품/음료"],     keywords: ["원두", "차", "초콜릿"] },
    "음료":      { categories: ["식품/음료"],     keywords: ["원두", "차"] },
    "선물":      { categories: [], keywords: ["선물", "기프트", "gift"] },
  };

  // 키워드 검색: 공백 구분 각 토큰을 AND로 검색 (각 토큰은 동의어 OR 그룹)
  if (query) {
    const tokens = query.split(/\s+/).filter(Boolean).slice(0, 5);
    for (const token of tokens) {
      const lower = token.toLowerCase();
      const syn = SEARCH_SYNONYMS[lower];
      if (syn) {
        const clauses: string[] = [];
        for (const cat of syn.categories) {
          clauses.push("shop_category = ?");
          params.push(cat);
        }
        for (const kw of syn.keywords) {
          clauses.push("search_text LIKE ?");
          params.push(`%${kw.toLowerCase()}%`);
        }
        // 원래 토큰도 fallback으로 포함
        clauses.push("search_text LIKE ?");
        params.push(`%${lower}%`);
        conditions.push(`(${clauses.join(" OR ")})`);
      } else {
        conditions.push("search_text LIKE ?");
        params.push(`%${lower}%`);
      }
    }
  }

  if (category) {
    conditions.push("shop_category = ?");
    params.push(category);
  }

  if (priceRange && PRICE_RANGES[priceRange]) {
    const [min, max] = PRICE_RANGES[priceRange];
    conditions.push("display_price >= ? AND display_price <= ?");
    params.push(min, max);
  }

  if (newOnly) {
    conditions.push("(is_new_arrival = 1 OR is_recently_launched = 1)");
  }

  const where = `WHERE ${conditions.join(" AND ")}`;

  const orderMap: Record<string, string> = {
    rarity:      "rarity_score DESC, is_new_arrival DESC, like_count DESC NULLS LAST",
    like_count:  "like_count DESC NULLS LAST",
    review_count:"review_count DESC NULLS LAST",
    price_asc:   "display_price ASC",
    price_desc:  "display_price DESC",
    new:         "(is_new_arrival + is_recently_launched) DESC, rarity_score DESC",
  };
  // 검색 중에는 기본 정렬을 rarity 기준으로 (like_count NULLS LAST로 외부상품 밀리지 않게)
  const defaultOrder = query
    ? "like_count DESC NULLS LAST, rarity_score DESC"
    : orderMap.rarity;
  const order = orderMap[sort] ?? defaultOrder;

  let db;
  try { db = getDb(); } catch (e) {
    return Response.json({ error: "db_init", detail: String(e).slice(0, 2000) }, { status: 500 });
  }
  const total = (
    db.prepare(`SELECT COUNT(*) as cnt FROM items ${where}`).get(...params) as { cnt: number }
  ).cnt;

  const products = db
    .prepare(
      `SELECT item_id, item_name, brand_name, brand_name_eng, display_price, original_price,
              sale_rate, is_new_arrival, is_recently_launched, review_score, review_count,
              like_count, large_category_name, middle_category_name, thumbnail_url, product_url,
              text_badges, feed_contexts, rarity_score, COALESCE(currency, 'KRW') as currency
       FROM items ${where}
       ORDER BY ${order}
       LIMIT ? OFFSET ?`
    )
    .all(...params, pageSize, (page - 1) * pageSize);

  return Response.json({
    products,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
