"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "../atoms/Input";
import { Button } from "../atoms/Button";
import { loginUser } from "../../services/auth";
import { useFlash } from "../../contexts/FlashContext";

import { useAuth } from "../../contexts/AuthContext";

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const { showFlash } = useFlash();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      showFlash("Please fill in all VIP credentials.", "warning");
      setLoading(false);
      return;
    }

    try {
      const data = await loginUser(email, password);
      showFlash("VIP Access Decrypted. Welcome back.", "success");
      // Call auth context login to sync state
      login(data.access_token);
    } catch (err: any) {
      showFlash(
        err.response?.data?.error || 
        "Authentication failed. Please verify your credentials.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };



  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-6">
      <div className="flex flex-col gap-1.5 mb-2">
        <h2 className="text-2xl font-bold tracking-tight text-text-primary">
          MEMBERS PORTAL
        </h2>
        <p className="text-xs text-text-secondary tracking-wider uppercase">
          Enter your VIP credentials to enter the club
        </p>
      </div>


      <Input
        id="email"
        type="email"
        label="Email address"
        placeholder="member@forge.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <Input
        id="password"
        type="password"
        label="Password"
        placeholder="••••••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <div className="flex items-center justify-between text-xs font-semibold tracking-wide uppercase text-text-secondary select-none">
        <label className="flex items-center gap-2 cursor-pointer hover:text-text-primary transition-colors">
          <input
            type="checkbox"
            className="rounded-xs border-border-subtle bg-surface text-accent focus:ring-accent-glow"
          />
          Remember Access
        </label>
        <a href="#" className="hover:text-text-accent transition-colors">
          Reset VIP Key
        </a>
      </div>

      <Button type="submit" fullWidth disabled={loading}>
        {loading ? "Decrypting Access..." : "Request Access"}
      </Button>
    </form>
  );
};
