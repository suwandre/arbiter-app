export type Side = "long" | "short";
export type Exchange = "binance" | "bybit" | "mexc";

export interface RecommendRequest {
  pair: string;
  side: Side;
  position_usdt: number;
  hold_hours: number;
}

export interface ExchangeScore {
  exchange: Exchange;
  composite_score: number;
  weights_source: "static" | "dynamic";
  mode: string;
  funding_rate: number;
  spread_pct: number;
  slippage_pct: number;
  volume_24h: number;
  open_interest: number;
}

export interface FundingCost {
  exchange: Exchange;
  projected_cost_pct: number;
  net_pnl_pct: number;
  paying: boolean;
}

export interface AnomalySignal {
  type: string;
  severity: "low" | "medium" | "high";
  description?: string;
}

export interface ExchangeAnomaly {
  exchange: Exchange;
  clean: boolean;
  signals?: AnomalySignal[];
}

export interface RecommendResponse {
  request: RecommendRequest;
  summary: string;
  weights_used: {
    funding: number;
    volume: number;
    oi: number;
    spread: number;
    slippage: number;
    bid_depth: number;
  };
  rankings: ExchangeScore[];
  funding_costs: FundingCost[];
  anomalies: ExchangeAnomaly[];
}
