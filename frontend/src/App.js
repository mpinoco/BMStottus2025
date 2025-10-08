import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import "@/App.css";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import MapPage from "@/pages/MapPage";
import OpenManagerPage from "@/pages/OpenManagerPage";
import CampaignsPage from "@/pages/CampaignsPage";
import SelfServicePage from "@/pages/SelfServicePage";
import ReportsPage from "@/pages/ReportsPage";
import ConsumptionPage from "@/pages/ConsumptionPage";
import SuppliesPage from "@/pages/SuppliesPage";
import AssetPage from "@/pages/AssetPage";
import AIMenuPage from "@/pages/AIMenuPage";
import SustainabilityPage from "@/pages/SustainabilityPage";
import ObsolescencePage from "@/pages/ObsolescencePage";
import SalesAnalysisPage from "@/pages/SalesAnalysisPage";
import PredictiveMaintenancePage from "@/pages/PredictiveMaintenancePage";
import { Toaster } from "@/components/ui/sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const auth = localStorage.getItem('bm_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    localStorage.setItem('bm_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('bm_auth');
    setIsAuthenticated(false);
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
              <Navigate to="/" replace /> : 
              <LoginPage onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
              <DashboardPage onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/map" 
            element={
              isAuthenticated ? 
              <MapPage onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/store/:storeId" 
            element={
              isAuthenticated ? 
              <OpenManagerPage onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/campaigns" 
            element={
              isAuthenticated ? 
              <CampaignsPage onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/self-service" 
            element={
              isAuthenticated ? 
              <SelfServicePage onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/reports" 
            element={
              isAuthenticated ? 
              <ReportsPage onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/consumption" 
            element={
              isAuthenticated ? 
              <ConsumptionPage onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/supplies" 
            element={
              isAuthenticated ? 
              <SuppliesPage onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/assets" 
            element={
              isAuthenticated ? 
              <AssetPage onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/ai-menu" 
            element={
              isAuthenticated ? 
              <AIMenuPage onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/sustainability" 
            element={
              isAuthenticated ? 
              <SustainabilityPage onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/obsolescence" 
            element={
              isAuthenticated ? 
              <ObsolescencePage onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/sales-analysis" 
            element={
              isAuthenticated ? 
              <SalesAnalysisPage onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/predictive-maintenance" 
            element={
              isAuthenticated ? 
              <PredictiveMaintenancePage onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
            } 
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;