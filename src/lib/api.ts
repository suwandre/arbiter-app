import type {
  FundingArbResponse,
  FundingRatesResponse,
  RecommendResponse,
} from "@/types/arbiter";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export async function getRecommendation(
  pair: string,
  side: "long" | "short",
  positionUsdt: number,
  holdHours: number
): Promise<RecommendResponse> {
  const params = new URLSearchParams({
    side,
    size: positionUsdt.toString(),
    hours: holdHours.toString(),
  });

  const response = await fetch(`${API_BASE}/v1/recommend/${pair}?${params}`);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export async function getActivePairs(): Promise<string[]> {
  const response = await fetch(`${API_BASE}/v1/pairs`);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.pairs || [];
}

export async function getFundingRates(
  pair: string
): Promise<FundingRatesResponse> {
  const params = new URLSearchParams({ side: "long", hours: "8" });
  const response = await fetch(`${API_BASE}/v1/funding/${pair}?${params}`);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export async function getFundingArb(pair: string): Promise<FundingArbResponse> {
  const response = await fetch(`${API_BASE}/v1/funding/${pair}/arb`);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}
