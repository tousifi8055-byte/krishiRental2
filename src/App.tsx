/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import LandingPage from "./pages/LandingPage";
import EquipmentListing from "./pages/EquipmentListing";
import Dashboard from "./pages/Dashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProviderRegisterPage from "./pages/ProviderRegisterPage";
import BookingFormPage from "./pages/BookingFormPage";
import AdminDashboard from "./pages/AdminDashboard";

const PrivateRoute = ({ children, role }: { children: React.ReactNode; role?: string }) => {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/explore" element={<EquipmentListing />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute role="farmer">
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/provider-dashboard" 
              element={
                <PrivateRoute role="provider">
                  <ProviderDashboard />
                </PrivateRoute>
              } 
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/provider-register" element={<ProviderRegisterPage />} />
            <Route path="/booking-form" element={<BookingFormPage />} />
            <Route 
              path="/admin-dashboard" 
              element={
                <PrivateRoute role="admin">
                  <AdminDashboard />
                </PrivateRoute>
              } 
            />
            <Route path="*" element={<div className="container mx-auto px-4 py-20 text-center">404 - Page under construction</div>} />
          </Routes>
        </main>
        <footer className="bg-slate-900 text-white pt-20 pb-10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-2xl font-serif font-black mb-6">Krishi Rental</h3>
                <p className="text-slate-400 max-w-sm">
                  Empowering rural communities through shared technology. 
                  Bridge the gap between modern machinery and Indian fields.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-6">Explore</h4>
                <ul className="space-y-4 text-slate-400 text-sm">
                  <li><a href="/explore" className="hover:text-white transition-colors">Find Tractors</a></li>
                  <li><a href="/explore" className="hover:text-white transition-colors">Drone Services</a></li>
                  <li><a href="/explore" className="hover:text-white transition-colors">Harvesters</a></li>
                  <li><a href="/explore" className="hover:text-white transition-colors">Irrigation Tools</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-6">Company</h4>
                <ul className="space-y-4 text-slate-400 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 uppercase tracking-widest font-bold">
              <span>© 2026 Krishi Rental. Made for India.</span>
              <div className="flex gap-8">
                <a href="#" className="hover:text-white transition-colors">Facebook</a>
                <a href="#" className="hover:text-white transition-colors">Instagram</a>
                <a href="#" className="hover:text-white transition-colors">Twitter</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
