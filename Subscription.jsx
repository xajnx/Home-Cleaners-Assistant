import React, { useEffect, useState } from "react";
import api from "../api/client";
import { toast } from "react-toastify";

export default function Subscription() {
  const [plan, setPlan] = useState("free");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await api.get("/subscription");
        setPlan(res.data.level);
      } catch (err) {
        toast.error("Failed to load subscription");
        console.error(err);
      }
    };
    fetchPlan();
  }, []);

  const upgradeToPro = async () => {
    setLoading(true);
    try {
      await api.post("/set-subscription", new URLSearchParams({ level: "pro" }));
      toast.success("Upgraded to Pro!");
      setPlan("pro");
    } catch (err) {
      toast.error("Upgrade failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 text-center">
      <h2 className="text-2xl font-bold mb-4">Your Plan: {plan.toUpperCase()}</h2>
      {plan === "pro" ? (
        <p className="text-green-600 font-semibold">You already have Pro access! 🎉</p>
      ) : (
        <button
          onClick={upgradeToPro}
          disabled={loading}
          className="bg-purple-600 text-white py-2 px-6 rounded mt-4"
        >
          {loading ? "Upgrading..." : "Upgrade to Pro"}
        </button>
      )}
    </div>
  );
}