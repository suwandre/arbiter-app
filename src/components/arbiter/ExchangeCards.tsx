import { RecommendResponse, ExchangeScore, FundingCost, ExchangeAnomaly } from "@/types/arbiter";

interface Props {
  result: RecommendResponse;
}

const EXCHANGE_LABELS: Record<string, string> = {
  binance: "Binance",
  bybit: "Bybit",
  mexc: "MEXC",
};

function fmt(n: number, decimals = 4) {
  return n.toFixed(decimals);
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
      <div
        className="h-full bg-primary rounded-full transition-all"
        style={{ width: `${score * 100}%` }}
      />
    </div>
  );
}

export function ExchangeCards({ result }: Props) {
  const { rankings, funding_costs, anomalies, summary } = result;

  return (
    <div className="space-y-4">

      {/* Summary banner */}
      <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground">
        {summary}
      </div>

      {/* Exchange cards */}
      {rankings.map((rank, i) => {
        const funding = funding_costs.find(f => f.exchange === rank.exchange);
        const anomaly = anomalies.find(a => a.exchange === rank.exchange);
        const isTop = i === 0;

        return (
          <div
            key={rank.exchange}
            className={`rounded-xl border p-5 space-y-4 transition-all ${
              isTop
                ? "border-primary/50 bg-primary/5"
                : "border-border bg-card"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isTop && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                    #1 Best
                  </span>
                )}
                <span className="font-semibold text-lg">
                  {EXCHANGE_LABELS[rank.exchange] ?? rank.exchange}
                </span>
              </div>
              <span className="text-2xl font-bold text-foreground">
                {fmt(rank.composite_score, 3)}
              </span>
            </div>

            <ScoreBar score={rank.composite_score} />

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Stat
                label="Funding Rate"
                value={`${(rank.funding_rate * 100).toFixed(5)}%`}
              />
              <Stat
                label="Spread"
                value={`${(rank.spread_pct * 100).toFixed(4)}%`}
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
                <>
                  <Stat
                    label="Funding Cost"
                    value={`${fmt(funding.projected_cost_pct, 4)}%`}
                    highlight={funding.paying ? "negative" : "positive"}
                  />
                  <Stat
                    label="Net PnL"
                    value={`${funding.net_pnl_pct > 0 ? "+" : ""}${fmt(funding.net_pnl_pct, 4)}%`}
                    highlight={funding.net_pnl_pct >= 0 ? "positive" : "negative"}
                  />
                </>
              )}
            </div>

            {/* Anomaly warning */}
            {anomaly && !anomaly.clean && anomaly.signals && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive space-y-1">
                <p className="font-semibold">⚠ Anomalies detected</p>
                {anomaly.signals.map((s, idx) => (
                  <p key={idx} className="capitalize">
                    {s.type.replace(/_/g, " ")} — <span className="font-medium">{s.severity}</span>
                  </p>
                ))}
              </div>
            )}

            {/* Weights source badge */}
            <p className="text-xs text-muted-foreground">
              Scoring: <span className="text-accent">{rank.weights_source}</span> weights · mode: {rank.mode}
            </p>
          </div>
        );
      })}
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
  highlight?: "positive" | "negative";
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p
        className={`font-medium ${
          highlight === "positive"
            ? "text-[#10b981]"
            : highlight === "negative"
            ? "text-[#ef4444]"
            : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
