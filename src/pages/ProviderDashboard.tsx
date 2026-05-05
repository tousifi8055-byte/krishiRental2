import React, { useState, useEffect } from "react";
import { 
  Tractor, 
  Package, 
  IndianRupee, 
  TrendingUp, 
  Plus, 
  Clock, 
  CheckCircle2, 
  User, 
  Settings,
  MoreVertical,
  Star,
  Banknote,
  CreditCard,
  Trash2,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

interface Equipment {
  id: number;
  name: string;
  type: string;
  price: number;
  rating: number;
  image: string;
  location?: string;
}

interface BookingRequest {
  id: number;
  equipmentName: string;
  date: string;
  renterName: string;
  renterEmail?: string;
  status: "Confirmed" | "Pending" | "Rejected";
  paymentMethod?: "cash" | "online";
}

export default function ProviderDashboard() {
  const [myEquipment, setMyEquipment] = useState<Equipment[]>([]);
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"listings" | "requests">("listings");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ message: string; sub: string } | null>(null);
  
  // Get ownerId from logged in user
  const storedUser = localStorage.getItem("user");
  const userData = storedUser ? JSON.parse(storedUser) : null;
  const ownerId = userData?.email || "owner123";

  // New machinery form state
  const [newMachine, setNewMachine] = useState({
    name: "",
    type: "Tractor",
    price: "",
    location: "",
    image: ""
  });
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (isEditing) {
          setEditingEquipment(prev => prev ? ({ ...prev, image: base64String }) : null);
        } else {
          setNewMachine(prev => ({ ...prev, image: base64String }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchData = async () => {
    try {
      const [equipRes, bookingsRes] = await Promise.all([
        fetch(`/api/provider/equipment/${ownerId}`),
        fetch(`/api/provider/bookings/${ownerId}`)
      ]);
      const equipData = await equipRes.json();
      const bookingsData = await bookingsRes.json();
      setMyEquipment(equipData);
      setRequests(bookingsData);
    } catch (err) {
      console.error("Error fetching provider data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddMachinery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newMachine,
          ownerId,
          price: Number(newMachine.price)
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowAddForm(false);
        setNewMachine({ name: "", type: "Tractor", price: "", location: "", image: "" });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMachinery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEquipment) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/equipment/${editingEquipment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingEquipment,
          price: Number(editingEquipment.price)
        })
      });
      const data = await res.json();
      if (data.success) {
        setEditingEquipment(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: "Confirmed" | "Rejected") => {
    try {
      const targetRequest = requests.find(r => r.id === id);
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        if (status === "Confirmed" && targetRequest) {
          // Simulate sending notification/email
          setNotification({
            message: "Approval Sent!",
            sub: `A confirmation email has been sent to ${targetRequest.renterEmail || targetRequest.renterName}.`
          });
          setTimeout(() => setNotification(null), 5000);
        }
        fetchData();
      }
    } catch (err) {
      console.error("Error updating status", err);
    }
  };

  const handleDeleteEquipment = async (id: number) => {
    if (!confirm("Are you sure you want to remove this equipment?")) return;
    try {
      const res = await fetch(`/api/equipment/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error("Error deleting equipment", err);
    }
  };

  const stats = [
    { label: "Active Listings", value: myEquipment.length, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Earnings", value: `₹${myEquipment.reduce((acc, curr) => acc + (curr.price * 5), 0)}`, icon: IndianRupee, color: "text-krishi-green", bg: "bg-krishi-green/10" },
    { label: "Pending Requests", value: requests.filter(r => r.status === "Pending").length, icon: Clock, color: "text-krishi-saffron", bg: "bg-krishi-saffron/10" },
    { label: "Rating", value: "4.8/5", icon: Star, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-serif font-black text-slate-900 mb-2">Provider Portal</h1>
          <p className="text-slate-600">Grow your rental business by managing your fleet and requests.</p>
        </div>
        
        <button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-krishi-green text-white rounded-2xl font-bold hover:bg-krishi-olive transition-all shadow-lg shadow-krishi-green/20"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Machinery</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4"
          >
            <div className={cn("p-4 rounded-2xl", stat.bg, stat.color)}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">{stat.label}</span>
              <span className="text-2xl font-black text-slate-900 font-serif">{stat.value}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 p-1 bg-white rounded-2xl w-fit border border-gray-100 shadow-sm">
        <button
          onClick={() => setActiveTab("listings")}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all",
            activeTab === "listings" ? "bg-krishi-green text-white" : "text-slate-500 hover:text-slate-900"
          )}
        >
          My Listings
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all",
            activeTab === "requests" ? "bg-krishi-green text-white" : "text-slate-500 hover:text-slate-900"
          )}
        >
          Incoming Requests
        </button>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {activeTab === "listings" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {myEquipment.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm group hover:shadow-xl transition-all"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 z-10 flex flex-col items-end">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                      className="bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-sm cursor-pointer hover:bg-white transition-colors"
                    >
                      <MoreVertical className="w-5 h-5 text-slate-600" />
                    </button>
                    <AnimatePresence>
                      {openMenuId === item.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: -10 }}
                          className="mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 min-w-[140px]"
                        >
                          <button 
                            onClick={() => {
                              handleDeleteEquipment(item.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl text-sm font-bold transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Remove Listing</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{item.name}</h3>
                      <span className="text-xs uppercase font-black text-krishi-green bg-krishi-green/10 px-2.5 py-1 rounded-full">
                        {item.type}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-slate-900 font-serif">₹{item.price}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">per hour</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Status</span>
                      <span className="text-sm font-bold text-green-600">Active</span>
                    </div>
                    <div className="flex flex-col ml-auto">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Total Hours Rented</span>
                      <span className="text-sm font-bold text-slate-900">124 hrs</span>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6 pt-6 border-t border-slate-100">
                    <button 
                      onClick={() => handleDeleteEquipment(item.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all shadow-sm shadow-red-100/50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                    <button 
                      onClick={() => setEditingEquipment(item)}
                      className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                    >
                      Edit Listing
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {requests.map((request, i) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center gap-6 justify-between hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-slate-50 flex items-center justify-center rounded-2xl text-slate-400">
                    <User className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{request.renterName}</h3>
                    <div className="flex items-center gap-3 mt-0.5 italic text-sm text-slate-500">
                      <span>{request.equipmentName}</span>
                      <span>•</span>
                      <span>{request.date}</span>
                      {request.paymentMethod && (
                        <>
                          <span>•</span>
                          <span className={cn(
                            "flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                            request.paymentMethod === "cash" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-sky-50 text-sky-600 border-sky-100"
                          )}>
                            {request.paymentMethod === "cash" ? <Banknote className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                            {request.paymentMethod === "online" ? "Paid Online" : "Cash on Delivery"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {request.status === "Pending" ? (
                    <>
                      <button 
                        onClick={() => handleUpdateStatus(request.id, "Rejected")}
                        className="px-5 py-2.5 border border-red-100 text-red-500 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors"
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(request.id, "Confirmed")}
                        className="px-5 py-2.5 bg-krishi-green text-white rounded-xl text-sm font-bold hover:bg-krishi-olive transition-all shadow-md shadow-krishi-green/10"
                      >
                        Approve
                      </button>
                    </>
                  ) : request.status === "Confirmed" ? (
                    <div className="flex items-center gap-2 text-green-600 font-bold px-4 py-2 bg-green-50 rounded-xl text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approved</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600 font-bold px-4 py-2 bg-red-50 rounded-xl text-sm font-serif italic">
                      <span>Rejected</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {requests.length === 0 && (
              <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
                <p className="text-slate-400">No rental requests at the moment.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Machinery Modal Placeholder */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl"
            >
              <h2 className="text-3xl font-serif font-black text-slate-900 mb-2">List Your Machinery</h2>
              <p className="text-slate-500 mb-8">Set your own price and start earning from your equipment.</p>
              
              <form onSubmit={handleAddMachinery} className="space-y-5">
                <div>
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Machine Name</label>
                  <input 
                    type="text" 
                    required
                    value={newMachine.name}
                    onChange={(e) => setNewMachine(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Sonalika GT 20" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-krishi-green/20" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Type</label>
                    <select 
                      value={newMachine.type}
                      onChange={(e) => setNewMachine(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-krishi-green/20 appearance-none"
                    >
                      <option>Tractor</option>
                      <option>Harvester</option>
                      <option>Drone</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Price / hr (₹)</label>
                    <input 
                      type="number" 
                      required
                      value={newMachine.price}
                      onChange={(e) => setNewMachine(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="500" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-krishi-green/20" 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Location</label>
                  <input 
                    type="text" 
                    required
                    value={newMachine.location}
                    onChange={(e) => setNewMachine(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. Pune, Maharashtra" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-krishi-green/20" 
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Machine Image</label>
                  <div className="mt-2 flex flex-col gap-4">
                    {newMachine.image && (
                      <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-100">
                        <img src={newMachine.image} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setNewMachine(prev => ({ ...prev, image: "" }))}
                          className="absolute top-2 right-2 p-1 bg-white/80 backdrop-blur-sm rounded-full text-red-500 shadow-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <div className="flex gap-4">
                      <label className="flex-1 cursor-pointer">
                        <div className="w-full py-3 bg-white border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-krishi-green transition-colors">
                          <Plus className="w-5 h-5 text-slate-400" />
                          <span className="text-xs font-bold text-slate-500">Upload Image</span>
                        </div>
                        <input 
                          type="file" 
                          accept="image/*"
                          className="hidden" 
                          onChange={(e) => handleImageUpload(e)}
                        />
                      </label>
                      <div className="flex-1 flex flex-col gap-1">
                        <input 
                          type="url" 
                          value={newMachine.image.startsWith("data:") ? "" : newMachine.image}
                          onChange={(e) => setNewMachine(prev => ({ ...prev, image: e.target.value }))}
                          placeholder="Or paste URL..." 
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-krishi-green/20 text-xs" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-krishi-green text-white rounded-2xl font-black uppercase tracking-widest hover:bg-krishi-olive transition-all mt-4 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Listing Machinery..." : "Confirm Listing"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Edit Machinery Modal */}
      <AnimatePresence>
        {editingEquipment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingEquipment(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl"
            >
              <h2 className="text-3xl font-serif font-black text-slate-900 mb-2">Edit Your Listing</h2>
              <p className="text-slate-500 mb-8">Update your equipment details to attract more renters.</p>
              
              <form onSubmit={handleEditMachinery} className="space-y-5">
                <div>
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Machine Name</label>
                  <input 
                    type="text" 
                    required
                    value={editingEquipment.name}
                    onChange={(e) => setEditingEquipment(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                    placeholder="e.g. Sonalika GT 20" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-krishi-green/20" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Type</label>
                    <select 
                      value={editingEquipment.type}
                      onChange={(e) => setEditingEquipment(prev => prev ? ({ ...prev, type: e.target.value }) : null)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-krishi-green/20 appearance-none"
                    >
                      <option>Tractor</option>
                      <option>Harvester</option>
                      <option>Drone</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Price / hr (₹)</label>
                    <input 
                      type="number" 
                      required
                      value={editingEquipment.price}
                      onChange={(e) => setEditingEquipment(prev => prev ? ({ ...prev, price: Number(e.target.value) }) : null)}
                      placeholder="500" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-krishi-green/20" 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Location</label>
                  <input 
                    type="text" 
                    required
                    value={editingEquipment.location || ""}
                    onChange={(e) => setEditingEquipment(prev => prev ? ({ ...prev, location: e.target.value }) : null)}
                    placeholder="e.g. Pune, Maharashtra" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-krishi-green/20" 
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Machine Image</label>
                  <div className="mt-2 flex flex-col gap-4">
                    {editingEquipment.image && (
                      <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-100">
                        <img src={editingEquipment.image} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setEditingEquipment(prev => prev ? ({ ...prev, image: "" }) : null)}
                          className="absolute top-2 right-2 p-1 bg-white/80 backdrop-blur-sm rounded-full text-red-500 shadow-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <div className="flex gap-4">
                      <label className="flex-1 cursor-pointer">
                        <div className="w-full py-3 bg-white border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-krishi-green transition-colors">
                          <Plus className="w-5 h-5 text-slate-400" />
                          <span className="text-xs font-bold text-slate-500">Upload New</span>
                        </div>
                        <input 
                          type="file" 
                          accept="image/*"
                          className="hidden" 
                          onChange={(e) => handleImageUpload(e, true)}
                        />
                      </label>
                      <div className="flex-1 flex flex-col gap-1">
                        <input 
                          type="url" 
                          value={editingEquipment.image.startsWith("data:") ? "" : editingEquipment.image}
                          onChange={(e) => setEditingEquipment(prev => prev ? ({ ...prev, image: e.target.value }) : null)}
                          placeholder="Or paste URL..." 
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-krishi-green/20 text-xs" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button 
                    type="button"
                    onClick={() => setEditingEquipment(null)}
                    className="flex-1 py-4 border border-slate-100 text-slate-400 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] py-4 bg-krishi-green text-white rounded-2xl font-black uppercase tracking-widest hover:bg-krishi-olive transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-[100] bg-slate-900 text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-5 border border-slate-800"
          >
            <div className="bg-krishi-green p-2 rounded-2xl">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-serif font-black text-lg leading-tight">{notification.message}</p>
              <p className="text-sm text-slate-400 mt-0.5">{notification.sub}</p>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="ml-4 p-2 hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-[100] bg-slate-900 text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-5 border border-slate-800"
          >
            <div className="bg-krishi-green p-2 rounded-2xl">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-serif font-black text-lg leading-tight">{notification.message}</p>
              <p className="text-sm text-slate-400 mt-0.5">{notification.sub}</p>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="ml-4 p-2 hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
