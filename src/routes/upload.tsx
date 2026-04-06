import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { HashDisplay } from "@/components/HashDisplay";
import { GlowCard } from "@/components/GlowCard";
import { computeSHA256 } from "@/lib/hash";
import { storeRecord } from "@/lib/vault-store";

export const Route = createFileRoute("/upload")({
  component: UploadPage,
});

type UploadState = "idle" | "hashing" | "pinning" | "storing" | "done";

function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [hash, setHash] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const [mockCid] = useState(() => "Qm" + Math.random().toString(36).slice(2, 15) + Math.random().toString(36).slice(2, 15));
  const mockOwner = "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28";
  const [mockTx] = useState(() => "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""));

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setState("hashing");

    const fileHash = await computeSHA256(f);
    setHash(fileHash);

    await new Promise((r) => setTimeout(r, 800));
    setState("pinning");

    await new Promise((r) => setTimeout(r, 1200));
    setState("storing");

    await new Promise((r) => setTimeout(r, 1000));

    storeRecord({
      hash: fileHash,
      cid: mockCid,
      owner: mockOwner,
      timestamp: Date.now(),
      fileName: f.name,
    });

    setState("done");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const reset = () => {
    setFile(null);
    setState("idle");
    setHash("");
  };

  const steps: { key: UploadState; label: string }[] = [
    { key: "hashing", label: "Computing SHA-256 hash..." },
    { key: "pinning", label: "Pinning to IPFS via Pinata..." },
    { key: "storing", label: "Storing hash on-chain (Sepolia)..." },
    { key: "done", label: "✅ On Chain!" },
  ];

  return (
    <div className="min-h-screen bg-background bg-grid relative">
      <Navbar />
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />

      <div className="relative pt-28 pb-16 px-6">
        <div className="mx-auto max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-bold text-foreground mb-2">Upload Document</h1>
            <p className="text-muted-foreground mb-8">
              Drop a file to hash, pin to IPFS, and record on the blockchain.
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {state === "idle" ? (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <label
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-16 cursor-pointer transition-all duration-200 ${
                    dragOver
                      ? "border-primary bg-primary/5 glow-primary"
                      : "border-border hover:border-primary/50 hover:bg-card/50"
                  }`}
                >
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-foreground font-medium mb-1">Drag & drop your document</p>
                  <p className="text-sm text-muted-foreground mb-4">PDF, images, or any file</p>
                  <Button variant="outline" size="sm" type="button">
                    Browse Files
                  </Button>
                  <input
                    type="file"
                    onChange={handleInputChange}
                    className="hidden"
                    accept="*/*"
                  />
                </label>
              </motion.div>
            ) : (
              <motion.div
                key="progress"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <GlowCard glowColor={state === "done" ? "success" : "primary"} hoverable={false} className="space-y-6">
                  {/* File info */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{file?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {file && (file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="space-y-3">
                    {steps.map((step) => {
                      const stepOrder = steps.findIndex((s) => s.key === step.key);
                      const currentOrder = steps.findIndex((s) => s.key === state);
                      const isDone = stepOrder < currentOrder || state === "done";
                      const isCurrent = step.key === state && state !== "done";

                      return (
                        <div
                          key={step.key}
                          className={`flex items-center gap-3 text-sm transition-opacity ${
                            stepOrder > currentOrder && state !== "done" ? "opacity-30" : "opacity-100"
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle className="h-4 w-4 text-success shrink-0" />
                          ) : isCurrent ? (
                            <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-border shrink-0" />
                          )}
                          <span className={isDone ? "text-success" : isCurrent ? "text-primary" : "text-muted-foreground"}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Result */}
                  {state === "done" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 pt-2 border-t border-border"
                    >
                      <HashDisplay label="SHA-256 Hash" hash={hash} />
                      <HashDisplay label="IPFS CID" hash={mockCid} />
                      <HashDisplay label="Transaction Hash" hash={mockTx} />

                      <div className="flex items-center gap-2 text-sm text-success">
                        <Shield className="h-4 w-4" />
                        Document secured on-chain
                      </div>

                      <Button onClick={reset} variant="outline" className="w-full mt-2">
                        Upload Another
                      </Button>
                    </motion.div>
                  )}
                </GlowCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
