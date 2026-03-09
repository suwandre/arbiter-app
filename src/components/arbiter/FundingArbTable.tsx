"use client";

import { useEffect, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { getFundingArb } from "@/lib/api";
import { FundingArbPair, FundingArbResponse } from "@/types/arbiter";

const EXCHANGE_LABELS: Record<string, string> = {
  binance: "Binance",
  bybit: "Bybit",
  mexc: "MEXC",
};

const EXCHANGE_COLORS: Record<string, string> = {
  binance: "#F0B90B",
  bybit: "#00C4FF",
  mexc: "#2354E6",
};

interface Props {
  pair: string;
}

export function FundingArbTable({ pair }: Props) {
  const [data, setData] = useState<FundingArbResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchArb = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getFundingArb(pair);
      setData(result);
    } catch {
      // non-critical
    } finally {
      setLoading(false);
    }
  }, [pair]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchArb();
  }, [fetchArb]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-4 h-4 rounded-full border-2 border-violet-500/40 border-t-violet-400 animate-spin" />
      </div>
    );
  }

  if (!data || data.opportunities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-2">
        <span className="text-2xl">—</span>
        <p className="text-sm text-white/30">
          No arb opportunities for {pair} right now
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header note */}
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 px-5 py-4 text-sm text-white/50 leading-relaxed">
        <span className="text-violet-400 font-semibold">How this works: </span>
        Go long on the exchange with the lower rate, short on the exchange with
        the higher rate. You net the differential each funding period (every
        8h). Annualized assumes 3 periods/day.
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-5 px-6 py-4 bg-white/[0.03] border-b border-white/[0.05]">
          {["Long", "Short", "Differential", "Annualized", "Net"].map((h) => (
            <p
              key={h}
              className="text-xs uppercase tracking-widest text-white/25 font-semibold"
            >
              {h}
            </p>
          ))}
        </div>

        {/* Rows */}
        {data.opportunities.map((opp, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="grid grid-cols-5 px-6 py-5 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
          >
            {/* Long exchange */}
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  backgroundColor:
                    EXCHANGE_COLORS[opp.long_exchange] ?? "#7c3aed",
                  boxShadow: `0 0 6px ${
                    EXCHANGE_COLORS[opp.long_exchange] ?? "#7c3aed"
                  }`,
                }}
              />
              <span className="text-sm text-white/80 font-semibold">
                {EXCHANGE_LABELS[opp.long_exchange] ?? opp.long_exchange}
              </span>
            </div>

            {/* Short exchange */}
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  backgroundColor:
                    EXCHANGE_COLORS[opp.short_exchange] ?? "#7c3aed",
                  boxShadow: `0 0 6px ${
                    EXCHANGE_COLORS[opp.short_exchange] ?? "#7c3aed"
                  }`,
                }}
              />
              <span className="text-sm text-white/80 font-semibold">
                {EXCHANGE_LABELS[opp.short_exchange] ?? opp.short_exchange}
              </span>
            </div>

            {/* Differential */}
            <div className="space-y-0.5">
              <span className="text-sm font-bold tabular-nums text-emerald-400">
                +{opp.diff_pct.toFixed(5)}%
              </span>
              <p className="text-[11px] text-white/20">per 8h period</p>
            </div>

            {/* Annualized */}
            <div className="space-y-0.5">
              <span className="text-sm font-bold tabular-nums text-white/80">
                {opp.annualized.toFixed(2)}%
              </span>
              <p className="text-[11px] text-white/20">annualized</p>
            </div>

            {/* Net bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-emerald-400/60"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min((opp.diff_pct / 0.002) * 100, 100)}%`,
                  }}
                  transition={{ duration: 0.6, delay: i * 0.07 + 0.2 }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Rates reference */}
      <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] px-5 py-4 space-y-3">
        <p className="text-[11px] uppercase tracking-widest text-white/20 font-semibold">
          Current Rates
        </p>
        <div className="grid grid-cols-3 gap-4">
          {[
            ...new Set(
              data.opportunities.flatMap((o) => [
                o.long_exchange,
                o.short_exchange,
              ])
            ),
          ].map((ex) => {
            const asLong = data.opportunities.find(
              (o) => o.long_exchange === ex
            );
            const asShort = data.opportunities.find(
              (o) => o.short_exchange === ex
            );
            const rate = asLong?.long_rate ?? asShort?.short_rate ?? 0;
            return (
              <div key={ex} className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: EXCHANGE_COLORS[ex] ?? "#7c3aed",
                    }}
                  />
                  <span className="text-xs text-white/40 font-medium">
                    {EXCHANGE_LABELS[ex] ?? ex}
                  </span>
                </div>
                <p
                  className={`text-sm font-bold tabular-nums ${
                    rate < 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {rate < 0 ? "" : "+"}
                  {(rate * 100).toFixed(5)}%
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-white/20 text-center">
        {data.count} opportunit{data.count !== 1 ? "ies" : "y"} · refreshes
        every 30s
      </p>
    </motion.div>
  );
}
