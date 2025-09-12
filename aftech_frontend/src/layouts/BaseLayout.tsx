// BaseLayout.tsx
import { useState } from "react";
import {
  NavLink,
  Outlet,
  useLocation,
  Link,
  useNavigate,
} from "react-router-dom";
import logo from "../assets/aftech-logo.png";

interface NavItem {
  to: string;
  label: string;
}

// Sidebar items (modules)
const sidebarLinks: NavItem[] = [
  { to: "/accounts", label: "Accounts" },
  { to: "/jobcards/jobcards", label: "Jobcards" },
  { to: "/inventory", label: "Inventory" },
  { to: "/clients", label: "Clients" },
  { to: "/reports", label: "Reports" },
];

// Top navs per module
const topNavConfig: Record<string, NavItem[]> = {
  jobcards: [
    { to: "/jobcards/dashboard", label: "Dashboard" },
    { to: "/jobcards/jobcards", label: "Jobcards" },
    { to: "/jobcards/customers", label: "Customers" },
    { to: "/jobcards/technicians", label: "Technicians" },
    { to: "/jobcards/support-agents", label: "Support Agents" },
    { to: "/jobcards/job-types", label: "Job Types" },
  ],
  accounts: [
    { to: "/accounts/dashboard", label: "Dashboard" },
    { to: "/accounts/notes", label: "Notes" },
  ],

  inventory: [
    { to: "/inventory/dashboard", label: "Dashboard" }, // This was a test of the requests endpoint to understand, built too quickly with AI
    { to: "/inventory/warehouses", label: "Warehouses" },
    { to: "/inventory/item-types", label: "Item Types" },
    { to: "/inventory/requests", label: "Movement Requests" },
  ],
  // You can define others like "inventory", "billing", etc. here later
};

const BaseLayout = () => {
  const location = useLocation();

  // Determine the current top-level route (e.g. "jobcards", "inventory")
  const currentModule = location.pathname.split("/")[1];
  const topNavLinks = topNavConfig[currentModule] || [];

  // ✅ Dropdown state
  const [showDropdown, setShowDropdown] = useState(false);

  // ✅ Dummy email (replace with actual user state or context)
  const user = localStorage.getItem("user") || "User";

  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#FF3C00] text-white flex flex-col justify-between py-6 z-50">
        <div className="flex flex-col items-center">
          <Link to="/">
            <img src={logo} alt="AFTECH Logo" className="w-56 mb-10" />
          </Link>
          <nav className="flex flex-col gap-4 w-full px-4">
            {sidebarLinks.map((item) => {
              const isActive = location.pathname.startsWith(item.to); // key change

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={
                    isActive
                      ? "no-underline bg-white text-[#FF3C00] font-semibold px-4 py-2 rounded"
                      : "no-underline text-white hover:bg-[#ff5a26] px-4 py-2 rounded"
                  }
                >
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* ✅ Bottom User Section */}
        <div className="relative px-4 mt-auto">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center justify-between w-full bg-[#FF3C00] px-4 py-3 rounded text-white hover:bg-[#ff7347]"
          >
            <span className="text-sm truncate">{user}</span>
            <span className="ml-2">▾</span>
          </button>
          {showDropdown && (
            <div className="absolute bottom-14 left-4 w-56 bg-white text-black shadow-lg rounded z-50">
              <Link
                to="/account"
                className="no-underline block px-4 py-2 hover:bg-gray-100 border-b"
              >
                Account
              </Link>
              <button
                onClick={() => {
                  // Clear stored auth data
                  localStorage.removeItem("access");
                  localStorage.removeItem("refresh");
                  localStorage.removeItem("user");

                  // Redirect to login page
                  navigate("/login");
                }}
                className="no-underline w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-gray-100 ml-64 overflow-x-auto">
        {/* Top Navigation Bar */}
        <div className="fixed top-0 left-64 right-0 bg-white border-b p-4 flex gap-8 font-semibold z-40">
          {topNavLinks.length > 0 ? (
            topNavLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  isActive
                    ? "no-underline text-[#FF3C00]"
                    : " no-underline text-black"
                }
              >
                {link.label}
              </NavLink>
            ))
          ) : (
            <span>Welcome to AFTECH Solutions</span>
          )}
        </div>

        {/* Page Content */}
        <div className="pt-[72px] px-6 pb-6 overflow-y-auto h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default BaseLayout;
