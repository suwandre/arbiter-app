"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RecommendResponse } from "@/types/arbiter";
import { getRecommendation } from "@/lib/api";
import { ExchangeCards } from "./ExchangeCards";

const PAIRS = [
  "BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT",
  "TRXUSDT", "XRPUSDT", "DOGEUSDT", "ADAUSDT"
];

export function ArbiterInputForm() {
  const [pair, setPair] = useState("BTCUSDT");
  const [side, setSide] = useState<"long" | "short">("long");
  const [position, setPosition] = useState("");
  const [hours, setHours] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RecommendResponse | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await getRecommendation(
        pair,
        side,
        parseFloat(position),
        parseFloat(hours)
      );
      setResult(data);
    } catch (err) {
      setError("Failed to fetch recommendation. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Pair */}
        <div className="space-y-1">
          <label className="text-sm text-muted-foreground">Pair</label>
          <Select value={pair} onValueChange={setPair}>
            <SelectTrigger className="w-full bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {PAIRS.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Side toggle */}
        <div className="space-y-1">
          <label className="text-sm text-muted-foreground">Side</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSide("long")}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors border ${
                side === "long"
                  ? "bg-[#10b981] border-[#10b981] text-white"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Long
            </button>
            <button
              type="button"
              onClick={() => setSide("short")}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors border ${
                side === "short"
                  ? "bg-[#ef4444] border-[#ef4444] text-white"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Short
            </button>
          </div>
        </div>

        {/* Position size */}
        <div className="space-y-1">
          <label className="text-sm text-muted-foreground">Position Size (USDT)</label>
          <Input
            type="number"
            placeholder="e.g. 8000"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="bg-card border-border"
            required
            min={1}
          />
        </div>

        {/* Hold duration */}
        <div className="space-y-1">
          <label className="text-sm text-muted-foreground">Hold Duration (hours)</label>
          <Input
            type="number"
            placeholder="e.g. 240"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="bg-card border-border"
            required
            min={1}
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
        >
          {loading ? "Analyzing..." : "Find Best Exchange →"}
        </Button>

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}
      </form>

      {/* Results */}
      {result && <ExchangeCards result={result} />}
    </div>
  );
}
