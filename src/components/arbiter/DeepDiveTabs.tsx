"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RecommendResponse,
  FundingRatesResponse,
  Exchange,
} from "@/types/arbiter";
import { getFundingRates } from "@/lib/api";

interface Props {
  result: RecommendResponse;
}

const TABS = ["Funding", "Anomalies", "Weights"] as const;
type Tab = (typeof TABS)[number];

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

const SEVERITY_COLORS: Record<string, string> = {
  low: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  medium: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  high: "text-red-400 bg-red-400/10 border-red-400/20",
};

// ─── Funding Tab ────────────────────────────────────────────────
function FundingTab({
  result,
  fundingData,
}: {
  result: RecommendResponse;
  fundingData: FundingRatesResponse | null;
}) {
  const { rankings, funding_costs } = result;

  return (
    <div className="space-y-3">
      {rankings.map((rank) => {
        const cost = funding_costs.find((f) => f.exchange === rank.exchange);
        const extended = fundingData?.results.find(
          (r) => r.exchange === rank.exchange
        );
        const accentColor = EXCHANGE_COLORS[rank.exchange] ?? "#7c3aed";

        return (
          <div
            key={rank.exchange}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3"
          >
            {/* Exchange header */}
            <div className="flex items-center gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 0 5px ${accentColor}`,
                }}
              />
              <span className="text-sm font-semibold text-white/80">
                {EXCHANGE_LABELS[rank.exchange] ?? rank.exchange}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-x-6 gap-y-3">
              <FundingStat
                label="Current Rate"
                value={`${(rank.funding_rate * 100).toFixed(5)}%`}
                highlight={rank.funding_rate < 0 ? "positive" : "negative"}
              />
              {extended && (
                <FundingStat
                  label="30d Avg Rate"
                  value={`${(extended.avg_rate_30d * 100).toFixed(5)}%`}
                  highlight={
                    extended.avg_rate_30d < 0 ? "positive" : "negative"
                  }
                />
              )}
              {cost && (
                <FundingStat
                  label="Status"
                  value={cost.paying ? "Paying" : "Receiving"}
                  highlight={cost.paying ? "negative" : "positive"}
                />
              )}
              {cost && (
                <FundingStat
                  label="Projected Cost"
                  value={`${cost.projected_cost_pct.toFixed(4)}%`}
                  highlight={
                    cost.projected_cost_pct <= 0 ? "positive" : "negative"
                  }
                />
              )}
              {cost && (
                <FundingStat
                  label="Net PnL"
                  value={`${
                    cost.net_pnl_pct >= 0 ? "+" : ""
                  }${cost.net_pnl_pct.toFixed(4)}%`}
                  highlight={cost.net_pnl_pct >= 0 ? "positive" : "negative"}
                />
              )}
              {extended && (
                <FundingStat
                  label="Cost Range"
                  value={`${
                    extended.projected_cost_low_pct?.toFixed(4) ?? "—"
                  }% → ${extended.projected_cost_high_pct?.toFixed(4) ?? "—"}%`}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FundingStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "positive" | "negative";
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
            : "text-white/80"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// ─── Anomalies Tab ──────────────────────────────────────────────
function AnomaliesTab({ result }: { result: RecommendResponse }) {
  const { anomalies } = result;
  const hasAny = anomalies.some((a) => !a.clean);

  if (!hasAny) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-2">
        <span className="text-2xl">✅</span>
        <p className="text-sm text-white/40">
          No anomalies detected across all exchanges
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {anomalies.map((anomaly) => {
        const accentColor = EXCHANGE_COLORS[anomaly.exchange] ?? "#7c3aed";
        return (
          <div
            key={anomaly.exchange}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 0 5px ${accentColor}`,
                  }}
                />
                <span className="text-sm font-semibold text-white/80">
                  {EXCHANGE_LABELS[anomaly.exchange] ?? anomaly.exchange}
                </span>
              </div>
              {anomaly.clean ? (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Clean
                </span>
              ) : (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                  {anomaly.signals?.length ?? 0} signal
                  {(anomaly.signals?.length ?? 0) !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {anomaly.signals && anomaly.signals.length > 0 && (
              <div className="space-y-2">
                {anomaly.signals.map((signal, idx) => (
                  <div
                    key={idx}
                    className={`rounded-lg border px-3 py-2 flex items-center justify-between ${
                      SEVERITY_COLORS[signal.severity] ?? SEVERITY_COLORS.low
                    }`}
                  >
                    <span className="text-xs font-medium capitalize">
                      {signal.type.replace(/_/g, " ")}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      {signal.severity}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {anomaly.clean && (
              <p className="text-xs text-white/30">
                No signals detected — data looks healthy
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Weights Tab ─────────────────────────────────────────────────
function WeightsTab({ result }: { result: RecommendResponse }) {
  const { weights_used, rankings } = result;
  const topRank = rankings[0];

  const weightEntries = Object.entries(weights_used)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a);

  const maxWeight = Math.max(...weightEntries.map(([, v]) => v));

  const WEIGHT_LABELS: Record<string, string> = {
    funding: "Funding Rate",
    volume: "Volume 24h",
    oi: "Open Interest",
    spread: "Spread",
    slippage: "Slippage",
    bid_depth: "Bid Depth",
  };

  return (
    <div className="space-y-4">
      {/* Context note */}
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-3 text-xs text-white/50 leading-relaxed">
        <span className="text-violet-400 font-semibold">
          How scoring works:{" "}
        </span>
        These weights were used to rank exchanges for your query. Higher weight
        = more influence on the final score.
        {topRank && (
          <span className="text-white/40">
            {" "}
            <span className="text-violet-300">
              {EXCHANGE_LABELS[topRank.exchange]}
            </span>{" "}
            ranked #1 using{" "}
            <span className="text-violet-300">{topRank.weights_source}</span>{" "}
            weighting.
          </span>
        )}
      </div>

      {/* Weight bars */}
      <div className="space-y-3">
        {weightEntries.map(([key, value]) => (
          <div key={key} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50 font-medium">
                {WEIGHT_LABELS[key] ?? key}
              </span>
              <span className="text-xs font-bold tabular-nums text-white/70">
                {(value * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #7c3aed, #06b6d4)",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${(value / maxWeight) * 100}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Score breakdown per exchange */}
      <div className="pt-2 border-t border-white/[0.05] space-y-2">
        <p className="text-[11px] uppercase tracking-wider text-white/30 font-medium">
          Final Scores
        </p>
        {rankings.map((rank, i) => (
          <div
            key={rank.exchange}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-white/20 w-4">{i + 1}</span>
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: EXCHANGE_COLORS[rank.exchange] ?? "#7c3aed",
                }}
              />
              <span className="text-xs text-white/60">
                {EXCHANGE_LABELS[rank.exchange] ?? rank.exchange}
              </span>
            </div>
            <span className="text-xs font-bold tabular-nums text-white/80">
              {rank.composite_score.toFixed(3)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────
export function DeepDiveTabs({ result }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Funding");
  const [fundingData, setFundingData] = useState<FundingRatesResponse | null>(
    null
  );

  const fetchFunding = useCallback(async () => {
    try {
      const data = await getFundingRates(result.request.pair);
      setFundingData(data);
    } catch {
      // non-critical
    }
  }, [result.request.pair]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchFunding();
  }, [fetchFunding]);

  return (
    <div className="space-y-4">
      {/* Tab headers */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.05]">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab
                ? "bg-white/[0.08] text-white"
                : "text-white/30 hover:text-white/60"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "Funding" && (
            <FundingTab result={result} fundingData={fundingData} />
          )}
          {activeTab === "Anomalies" && <AnomaliesTab result={result} />}
          {activeTab === "Weights" && <WeightsTab result={result} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
