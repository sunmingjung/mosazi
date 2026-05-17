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
      className="group block bg-white rounded-3xl overflow-hidden transition-all hover:-translate-y-1"
      style={{ boxShadow: "0 4px 16px -6px rgba(155, 134, 224, 0.25), 0 2px 6px -2px rgba(167, 150, 255, 0.15)" }}
    >
      <div className="relative aspect-square bg-[var(--lavender-soft)] overflow-hidden">
        {p.thumbnail_url ? (
          <Image
            src={p.thumbnail_url}
            alt={p.item_name}
            fill
            unoptimized
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-[1.06] transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--subtle)] font-pixel text-[10px]">
            NO IMAGE
          </div>
        )}
        {isNew && (
          <span className="absolute top-2.5 left-2.5 font-pixel text-[8px] bg-grad-strawberry text-white px-2 py-1 rounded -rotate-3" style={{ boxShadow: "0 3px 8px -2px rgba(255, 90, 154, 0.45)" }}>
            ★ NEW
          </span>
        )}
        {p.sale_rate && p.sale_rate > 0 ? (
          <span className="absolute top-2.5 right-2.5 font-pixel text-[8px] bg-white/95 backdrop-blur text-[var(--pink-deep)] px-2 py-1 rounded num-tabular rotate-3 border border-[var(--pink)]">
            -{p.sale_rate}%
          </span>
        ) : null}
      </div>

      <div className="p-3.5 space-y-1.5">
        <p className="font-pixel text-[8px] text-[var(--lavender)] truncate">
          {brandLabel}
        </p>
        <p className="text-[13px] leading-snug text-[var(--ink)] line-clamp-2 min-h-[2.4em]">
          {p.item_name}
        </p>

        <div className="flex items-baseline gap-2 pt-1 num-tabular">
          <span className="text-sm font-bold text-[var(--ink)]">
            {formatPrice(p.display_price, p.currency)}
          </span>
          {p.original_price && p.original_price !== p.display_price && (
            <span className="text-[11px] text-[var(--subtle)] line-through">
              {formatPrice(p.original_price, p.currency)}
            </span>
          )}
        </div>

        {editorialCopy && (
          <p className="text-[11px] text-[var(--muted)] line-clamp-2 leading-snug italic font-rounded">
            “{editorialCopy}”
          </p>
        )}

        <div className="flex items-center gap-3 pt-1 font-pixel text-[8px] text-[var(--subtle)] num-tabular">
          {p.like_count != null && p.like_count > 0 && (
            <span>♥ {p.like_count.toLocaleString()}</span>
          )}
          {p.review_count != null && p.review_count > 0 && (
            <span>★ {p.review_score} / {p.review_count}</span>
          )}
        </div>
      </div>
    </a>
  );
}
