import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
//import App from "./App.tsx";
import Login from "./Login";
import ProtectedRoute from "./components/ProtectedRoute";
import BaseLayout from "./layouts/BaseLayout";
import CustomerPage from "./pages/jobcards/CustomerPage";
import TechnicianPage from "./pages/jobcards/TechnicianPage";
import JobcardPage from "./pages/jobcards/JobcardPage";
import SupportAgentPage from "./pages/jobcards/SupportAgentPage";
import JobTypePage from "./pages/jobcards/JobTypePage";
import JobcardDashboard from "./pages/jobcards/JobcardDashboard";
import StockTakePage from "./inventory/pages/StockTakePage";
import Terms from "./pages/jobcards/terms";  
// Note: for Terms page above,
        // ✅
import Clients from "./clients/pages/clients";
import Reports from "./reports/reports";
import Accounts from "./accounts/pages/accounts";



createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public Route to Login */}
        <Route path="/login" element={<Login />} />
        <Route path="/terms" element={<Terms />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<BaseLayout />}>
            <Route path="jobcards/dashboard" element={<JobcardDashboard />} />
            <Route path="jobcards/jobcards" element={<JobcardPage />} />
            <Route path="jobcards/customers" element={<CustomerPage />} />
            <Route path="jobcards/technicians" element={<TechnicianPage />} />
            <Route
              path="jobcards/support-agents"
              element={<SupportAgentPage />}
            />
            <Route path="jobcards/job-types" element={<JobTypePage />} />
            <Route path="inventory" element={<StockTakePage />} />

            <Route path="clients" element={<Clients />} />
            <Route path="accounts" element={<Accounts />} />
            <Route path="reports" element={<Reports />} />
  
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
