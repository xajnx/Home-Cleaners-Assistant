import React, { useEffect, useState } from "react";
import api from "../api/client";
import BusinessBranding from "../components/BusinessBranding";
export default function Dashboard() {
  const [clients, setClients] = useState([]);
  const [bids, setBids] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [clientsRes, bidsRes, profileRes] = await Promise.all([
          api.get("/clients"),
          api.get("/bids"),
          api.get("/profile")
        ]);
        setClients(clientsRes.data);
        setBids(bidsRes.data);
        setProfile(profileRes.data);
      } catch (err) {
        console.error("Dashboard load failed:", err);
      }
    };
    loadDashboard();
  }, []);

  const signedContracts = bids.filter(b => b.signed_contract).length;

  // New analytics
  const now = new Date();
  const oneDayAgo = now.getTime() - 24*60*60*1000;
  const oneWeekAgo = now.getTime() - 7*24*60*60*1000;

  const bidsToday     = bids.filter(b => new Date(b.created_at).getTime() >= oneDayAgo).length;
  const bidsThisWeek  = bids.filter(b => new Date(b.created_at).getTime() >= oneWeekAgo).length;
  const clientsToday  = clients.filter(c => new Date(c.created_at).getTime() >= oneDayAgo).length;
  const clientsWeek   = clients.filter(c => new Date(c.created_at).getTime() >= oneWeekAgo).length;

  // encouragement logic
  const totalCount = clients.length + bids.length;
  const encouragement = totalCount < 5
    ? "Time to hustle!"
    : totalCount < 10
      ? "You're doing a great job!"
      : "You're crushing it! 💥";

  // greeting & profile
  const hr = now.getHours();
  const greeting = hr < 12 ? "Good morning" : hr < 18 ? "Good afternoon" : "Good evening";
  const name = profile?.profile?.owner_name || "Cleaner";
  <p className="text-sm text-gray-500">
    {profile?.profile?.business_name}
  </p>

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{`${greeting}, ${name}!`}</h1>
        <p className="italic text-gray-600 mt-1">{encouragement}</p>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
          <span>🗓️ Clients today: <strong>{clientsToday}</strong></span>
          <span>🕒 Clients this week: <strong>{clientsWeek}</strong></span>
          <span>🗓️ Bids today: <strong>{bidsToday}</strong></span>
          <span>🕒 Bids this week: <strong>{bidsThisWeek}</strong></span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card title="Clients" value={clients.length} color="blue" />
        <Card title="Bids" value={bids.length} color="green" />
        <Card title="Signed" value={signedContracts} color="indigo" />
        <Card title="This Week" value={`${clientsWeek}c • ${bidsThisWeek}b`} color="purple" />
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <QuickAction to="/clients" title="Add Client" emoji="➕" />
        <QuickAction to="/calculator/new" title="New Bid" emoji="📝" />
        <QuickAction to="/profile" title="Edit Profile" emoji="⚙️" />
        <QuickAction to="/dashboard" title="Dashboard" emoji="📊" />
      </div>

      {/* Placeholder */}
      <div className="bg-white border rounded shadow p-6 text-center text-gray-500">
        📈 Charts and Scheduling Calendar coming soon...
      </div>

      {/* Business Branding */}
      <BusinessBranding />
      
    </div>
  );
}

// UI Helpers
function Card({ title, value, color }) { /* unchanged as before */ }
function QuickAction({ to, title, emoji }) { /* unchanged as before */ }