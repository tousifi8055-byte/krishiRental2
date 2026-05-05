import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Tractor, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (data.success) {
        // Save user to local storage for demo purposes
        localStorage.setItem("user", JSON.stringify(data.user));
        
        if (data.user.role === "admin") {
          navigate("/admin-dashboard");
        } else if (data.user.role === "provider") {
          navigate("/provider-dashboard");
        } else {
          navigate("/explore");
        }
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-krishi-green/10 p-8 md:p-12"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="bg-krishi-green p-4 rounded-2xl mb-4 shadow-lg shadow-krishi-green/20">
            <Tractor className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-serif font-black text-slate-900">Welcome Back</h1>
          <p className="text-slate-500 mt-2">Sign in to your Krishi account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 italic">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase font-black text-slate-400 tracking-widest pl-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@village.com"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-krishi-green/20 font-medium transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end pl-1">
              <label className="text-xs uppercase font-black text-slate-400 tracking-widest">Password</label>
              <button type="button" className="text-xs font-bold text-krishi-green hover:underline">Forgot?</button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-krishi-green/20 font-medium transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-krishi-green text-white rounded-2xl font-black uppercase tracking-widest hover:bg-krishi-olive transition-all transform hover:translate-y-[-2px] disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2 shadow-xl shadow-krishi-green/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-50 text-center space-y-4">
          <p className="text-slate-500 text-sm font-medium">
            New to Krishi Rental?{" "}
            <Link to="/register" className="text-krishi-green font-black hover:underline">Create Account</Link>
          </p>
          <div className="h-px bg-slate-50 w-1/2 mx-auto" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            Own machinery?{" "}
            <Link to="/provider-register" className="text-slate-600 hover:text-krishi-green transition-colors">Register as Provider</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
