"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail, Lock, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    
    try {
      const supabase = createClient();
      
      if (mode === "register") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (signUpError) throw signUpError;
        setSuccessMsg("註冊成功！請檢查收件匣進行信箱驗證。");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) throw signInError;
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "發生錯誤，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[var(--color-accent-pink)]/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[var(--color-accent-blue)]/20 rounded-full blur-[100px]" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="glass-strong border border-[var(--color-border)] rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[var(--color-accent-pink)] to-[var(--color-accent-blue)] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <span className="text-white text-3xl font-bold">N</span>
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
              NihoNote 學習筆記
            </h1>
            <p className="text-[var(--color-text-secondary)] text-sm">
              登入以同步您的單字與標註資料
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2 text-red-500 text-sm animate-pop-in">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            
            {successMsg && (
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start gap-2 text-green-500 text-sm animate-pop-in">
                <span>{successMsg}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--color-text-secondary)] ml-1">電子郵件</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 text-[var(--color-text-muted)]" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-blue)] focus:ring-1 focus:ring-[var(--color-accent-blue)] transition-all"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--color-text-secondary)] ml-1">密碼</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 text-[var(--color-text-muted)]" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-blue)] focus:ring-1 focus:ring-[var(--color-accent-blue)] transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-4 bg-[var(--color-accent-blue)] hover:bg-blue-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-[var(--color-accent-blue)]/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
              {mode === "login" ? "登入" : "註冊帳號"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
            {mode === "login" ? "還沒有帳號？" : "已經有帳號了？"}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-[var(--color-accent-blue)] hover:underline focus:outline-none"
            >
              {mode === "login" ? "立即註冊" : "返回登入"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
