import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Star, MapPin, Filter, ArrowUpDown, X, CheckCircle2, ShieldCheck, Clock, Tractor as TractorIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

interface Equipment {
  id: number;
  name: string;
  type: string;
  price: number;
  rating: number;
  image: string;
  location: string;
  isAvailable: boolean;
  ownerId: string;
}

interface Review {
  id: number;
  equipmentId: number;
  renterName: string;
  rating: number;
  comment: string;
  date: string;
}

interface Review {
  id: number;
  equipmentId: number;
  renterName: string;
  rating: number;
  comment: string;
  date: string;
}

export default function EquipmentListing() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [sortBy, setSortBy] = useState<"price-low" | "price-high" | "rating">("rating");
  const [showFilters, setShowFilters] = useState(false);
  
  // Advanced Filter State
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam && !selectedTypes.includes(typeParam)) {
      setSelectedTypes([typeParam]);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/equipment")
      .then(res => res.json())
      .then(data => {
        setEquipment(data);
        applyFilters(data);
        setLoading(false);
      });
  }, [searchParams, sortBy, minPrice, maxPrice, onlyAvailable, selectedTypes]);

  useEffect(() => {
    if (selectedItem) {
      setLoadingReviews(true);
      fetch(`/api/reviews/${selectedItem.id}`)
        .then(res => res.json())
        .then(data => {
          setReviews(data);
          setLoadingReviews(false);
        })
        .catch(err => {
          console.error("Error fetching reviews", err);
          setLoadingReviews(false);
        });
    } else {
      setReviews([]);
    }
  }, [selectedItem]);

  useEffect(() => {
    if (selectedItem) {
      setLoadingReviews(true);
      fetch(`/api/reviews/${selectedItem.id}`)
        .then(res => res.json())
        .then(data => {
          setReviews(data);
          setLoadingReviews(false);
        })
        .catch(err => {
          console.error("Error fetching reviews", err);
          setLoadingReviews(false);
        });
    } else {
      setReviews([]);
    }
  }, [selectedItem]);

  const applyFilters = (data: Equipment[]) => {
    const locationParam = searchParams.get("location");
    
    let filtered = [...data];
    
    // Type Filter
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((item: Equipment) => selectedTypes.includes(item.type));
    }
    
    // Location Filter
    if (locationParam) {
      filtered = filtered.filter((item: Equipment) => 
        item.location.toLowerCase().includes(locationParam.toLowerCase())
      );
    }

    // Price Filter
    filtered = filtered.filter(item => item.price >= minPrice && item.price <= maxPrice);

    // Availability Filter
    if (onlyAvailable) {
      filtered = filtered.filter(item => item.isAvailable);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      return b.rating - a.rating;
    });
    
    setFilteredEquipment(filtered);
  };

  const handleBook = async (item: Equipment) => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    navigate(`/booking-form?equipmentId=${item.id}`);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      const res = await fetch(`/api/equipment/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setEquipment(prev => prev.filter(item => item.id !== id));
        setFilteredEquipment(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error("Error deleting equipment:", err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-serif font-black text-slate-900 mb-2">Available Equipment</h1>
          <p className="text-slate-600">Find the right machinery for your specific farming needs.</p>
        </div>
        
        <div className="flex items-center gap-3 relative">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Sort:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-krishi-green/20"
            >
              <option value="rating">Top Rated</option>
              <option value="price-low">Lowest Price</option>
              <option value="price-high">Highest Price</option>
            </select>
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 border rounded-lg transition-all font-semibold text-sm",
              showFilters ? "bg-krishi-green text-white border-krishi-green" : "border-gray-200 hover:bg-white text-slate-700"
            )}
          >
            <Filter className={cn("w-4 h-4", showFilters ? "animate-pulse" : "")} />
            <span>Filters</span>
            {(selectedTypes.length > 0 || minPrice > 0 || maxPrice < 5000 || onlyAvailable) && (
              <span className="w-2 h-2 bg-krishi-saffron rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-12"
          >
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Type Filter */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Machine Type</h4>
                <div className="flex flex-wrap gap-2">
                  {["Tractor", "Harvester", "Drone"].map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedTypes(prev => 
                          prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                        );
                      }}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                        selectedTypes.includes(type) 
                          ? "bg-krishi-green text-white border-krishi-green shadow-md shadow-krishi-green/20" 
                          : "bg-slate-50 text-slate-600 border-slate-100 hover:border-krishi-green"
                      )}
                    >
                      {type}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Price Range (₹/hr)</h4>
                  <span className="text-sm font-serif font-bold text-krishi-green">
                    ₹{minPrice} - ₹{maxPrice}
                  </span>
                </div>
                <div className="flex gap-4 items-center">
                  <input 
                    type="range" 
                    min="0" 
                    max="5000" 
                    step="100"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="flex-1 accent-krishi-green"
                  />
                  <input 
                    type="range" 
                    min="0" 
                    max="5000" 
                    step="100"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="flex-1 accent-krishi-green"
                  />
                </div>
              </div>

              {/* Availability */}
              <div className="flex flex-col">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Availability</h4>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div 
                    onClick={() => setOnlyAvailable(!onlyAvailable)}
                    className={cn(
                      "w-12 h-6 rounded-full transition-all relative overflow-hidden",
                      onlyAvailable ? "bg-krishi-green" : "bg-slate-200"
                    )}
                  >
                    <motion.div 
                      animate={{ x: onlyAvailable ? 24 : 4 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-krishi-green">Available Now Only</span>
                </label>
                
                <button 
                  onClick={() => {
                    setMinPrice(0);
                    setMaxPrice(5000);
                    setOnlyAvailable(false);
                    setSelectedTypes([]);
                    navigate("/explore");
                  }}
                  className="mt-auto text-xs font-bold text-red-500 hover:underline text-left"
                >
                  Reset all filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-2xl h-[400px] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEquipment.length > 0 ? (
            filteredEquipment.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-100"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-krishi-green">
                      {item.type}
                    </div>
                    {item.isAvailable ? (
                      <div className="bg-green-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Available
                      </div>
                    ) : (
                      <div className="bg-slate-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Booked
                      </div>
                    )}
                  </div>
                  <button className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:text-red-500 transition-colors">
                    <Star className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{item.name}</h3>
                      <div className="flex items-center gap-1 text-krishi-saffron fill-krishi-saffron">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${i < Math.floor(item.rating) ? 'fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                        <span className="text-xs font-bold text-slate-500 ml-1">{item.rating}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-krishi-green font-serif">₹{item.price}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">per hour</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-6">
                    <MapPin className="w-4 h-4" />
                    <span>{item.location} (2km away)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setSelectedItem(item)}
                      className={cn(
                        "px-4 py-2.5 bg-gray-50 text-slate-700 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors",
                        currentUser?.role === "provider" && item.ownerId === currentUser?.email ? "col-span-1" : "col-span-1"
                      )}
                    >
                      View Details
                    </button>
                    {currentUser?.role === "provider" && item.ownerId === currentUser?.email ? (
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors"
                      >
                        Delete Listing
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleBook(item)}
                        disabled={isBooking || !item.isAvailable}
                        className="px-4 py-2.5 bg-krishi-green text-white rounded-xl font-bold text-sm hover:bg-krishi-olive transition-colors shadow-lg shadow-krishi-green/10 disabled:opacity-50 disabled:bg-slate-300 disabled:shadow-none"
                      >
                        {isBooking ? "Booking..." : item.isAvailable ? "Book Now" : "Unavailable"}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="flex flex-col items-center gap-4">
                <TractorIcon className="w-16 h-16 text-slate-200" />
                <h3 className="text-xl font-bold text-slate-900">No equipment found</h3>
                <p className="text-slate-500">Try adjusting your filters or search criteria.</p>
                <button 
                  onClick={() => navigate("/explore")}
                  className="px-6 py-2 bg-krishi-green text-white rounded-xl font-bold"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white md:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="w-full md:w-1/2 aspect-square md:aspect-auto">
                <img 
                  src={selectedItem.image} 
                  alt={selectedItem.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="p-8 md:p-12 w-full md:w-1/2 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-krishi-green/10 text-krishi-green rounded-full text-[10px] font-black uppercase tracking-widest">
                    {selectedItem.type}
                  </span>
                  <div className="flex items-center gap-1 text-krishi-saffron fill-krishi-saffron ml-auto">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-bold text-slate-900">{selectedItem.rating} ({reviews.length} reviews)</span>
                  </div>
                </div>

                <h2 className="text-3xl font-serif font-black text-slate-900 mb-2">{selectedItem.name}</h2>
                <p className="text-slate-600 mb-8">
                  Highly efficient {selectedItem.type.toLowerCase()} suitable for all major agricultural terrains. 
                  Well-maintained and recently serviced for peak performance.
                </p>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg text-krishi-green">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Verified</span>
                      <span className="text-sm font-bold">Owner Insured</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg text-krishi-green">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Availability</span>
                      <span className="text-sm font-bold">Instantly ready</span>
                    </div>
                  </div>
                </div>

                {/* Reviews Section */}
                <div className="mb-8 flex-1 overflow-y-auto pr-2 max-h-[150px]">
                  <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-4">Recent Reviews</h4>
                  {loadingReviews ? (
                    <div className="text-xs text-slate-400 animate-pulse">Loading reviews...</div>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map(review => (
                        <div key={review.id} className="border-b border-slate-50 pb-3 last:border-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-900">{review.renterName}</span>
                            <div className="flex items-center gap-0.5 text-krishi-saffron">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              <span className="text-[10px] font-bold">{review.rating}</span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 italic leading-relaxed">"{review.comment}"</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No reviews yet for this machinery.</p>
                  )}
                </div>

                {/* Reviews Section */}
                <div className="mb-8 flex-1 overflow-y-auto pr-2 max-h-[150px]">
                  <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-4">Recent Reviews</h4>
                  {loadingReviews ? (
                    <div className="text-xs text-slate-400 animate-pulse">Loading reviews...</div>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map(review => (
                        <div key={review.id} className="border-b border-slate-50 pb-3 last:border-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-900">{review.renterName}</span>
                            <div className="flex items-center gap-0.5 text-krishi-saffron">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              <span className="text-[10px] font-bold">{review.rating}</span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 italic leading-relaxed">"{review.comment}"</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No reviews yet for this machinery.</p>
                  )}
                </div>

                <div className="mt-auto pt-8 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-3xl font-black text-krishi-green font-serif">₹{selectedItem.price}</span>
                    <span className="text-xs uppercase font-bold text-slate-400 ml-2">per hour</span>
                  </div>
                  {currentUser?.role === "provider" && selectedItem.ownerId === currentUser?.email ? (
                    <button 
                      onClick={() => {
                        handleDelete(selectedItem.id);
                        setSelectedItem(null);
                      }}
                      className="px-8 py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-600 transition-all transform hover:scale-[1.02] shadow-lg shadow-red-500/20"
                    >
                      Delete My Listing
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleBook(selectedItem)}
                      disabled={isBooking || !selectedItem.isAvailable}
                      className="px-8 py-4 bg-krishi-green text-white rounded-2xl font-black uppercase tracking-widest hover:bg-krishi-olive transition-all transform hover:scale-[1.02] shadow-lg shadow-krishi-green/20 disabled:opacity-50"
                    >
                      {isBooking ? "Processing..." : selectedItem.isAvailable ? "Confirm Booking" : "Unavailable"}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {bookingSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4"
          >
            <div className="bg-krishi-green p-1 rounded-full">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold">Booking Confirmed!</p>
              <p className="text-xs text-slate-400">{bookingSuccess} has been scheduled.</p>
            </div>
            <button 
              onClick={() => setBookingSuccess(null)}
              className="ml-4 hover:text-krishi-saffron transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
