import Database from "better-sqlite3";
import path from "path";

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    const dbPath = path.join(process.cwd(), "products_db.sqlite");
    _db = new Database(dbPath, { readonly: true });
  }
  return _db;
}

export interface Product {
  item_id: number;
  item_name: string;
  brand_id: number | null;
  brand_name: string | null;
  brand_name_eng: string | null;
  original_price: number | null;
  display_price: number | null;
  sale_rate: number | null;
  is_sold_out: number;
  is_new_arrival: number;
  is_recently_launched: number;
  review_score: number | null;
  review_count: number | null;
  like_count: number | null;
  large_category_name: string | null;
  middle_category_name: string | null;
  small_category_name: string | null;
  thumbnail_url: string | null;
  product_url: string | null;
  badge_types: string | null;
  text_badges: string | null;
  feed_contexts: string | null;
}
