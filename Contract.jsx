import React, { useEffect, useState } from "react";
import api from "../api/client";
import { toast } from "react-toastify";

export default function Contract() {
  const [clients, setClients] = useState([]);
  const [bids, setBids] = useState([]);
  const [selected, setSelected] = useState({ client_id: "", bid_id: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, bRes] = await Promise.all([api.get("/clients"), api.get("/bids")]);
        setClients(cRes.data);
        setBids(bRes.data);
      } catch (err) {
        toast.error("Error loading clients or bids");
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelected((prev) => ({ ...prev, [name]: value }));
  };

  const generateContract = async () => {
    toast.info("Generating contract...");
    try {
      const res = await api.get(`/generate-contract/${selected.client_id}/${selected.bid_id}`, {
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "contract.pdf";
      a.click();

      toast.success("Contract downloaded!");
    } catch (err) {
      toast.error("Failed to generate contract");
      console.error(err);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Generate Contract</h2>
      <select name="client_id" value={selected.client_id} onChange={handleChange} className="w-full border p-2 mb-2">
        <option value="">Select Client</option>
        {clients.map((c) => (
          <option key={c.client_id} value={c.client_id}>{c.name}</option>
        ))}
      </select>
      <select name="bid_id" value={selected.bid_id} onChange={handleChange} className="w-full border p-2 mb-4">
        <option value="">Select Bid</option>
        {bids.map((b) => (
          <option key={b.bid_id} value={b.bid_id}>{b.bid_address}</option>
        ))}
      </select>
      <button onClick={generateContract} disabled={!selected.client_id || !selected.bid_id} className="bg-blue-600 text-white px-4 py-2 rounded">
        Generate Contract PDF
      </button>
    </div>
  );
}