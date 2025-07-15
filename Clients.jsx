import React, { useEffect, useState } from "react";
import api from "../api/client";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await api.get("/clients");
        res.data.sort((a, b) => a.name.localeCompare(b.name));
        setClients(res.data);
      } catch (err) {
        toast.error("Failed to load clients");
        console.error(err);
      }
    };

    fetchClients();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Clients</h2>
        <Link to="/clients/new">
          <button className="bg-blue-600 text-white px-3 py-1 rounded">
            + Add Client
          </button>
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search clients..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
      />

      {clients.length === 0 ? (
        <p className="text-gray-500">No clients found.</p>
      ) : (
        <ul className="space-y-4">
          {clients
            .filter((c) =>
              c.name.toLowerCase().includes(search.toLowerCase()) ||
              c.contact_email.toLowerCase().includes(search.toLowerCase())
            )
            .map((client) => (
              <li key={client.client_id} className="p-4 border rounded shadow-sm">
                <h3 className="text-lg font-semibold">{client.name}</h3>
                <p className="text-sm text-gray-600">
                  {client.contact_email} | {client.contact_number}
                </p>
                <p className="text-sm">Frequency: {client.cleaning_frequency}</p>

                <div className="mt-2 flex gap-2">
                  <Link to={`/calculator/new?clientId=${client.client_id}`}>
                    <button className="bg-green-700 text-white px-3 py-1 rounded">
                      Quick Quote
                    </button>
                  </Link>
                  <Link to={`/bids?client=${client.client_id}`}>
                    <button className="bg-gray-700 text-white px-3 py-1 rounded">
                      View Bids
                    </button>
                  </Link>
                </div>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}