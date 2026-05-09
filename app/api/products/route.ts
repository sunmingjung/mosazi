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

  const EXCLUDED = ["여성의류", "남성의류", "여성슈즈", "남성슈즈"];
  const conditions: string[] = [
    "is_sold_out = 0",
    "thumbnail_url IS NOT NULL",
    "display_price > 0",
    `large_category_name NOT IN (${EXCLUDED.map(() => "?").join(",")})`,
  ];
  const params: (string | number)[] = [...EXCLUDED];

  if (category) {
    conditions.push("large_category_name = ?");
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
  const order = orderMap[sort] ?? orderMap.rarity;

  const db = getDb();
  const total = (
    db.prepare(`SELECT COUNT(*) as cnt FROM products ${where}`).get(...params) as { cnt: number }
  ).cnt;

  const products = db
    .prepare(
      `SELECT item_id, item_name, brand_name, brand_name_eng, display_price, original_price,
              sale_rate, is_new_arrival, is_recently_launched, review_score, review_count,
              like_count, large_category_name, middle_category_name, thumbnail_url, product_url,
              text_badges, feed_contexts, rarity_score
       FROM products ${where}
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
