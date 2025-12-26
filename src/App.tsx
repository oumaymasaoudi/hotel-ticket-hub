import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CreateTicket from "./pages/CreateTicket";
import TrackTicket from "./pages/TrackTicket";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ClientDashboard from "./pages/ClientDashboard";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/create-ticket" element={<CreateTicket />} />
          <Route path="/track-ticket" element={<TrackTicket />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Client routes */}
          <Route path="/dashboard/client" element={<ClientDashboard />} />
          <Route path="/dashboard/client/*" element={<ClientDashboard />} />
          
          {/* Technician routes */}
          <Route path="/dashboard/technician" element={<TechnicianDashboard />} />
          <Route path="/dashboard/technician/*" element={<TechnicianDashboard />} />
          
          {/* Admin routes */}
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/admin/*" element={<AdminDashboard />} />
          
          {/* SuperAdmin routes */}
          <Route path="/dashboard/superadmin" element={<SuperAdminDashboard />} />
          <Route path="/dashboard/superadmin/*" element={<SuperAdminDashboard />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
