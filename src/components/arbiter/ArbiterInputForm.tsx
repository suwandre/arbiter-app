"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
  "BTCUSDT",
  "ETHUSDT",
  "SOLUSDT",
  "BNBUSDT",
  "TRXUSDT",
  "XRPUSDT",
  "DOGEUSDT",
  "ADAUSDT",
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
    } catch {
      setError("Failed to fetch. Is the backend running on :8080?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
        {/* Pair */}
        <div className="space-y-1.5">
          <label className="text-[11px] uppercase tracking-widest text-white/30 font-medium">
            Pair
          </label>
          <Select value={pair} onValueChange={setPair}>
            <SelectTrigger className="w-full bg-white/[0.03] border-white/[0.08] text-white/80 hover:border-white/20 transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0f0f17] border-white/[0.08]">
              {PAIRS.map((p) => (
                <SelectItem
                  key={p}
                  value={p}
                  className="text-white/70 hover:text-white focus:text-white"
                >
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Side toggle */}
        <div className="space-y-1.5">
          <label className="text-[11px] uppercase tracking-widest text-white/30 font-medium">
            Side
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSide("long")}
              className={`py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                side === "long"
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                  : "bg-white/[0.02] border-white/[0.06] text-white/30 hover:text-white/50"
              }`}
            >
              Long ↑
            </button>
            <button
              type="button"
              onClick={() => setSide("short")}
              className={`py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                side === "short"
                  ? "bg-red-500/15 border-red-500/40 text-red-400"
                  : "bg-white/[0.02] border-white/[0.06] text-white/30 hover:text-white/50"
              }`}
            >
              Short ↓
            </button>
          </div>
        </div>

        {/* Position + Hours — side by side */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-widest text-white/30 font-medium">
              Position (USDT)
            </label>
            <Input
              type="number"
              placeholder="8000"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="bg-white/[0.03] border-white/[0.08] text-white/80 placeholder:text-white/20 hover:border-white/20 transition-colors"
              required
              min={1}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-widest text-white/30 font-medium">
              Hold Duration (hrs)
            </label>
            <Input
              type="number"
              placeholder="240"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="bg-white/[0.03] border-white/[0.08] text-white/80 placeholder:text-white/20 hover:border-white/20 transition-colors"
              required
              min={1}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-all relative overflow-hidden group disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
          }}
        >
          <span className="relative z-10 text-white">
            {loading ? "Analyzing markets..." : "Find Best Exchange →"}
          </span>
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {error && <p className="text-xs text-red-400 text-center">{error}</p>}
      </form>

      {result && <ExchangeCards result={result} />}
    </div>
  );
}
