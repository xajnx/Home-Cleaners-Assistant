import React, { useEffect, useState } from "react";
import api from "../api/client";
import { toast } from "react-toastify";

export default function Profile() {
  const [form, setForm] = useState({
    owner_name: "",
    business_name: "",
    business_address: "",
    contact_email: "",
    contact_number: ""
  });

  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile");
        setForm(res.data);
      } catch (err) {
        toast.error("Failed to load profile");
        console.error(err);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) =>
        formData.append(key, val)
      );
      await api.post("/profile", formData);
      toast.success("Profile updated!");
      setEditing(false);
    } catch (err) {
      toast.error("Failed to update profile");
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">
            {form.owner_name || "Cleaner Name"}
          </h2>
          <p className="text-sm text-gray-600">
            {form.business_name || "Business Name"}
          </p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="bg-yellow-500 text-white px-3 py-1 rounded"
          >
            ✏️ Edit
          </button>
        ) : (
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            💾 Save
          </button>
        )}
      </div>

      <div className="space-y-3">
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