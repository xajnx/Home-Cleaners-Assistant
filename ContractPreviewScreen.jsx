import React, { useEffect, useState } from "react";
import api from "../api/client";
import { toast } from "react-toastify";

export default function ContractPreviewScreen({ clientId, bidId }) {
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    const fetchPdf = async () => {
      toast.info("Loading contract preview...");
      try {
        const res = await api.get(`/generate-contract/${clientId}/${bidId}`, {
          responseType: "blob"
        });

        const url = window.URL.createObjectURL(new Blob([res.data]));
        setPdfUrl(url);
        toast.dismiss();
      } catch (err) {
        toast.error("Preview failed");
        console.error(err);
      }
    };

    fetchPdf();
  }, [clientId, bidId]);

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Contract Preview</h2>
      {pdfUrl ? (
        <iframe
          title="Contract PDF"
          src={pdfUrl}
          width="100%"
          height="600px"
          className="border shadow rounded"
        />
      ) : (
        <p className="text-gray-500">Generating preview...</p>
      )}
    </div>
  );
}