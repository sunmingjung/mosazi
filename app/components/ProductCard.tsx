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

function formatPrice(price: number | null | undefined, currency: string | null | undefined): string {
  const value = price ?? 0;
  if (currency === "USD") return `$${value.toLocaleString()}`;
  return `${value.toLocaleString()}원`;
}

export default function ProductCard({ product: p }: Props) {
  const editorialCopy = getEditorialCopy(p.feed_contexts);
  const isNew = p.is_new_arrival === 1 || p.is_recently_launched === 1;
  const brandLabel = p.brand_name_eng || p.brand_name || "";

  const href = p.product_url || `https://product.29cm.co.kr/catalog/${p.item_id}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <div className="relative aspect-[4/5] bg-[var(--border)]/40 overflow-hidden mb-5">
        {p.thumbnail_url ? (
          <Image
            src={p.thumbnail_url}
            alt={p.item_name}
            fill
            unoptimized
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--subtle)] text-[10px] uppercase tracking-caps">
            No Image
          </div>
        )}
        {isNew && (
          <span className="absolute top-3 left-3 text-[9px] uppercase tracking-caps bg-[var(--ink)] text-[var(--bg)] px-2 py-1">
            New
          </span>
        )}
        {p.sale_rate && p.sale_rate > 0 ? (
          <span className="absolute top-3 right-3 text-[10px] uppercase tracking-caps text-[var(--ink)] num-tabular">
            −{p.sale_rate}%
          </span>
        ) : null}
      </div>

      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-caps text-[var(--muted)] truncate">
          {brandLabel}
        </p>
        <p className="font-serif text-[14px] leading-[1.45] text-[var(--ink)] line-clamp-2 min-h-[2.9em]">
          {p.item_name}
        </p>

        <div className="flex items-baseline gap-2 pt-1.5 num-tabular">
          <span className="text-[13px] text-[var(--ink)] tracking-tight">
            {formatPrice(p.display_price, p.currency)}
          </span>
          {p.original_price && p.original_price !== p.display_price && (
            <span className="text-[11px] text-[var(--subtle)] line-through">
              {formatPrice(p.original_price, p.currency)}
            </span>
          )}
        </div>

        {editorialCopy && (
          <p className="font-serif italic text-[12px] text-[var(--muted)] line-clamp-2 leading-[1.5] pt-1.5">
            “{editorialCopy}”
          </p>
        )}

        {(p.like_count || p.review_count) ? (
          <div className="flex items-center gap-4 pt-1.5 text-[9px] uppercase tracking-caps text-[var(--subtle)] num-tabular">
            {p.like_count != null && p.like_count > 0 && (
              <span>{p.like_count.toLocaleString()} <span className="text-[var(--subtle)]/70">likes</span></span>
            )}
            {p.review_count != null && p.review_count > 0 && (
              <span>
                {p.review_score} <span className="text-[var(--subtle)]/70">·</span> {p.review_count}
              </span>
            )}
          </div>
        ) : null}
      </div>
    </a>
  );
}
