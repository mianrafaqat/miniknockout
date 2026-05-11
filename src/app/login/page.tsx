"use client";

import { useState } from "react";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { LogIn, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (!auth) {
        setError("Firebase Auth is not configured. Please check environment variables.");
        return;
      }
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err) {
      const message =
        err instanceof FirebaseError && err.code === "auth/invalid-credential"
          ? "Invalid credentials. Please try again."
          : "Unable to sign in right now. Please try again.";
      setError(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-white text-slate-900 px-6">
      <div className="max-w-sm mx-auto w-full space-y-10">
        {/* Logo/Brand */}
        <div className="space-y-3">
          <div className="h-12 w-12 bg-black rounded-lg flex items-center justify-center">
            <LogIn className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
            <p className="text-sm text-slate-500">Access your business ledger</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Email address</label>
            <input 
              required
              type="email" 
              placeholder="name@company.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700">Password</label>
            </div>
            <input 
              required
              type="password" 
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-xs text-red-600 font-medium text-center">{error}</p>
            </div>
          )}

          <button 
            disabled={loading}
            className="w-full bg-black text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
            {loading ? "Signing in..." : "Continue"}
          </button>
        </form>

        <footer className="pt-10 text-center">
          <p className="text-xs text-slate-400">
            Securely managed by Garment Unit Manager System
          </p>
        </footer>
      </div>
    </div>
  );
}


