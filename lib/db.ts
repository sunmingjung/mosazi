import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    const cwd = process.cwd();
    const candidates = [
      path.join(cwd, "products_db.sqlite"),
      path.join(cwd, ".next/server/products_db.sqlite"),
      path.join(__dirname, "..", "products_db.sqlite"),
      path.join(__dirname, "products_db.sqlite"),
      "/var/task/products_db.sqlite",
      "/var/task/web/products_db.sqlite",
    ];
    let found: string | null = null;
    for (const p of candidates) {
      try {
        if (fs.existsSync(p)) { found = p; break; }
      } catch {}
    }
    if (!found) {
      const cwdContents = fs.readdirSync(cwd).slice(0, 30).join(", ");
      throw new Error(`DB not found. cwd=${cwd} contents=[${cwdContents}] candidates_tried=${candidates.join("|")}`);
    }
    _db = new Database(found, { readonly: true });
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
