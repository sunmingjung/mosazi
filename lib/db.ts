import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

let _db: Database.Database | null = null;

function findDb(): string {
  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, "products_db.sqlite"),
    path.join("/var/task", "products_db.sqlite"),
    path.join("/var/task/web", "products_db.sqlite"),
    path.join(__dirname, "..", "products_db.sqlite"),
    path.join(__dirname, "..", "..", "products_db.sqlite"),
  ];
  for (const p of candidates) {
    try { if (fs.existsSync(p)) return p; } catch {}
  }
  // 마지막 수단: cwd 안에서 재귀 탐색 (얕은 깊이)
  const found = walkFind(cwd, "products_db.sqlite", 3);
  if (found) return found;
  const cwdList = (() => { try { return fs.readdirSync(cwd).slice(0, 40).join(","); } catch (e) { return String(e); } })();
  throw new Error(`DB_NOT_FOUND cwd=${cwd} list=[${cwdList}] tried=${candidates.join("|")}`);
}

function walkFind(dir: string, name: string, depth: number): string | null {
  if (depth < 0) return null;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isFile() && e.name === name) return full;
    }
    for (const e of entries) {
      if (e.isDirectory() && !e.name.startsWith(".") && e.name !== "node_modules") {
        const r = walkFind(path.join(dir, e.name), name, depth - 1);
        if (r) return r;
      }
    }
  } catch {}
  return null;
}

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(findDb(), { readonly: true });
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
