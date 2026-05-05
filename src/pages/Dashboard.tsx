import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, MapPin, Phone, CheckCircle2, Clock, ChevronLeft, ChevronRight, Filter, Search, Banknote, CreditCard, X, User, Trash2, Star, Loader2, Download, Printer, Gavel } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/src/lib/utils";

interface Booking {
  id: number;
  equipmentId: number;
  equipmentName: string;
  date: string;
  ownerContact: string;
  status: "Confirmed" | "Pending" | "Rejected";
  paymentMethod?: "cash" | "online";
}

export default function Dashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const navigate = useNavigate();

  const fetchBookings = () => {
    const user = localStorage.getItem("user");
    const userData = user ? JSON.parse(user) : null;
    const email = userData?.email;

    fetch(`/api/bookings?email=${email}`)
      .then(res => res.json())
      .then(data => {
        setBookings(data);
        setFilteredBookings(data);
      });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReviewModal) return;
    setSubmittingReview(true);
    
    const user = localStorage.getItem("user");
    const userData = user ? JSON.parse(user) : null;

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipmentId: showReviewModal.equipmentId,
          renterName: userData?.name || "Verified Farmer",
          rating: reviewRating,
          comment: reviewComment
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowReviewModal(null);
        setReviewComment("");
        setReviewRating(5);
        alert("Review submitted successfully!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDownloadInvoice = (booking: Booking) => {
    alert(`Generating Indian GST Invoice for ${booking.equipmentName}...\nInvoice No: KRISHI/2026/${booking.id}\nGSTIN: 27AABCU9603R1ZN (Simulated)`);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        fetchBookings();
      }
    } catch (err) {
      console.error("Error cancelling booking", err);
    }
  };

  useEffect(() => {
    let filtered = bookings;
    if (statusFilter !== "All") {
      filtered = filtered.filter(b => b.status === statusFilter);
    }
    if (searchTerm) {
      filtered = filtered.filter(b => b.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    setFilteredBookings(filtered);
  }, [statusFilter, searchTerm, bookings]);

  // Calendar logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-serif font-black text-slate-900 mb-2">Farmer Dashboard</h1>
          <p className="text-slate-600">Manage your upcoming machinery rentals and schedule.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search bookings..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-krishi-green/20"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
          >
            <option>All</option>
            <option>Confirmed</option>
            <option>Pending</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Calendar */}
        <div className="lg:col-span-4 bg-white p-6 rounded-[2rem] shadow-xl shadow-krishi-green/5 border border-krishi-green/5">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold font-serif text-slate-900">{format(currentDate, "MMMM yyyy")}</h2>
            <div className="flex gap-1">
              <button 
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <span key={day} className="text-[10px] uppercase font-black text-slate-400">{day}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {/* Pad the start of month */}
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            
            {days.map(day => {
              const hasBooking = bookings.some(b => isSameDay(new Date(b.date), day));
              return (
                <button 
                  key={day.toString()}
                  className={cn(
                    "aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all relative",
                    isSameDay(day, new Date()) ? "bg-krishi-saffron text-slate-900" : "hover:bg-gray-50",
                    !isSameMonth(day, monthStart) && "text-slate-300"
                  )}
                >
                  {format(day, "d")}
                  {hasBooking && (
                    <span className="absolute bottom-1.5 w-1 h-1 bg-krishi-green rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100">
            <div className="flex items-center gap-3 text-sm text-slate-600 mb-4">
              <div className="w-3 h-3 bg-krishi-saffron rounded-full" />
              <span>Today</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-3 h-3 bg-krishi-green rounded-full" />
              <span>Booking Scheduled</span>
            </div>
          </div>
        </div>

        {/* Right Side: Bookings List */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Upcoming Rentals</h2>
          
          <AnimatePresence mode="popLayout">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <motion.div
                  key={booking.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between hover:shadow-md transition-all group"
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-krishi-green/5 rounded-2xl flex items-center justify-center text-krishi-green group-hover:bg-krishi-green group-hover:text-white transition-colors">
                      <CalendarIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{booking.equipmentName}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5 ">
                          <Clock className="w-4 h-4" />
                          {format(new Date(booking.date), "PPP")}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          Village Area C
                        </span>
                        {booking.paymentMethod && (
                          <span className={cn(
                            "flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest",
                            booking.paymentMethod === "cash" ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700"
                          )}>
                            {booking.paymentMethod === "cash" ? <Banknote className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                            {booking.paymentMethod === "online" ? "Online Paid" : "Pay on Delivery"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto">
                    <div className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest self-start sm:self-auto flex items-center gap-2",
                      booking.status === "Confirmed" ? "bg-green-100 text-green-700" : 
                      booking.status === "Rejected" ? "bg-red-100 text-red-700" :
                      "bg-krishi-saffron/20 text-krishi-saffron"
                    )}>
                      {booking.status === "Confirmed" ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      {booking.status}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <a 
                         href={`tel:${booking.ownerContact}`} 
                        className="flex items-center gap-2 text-sm font-bold text-krishi-green hover:text-krishi-olive transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        <span className="hidden sm:inline">Owner Contact</span>
                      </a>
                      <button 
                        onClick={() => setSelectedBooking(booking)}
                        className="px-6 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                      >
                        Details
                      </button>
                      {booking.status === "Confirmed" && (
                        <button 
                          onClick={() => setShowReviewModal(booking)}
                          className="px-6 py-2 bg-krishi-saffron/10 text-krishi-saffron rounded-xl text-sm font-bold hover:bg-krishi-saffron hover:text-white transition-all shadow-sm"
                        >
                          Review
                        </button>
                      )}
                      {booking.status === "Confirmed" && (
                        <button 
                          onClick={() => setShowReviewModal(booking)}
                          className="px-6 py-2 bg-krishi-saffron/10 text-krishi-saffron rounded-xl text-sm font-bold hover:bg-krishi-saffron hover:text-white transition-all shadow-sm"
                        >
                          Review
                        </button>
                      )}
                      <button 
                        onClick={() => handleCancelBooking(booking.id)}
                        className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                        title="Cancel Booking"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="bg-white p-12 rounded-[2rem] border-2 border-dashed border-gray-100 text-center">
                <p className="text-slate-400 font-medium">No bookings found matching your filters.</p>
              </div>
            )}
          </AnimatePresence>

          <button 
            onClick={() => navigate("/explore")}
            className="mt-4 w-full py-4 border-2 border-dashed border-gray-200 rounded-[2rem] text-slate-400 font-bold hover:border-krishi-green hover:text-krishi-green transition-all flex items-center justify-center gap-2 group"
          >
            <span className="p-1 bg-gray-50 rounded-full group-hover:bg-krishi-green group-hover:text-white transition-colors">+</span>
            <span>New Rental Agreement</span>
          </button>
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setSelectedBooking(null)}
                className="absolute top-4 right-4 p-2 hover:bg-slate-50 rounded-full text-slate-400"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="inline-block px-4 py-1 rounded-full bg-krishi-green/10 text-krishi-green text-[10px] font-black uppercase tracking-widest mb-6">
                Booking Information
              </div>
              <h2 className="text-3xl font-serif font-black text-slate-900 mb-2">{selectedBooking.equipmentName}</h2>
              <p className="text-slate-500 mb-8 font-medium">Rental requested for {format(new Date(selectedBooking.date), "PPP")}</p>

              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <User className="w-6 h-6 text-krishi-green" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                    <span className={cn(
                      "font-bold",
                      selectedBooking.status === "Confirmed" ? "text-green-600" : "text-krishi-saffron"
                    )}>{selectedBooking.status}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <Phone className="w-6 h-6 text-krishi-green" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Owner Contact</span>
                    <span className="font-bold">{selectedBooking.ownerContact}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <Banknote className="w-6 h-6 text-krishi-green" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment Details</span>
                    <span className="font-bold">
                      {selectedBooking.paymentMethod === "online" ? "Fully Paid Online (UPI/Card)" : "Cash on Delivery"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <button 
                  onClick={() => handleDownloadInvoice(selectedBooking)}
                  className="flex items-center justify-center gap-2 py-3 bg-amber-50 text-amber-700 rounded-xl font-bold text-sm border border-amber-200 hover:bg-amber-100 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Tax Invoice
                </button>
                <button 
                  onClick={() => setSelectedBooking(null)}
                  className="py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReviewModal(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setShowReviewModal(null)}
                className="absolute top-4 right-4 p-2 hover:bg-slate-50 rounded-full text-slate-400"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="inline-block px-4 py-1 rounded-full bg-krishi-saffron/10 text-krishi-saffron text-[10px] font-black uppercase tracking-widest mb-6">
                Rate Machinery
              </div>
              <h2 className="text-3xl font-serif font-black text-slate-900 mb-2">Rate {showReviewModal.equipmentName}</h2>
              <p className="text-slate-500 mb-8 font-medium">How was your rental experience?</p>

              <form onSubmit={handleReviewSubmit} className="space-y-6">
                <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={cn(
                        "p-2 rounded-xl transition-all",
                        reviewRating >= star ? "text-krishi-saffron scale-110" : "text-gray-200"
                      )}
                    >
                      <Star key={star} className={cn("w-8 h-8", reviewRating >= star ? "fill-current" : "")} />
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-slate-400 pl-1 tracking-widest">Share your feedback</label>
                  <textarea
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tell other farmers about the machinery condition, performance, etc."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-krishi-green/20 outline-none font-medium min-h-[120px]"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-4 bg-krishi-green text-white rounded-2xl font-black uppercase tracking-widest hover:bg-krishi-olive transition-all flex items-center justify-center gap-2 shadow-xl shadow-krishi-green/20"
                >
                  {submittingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Review"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
