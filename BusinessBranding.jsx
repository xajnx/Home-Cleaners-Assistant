import React, { useEffect, useState } from "react";
import api from "../api/client";
import { toast } from "react-toastify";

export default function BusinessBranding() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    owner_name: "",
    business_name: "",
    business_address: "",
    contact_email: "",
    contact_number: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile");
        setForm({
          owner_name: res.data.owner_name || "",
          business_name: res.data.business_name || "",
          business_address: res.data.business_address || "",
          contact_email: res.data.contact_email || "",
          contact_number: res.data.contact_number || ""
        });
      } catch (err) {
        toast.error("Failed to load business profile");
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) =>
      formData.append(key, val)
    );

    try {
      await api.post("/profile", formData);
      toast.success("Business profile updated!");
      setEditing(false);
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="mt-6 p-4 border rounded shadow bg-white">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {form.owner_name || "Cleaner Name"}
          </h3>
          <p className="text-sm text-gray-600">
            {form.business_name || "Business Name"}
          </p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="bg-yellow-500 text-white px-3 py-1 text-sm rounded"
          >
            ✏️ Edit
          </button>
        ) : (
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-3 py-1 text-sm rounded"
          >
            💾 Save
          </button>
        )}
      </div>

      <div className="space-y-2">
        <input
          name="owner_name"
          value={form.owner_name}
          onChange={handleChange}
          disabled={!editing}
          placeholder="Owner's Name"
          className="w-full border p-2"
        />
        <input
          name="business_name"
          value={form.business_name}
          onChange={handleChange}
          disabled={!editing}
          placeholder="Business Name"
          className="w-full border p-2"
        />
        <input
          name="business_address"
          value={form.business_address}
          onChange={handleChange}
          disabled={!editing}
          placeholder="Business Address"
          className="w-full border p-2"
        />
        <input
          name="contact_email"
          value={form.contact_email}
          onChange={handleChange}
          disabled={!editing}
          placeholder="Email"
          className="w-full border p-2"
        />
        <input
          name="contact_number"
          value={form.contact_number}
          onChange={handleChange}
          disabled={!editing}
          placeholder="Phone"
          className="w-full border p-2"
        />
      </div>
    </div>
  );
}