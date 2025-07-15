import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import api from "../api/client";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function SignContractScreen({ clientId, bidId }) {
  const sigRef = useRef(null);
  const [signerName, setSignerName] = useState("");
  const navigate = useNavigate();

  const clearSig = () => sigRef.current.clear();

  const handleSubmit = async () => {
    if (!signerName.trim()) {
      toast.error("Name is required");
      return;
    }

    if (sigRef.current.isEmpty()) {
      toast.error("Signature is required");
      return;
    }

    const blob = await fetch(sigRef.current.getTrimmedCanvas().toDataURL()).then(r => r.blob());
    const form = new FormData();
    form.append("signature", blob, "signature.png");
    form.append("name", signerName);

    try {
      await api.post(`/sign-contract/${clientId}/${bidId}`, form);
      toast.success("Contract signed and saved!");
      navigate(`/contracts/preview/${clientId}/{bidId} `);
    } catch (err) {
      toast.error("Signing failed");
      console.error(err);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 bg-white p-6 shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Sign Contract</h2>
      <p className="mb-2">Please sign below to accept the service agreement.</p>

      <SignatureCanvas
        penColor="black"
        canvasProps={{ width: 500, height: 200, className: "border" }}
        ref={sigRef}
      />

      <input
        type="text"
        value={signerName}
        onChange={(e) => setSignerName(e.target.value)}
        placeholder="Signer full name"
        className="w-full mt-3 border p-2"
      />

      <div className="flex gap-2 mt-4">
        <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded">
          Submit Signature
        </button>
        <button onClick={clearSig} className="bg-gray-300 px-4 py-2 rounded">
          Clear
        </button>
      </div>
    </div>
  );
}