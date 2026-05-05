import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Mock Data / Routes
  let equipment = [
    { id: 1, name: "Mahindra Arjun 555", type: "Tractor", price: 800, rating: 4.8, image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800", ownerId: "owner@demo.com", location: "Pune, Maharashtra", isAvailable: true },
    { id: 2, name: "DJI Agras T40", type: "Drone", price: 1200, rating: 4.9, image: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?auto=format&fit=crop&q=80&w=800", ownerId: "owner456", location: "Nashik, Maharashtra", isAvailable: true },
    { id: 3, name: "Kubota Harvester DC-70", type: "Harvester", price: 2500, rating: 4.7, image: "https://images.unsplash.com/photo-1516253457591-6284693a1c6a?auto=format&fit=crop&q=80&w=800", ownerId: "owner@demo.com", location: "Ahmednagar, Maharashtra", isAvailable: false },
    { id: 4, name: "John Deere 5050D", type: "Tractor", price: 900, rating: 4.6, image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&q=80&w=800", ownerId: "owner789", location: "Satara, Maharashtra", isAvailable: true },
    { id: 5, name: "Sonalika Tiger DI 65", type: "Tractor", price: 750, rating: 4.5, image: "https://images.unsplash.com/photo-1596720426673-e48357065627?auto=format&fit=crop&q=80&w=800", ownerId: "owner@demo.com", location: "Sangli, Maharashtra", isAvailable: true },
    { id: 6, name: "Preet 987 Harvester", type: "Harvester", price: 2200, rating: 4.4, image: "https://images.unsplash.com/photo-1563513364234-ab62973f71c4?auto=format&fit=crop&q=80&w=800", ownerId: "owner456", location: "Solapur, Maharashtra", isAvailable: true },
    { id: 7, name: "Escorts FT 45", type: "Tractor", price: 650, rating: 4.3, image: "https://images.unsplash.com/photo-1530267981375-f0ea937f5f13?auto=format&fit=crop&q=80&w=800", ownerId: "owner789", location: "Kolhapur, Maharashtra", isAvailable: true },
    { id: 8, name: "Swaraj 855 FE", type: "Tractor", price: 850, rating: 4.7, image: "https://images.unsplash.com/photo-1591550917208-842c26289d02?auto=format&fit=crop&q=80&w=800", ownerId: "owner456", location: "Beed, Maharashtra", isAvailable: false },
    { id: 9, name: "Garuda Farmer Drone", type: "Drone", price: 1000, rating: 4.5, image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&q=80&w=800", ownerId: "owner@demo.com", location: "Latur, Maharashtra", isAvailable: true },
    { id: 10, name: "Kartar 4000 Harvester", type: "Harvester", price: 2800, rating: 4.8, image: "https://images.unsplash.com/photo-1533230408708-8f9f91d1235a?auto=format&fit=crop&q=80&w=800", ownerId: "owner789", location: "Amravati, Maharashtra", isAvailable: true },
  ];

  let bookings = [
    { id: 1, equipmentId: 1, equipmentName: "Mahindra Arjun 555", date: "2026-04-20", ownerContact: "+91 98765 43210", status: "Confirmed", renterName: "Ramesh Farmer", ownerId: "owner@demo.com", renterEmail: "farmer@demo.com" },
    { id: 2, equipmentId: 2, equipmentName: "DJI Agras T40", date: "2026-04-22", ownerContact: "+91 87654 32109", status: "Pending", renterName: "Suresh Patil", ownerId: "owner456", renterEmail: "farmer@demo.com" },
    { id: 3, equipmentId: 3, equipmentName: "Kubota Harvester DC-70", date: "2026-04-25", ownerContact: "+91 76543 21098", status: "Confirmed", renterName: "Gopal Singh", ownerId: "owner@demo.com", renterEmail: "farmer@demo.com" },
  ];

  let reviews: any[] = [
    { id: 1, equipmentId: 1, renterName: "Sanjay Kumar", rating: 5, comment: "Amazing tractor, very powerful for hilly terrain.", date: "2026-04-15" },
    { id: 2, equipmentId: 1, renterName: "Anil Deshmukh", rating: 4, comment: "Good condition, easy to operate.", date: "2026-04-18" }
  ];

  let users = [
    { email: "farmer@demo.com", password: "password123", name: "Demo Farmer", role: "farmer" },
    { email: "owner@demo.com", password: "password123", name: "Demo Owner", role: "provider" },
    { email: "admin@krishi.com", password: "admin123", name: "Krishi Admin", role: "admin" }
  ];

  // Admin APIs
  app.get("/api/admin/stats", (req, res) => {
    res.json({
      totalEquipment: equipment.length,
      totalBookings: bookings.length,
      totalUsers: users.length,
      totalRevenue: bookings.filter(b => b.status === "Confirmed").length * 500, // Simulated revenue
    });
  });

  app.get("/api/admin/users", (req, res) => {
    res.json(users.map(u => ({ email: u.email, name: u.name, role: u.role })));
  });

  app.delete("/api/admin/users/:email", (req, res) => {
    const { email } = req.params;
    const index = users.findIndex(u => u.email === email);
    if (index !== -1) {
      users.splice(index, 1);
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false });
    }
  });

  app.get("/api/equipment", (req, res) => {
    res.json(equipment);
  });

  app.get("/api/reviews/:equipmentId", (req, res) => {
    const { equipmentId } = req.params;
    res.json(reviews.filter(r => r.equipmentId === Number(equipmentId)));
  });

  app.post("/api/reviews", (req, res) => {
    const { equipmentId, renterName, rating, comment } = req.body;
    if (equipmentId && rating) {
      const newReview = {
        id: reviews.length + 1,
        equipmentId: Number(equipmentId),
        renterName: renterName || "Anonymous",
        rating: Number(rating),
        comment,
        date: new Date().toISOString().split('T')[0]
      };
      reviews.push(newReview);
      
      // Update equipment rating (simple average)
      const equipIndex = equipment.findIndex(e => e.id === Number(equipmentId));
      if (equipIndex !== -1) {
        const equipReviews = reviews.filter(r => r.equipmentId === Number(equipmentId));
        const avgRating = equipReviews.reduce((acc, curr) => acc + curr.rating, 0) / equipReviews.length;
        equipment[equipIndex].rating = Number(avgRating.toFixed(1));
      }

      res.json({ success: true, review: newReview });
    } else {
      res.status(400).json({ success: false });
    }
  });

  app.get("/api/bookings", (req, res) => {
    const { email } = req.query;
    if (email) {
      res.json(bookings.filter(b => b.renterEmail === email));
    } else {
      res.json(bookings);
    }
  });

  app.get("/api/provider/equipment/:ownerId", (req, res) => {
    const { ownerId } = req.params;
    res.json(equipment.filter(e => e.ownerId === ownerId));
  });

  app.delete("/api/equipment/:id", (req, res) => {
    const { id } = req.params;
    const index = equipment.findIndex(e => e.id === Number(id));
    if (index !== -1) {
      equipment.splice(index, 1);
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: "Equipment or item not found" });
    }
  });

  app.put("/api/equipment/:id", (req, res) => {
    const { id } = req.params;
    const { name, type, price, image, location } = req.body;
    const index = equipment.findIndex(e => e.id === Number(id));
    
    if (index !== -1) {
      equipment[index] = {
        ...equipment[index],
        name: name || equipment[index].name,
        type: type || equipment[index].type,
        price: price ? Number(price) : equipment[index].price,
        image: image || equipment[index].image,
        location: location || equipment[index].location
      };
      res.json({ success: true, equipment: equipment[index] });
    } else {
      res.status(404).json({ success: false, message: "Equipment not found" });
    }
  });

  app.get("/api/provider/bookings/:ownerId", (req, res) => {
    const { ownerId } = req.params;
    res.json(bookings.filter(b => b.ownerId === ownerId));
  });

  app.delete("/api/bookings/:id", (req, res) => {
    const { id } = req.params;
    const index = bookings.findIndex(b => b.id === Number(id));
    if (index !== -1) {
      bookings.splice(index, 1);
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: "Booking not found" });
    }
  });

  app.post("/api/equipment", (req, res) => {
    const { name, type, price, image, ownerId, location } = req.body;
    const newEquipment = {
      id: equipment.length + 1,
      name,
      type,
      price: Number(price),
      rating: 5.0,
      image: image || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800",
      ownerId: ownerId || "owner123",
      location: location || "Maharashtra, India",
      isAvailable: true
    };
    equipment.push(newEquipment);
    res.json({ success: true, equipment: newEquipment });
  });

  app.post("/api/bookings", (req, res) => {
    const { equipmentId, equipmentName, date, paymentMethod, renterName, ownerId, renterEmail } = req.body;
    if (equipmentName && date) {
      const newBooking = {
        id: bookings.length + 1,
        equipmentId: Number(equipmentId),
        equipmentName,
        date,
        ownerContact: "+91 " + Math.floor(Math.random() * 9000000000 + 1000000000),
        status: "Pending", // Default all new bookings to Pending
        renterName: renterName || "Demo User",
        renterEmail: renterEmail || "",
        ownerId: ownerId || "owner123",
        paymentMethod: paymentMethod || "cash"
      };
      bookings.push(newBooking);
      res.json({ success: true, booking: newBooking });
    } else {
      res.status(400).json({ success: false, message: "Missing booking details" });
    }
  });

  app.patch("/api/bookings/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const bookingIndex = bookings.findIndex(b => b.id === Number(id));
    
    if (bookingIndex !== -1) {
      bookings[bookingIndex].status = status;
      res.json({ success: true, booking: bookings[bookingIndex] });
    } else {
      res.status(404).json({ success: false, message: "Booking not found" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "No user found. Please sign up first." });
    }

    if (user.password === password) {
      res.json({ success: true, user: { email: user.email, name: user.name, role: user.role } });
    } else {
      res.status(401).json({ success: false, message: "Invalid password" });
    }
  });

  app.post("/api/auth/register", (req, res) => {
    const { name, email, password, role } = req.body;
    
    if (users.some(u => u.email === email)) {
      return res.status(400).json({ success: false, message: "User already exists with this email." });
    }

    if (name && email && password) {
      const newUser = { name, email, password, role: role || "farmer" };
      users.push(newUser);
      res.json({ success: true, user: { email: newUser.email, name: newUser.name, role: newUser.role } });
    } else {
      res.status(400).json({ success: false, message: "Missing required fields" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
