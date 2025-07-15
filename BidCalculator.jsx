import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import api from "../api/client";
import { toast } from "react-toastify";
import { format } from "date-fns";

export default function BidCalculator() {
  const { bid_id } = useParams();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get("clientId");

  const [form, setForm] = useState({
    total_sqft: "",
    num_pets: "",
    num_windows: "",
    cleanliness: "2",
    travel_miles: "",
    state: ""
  });

  const [clientName, setClientName] = useState("client");
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    const fetchClient = async () => {
      if (!clientId) return;

      try {
        const res = await api.get("/clients");
        const client = res.data.find((c) => c.client_id === clientId);
        if (client) {
          setClientName(client.name);
          setForm((prev) => ({
            ...prev,
            client_id: client.client_id,
            contact_email: client.contact_email,
            contact_number: client.contact_number,
            cleaning_frequency: client.cleaning_frequency
          }));
        }
      } catch (err) {
        toast.error("Failed to preload client");
        console.error(err);
      }
    };

    fetchClient();
  }, [clientId]);

  useEffect(() => {
    const loadBid = async () => {
      if (!bid_id) return;
      try {
        const res = await api.get(`/bids/${bid_id}`);
        const bid = res.data;

        setForm((prev) => ({
          ...prev,
          total_sqft: bid.total_sqft ?? "1000",
          num_pets: bid.num_pets ?? "0",
          num_windows: bid.num_windows ?? "5",
          cleanliness: bid.cleanliness ?? "2",
          travel_miles: bid.travel_miles ?? "10",
          state: bid.state ?? "TX"
        }));

        setClientName(bid.client_name || "client");
        toast.info("Loaded saved bid into calculator");
      } catch (err) {
        toast.error("Failed to load bid data");
      }
    };

    loadBid();
  }, [bid_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    toast.info("Calculating quote...");
    try {
      const res = await api.post("/calculate-quote", form);
      setQuote(res.data.quote);
      toast.success("Quote calculated!");
    } catch (err) {
      toast.error("Failed to calculate quote");
      console.error(err);
    }
  };

  const exportEstimate = async () => {
    toast.info("Generating estimate PDF...");

    try {
      let res;
      if (bid_id) {
        res = await api.post(`/generate-estimate/${bid_id}`, null, {
          responseType: "blob"
        });
      } else {
        res = await api.post("/generate-estimate", form, {
          responseType: "blob"
        });
      }

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      const last = clientName.split(" ").slice(-1)[0].toLowerCase();
      const date = format(new Date(), "yyyyMMdd");
      a.download = `${last}-${date}-estimate.pdf`;
      a.click();

      toast.success("Estimate downloaded!");
    } catch (err) {
      toast.error("Failed to generate estimate");
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-blue-800">Bid Calculator</h2>
      <form onSubmit={handleCalculate} className="space-y-3">
        <input
          name="total_sqft"
          value={form.total_sqft}
          onChange={handleChange}
          type="number"
          placeholder="Total Square Feet"
          className="w-full border border-blue-300 p-2"
          required
        />
        <input
          name="num_pets"
          value={form.num_pets}
          onChange={handleChange}
          type="number"
          placeholder="Number of Pets"
          className="w-full border border-blue-300 p-2"
          required
        />
        <input
          name="num_windows"
          value={form.num_windows}
          onChange={handleChange}
          type="number"
          placeholder="Number of Windows"
          className="w-full border border-blue-300 p-2"
          required
        />
        <select
          name="cleanliness"
          value={form.cleanliness}
          onChange={handleChange}
          className="w-full border border-blue-300 p-2"
        >
          <option value="0">Very Clean</option>
          <option value="1">Clean</option>
          <option value="2">Moderate</option>
          <option value="3">Dirty</option>
          <option value="4">Very Dirty</option>
          <option value="5">Extreme</option>
        </select>
        <input
          name="travel_miles"
          value={form.travel_miles}
          onChange={handleChange}
          type="number"
          placeholder="Travel Distance (miles)"
          className="w-full border border-blue-300 p-2"
          required
        />
        <input
          name="state"
          value={form.state}
          onChange={handleChange}
          maxLength="2"
          placeholder="State Abbr (e.g. TX)"
          className="w-full border border-blue-300 p-2"
          required
        />
        <button type="submit" className="bg-blue-800 text-white px-4 py-2 rounded">
          Calculate
        </button>
      </form>

      {quote && (
        <div className="mt-8 p-4 bg-yellow-100 border border-yellow-300 rounded">
          <h3 className="text-lg font-semibold mb-2 text-blue-900">🧾 Quote Summary</h3>
          <p><strong>Base Rate:</strong> ${quote.base_rate.toFixed(2)}</p>
          <p><strong>Pet Fee:</strong> ${quote.pet_fee.toFixed(2)}</p>
          <p><strong>Floor Fee:</strong> ${quote.floor_fee.toFixed(2)}</p>
          <p><strong>Window Fee:</strong> ${quote.window_fee.toFixed(2)}</p>
          <p><strong>Knickknack Fee:</strong> ${quote.knickknack_fee.toFixed(2)}</p>
          <p><strong>Travel Fee:</strong> ${quote.travel_fee.toFixed(2)}</p>
          <p><strong>Multiplier:</strong> x{quote.cleanliness_multiplier.toFixed(2)}</p>
          <p><strong>Tax:</strong> ${quote.tax.toFixed(2)}</p>
          <p className="text-xl mt-2"><strong>Total:</strong> ${quote.total.toFixed(2)}</p>
          <div className="mt-2 text-sm text-gray-600 italic">
            Bi-weekly: ${quote.bi_week.toFixed(2)} | Weekly: ${quote.week.toFixed(2)}
          </div>

          <button
            onClick={exportEstimate}
            className="mt-6 bg-yellow-400 text-blue-900 font-semibold px-4 py-2 rounded"
          >
            Export as PDF
          </button>
        </div>
      )}
    </div>
  );
}