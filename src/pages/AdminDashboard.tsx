import React, { useState, useEffect } from "react";
import { 
  Users, 
  Tractor, 
  Calendar, 
  TrendingUp, 
  Search, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X,
  Loader2,
  MoreVertical,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/src/lib/utils";

interface Stat {
  totalEquipment: number;
  totalBookings: number;
  totalUsers: number;
  totalRevenue: number;
}

interface User {
  email: string;
  name: string;
  role: string;
}

interface Equipment {
  id: number;
  name: string;
  type: string;
  price: number;
  location: string;
  ownerId: string;
}

interface Booking {
  id: number;
  equipmentName: string;
  date: string;
  status: string;
  renterName: string;
  ownerId: string;
}

type Tab = "overview" | "users" | "machinery" | "bookings";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stat | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      navigate("/login");
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== "admin") {
      navigate("/");
      return;
    }

    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, equipRes, bookingsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/users"),
        fetch("/api/equipment"),
        fetch("/api/bookings")
      ]);

      const [statsData, usersData, equipData, bookingsData] = await Promise.all([
        statsRes.json(),
        usersRes.json(),
        equipRes.json(),
        bookingsRes.json()
      ]);

      setStats(statsData);
      setUsers(usersData);
      setEquipment(equipData);
      setBookings(bookingsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const deleteUser = async (email: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/admin/users/${email}`, { method: "DELETE" });
      if (res.ok) {
        setUsers(users.filter(u => u.email !== email));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMachinery = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this machinery?")) return;
    try {
      const res = await fetch(`/api/equipment/${id}`, { method: "DELETE" });
      if (res.ok) {
        setEquipment(equipment.filter(e => e.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-krishi-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 z-50 transform transition-transform lg:relative lg:translate-x-0 transition-all",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-krishi-green rounded-xl flex items-center justify-center text-white shadow-lg shadow-krishi-green/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif font-black text-xl tracking-tight leading-none text-slate-900">Krishi</h1>
              <span className="text-[10px] font-black uppercase tracking-widest text-krishi-olive">Admin Panel</span>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {[
              { id: "overview", label: "Overview", icon: TrendingUp },
              { id: "users", label: "User Management", icon: Users },
              { id: "machinery", label: "Machinery", icon: Tractor },
              { id: "bookings", label: "Global Bookings", icon: Calendar },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as Tab);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all text-sm",
                  activeTab === item.id 
                    ? "bg-krishi-green/10 text-krishi-green" 
                    : "text-slate-500 hover:bg-slate-50"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          <button 
            onClick={handleLogout}
            className="mt-auto flex items-center gap-4 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-bold transition-all text-sm"
          >
            <LogOut className="w-5 h-5" />
            Logout Session
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-6 lg:px-10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-50 rounded-lg text-slate-500"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-serif font-black text-slate-900 capitalize italic">{activeTab.replace("-", " ")}</h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-black text-slate-900">Administrator</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">Verified Authority</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 overflow-hidden">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: "Total Machinery", value: stats?.totalEquipment, icon: Tractor, color: "text-blue-600 bg-blue-50" },
                    { label: "Active Bookings", value: stats?.totalBookings, icon: Calendar, color: "text-amber-600 bg-amber-50" },
                    { label: "Community Size", value: stats?.totalUsers, icon: Users, color: "text-indigo-600 bg-indigo-50" },
                    { label: "Ecosystem Rev", value: `₹${stats?.totalRevenue}`, icon: TrendingUp, color: "text-krishi-green bg-krishi-green/5" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm transition-all hover:shadow-md">
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", stat.color)}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest block mb-1">{stat.label}</span>
                      <span className="text-3xl font-serif font-black text-slate-900">{stat.value}</span>
                    </div>
                  ))}
                </div>

                {/* Recent Activity Mini Tables */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-serif font-black text-slate-900">Recent Machinery</h3>
                      <button onClick={() => setActiveTab("machinery")} className="text-xs font-black uppercase text-krishi-green flex items-center gap-1">View All <ChevronRight className="w-4 h-4" /></button>
                    </div>
                    <div className="space-y-4">
                      {equipment.slice(0, 5).map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-400">
                              <Tractor className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-sm font-bold text-slate-900 block">{item.name}</span>
                              <span className="text-[10px] uppercase font-bold text-slate-400">{item.type} • {item.location}</span>
                            </div>
                          </div>
                          <span className="text-sm font-black text-krishi-green">₹{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-serif font-black text-slate-900">Recent Bookings</h3>
                      <button onClick={() => setActiveTab("bookings")} className="text-xs font-black uppercase text-krishi-green flex items-center gap-1">View All <ChevronRight className="w-4 h-4" /></button>
                    </div>
                    <div className="space-y-4">
                      {bookings.slice(0, 5).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-400">
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-sm font-bold text-slate-900 block">{booking.equipmentName}</span>
                              <span className="text-[10px] uppercase font-bold text-slate-400">{booking.renterName} • {booking.date}</span>
                            </div>
                          </div>
                          <div className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight",
                            booking.status === "Confirmed" ? "bg-krishi-green/10 text-krishi-green" : "bg-amber-100 text-amber-600"
                          )}>
                            {booking.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "users" && (
              <motion.div 
                key="users"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm"
              >
                <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-serif font-black text-slate-900">Platform Users</h3>
                    <p className="text-slate-500 text-sm font-medium">Manage farmers and machine providers</p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search users..." 
                      className="pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-krishi-green/20 text-sm w-full md:w-64"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-widest italic font-serif">Name & Identity</th>
                        <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-widest italic font-serif">Platform Role</th>
                        <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-widest italic font-serif text-right">Administrative Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 italic font-serif">
                      {users.map((user) => (
                        <tr key={user.email} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black">
                                {user.name.charAt(0)}
                              </div>
                              <div className="normal-case font-sans">
                                <span className="font-bold text-slate-900 block">{user.name}</span>
                                <span className="text-xs text-slate-500 uppercase tracking-tight">{user.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight font-sans",
                              user.role === "admin" ? "bg-slate-900 text-white" : 
                              user.role === "provider" ? "bg-blue-100 text-blue-600" : "bg-indigo-100 text-indigo-600"
                            )}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            {user.role !== "admin" && (
                              <button 
                                onClick={() => deleteUser(user.email)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === "machinery" && (
              <motion.div 
                key="machinery"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm"
              >
                <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-serif font-black text-slate-900">Machinery Registry</h3>
                    <p className="text-slate-500 text-sm font-medium">Inventory control across Maharashtra</p>
                  </div>
                </div>
                <div className="overflow-x-auto italic font-serif">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-widest">Model & State</th>
                        <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-widest">Type</th>
                        <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-widest">Price / hr</th>
                        <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {equipment.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6">
                            <div className="font-sans">
                              <span className="font-bold text-slate-900 block">{item.name}</span>
                              <span className="text-xs text-slate-500 uppercase tracking-tight">{item.location}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-xs font-bold text-slate-500 font-sans uppercase">{item.type}</span>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-sm font-black text-krishi-green font-sans">₹{item.price}</span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button 
                              onClick={() => deleteMachinery(item.id)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === "bookings" && (
              <motion.div 
                key="bookings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm"
              >
                <div className="p-8 border-b border-slate-100">
                  <h3 className="text-2xl font-serif font-black text-slate-900">Ecosystem Bookings</h3>
                  <p className="text-slate-500 text-sm font-medium">Tracking all rental transactions</p>
                </div>
                <div className="overflow-x-auto italic font-serif">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-widest text-sans">Transaction Detail</th>
                        <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-widest text-sans">Contractors</th>
                        <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-widest text-sans">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6">
                            <div className="font-sans">
                              <span className="font-bold text-slate-900 block">{booking.equipmentName}</span>
                              <span className="text-xs text-slate-500 uppercase tracking-tight">{booking.date}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="font-sans">
                              <span className="text-xs font-bold text-slate-900 block">{booking.renterName} (Renter)</span>
                              <span className="text-xs text-slate-400 block">{booking.ownerId} (Provider)</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight font-sans",
                              booking.status === "Confirmed" ? "bg-krishi-green/10 text-krishi-green" : "bg-amber-100 text-amber-600"
                            )}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
