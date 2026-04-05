import { cn } from "@/lib/utils";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface HashDisplayProps {
  label: string;
  hash: string;
  className?: string;
  truncate?: boolean;
}

export function HashDisplay({ label, hash, className, truncate = true }: HashDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayHash = truncate && hash.length > 20
    ? `${hash.slice(0, 10)}...${hash.slice(-10)}`
    : hash;

  return (
    <div className={cn("space-y-1.5", className)}>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <div className="flex items-center gap-2 rounded-lg bg-muted/50 border border-border px-3 py-2">
        <code className="text-sm text-primary font-[family-name:var(--font-mono)] flex-1 select-all">
          {displayHash}
        </code>
        <button
          onClick={handleCopy}
          className="text-muted-foreground hover:text-primary transition-colors shrink-0"
        >
          {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
