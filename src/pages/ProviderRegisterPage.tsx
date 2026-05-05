import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Tractor, User, Mail, Lock, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

export default function ProviderRegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "provider" }),
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem("user", JSON.stringify({ ...data.user, role: "provider" }));
        navigate("/provider-dashboard");
      } else {
        setError(data.message || "Registration failed");
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
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-krishi-green p-4 rounded-2xl mb-4 shadow-lg shadow-krishi-green/20 text-white">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-serif font-black text-slate-900">Partner with Us</h1>
          <p className="text-slate-500 mt-2">Sign up as an Equipment Provider and start earning</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 italic text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs uppercase font-black text-slate-400 tracking-widest pl-1">Business or Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Swaraj Farm Services"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-krishi-green/20 font-medium transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase font-black text-slate-400 tracking-widest pl-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@service.com"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-krishi-green/20 font-medium transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase font-black text-slate-400 tracking-widest pl-1">Password</label>
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
            className="w-full py-4 bg-krishi-green text-white rounded-2xl font-black uppercase tracking-widest hover:bg-krishi-olive transition-all transform hover:translate-y-[-2px] disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2 shadow-xl shadow-krishi-green/20 mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <span>Become a Provider</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-50 text-center space-y-4">
          <p className="text-slate-500 text-sm font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-krishi-green font-black hover:underline">Sign In</Link>
          </p>
          <div className="h-px bg-slate-100 w-1/2 mx-auto" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            Want to rent instead?{" "}
            <Link to="/register" className="text-slate-600 hover:text-krishi-green transition-colors">Join as Farmer</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
