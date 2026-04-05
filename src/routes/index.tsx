import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Shield, Upload, CheckCircle, AlertTriangle, ArrowRight, Lock, Fingerprint, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlowCard } from "@/components/GlowCard";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-background bg-grid relative overflow-hidden">
      <Navbar />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-8">
              <Lock className="h-3.5 w-3.5" />
              Blockchain-Secured Legal Records
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              <span className="text-foreground">Store </span>
              <span className="text-gradient-primary">Trust</span>
              <span className="text-foreground">,</span>
              <br />
              <span className="text-foreground">Not Files</span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Upload legal documents, hash them with SHA-256, pin to IPFS, and record on-chain.
              Verify authenticity instantly — tamper-proof by design.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/upload">
              <Button variant="hero" size="xl">
                <Upload className="h-5 w-5" />
                Upload Document
              </Button>
            </Link>
            <Link to="/verify">
              <Button variant="outline" size="xl">
                <CheckCircle className="h-5 w-5" />
                Verify Document
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative px-6 pb-24">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-3 gap-6"
          >
            <GlowCard glowColor="primary">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Fingerprint className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">SHA-256 Hashing</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every document gets a unique cryptographic fingerprint. Even one byte change produces a completely different hash.
              </p>
            </GlowCard>

            <GlowCard glowColor="success">
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">On-Chain Proof</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Hash stored on Ethereum Sepolia blockchain. Immutable, timestamped, verifiable by anyone, forever.
              </p>
            </GlowCard>

            <GlowCard glowColor="primary">
              <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-warning" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Instant Verify</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Re-upload any document to verify. Compare hashes in milliseconds — authentic or tampered, you'll know.
              </p>
            </GlowCard>
          </motion.div>
        </div>
      </section>

      {/* Demo flow */}
      <section className="relative px-6 pb-28">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              See It In Action
            </h2>
            <p className="text-muted-foreground mb-12">
              The tamper detection demo proves the system in under 2 minutes.
            </p>
          </motion.div>

          <div className="space-y-4">
            {[
              { step: "1", text: 'Upload a sample deed', icon: Upload, color: "text-primary" },
              { step: "2", text: 'Verify → "100% Authentic"', icon: CheckCircle, color: "text-success" },
              { step: "3", text: 'Edit → Re-verify → "🚨 TAMPERED!"', icon: AlertTriangle, color: "text-destructive" },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
                className="flex items-center gap-4 rounded-xl border border-border bg-card/50 p-5 text-left"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold font-[family-name:var(--font-mono)]">
                  {item.step}
                </div>
                <item.icon className={`h-5 w-5 shrink-0 ${item.color}`} />
                <span className="text-foreground font-medium">{item.text}</span>
                {i < 2 && <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto hidden sm:block" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="mx-auto max-w-6xl flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span>eVault — Blockchain Legal Record Vault</span>
          </div>
          <span>Hackathon MVP</span>
        </div>
      </footer>
    </div>
  );
}
