import { ArbiterInputForm } from "@/components/arbiter/ArbiterInputForm";

export default function Home() {
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

      <div className="relative px-6 py-16 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10 space-y-2">
          <h1
            className="text-5xl font-bold tracking-tight"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Arbiter
          </h1>
          <p className="text-sm text-white/30 tracking-widest uppercase">
            Perpetual Futures Intelligence
          </p>
        </div>

        <ArbiterInputForm />
      </div>
    </main>
  );
}
