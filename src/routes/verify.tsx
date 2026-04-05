import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle, XCircle, Upload, FileText, AlertTriangle, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { HashDisplay } from "@/components/HashDisplay";
import { GlowCard } from "@/components/GlowCard";
import { computeSHA256, computeSHA256FromText } from "@/lib/hash";
import { verifyRecord, type VaultRecord } from "@/lib/vault-store";

export const Route = createFileRoute("/verify")({
  component: VerifyPage,
});

type VerifyState = "idle" | "hashing" | "checking" | "authentic" | "tampered" | "not-found";

function VerifyPage() {
  const [state, setState] = useState<VerifyState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState("");
  const [record, setRecord] = useState<VaultRecord | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [demoText, setDemoText] = useState("This is the original content of the legal deed document #12345.");
  const [demoStored, setDemoStored] = useState(false);
  const [demoOriginalHash, setDemoOriginalHash] = useState("");

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setState("hashing");

    const fileHash = await computeSHA256(f);
    setHash(fileHash);

    await new Promise((r) => setTimeout(r, 600));
    setState("checking");

    await new Promise((r) => setTimeout(r, 800));

    const result = verifyRecord(fileHash);
    if (result.exists && result.record) {
      setRecord(result.record);
      setState("authentic");
    } else {
      setState("not-found");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const reset = () => {
    setFile(null);
    setState("idle");
    setHash("");
    setRecord(null);
  };

  // Demo mode handlers
  const handleDemoStore = async () => {
    const h = await computeSHA256FromText(demoText);
    setDemoOriginalHash(h);
    setDemoStored(true);
  };

  const handleDemoVerify = async () => {
    setState("hashing");
    const currentHash = await computeSHA256FromText(demoText);
    setHash(currentHash);

    await new Promise((r) => setTimeout(r, 600));
    setState("checking");
    await new Promise((r) => setTimeout(r, 800));

    if (currentHash === demoOriginalHash) {
      setState("authentic");
    } else {
      setState("tampered");
    }
  };

  const resetDemo = () => {
    setState("idle");
    setHash("");
    setDemoStored(false);
    setDemoOriginalHash("");
    setDemoText("This is the original content of the legal deed document #12345.");
  };

  return (
    <div className="min-h-screen bg-background bg-grid relative">
      <Navbar />
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />

      <div className="relative pt-28 pb-16 px-6">
        <div className="mx-auto max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-bold text-foreground mb-2">Verify Document</h1>
            <p className="text-muted-foreground mb-6">
              Re-upload a document or use Demo Mode to see tamper detection in action.
            </p>

            {/* Mode toggle */}
            <div className="flex gap-2 mb-8">
              <Button
                variant={!demoMode ? "default" : "outline"}
                size="sm"
                onClick={() => { setDemoMode(false); reset(); resetDemo(); }}
              >
                <Upload className="h-4 w-4" />
                File Verify
              </Button>
              <Button
                variant={demoMode ? "default" : "outline"}
                size="sm"
                onClick={() => { setDemoMode(true); reset(); resetDemo(); }}
              >
                <AlertTriangle className="h-4 w-4" />
                Demo Mode
              </Button>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {!demoMode ? (
              /* File verification */
              <motion.div key="file-verify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {state === "idle" ? (
                  <label
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-16 cursor-pointer hover:border-primary/50 hover:bg-card/50 transition-all"
                  >
                    <Search className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-foreground font-medium mb-1">Drop document to verify</p>
                    <p className="text-sm text-muted-foreground mb-4">We'll compute its hash and check on-chain</p>
                    <Button variant="outline" size="sm" type="button">Browse Files</Button>
                    <input type="file" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} className="hidden" />
                  </label>
                ) : (
                  <ResultCard
                    state={state}
                    file={file}
                    hash={hash}
                    record={record}
                    onReset={reset}
                  />
                )}
              </motion.div>
            ) : (
              /* Demo mode */
              <motion.div key="demo-mode" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <GlowCard hoverable={false} glowColor={state === "authentic" ? "success" : state === "tampered" ? "destructive" : "primary"}>
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    <h3 className="font-semibold text-foreground">Tamper Detection Demo</h3>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    {!demoStored
                      ? "Step 1: This text represents a legal document. Click 'Store Hash' to record it."
                      : state === "idle"
                      ? "Step 2: Try editing the text below, then click 'Verify' to see tamper detection."
                      : ""}
                  </p>

                  <textarea
                    value={demoText}
                    onChange={(e) => setDemoText(e.target.value)}
                    disabled={!demoStored || state !== "idle"}
                    rows={4}
                    className="w-full rounded-lg bg-muted/50 border border-border p-3 text-sm text-foreground font-[family-name:var(--font-mono)] resize-none focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                  />

                  {demoOriginalHash && (
                    <HashDisplay label="Stored Hash" hash={demoOriginalHash} className="mt-4" />
                  )}

                  {hash && state !== "idle" && (
                    <HashDisplay label="Current Hash" hash={hash} className="mt-3" />
                  )}

                  {/* Demo result */}
                  <AnimatePresence>
                    {state === "authentic" && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-6 flex items-center gap-3 rounded-xl bg-success/10 border border-success/20 p-4"
                      >
                        <CheckCircle className="h-8 w-8 text-success" />
                        <div>
                          <p className="font-semibold text-success">✅ 100% Authentic</p>
                          <p className="text-sm text-muted-foreground">Hash matches on-chain record</p>
                        </div>
                      </motion.div>
                    )}
                    {state === "tampered" && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-6 flex items-center gap-3 rounded-xl bg-destructive/10 border border-destructive/20 p-4"
                      >
                        <XCircle className="h-8 w-8 text-destructive" />
                        <div>
                          <p className="font-semibold text-destructive">🚨 TAMPERED!</p>
                          <p className="text-sm text-muted-foreground">Hash does NOT match — document was modified</p>
                        </div>
                      </motion.div>
                    )}
                    {(state === "hashing" || state === "checking") && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 flex items-center gap-3 p-4">
                        <Loader2 className="h-6 w-6 text-primary animate-spin" />
                        <span className="text-sm text-primary">
                          {state === "hashing" ? "Computing hash..." : "Comparing with on-chain record..."}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mt-4 flex gap-2">
                    {!demoStored ? (
                      <Button onClick={handleDemoStore} variant="hero" className="w-full">
                        Store Hash On-Chain
                      </Button>
                    ) : state === "idle" ? (
                      <Button onClick={handleDemoVerify} variant="hero" className="w-full">
                        <Search className="h-4 w-4" />
                        Verify Document
                      </Button>
                    ) : (state === "authentic" || state === "tampered") ? (
                      <Button onClick={resetDemo} variant="outline" className="w-full">
                        <RotateCcw className="h-4 w-4" />
                        Try Again
                      </Button>
                    ) : null}
                  </div>
                </GlowCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ResultCard({
  state,
  file,
  hash,
  record,
  onReset,
}: {
  state: VerifyState;
  file: File | null;
  hash: string;
  record: VaultRecord | null;
  onReset: () => void;
}) {
  const glowColor = state === "authentic" ? "success" : state === "tampered" || state === "not-found" ? "destructive" : "primary";

  return (
    <GlowCard glowColor={glowColor} hoverable={false} className="space-y-4">
      {file && (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        </div>
      )}

      {(state === "hashing" || state === "checking") && (
        <div className="flex items-center gap-3 py-4">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
          <span className="text-sm text-primary">
            {state === "hashing" ? "Computing SHA-256 hash..." : "Checking on-chain records..."}
          </span>
        </div>
      )}

      {hash && <HashDisplay label="Document Hash" hash={hash} />}

      {state === "authentic" && record && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="flex items-center gap-3 rounded-xl bg-success/10 border border-success/20 p-4 mb-4">
            <CheckCircle className="h-8 w-8 text-success" />
            <div>
              <p className="font-semibold text-success">✅ Authentic</p>
              <p className="text-sm text-muted-foreground">Matches on-chain record</p>
            </div>
          </div>
          <HashDisplay label="IPFS CID" hash={record.cid} />
          <HashDisplay label="Owner" hash={record.owner} className="mt-3" />
          <p className="text-xs text-muted-foreground mt-3">
            Stored: {new Date(record.timestamp).toLocaleString()}
          </p>
        </motion.div>
      )}

      {state === "not-found" && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="flex items-center gap-3 rounded-xl bg-destructive/10 border border-destructive/20 p-4">
            <XCircle className="h-8 w-8 text-destructive" />
            <div>
              <p className="font-semibold text-destructive">Not Found</p>
              <p className="text-sm text-muted-foreground">No matching record on-chain</p>
            </div>
          </div>
        </motion.div>
      )}

      {(state === "authentic" || state === "not-found" || state === "tampered") && (
        <Button onClick={onReset} variant="outline" className="w-full mt-2">
          <RotateCcw className="h-4 w-4" />
          Verify Another
        </Button>
      )}
    </GlowCard>
  );
}
