import React from "react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { path: "/", label: "Dashboard", icon: <img src="/icons/dashboard.svg" className="w-5 h-5" alt="Dashboard" /> },
  { path: "/clients", label: "Clients", icon: <img src="/icons/people.svg" className="w-5 h-4" alt="Clients" /> },
  { path: "/bids", label: "Bids", icon: <img src="/icons/people.svg" className="w-5 h-5" alt="Receipts" /> },
  { path: "/profile", label: "Profile", icon: <img src="/icons/account.svg" className="w-5 h-5" alt="Profile" /> },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="bg-cobalt text-white shadow-md">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center space-x-2">
          <img src="/icons/app_logo.jpeg" alt="App Logo" className="w-8 h-8" />
          <span className="text-2xl font-bold sunflower">Home Cleaner's Assistant</span>
        </Link>
        <div className="hidden md:flex space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-1 py-2 px-3 rounded hover:bg-sunflower hover:text-cobalt ${
                pathname === item.path ? "bg-sunflower text-cobalt" : ""
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}