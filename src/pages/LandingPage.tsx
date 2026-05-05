import React, { useState } from "react";
import { Search, MapPin, Tractor, ChevronRight, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";

export default function LandingPage() {
  const [location, setLocation] = useState("");
  const [equipmentType, setEquipmentType] = useState("All Equipment");
  const navigate = useNavigate();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.append("location", location);
    if (equipmentType !== "All Equipment") params.append("type", equipmentType);
    navigate(`/explore?${params.toString()}`);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-krishi-green rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-krishi-saffron rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-20 md:py-32 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-krishi-green/10 text-krishi-green text-sm font-bold uppercase tracking-widest mb-6">
            Trusted by 10,000+ Farmers
          </span>
          <h1 className="text-5xl md:text-7xl font-serif font-black text-slate-900 leading-[1.1] mb-8 max-w-4xl mx-auto">
            Rent <span className="text-krishi-green italic">Tractors</span>, Drones & Harvesters <span className="text-krishi-saffron">Instantly</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-12">
            Empowering Indian agriculture with easy access to modern machinery. 
            Efficient, reliable, and affordable rentals at your fingertips.
          </p>
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-4xl bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-2xl shadow-krishi-green/10 flex flex-col md:flex-row gap-4 items-center"
        >
          <div className="flex-1 w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
            <MapPin className="w-5 h-5 text-krishi-green" />
            <div className="flex flex-col items-start w-full text-left">
              <span className="text-[10px] uppercase font-bold text-gray-400">Location</span>
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter Village or District" 
                className="bg-transparent border-none focus:outline-none text-sm font-semibold placeholder:text-gray-300 w-full"
              />
            </div>
          </div>

          <div className="hidden md:block w-px h-10 bg-gray-200" />

          <div className="flex-1 w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
            <Tractor className="w-5 h-5 text-krishi-green" />
            <div className="flex flex-col items-start w-full text-left">
              <span className="text-[10px] uppercase font-bold text-gray-400">Equipment Type</span>
              <select 
                value={equipmentType}
                onChange={(e) => setEquipmentType(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-sm font-semibold w-full appearance-none cursor-pointer"
              >
                <option>All Equipment</option>
                <option value="Tractor">Tractors</option>
                <option value="Drone">Drones</option>
                <option value="Harvester">Harvesters</option>
                <option>Implements</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleSearch}
            className="w-full md:w-auto px-8 py-4 bg-krishi-green text-white rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-krishi-olive transition-all transform hover:scale-[1.02] shadow-lg shadow-krishi-green/20"
          >
            <Search className="w-5 h-5" />
            <span>Explore Equipment</span>
          </button>
        </motion.div>

        {/* Stats / Quick Info */}
        <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-5xl">
          {[
            { label: "Machinery Types", value: "25+" },
            { label: "Verified Owners", value: "500+" },
            { label: "Farmers Served", value: "10k+" },
            { label: "Districts Active", value: "50+" },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex flex-col items-center"
            >
              <span className="text-3xl font-serif font-black text-krishi-green">{stat.value}</span>
              <span className="text-xs uppercase tracking-widest font-bold text-gray-400 mt-1">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Hero Image Section */}
      <section className="container mx-auto px-4 pb-20">
        <div className="relative rounded-[2rem] overflow-hidden aspect-[16/9] md:aspect-[21/9]">
          <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1920" 
            alt="Farming machines" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-8 md:p-12">
            <div className="text-white">
              <h3 className="text-2xl md:text-3xl font-serif font-bold mb-2">Modernizing India's Fields</h3>
              <p className="text-sm md:text-base opacity-80 max-w-md">Access state-of-the-art agricultural technology without the heavy investment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* For Owners Section */}
      <section className="bg-slate-50 py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 bg-white rounded-[3rem] p-8 md:p-16 shadow-xl border border-slate-100">
            <div className="flex-1 space-y-6">
              <span className="inline-block px-4 py-1.5 rounded-full bg-krishi-green/10 text-krishi-green text-xs font-black uppercase tracking-widest">
                For Machinery Owners
              </span>
              <h2 className="text-4xl md:text-5xl font-serif font-black text-slate-900 leading-tight">
                Turn Your Machinery into an <span className="text-krishi-green">Asset</span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Do you own a tractor, drone, or harvester? Don't let it sit idle. Join Krishi Rental 
                and start earning by renting your equipment to verified farmers in your region.
              </p>
              <ul className="space-y-4">
                {[
                  "Set your own hourly rates",
                  "Manage requests on your portal",
                  "Verified farmer profiles",
                  "Secure payout tracking"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-bold text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-krishi-green" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                <Link 
                  to="/provider-register"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
                >
                  <span>Register as Provider</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
            <div className="flex-1 w-full relative">
              <div className="absolute -inset-4 bg-krishi-green/5 rounded-[2.5rem] rotate-2" />
              <img 
                src="https://images.unsplash.com/photo-1594913785465-b77da1796791?auto=format&fit=crop&q=80&w=800" 
                alt="Owner managing machinery" 
                className="relative rounded-[2rem] shadow-2xl w-full aspect-video md:aspect-square object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
