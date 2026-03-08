import { ArbiterInputForm } from "@/components/arbiter/ArbiterInputForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Arbiter
        </h1>
        <p className="text-center text-muted-foreground mb-10">
          Real-time perpetual futures comparison engine
        </p>
        <ArbiterInputForm />
      </div>
    </main>
  );
}
