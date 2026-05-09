"use client";

import Image from "next/image";
import type { ApiProduct } from "../page";

interface FeedContext {
  feed_no: number;
  feed_title: string;
  feed_contents: string;
  feed_type: string;
  link_url: string;
}

function getEditorialCopy(feed_contexts_raw: string | null): string | null {
  if (!feed_contexts_raw) return null;
  try {
    const ctxs: FeedContext[] = JSON.parse(feed_contexts_raw);
    const withTitle = ctxs.find((c) => c.feed_title && c.feed_contents);
    if (withTitle) return withTitle.feed_contents;
    const withAny = ctxs.find((c) => c.feed_title);
    if (withAny) return withAny.feed_title;
  } catch {
    // ignore
  }
  return null;
}

interface Props {
  product: ApiProduct;
}

export default function ProductCard({ product: p }: Props) {
  const editorialCopy = getEditorialCopy(p.feed_contexts);
  const isNew = p.is_new_arrival === 1 || p.is_recently_launched === 1;

  const href = p.product_url || `https://product.29cm.co.kr/catalog/${p.item_id}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Thumbnail */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {p.thumbnail_url ? (
          <Image
            src={p.thumbnail_url}
            alt={p.item_name}
            fill
            unoptimized
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
            🖼
          </div>
        )}
        {isNew && (
          <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            NEW
          </span>
        )}
        {p.sale_rate && p.sale_rate > 0 ? (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            {p.sale_rate}%
          </span>
        ) : null}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs text-gray-400 mb-0.5 truncate">
          {p.brand_name_eng || p.brand_name || ""}
        </p>
        <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug mb-2">
          {p.item_name}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="text-base font-bold text-gray-900">
            {(p.display_price ?? 0).toLocaleString()}원
          </span>
          {p.original_price && p.original_price !== p.display_price && (
            <span className="text-xs text-gray-400 line-through">
              {p.original_price.toLocaleString()}원
            </span>
          )}
        </div>

        {/* Editorial copy from feed */}
        {editorialCopy && (
          <p className="text-[11px] text-indigo-600 bg-indigo-50 rounded-md px-2 py-1 line-clamp-2 mb-2 leading-snug">
            {editorialCopy}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-2 text-[11px] text-gray-400">
          {p.like_count != null && p.like_count > 0 && (
            <span>♥ {p.like_count.toLocaleString()}</span>
          )}
          {p.review_count != null && p.review_count > 0 && (
            <span>
              ★ {p.review_score} ({p.review_count})
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
