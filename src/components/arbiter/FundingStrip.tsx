"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getFundingRates } from "@/lib/api";
import { FundingRateItem } from "@/types/arbiter";

const PAIRS = [
  "BTCUSDT",
  "ETHUSDT",
  "SOLUSDT",
  "BNBUSDT",
  "TRXUSDT",
  "XRPUSDT",
  "DOGEUSDT",
  "ADAUSDT",
];

const EXCHANGE_SHORT: Record<string, string> = {
  binance: "BN",
  bybit: "BB",
  mexc: "MX",
};

interface StripItem {
  pair: string;
  exchange: string;
  rate: number;
}

function buildItems(data: Record<string, FundingRateItem[]>): StripItem[] {
  const items: StripItem[] = [];
  for (const pair of PAIRS) {
    const results = data[pair];
    if (!results) continue;
    for (const r of results) {
      items.push({ pair, exchange: r.exchange, rate: r.current_rate });
    }
  }
  return items;
}

export function FundingStrip() {
  const [items, setItems] = useState<StripItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const results = await Promise.all(
        PAIRS.map((pair) => getFundingRates(pair))
      );
      const data: Record<string, FundingRateItem[]> = {};
      results.forEach((r) => {
        data[r.pair] = r.results;
      });
      setItems(buildItems(data));
      setLastUpdated(new Date());
    } catch {
      // silently fail — strip is non-critical
    }
  }, []);

  useEffect(() => {
    // suppress ESLint because fetchAll is async.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();
    intervalRef.current = setInterval(fetchAll, 30_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchAll]);

  if (items.length === 0) return null;

  // Duplicate items for seamless loop
  const looped = [...items, ...items];

  return (
    <div className="w-full border-b border-white/[0.06] bg-white/[0.02] overflow-hidden relative">
      {/* Left fade */}
      <div
        className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
        style={{ background: "linear-gradient(90deg, #0a0a0f, transparent)" }}
      />
      {/* Right fade */}
      <div
        className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
        style={{ background: "linear-gradient(-90deg, #0a0a0f, transparent)" }}
      />

      <div className="flex animate-strip-scroll whitespace-nowrap py-2">
        {looped.map((item, i) => {
          const isNeg = item.rate < 0;
          return (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-4 text-xs"
            >
              <span className="text-white/40 font-medium">
                {item.pair.replace("USDT", "")}
              </span>
              <span className="text-white/20 text-[10px]">
                {EXCHANGE_SHORT[item.exchange] ?? item.exchange.toUpperCase()}
              </span>
              <span
                className={`font-semibold tabular-nums ${
                  isNeg ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {isNeg ? "" : "+"}
                {(item.rate * 100).toFixed(5)}%
              </span>
              <span className="text-white/10 ml-2">·</span>
            </span>
          );
        })}
      </div>

      {/* Last updated */}
      {lastUpdated && (
        <div className="absolute right-14 top-1/2 -translate-y-1/2 z-20 text-[10px] text-white/20 hidden sm:block">
          LIVE
          <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      )}
    </div>
  );
}
