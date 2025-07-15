import React, { useState } from "react";
import api from "../api/client";
import { toast } from "react-toastify";

export default function Estimate() {
  const [form, setForm] = useState({
    total_sqft: "",
    num_pets: "",
    num_windows: "",
    cleanliness: 0,
    travel_miles: "",
    state: "CA"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.info("Generating estimate...");

    try {
      const res = await api.post("/generate-estimate", form, {
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "estimate.pdf";
      a.click();

      toast.success("Estimate downloaded!");
    } catch (err) {
      toast.error("Failed to generate estimate");
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Generate Estimate</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="total_sqft" type="number" onChange={handleChange} placeholder="Total Square Feet" className="w-full border p-2" />
        <input name="num_pets" type="number" onChange={handleChange} placeholder="Number of Pets" className="w-full border p-2" />
        <input name="num_windows" type="number" onChange={handleChange} placeholder="Number of Windows" className="w-full border p-2" />
        <input name="travel_miles" type="number" onChange={handleChange} placeholder="Travel Distance (miles)" className="w-full border p-2" />
        <select name="cleanliness" onChange={handleChange} className="w-full border p-2">
          <option value="0">Very Clean</option>
          <option value="1">Clean</option>
          <option value="2">Moderate</option>
          <option value="3">Dirty</option>
          <option value="4">Very Dirty</option>
          <option value="5">Extreme</option>
        </select>
        <input name="state" maxLength="2" onChange={handleChange} placeholder="State Abbr (e.g. TX)" className="w-full border p-2" />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          Generate PDF
        </button>
      </form>
    </div>
  );
}