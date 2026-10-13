"use client";

import { type FormEvent, useState } from "react";

import { useRouter } from "next/navigation";

import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";

import { addAdmin, AdminAuthError } from "@/lib/api/admin-auth-api";
import { sanitizeText } from "@/lib/utils/sanitize";

export function AdminAddAdminForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanedEmail = email.trim();

    if (!name.trim()) {
      setError("Please enter the admin's name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await addAdmin(sanitizeText(name), cleanedEmail, password, confirmPassword);

      setSuccess(response.message ?? "Admin added successfully.");

      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1200);
    } catch (error) {
      setError(
        error instanceof TypeError
          ? "We couldn't connect. Please check your internet connection and try again."
          : error instanceof AdminAuthError
            ? error.message
            : "We're unable to add the administrator right now. Please try again in a few minutes.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="admin-name" className="mb-2 block font-semibold text-[#252a4a] text-admin-14">
          Full Name
        </label>

        <div className="flex h-[48px] items-center rounded-[8px] border border-[#dedfeb] bg-white transition focus-within:border-[#2720a8] focus-within:ring-2 focus-within:ring-[#2720a8]/10">
          <UserRound size={17} className="shrink-0 text-[#7c8098]" />

          <input
            id="admin-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter admin full name"
            disabled={loading}
            className="min-w-0 flex-1 border-0 bg-transparent px-3 text-[#11163d] text-admin-14 outline-none placeholder:text-[#a0a3b5]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="admin-add-email" className="mb-2 block font-semibold text-[#252a4a] text-admin-14">
          Email Address
        </label>

        <div className="flex h-[48px] overflow-hidden rounded-[8px] border border-[#dedfeb] bg-white transition focus-within:border-[#2720a8] focus-within:ring-2 focus-within:ring-[#2720a8]/10">
          <Mail size={17} className="ml-3 shrink-0 self-center text-muted-foreground" />

          <input
            id="admin-add-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter email address"
            disabled={loading}
            className="min-w-0 flex-1 border-0 bg-transparent px-4 text-[#11163d] text-admin-14 outline-none placeholder:text-[#a0a3b5]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="admin-add-password" className="mb-2 block font-semibold text-[#252a4a] text-admin-14">
          Password
        </label>

        <div className="flex h-[48px] items-center rounded-[8px] border border-[#dedfeb] bg-white px-3 transition focus-within:border-[#2720a8] focus-within:ring-2 focus-within:ring-[#2720a8]/10">
          <LockKeyhole size={17} className="shrink-0 text-[#7c8098]" />

          <input
            id="admin-add-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimum 8 characters"
            disabled={loading}
            className="min-w-0 flex-1 border-0 bg-transparent px-3 text-[#11163d] text-admin-14 outline-none placeholder:text-[#a0a3b5]"
          />

          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            disabled={loading}
            className="flex h-8 w-8 items-center justify-center text-[#7c8098] transition hover:text-[#2720a8]"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="admin-add-confirm-password" className="mb-2 block font-semibold text-[#252a4a] text-admin-14">
          Confirm Password
        </label>

        <div className="flex h-[48px] items-center rounded-[8px] border border-[#dedfeb] bg-white px-3 transition focus-within:border-[#2720a8] focus-within:ring-2 focus-within:ring-[#2720a8]/10">
          <LockKeyhole size={17} className="shrink-0 text-[#7c8098]" />

          <input
            id="admin-add-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Re-enter your password"
            disabled={loading}
            className="min-w-0 flex-1 border-0 bg-transparent px-3 text-[#11163d] text-admin-14 outline-none placeholder:text-[#a0a3b5]"
          />

          <button
            type="button"
            onClick={() => setShowConfirmPassword((current) => !current)}
            disabled={loading}
            className="flex h-8 w-8 items-center justify-center text-[#7c8098] transition hover:text-[#2720a8]"
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-[7px] border border-[#ffd6d6] bg-[#fff6f6] px-4 py-3 font-medium text-[#c23b3b] text-admin-14">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-[7px] border border-[#cdeed8] bg-[#f3fff7] px-4 py-3 font-medium text-[#247a45] text-admin-14">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex h-[48px] w-full items-center justify-center rounded-[8px] bg-[#2720a8] font-bold text-admin-14 text-white transition hover:bg-[#1d178e] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Adding Admin..." : "Add Admin"}
      </button>

      <p className="text-center text-[#9699aa] text-admin-14 leading-5">
        Only authorized administrators can add another administrator to the CoolerGuru platform.
      </p>
    </form>
  );
}
