"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FundingArbTable } from "@/components/arbiter/FundingArbTable";
import Link from "next/link";

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

export default function ArbPage() {
  const [selectedPair, setSelectedPair] = useState("BTCUSDT");

  return (
    <main className="min-h-screen bg-[#0a0a0f] flex flex-col items-center">
      {/* Radial glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 40% at 50% -10%, rgba(124,58,237,0.12), transparent)",
        }}
      />

      <div className="relative px-6 py-16 w-full max-w-2xl space-y-10">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1
              className="text-4xl font-bold tracking-tight"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Funding Arb
            </h1>
            <p className="text-sm text-white/30 tracking-widest uppercase">
              Cross-Exchange Opportunities
            </p>
          </div>
          <Link
            href="/"
            className="text-xs text-white/30 hover:text-white/60 transition-colors mt-1"
          >
            ← Back
          </Link>
        </div>

        {/* Pair selector */}
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-widest text-white/20 font-medium">
            Select Pair
          </p>
          <div className="flex flex-wrap gap-2">
            {PAIRS.map((pair) => {
              const isActive = selectedPair === pair;
              return (
                <button
                  key={pair}
                  onClick={() => setSelectedPair(pair)}
                  className="relative px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
                  style={{
                    color: isActive ? "white" : "rgba(255,255,255,0.3)",
                    border: isActive
                      ? "1px solid rgba(124,58,237,0.5)"
                      : "1px solid rgba(255,255,255,0.06)",
                    background: isActive
                      ? "rgba(124,58,237,0.15)"
                      : "rgba(255,255,255,0.02)",
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="pair-active"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: "rgba(124,58,237,0.12)",
                        border: "1px solid rgba(124,58,237,0.4)",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10">
                    {pair.replace("USDT", "")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Arb table */}
        <FundingArbTable pair={selectedPair} />
      </div>
    </main>
  );
}
