import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "../firebase/firebase";
import { toast } from "react-toastify";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in successfully!");
      navigate("/dashboard");
    } catch (e) {
      toast.error("Login failed: " + e.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 p-8 border rounded shadow">
      <h2 className="text-2xl mb-4">Login to CleanAssist</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email" value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email" required
          className="w-full border p-2 rounded"
        />
        <input
          type="password" value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password" required
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}