import React, { useEffect, useState } from "react";
import api from "../api/client";
import { toast } from "react-toastify";
import { Link, useSearchParams } from "react-router-dom";

export default function Bids() {
  const [bids, setBids] = useState([]);
  const [searchParams] = useSearchParams();
  const clientFilter = searchParams.get("client");
  const [emailInputs, setEmailInputs] = useState({});

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const url = clientFilter ? `/bids?client=${clientFilter}` : "/bids";
        const res = await api.get(url);
        setBids(res.data);
      } catch (err) {
        toast.error("Failed to load bids");
        console.error(err);
      }
    };
    fetchBids();
  }, [clientFilter]);

  const downloadEstimate = async (bidId, clientName) => {
    toast.info("Generating estimate PDF...");
    try {
      const res = await api.post(`/generate-estimate/${bidId}`, null, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      const last = clientName.split(" ").slice(-1)[0].toLowerCase();
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      a.download = `${last}-${date}-estimate.pdf`;
      a.click();
      toast.success("Estimate downloaded!");
    } catch (err) {
      toast.error("Estimate generation failed");
      console.error(err);
    }
  };

  const downloadContract = async (clientId, bidId) => {
    toast.info("Generating contract...");
    try {
      const res = await api.get(`/generate-contract/${clientId}/${bidId}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `contract-${clientId}.pdf`;
      a.click();
      toast.success("Contract downloaded!");
    } catch (err) {
      toast.error("Contract generation failed");
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Saved Bids</h2>
      {bids.length === 0 ? (
        <p className="text-gray-500">No bids found.</p>
      ) : (
        <ul className="space-y-4">
          {bids.map((bid) => {
            const status = bid.signed_contract
              ? "🟢 Signed"
              : bid.messages?.some((m) => m.attachment?.includes("contract"))
              ? "📫 Contract Sent"
              : bid.messages?.some((m) => m.attachment?.includes("estimate"))
              ? "🟡 Estimate Sent"
              : "🔴 No Estimate";

            return (
              <li key={bid.bid_id} className="p-4 border rounded shadow-sm">
                <h3 className="text-lg font-semibold">{bid.bid_address}</h3>
                <span className="text-sm italic text-gray-700">Status: {status}</span>
                <p className="text-sm text-gray-600">Notes: {bid.notes}</p>

                <div className="mt-2 flex flex-wrap gap-2">
                  <Link to={`/calculator/${bid.bid_id}`}>
                    <button className="bg-blue-500 text-white px-3 py-1 rounded">
                      Preview Quote
                    </button>
                  </Link>
                  <button
                    onClick={() => downloadEstimate(bid.bid_id, bid.client_name)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Estimate
                  </button>
                  <button
                    onClick={() => downloadContract(bid.client_id, bid.bid_id)}
                    className="bg-gray-700 text-white px-3 py-1 rounded"
                  >
                    Contract
                  </button>
                  <Link to={`/contracts/preview/${bid.client_id}/${bid.bid_id}`}>
                    <button className="bg-purple-600 text-white px-3 py-1 rounded">
                      Preview Contract
                    </button>
                  </Link>
                  {!bid.signed_contract && (
                    <Link to={`/contracts/sign/${bid.client_id}/${bid.bid_id}`}>
                      <button className="bg-green-700 text-white px-3 py-1 rounded">
                        Sign Now
                      </button>
                    </Link>
                  )}
                  {bid.signed_contract && (
                    <span className="text-sm text-green-600 italic ml-2">
                      ✔️ Signed by {bid.signed_contract?.name}
                    </span>
                  )}
                </div>

                {/* Email Estimate */}
                <div className="mt-4">
                  <input
                    type="email"
                    placeholder="Client Email"
                    value={emailInputs[bid.bid_id] || ""}
                    onChange={(e) =>
                      setEmailInputs((prev) => ({ ...prev, [bid.bid_id]: e.target.value }))
                    }
                    className="w-full border p-2 mb-1"
                  />
                  <button
                    className="bg-indigo-600 text-white px-4 py-1 rounded w-full"
                    onClick={async () => {
                      const email = emailInputs[bid.bid_id];
                      if (!email) return toast.error("Enter an email");
                      toast.info("Sending estimate...");
                      try {
                        const form = new FormData();
                        form.append("to", email);
                        await api.post(`/email-estimate/${bid.bid_id}`, form);
                        toast.success("Estimate emailed successfully!");
                      } catch (err) {
                        toast.error("Sending failed");
                        console.error(err);
                      }
                    }}
                  >
                    📧 Email Estimate
                  </button>
                </div>

                {/* Email Contract */}
                <div className="mt-4">
                  <input
                    type="email"
                    placeholder="Client Email"
                    value={emailInputs[`contract_${bid.bid_id}`] || ""}
                    onChange={(e) =>
                      setEmailInputs((prev) => ({
                        ...prev,
                        [`contract_${bid.bid_id}`]: e.target.value
                      }))
                    }
                    className="w-full border p-2 mb-1"
                  />
                  <button
                    className="bg-red-600 text-white px-4 py-1 rounded w-full"
                    onClick={async () => {
                      const email = emailInputs[`contract_${bid.bid_id}`];
                      if (!email) return toast.error("Enter a valid email");
                      toast.info("Sending contract...");
                      try {
                        const form = new FormData();
                        form.append("to", email);
                        await api.post(`/email-contract/${bid.client_id}/${bid.bid_id}`, form);
                        toast.success("Contract emailed successfully!");
                      } catch (err) {
                        toast.error("Sending failed");
                        console.error(err);
                      }
                    }}
                  >
                    📨 Email Contract
                  </button>
                </div>

                {/* Communication Log */}
                <div className="mt-2">
                  <button
                    onClick={async () => {
                      try {
                        const res = await api.get(`/bids/${bid.bid_id}/messages`);
                        const log = res.data.messages;
                        if (!log.length) return toast.info("No emails sent yet");
                        alert(
                          log
                            .map(
                              (m, i) =>
                                `#${i + 1} - ${
                                  m.attachment?.includes("contract") ? "Contract" : "Estimate"
                                }\n🕒 ${m.timestamp}\n📬 To: ${m.to}\n📌 Subject: ${m.subject}`
                            )
                            .join("\n\n")
                        );
                      } catch (err) {
                        toast.error("Failed to load messages.");
                        console.error(err);
                      }
                    }}
                    className="bg-yellow-500 text-white px-4 py-1 mt-2 rounded w-full"
                  >
                    📜 View Communication Log
                  </button>
                  </div>
                  <a 
                    href={`${import.meta.env.VITE_API_BASE}/calendar/${bid.client_id}/${bid.bid_id}`}
                    download
                  >
                    <button className="bg-sky-600 text-white px-3 py-1 rounded w-full mt-1">
                      📅 Add to Calendar
                    </button>
                  </a>     
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}