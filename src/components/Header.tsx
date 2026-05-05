import { Link, useNavigate } from "react-router-dom";
import { Tractor, Menu, Search, User, LogOut, X, ChevronRight, LayoutDashboard } from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [portal, setPortal] = useState<"farmer" | "provider">("farmer");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setPortal(parsedUser.role === "provider" ? "provider" : "farmer");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?location=${searchQuery}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-krishi-green/10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-krishi-green p-2 rounded-lg group-hover:bg-krishi-olive transition-colors">
            <Tractor className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-serif font-bold text-krishi-green tracking-tight">Krishi Rental</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/" className="hover:text-krishi-green transition-colors">Home</Link>
          {portal === "farmer" ? (
            <>
              <Link to="/explore" className="hover:text-krishi-green transition-colors">Explore</Link>
              <Link to="/dashboard" className="hover:text-krishi-green transition-colors">My Bookings</Link>
            </>
          ) : (
            <>
              <Link to="/provider-dashboard" className="hover:text-krishi-green transition-colors">Fleet Stats</Link>
              <Link to="/provider-dashboard" className="hover:text-krishi-green transition-colors">Manage Requests</Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {!user && (
            <div className="hidden lg:flex p-1 bg-slate-100 rounded-xl">
              <button 
                onClick={() => { setPortal("farmer"); navigate("/explore"); }}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                  portal === "farmer" ? "bg-white text-krishi-green shadow-sm" : "text-slate-400"
                )}
              >
                Farmer
              </button>
              <button 
                onClick={() => { setPortal("provider"); navigate("/provider-register"); }}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                  portal === "provider" ? "bg-white text-krishi-green shadow-sm" : "text-slate-400"
                )}
              >
                Provider
              </button>
            </div>
          )}
          
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block"
          >
            {isSearchOpen ? <X className="w-5 h-5 text-red-500" /> : <Search className="w-5 h-5" />}
          </button>
          
          <div className="relative">
            {user ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-krishi-green transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-krishi-saffron flex items-center justify-center text-[10px] uppercase shadow-sm">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden md:inline">{user.name}</span>
                </button>
                
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 overflow-hidden"
                    >
                      <Link 
                        to={user.role === "provider" ? "/provider-dashboard" : "/dashboard"}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors text-slate-700 font-bold"
                      >
                        <LayoutDashboard className="w-4 h-4 text-krishi-green" />
                        <span>My Dashboard</span>
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl transition-colors text-red-500 font-bold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link 
                to="/login"
                className="flex items-center gap-2 bg-krishi-green text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-krishi-olive transition-colors shadow-lg shadow-krishi-green/10"
              >
                <User className="w-4 h-4" />
                <span>Login / Register</span>
              </Link>
            )}
          </div>

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-full"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Global Search Bar Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-slate-900"
          >
            <div className="container mx-auto px-4 py-6">
              <form onSubmit={handleSearch} className="flex items-center gap-4">
                <Search className="w-6 h-6 text-slate-400" />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Seach by location or village..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none text-white text-xl focus:outline-none placeholder:text-slate-600"
                />
                <button type="submit" className="px-6 py-2 bg-krishi-green text-white rounded-full font-bold">
                  Search
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed inset-0 z-40 bg-white md:hidden"
          >
            <div className="p-4 pt-20 flex flex-col gap-6">
              <div className="flex flex-col gap-4 border-b border-gray-100 pb-8">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-slate-900 flex items-center justify-between">
                  <span>Home</span>
                  <ChevronRight className="w-6 h-6 text-slate-300" />
                </Link>
                <Link to="/explore" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-slate-900 flex items-center justify-between">
                  <span>Explore Equipment</span>
                  <ChevronRight className="w-6 h-6 text-slate-300" />
                </Link>
                {user && (
                  <Link to={user.role === "provider" ? "/provider-dashboard" : "/dashboard"} onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-slate-900 flex items-center justify-between">
                    <span>Manage My Bookings</span>
                    <ChevronRight className="w-6 h-6 text-slate-300" />
                  </Link>
                )}
              </div>
              
              {!user && (
                <Link 
                  to="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-4 bg-krishi-green text-white rounded-2xl font-black text-center"
                >
                  Join Krishi Rental
                </Link>
              )}
              
              {user && (
                <button 
                  onClick={handleLogout}
                  className="w-full py-4 bg-red-50 text-red-500 rounded-2xl font-black text-center"
                >
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
