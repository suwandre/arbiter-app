"use client";

import { motion } from "framer-motion";
import { RecommendResponse } from "@/types/arbiter";
import { DeepDiveTabs } from "./DeepDiveTabs";

interface Props {
  result: RecommendResponse;
}

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

function fmt(n: number, decimals = 4) {
  return n.toFixed(decimals);
}

function ScoreBar({ score, delay }: { score: number; delay: number }) {
  return (
    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{
          background: "linear-gradient(90deg, #7c3aed, #06b6d4)",
        }}
        initial={{ width: 0 }}
        animate={{ width: `${score * 100}%` }}
        transition={{ duration: 0.8, delay, ease: "easeOut" }}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "positive" | "negative" | "neutral";
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] uppercase tracking-wider text-white/30 font-medium">
        {label}
      </p>
      <p
        className={`text-sm font-semibold tabular-nums ${
          highlight === "positive"
            ? "text-emerald-400"
            : highlight === "negative"
            ? "text-red-400"
            : "text-white/90"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export function ExchangeCards({ result }: Props) {
  const { rankings, funding_costs, anomalies, summary } = result;

  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Summary banner */}
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-3 text-sm text-white/70 leading-relaxed">
        <span className="text-violet-400 font-semibold">→ </span>
        {summary}
      </div>

      {/* Exchange cards */}
      {rankings.map((rank, i) => {
        const funding = funding_costs.find((f) => f.exchange === rank.exchange);
        const anomaly = anomalies.find((a) => a.exchange === rank.exchange);
        const isTop = i === 0;
        const accentColor = EXCHANGE_COLORS[rank.exchange] ?? "#7c3aed";

        return (
          <motion.div
            key={rank.exchange}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className={`relative rounded-2xl border p-6 space-y-4 overflow-hidden ${
              isTop
                ? "border-violet-500/30 bg-white/[0.04]"
                : "border-white/[0.06] bg-white/[0.02]"
            }`}
            style={
              isTop ? { boxShadow: "0 0 40px rgba(124, 58, 237, 0.08)" } : {}
            }
          >
            {/* Subtle top border glow for #1 */}
            {isTop && (
              <div
                className="absolute inset-x-0 top-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, #7c3aed, #06b6d4, transparent)",
                }}
              />
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Exchange color dot */}
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 0 6px ${accentColor}`,
                  }}
                />
                <span className="font-semibold text-white/90 text-base tracking-tight">
                  {EXCHANGE_LABELS[rank.exchange] ?? rank.exchange}
                </span>
                {isTop && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 uppercase tracking-widest">
                    Best
                  </span>
                )}
              </div>
              <span className="text-2xl font-bold tabular-nums text-white">
                {fmt(rank.composite_score, 3)}
              </span>
            </div>

            <ScoreBar score={rank.composite_score} delay={i * 0.1 + 0.2} />

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-x-6 gap-y-4">
              <Stat
                label="Funding Rate"
                value={`${(rank.funding_rate * 100).toFixed(5)}%`}
                highlight={rank.funding_rate < 0 ? "positive" : "neutral"}
              />
              <Stat
                label="Spread"
                value={`${(rank.spread_pct * 100).toFixed(4)}%`}
              />
              <Stat
                label="Slippage"
                value={`${(rank.slippage_pct * 100).toFixed(4)}%`}
              />
              <Stat
                label="Volume 24h"
                value={`$${(rank.volume_24h / 1e9).toFixed(2)}B`}
              />
              <Stat
                label="Open Interest"
                value={`$${(rank.open_interest / 1e9).toFixed(2)}B`}
              />
              {funding && (
                <Stat
                  label="Net PnL"
                  value={`${funding.net_pnl_pct >= 0 ? "+" : ""}${fmt(
                    funding.net_pnl_pct,
                    4
                  )}%`}
                  highlight={funding.net_pnl_pct >= 0 ? "positive" : "negative"}
                />
              )}
            </div>

            {/* Anomaly warning */}
            {anomaly && !anomaly.clean && anomaly.signals && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5 space-y-1">
                <p className="text-[11px] font-bold text-red-400 uppercase tracking-wider">
                  ⚠ Anomalies Detected
                </p>
                {anomaly.signals.map((s, idx) => (
                  <p key={idx} className="text-xs text-red-300/70 capitalize">
                    {s.type.replace(/_/g, " ")}
                    <span className="ml-2 text-red-400 font-semibold">
                      — {s.severity}
                    </span>
                  </p>
                ))}
              </div>
            )}

            {/* Footer */}
            <p className="text-[11px] text-white/20">
              {rank.weights_source} weights · {rank.mode} mode
            </p>
          </motion.div>
        );
      })}

      <div className="pt-4 border-t border-white/[0.05]">
        <p className="text-[11px] uppercase tracking-widest text-white/10 font-bold mb-3 flex items-center gap-2">
          <span className="flex-1 h-px bg-white/[0.04]" />
          Deep Dive
          <span className="flex-1 h-px bg-white/[0.04]" />
        </p>
        <DeepDiveTabs result={result} />
      </div>
    </motion.div>
  );
}
