import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Tractor, MapPin, Calendar, HardHat, Phone, Loader2, CheckCircle2, CreditCard, Banknote, Smartphone, QrCode, AtSign, X, ShieldCheck } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface Equipment {
  id: number;
  name: string;
  type: string;
  price: number;
  image: string;
  ownerId: string;
}

export default function BookingFormPage() {
  const [searchParams] = useSearchParams();
  const equipmentId = searchParams.get("equipmentId");
  const navigate = useNavigate();
  
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "online">("cash");
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiStep, setUpiStep] = useState<"apps" | "qr" | "vpa">("apps");
  const [vpa, setVpa] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    village: "",
    district: "",
    landSize: "",
    bookingDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (!equipmentId) {
      navigate("/explore");
      return;
    }

    fetch("/api/equipment")
      .then(res => res.json())
      .then(data => {
        const item = data.find((e: Equipment) => e.id === Number(equipmentId));
        if (item) {
          setEquipment(item);
        } else {
          navigate("/explore");
        }
        setLoading(false);
      });
    
    // Auto-fill from local storage if available
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      setFormData(prev => ({ ...prev, fullName: userData.name || "", email: userData.email || "" }));
    } else {
      navigate("/login");
    }
  }, [equipmentId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === "online" && !showUpiModal) {
      setShowUpiModal(true);
      return;
    }

    setBookingLoading(true);

    try {
      const user = localStorage.getItem("user");
      const userData = user ? JSON.parse(user) : null;

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipmentId: equipment?.id,
          equipmentName: equipment?.name,
          date: formData.bookingDate,
          renterInfo: formData, // Sending extra info
          paymentMethod: paymentMethod,
          renterName: formData.fullName,
          ownerId: equipment?.ownerId,
          renterEmail: userData?.email || "",
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowSuccess(true);
        setTimeout(() => navigate("/dashboard"), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePaymentComplete = () => {
    setBookingLoading(true);
    setShowUpiModal(false);
    // Submit form after simulation
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSubmit(fakeEvent);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-krishi-green" /></div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="flex flex-col md:flex-row">
          {/* Equipment Preview */}
          <div className="w-full md:w-1/3 bg-slate-50 p-8 border-r border-slate-100">
            <h3 className="text-xl font-serif font-black text-slate-900 mb-6">Booking Details</h3>
            <div className="rounded-2xl overflow-hidden mb-4 shadow-md">
              <img src={equipment?.image} alt={equipment?.name} className="w-full aspect-square object-cover" />
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">Machine</span>
                <span className="font-bold text-slate-900">{equipment?.name}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">Rental Rate</span>
                <span className="font-bold text-krishi-green">₹{equipment?.price} per hour</span>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-500 italic">
                  "Ensure your field is ready for the machinery on the scheduled date."
                </p>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="flex-1 p-8 md:p-12">
            {showSuccess ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 bg-krishi-green rounded-full flex items-center justify-center text-white mb-6"
                >
                  <CheckCircle2 className="w-10 h-10" />
                </motion.div>
                <h2 className="text-3xl font-serif font-black text-slate-900 mb-4">Booking Successful!</h2>
                <p className="text-slate-600 mb-8">
                  Your request has been sent to the owner. You will be redirected to your dashboard shortly.
                </p>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold"
                >
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-serif font-black text-slate-900 mb-2">Farmer Information</h2>
                <p className="text-slate-500 mb-8">Please provide your details to complete the rental booking.</p>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-slate-400 pl-1 tracking-widest">Full Name</label>
                    <div className="relative">
                      <HardHat className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-krishi-green/20 outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-slate-400 pl-1 tracking-widest">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-krishi-green/20 outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-slate-400 pl-1 tracking-widest">Village</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={formData.village}
                        onChange={(e) => setFormData(prev => ({ ...prev, village: e.target.value }))}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-krishi-green/20 outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-slate-400 pl-1 tracking-widest">District</label>
                    <input
                      type="text"
                      required
                      value={formData.district}
                      onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-krishi-green/20 outline-none font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-slate-400 pl-1 tracking-widest">Land Size (Acres)</label>
                    <input
                      type="number"
                      required
                      value={formData.landSize}
                      onChange={(e) => setFormData(prev => ({ ...prev, landSize: e.target.value }))}
                      placeholder="e.g. 5"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-krishi-green/20 outline-none font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-slate-400 pl-1 tracking-widest">Required Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="date"
                        required
                        value={formData.bookingDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, bookingDate: e.target.value }))}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-krishi-green/20 outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-4 pt-6">
                    <label className="text-[10px] uppercase font-black text-slate-400 pl-1 tracking-widest block">Payment Method</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("cash")}
                        className={cn(
                          "flex items-center justify-center gap-3 p-4 border rounded-2xl transition-all",
                          paymentMethod === "cash" 
                            ? "bg-krishi-green/10 border-krishi-green text-krishi-green ring-2 ring-krishi-green/20" 
                            : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                        )}
                      >
                        <Banknote className="w-5 h-5" />
                        <span className="font-bold">Pay by Cash</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("online")}
                        className={cn(
                          "flex items-center justify-center gap-3 p-4 border rounded-2xl transition-all",
                          paymentMethod === "online" 
                            ? "bg-krishi-green/10 border-krishi-green text-krishi-green ring-2 ring-krishi-green/20" 
                            : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                        )}
                      >
                        <CreditCard className="w-5 h-5" />
                        <span className="font-bold">Online Payment</span>
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-2 pt-6">
                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="w-full py-4 bg-krishi-green text-white rounded-2xl font-black uppercase tracking-widest hover:bg-krishi-olive transition-all flex items-center justify-center gap-2 shadow-xl shadow-krishi-green/20 transition-all transform hover:scale-[1.01]"
                    >
                      {bookingLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm & Book Now"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* UPI Payment Modal (Indian Specific) */}
      <AnimatePresence>
        {showUpiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUpiModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setShowUpiModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-slate-50 rounded-full text-slate-400"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="font-black font-serif text-xl tracking-tight italic text-blue-900">SecurePay India</span>
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-serif font-black text-slate-900">UPI Payment</h3>
                  <span className="text-krishi-green font-black">₹{equipment?.price}</span>
                </div>
                <p className="text-sm text-slate-500 font-medium">Select your preferred UPI method</p>
              </div>

              {/* Tabs */}
              <div className="flex bg-slate-50 p-1 rounded-2xl mb-8">
                <button 
                  onClick={() => setUpiStep("apps")}
                  className={cn("flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all", upiStep === "apps" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                >
                  <Smartphone className="w-4 h-4" />
                  Apps
                </button>
                <button 
                  onClick={() => setUpiStep("qr")}
                  className={cn("flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all", upiStep === "qr" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                >
                  <QrCode className="w-4 h-4" />
                  QR Code
                </button>
                <button 
                  onClick={() => setUpiStep("vpa")}
                  className={cn("flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all", upiStep === "vpa" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                >
                  <AtSign className="w-4 h-4" />
                  ID
                </button>
              </div>

              {/* Content Areas */}
              {upiStep === "apps" && (
                <div className="space-y-4">
                  {[
                    { name: "Google Pay", color: "bg-blue-50 text-blue-600 border-blue-100", icon: "G" },
                    { name: "PhonePe", color: "bg-purple-50 text-purple-600 border-purple-100", icon: "P" },
                    { name: "Paytm", color: "bg-sky-50 text-sky-600 border-sky-100", icon: "T" }
                  ].map((app) => (
                    <button
                      key={app.name}
                      onClick={handlePaymentComplete}
                      className={cn("w-full flex items-center justify-between p-4 border rounded-2xl group transition-all hover:scale-[1.02]", app.color)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-lg shadow-sm border border-black/5">
                          {app.icon}
                        </div>
                        <span className="font-black text-slate-900 group-hover:translate-x-1 transition-transform">{app.name}</span>
                      </div>
                      <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-krishi-green transition-colors" />
                    </button>
                  ))}
                </div>
              )}

              {upiStep === "qr" && (
                <div className="flex flex-col items-center">
                  <div className="bg-white p-6 rounded-3xl border-4 border-slate-50 mb-4 shadow-inner">
                    <div className="w-48 h-48 bg-slate-100 rounded-2xl flex items-center justify-center relative overflow-hidden">
                      {/* Fake QR segments */}
                      <div className="grid grid-cols-4 gap-2 opacity-20">
                        {Array.from({ length: 16 }).map((_, i) => (
                          <div key={i} className="w-8 h-8 bg-black rounded-sm" />
                        ))}
                      </div>
                      <QrCode className="absolute w-24 h-24 text-slate-900" />
                    </div>
                  </div>
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest text-center">
                    Scan with any UPI App<br/>
                    <span className="text-krishi-green">Confirm payment in your phone</span>
                  </p>
                  <button 
                    onClick={handlePaymentComplete}
                    className="mt-6 w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800"
                  >
                    Paid Successfully
                  </button>
                </div>
              )}

              {upiStep === "vpa" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-slate-400 pl-1 tracking-widest">Enter UPI ID (VPA)</label>
                    <input 
                      type="text"
                      value={vpa}
                      onChange={(e) => setVpa(e.target.value)}
                      placeholder="farmer@oksbi"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none font-bold text-center placeholder:text-slate-300"
                    />
                  </div>
                  <button 
                    onClick={handlePaymentComplete}
                    disabled={!vpa.includes("@")}
                    className="w-full py-4 bg-krishi-green text-white rounded-2xl font-black uppercase tracking-widest hover:bg-krishi-olive transition-all shadow-xl shadow-krishi-green/20 disabled:opacity-50"
                  >
                    Verify & Pay
                  </button>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2">
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-tighter">Powered by</span>
                <span className="text-[9px] font-black text-slate-900">RAZORPAY INDIA</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
