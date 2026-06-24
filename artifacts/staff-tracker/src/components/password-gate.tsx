import { useState } from "react";
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

const ADMIN_PASSWORD = "Modilovesmamta";
const STORAGE_KEY = "staff-tracker-auth";

export function usePasswordGate() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "granted";
}

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(() => localStorage.getItem(STORAGE_KEY) === "granted");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  if (authed) return <>{children}</>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, "granted");
      setAuthed(true);
      setError(false);
    } else {
      setError(true);
      setShaking(true);
      setPassword("");
      setTimeout(() => setShaking(false), 600);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        animate={shaking ? { x: [-10, 10, -10, 10, -6, 6, -3, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-primary/10 border-b border-border p-8 text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/30">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold tracking-tight">OPS COMMAND</h1>
            <p className="text-muted-foreground font-mono text-xs mt-1 uppercase tracking-widest">Staff Tracker — Restricted Access</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Admin Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(false); }}
                  placeholder="Enter password..."
                  className={`font-mono bg-background pr-10 ${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-500 text-xs font-mono"
                  >
                    Incorrect password. Access denied.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <Button type="submit" className="w-full font-mono uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 mr-2" />
              Authenticate
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
