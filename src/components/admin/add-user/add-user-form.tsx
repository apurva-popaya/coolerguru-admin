"use client";

import * as React from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ArrowLeft, Building2, Info, Store, UserRound } from "lucide-react";

import type { UserRole } from "@/components/admin/users/users-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createAdminUser, updateAdminUser } from "@/lib/api/admin-users-api";
import { getApiErrorMessage } from "@/lib/api/get-api-error-message";

interface RoleOption {
  role: UserRole;
  title: string;
  description: string;
  icon: React.ElementType;
}

export interface AdminUserFormInitialValues {
  name: string;
  mobile: string;
  role: UserRole;
}

interface AddUserFormProps {
  mode?: "add" | "edit";
  userId?: string;
  initialValues?: AdminUserFormInitialValues;
}

const roleOptions: RoleOption[] = [
  {
    role: "Buyer",
    title: "Buyer",
    description: "Create an individual buyer account.",
    icon: UserRound,
  },
  {
    role: "Supplier",
    title: "Supplier",
    description: "Create a supplier account for a company.",
    icon: Store,
  },
];

function normalizeMobile(value: string) {
  return value.replace(/\D/g, "").replace(/^91/, "").slice(0, 10);
}

export function AddUserForm({ mode = "add", userId, initialValues }: AddUserFormProps) {
  const router = useRouter();

  const isEditMode = mode === "edit";

  const [selectedRole, setSelectedRole] = React.useState<UserRole>(initialValues?.role ?? "Buyer");

  const [buyerName, setBuyerName] = React.useState(initialValues?.role === "Buyer" ? initialValues.name : "");

  const [companyName, setCompanyName] = React.useState(initialValues?.role === "Supplier" ? initialValues.name : "");

  const [mobile, setMobile] = React.useState(normalizeMobile(initialValues?.mobile ?? ""));

  const [loading, setLoading] = React.useState(false);

  const [error, setError] = React.useState("");

  const [success, setSuccess] = React.useState("");

  function selectRole(role: UserRole) {
    setSelectedRole(role);

    setError("");
    setSuccess("");

    /*
     * In edit mode preserve the current name
     * when switching between Buyer/Supplier.
     */
    if (role === "Buyer") {
      if (!buyerName && companyName) {
        setBuyerName(companyName);
      }
    } else {
      if (!companyName && buyerName) {
        setCompanyName(buyerName);
      }
    }
  }

  function handleMobileChange(value: string) {
    const onlyNumbers = value.replace(/\D/g, "");

    setMobile(onlyNumbers.slice(0, 10));
  }

  const currentName = selectedRole === "Buyer" ? buyerName.trim() : companyName.trim();

  const formIsValid = currentName.length > 0 && mobile.length === 10;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formIsValid || loading) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const backendRole = selectedRole === "Buyer" ? "BUYER" : "SELLER";

    try {
      if (isEditMode) {
        if (!userId) {
          throw new Error("User ID is missing.");
        }

        await updateAdminUser(userId, {
          name: currentName,
          phone_number: `+91${mobile}`,
          roles: [backendRole],
        });

        setSuccess("User updated successfully.");
      } else {
        await createAdminUser({
  user_type: backendRole,
  name: currentName,
  phone_number: `+91${mobile}`,
});

        setSuccess(`${selectedRole} added successfully.`);
      }

      setTimeout(() => {
        router.push("/users");
        router.refresh();
      }, 600);
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* HEADER */}

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-admin-14">
            <Link href="/users" className="font-medium text-[#2720a8]">
              Users
            </Link>

            <span className="text-muted-foreground">/</span>

            <span className="font-medium text-[#15136f]">{isEditMode ? "Edit User" : "Add User"}</span>
          </div>

          <h1 className="font-bold text-[#15136f] text-admin-28">{isEditMode ? "Edit User" : "Add User"}</h1>

          <p className="mt-1 text-[#5d6280] text-admin-14">
            {isEditMode ? "Update buyer or supplier account information." : "Create a new buyer or supplier account."}
          </p>
        </div>

        <Button asChild variant="outline" className="gap-2">
          <Link href="/users">
            <ArrowLeft className="size-4" />
            Back to Users
          </Link>
        </Button>
      </div>

      {/* CONTENT */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.75fr)_minmax(0,0.85fr)]">
        <form onSubmit={handleSubmit} className="rounded-[10px] border border-border bg-white p-6">
          {/* ROLE */}

          <div>
            <h2 className="font-bold text-[#15136f] text-admin-19">User Type</h2>

            <p className="mt-1 text-[#5d6280] text-admin-14">Select whether this account is a buyer or supplier.</p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {roleOptions.map((option) => {
              const Icon = option.icon;

              const selected = selectedRole === option.role;

              return (
                <button
                  key={option.role}
                  type="button"
                  onClick={() => selectRole(option.role)}
                  disabled={loading}
                  className={`relative min-h-[135px] rounded-[9px] border p-5 text-left transition ${selected ? "border-[#2720a8] bg-[#f5f4ff] shadow-[0_0_0_1px_#2720a8]" : "border-border bg-white hover:border-[#c9c6f3]"} disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex size-11 items-center justify-center rounded-[8px] ${selected ? "bg-[#e8e6ff]" : "bg-[#edf3ff]"}`}
                    >
                      <Icon className="size-6 text-[#2720a8]" />
                    </div>

                    <div
                      className={`flex size-5 items-center justify-center rounded-full border-2 ${selected ? "border-[#2720a8]" : "border-[#9da2b6]"}`}
                    >
                      {selected && <div className="size-2.5 rounded-full bg-[#2720a8]" />}
                    </div>
                  </div>

                  <p className="mt-4 font-bold text-[#15136f] text-admin-15">{option.title}</p>

                  <p className="mt-1 text-[#5d6280] text-admin-14 leading-5">{option.description}</p>
                </button>
              );
            })}
          </div>

          {/* USER INFORMATION */}

          <div className="mt-7 border-border border-t pt-6">
            <h2 className="font-bold text-[#15136f] text-admin-19">
              {selectedRole === "Buyer" ? "Buyer Information" : "Supplier Information"}
            </h2>

            <p className="mt-1 text-[#5d6280] text-admin-14">
              {selectedRole === "Buyer"
                ? "Enter the buyer's name and mobile number."
                : "Enter the supplier's company name and mobile number."}
            </p>

            <div className="mt-6 space-y-5">
              {selectedRole === "Buyer" ? (
                <div>
                  <label htmlFor="buyer-name" className="font-semibold text-[#15136f] text-admin-14">
                    Name <span className="text-red-500">*</span>
                  </label>

                  <div className="relative mt-2">
                    <UserRound className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#7a8099]" />

                    <Input
                      id="buyer-name"
                      value={buyerName}
                      onChange={(event) => setBuyerName(event.target.value)}
                      placeholder="Enter buyer name"
                      className="h-11 pl-10"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label htmlFor="company-name" className="font-semibold text-[#15136f] text-admin-14">
                    Company Name <span className="text-red-500">*</span>
                  </label>

                  <div className="relative mt-2">
                    <Building2 className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#7a8099]" />

                    <Input
                      id="company-name"
                      value={companyName}
                      onChange={(event) => setCompanyName(event.target.value)}
                      placeholder="Enter company name"
                      className="h-11 pl-10"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="mobile-number" className="font-semibold text-[#15136f] text-admin-14">
                  Mobile Number <span className="text-red-500">*</span>
                </label>

                <div className="mt-2 flex gap-2">
                  <div className="flex h-11 w-[86px] shrink-0 items-center justify-center rounded-[7px] border border-border bg-[#fafafe] font-semibold text-[#15136f] text-admin-14">
                    +91
                  </div>

                  <Input
                    id="mobile-number"
                    inputMode="numeric"
                    value={mobile}
                    onChange={(event) => handleMobileChange(event.target.value)}
                    placeholder="Enter 10 digit mobile number"
                    className="h-11"
                    disabled={loading}
                    required
                  />
                </div>

                <p className="mt-1 text-admin-14 text-muted-foreground">Enter a valid 10 digit Indian mobile number.</p>
              </div>
            </div>
          </div>

          {/* INFO */}

          <div className="mt-7">
            <div className="flex gap-3 rounded-[9px] border border-[#cfe0ff] bg-[#f5f9ff] p-4">
              <Info className="mt-0.5 size-5 shrink-0 text-[#2563eb]" />

              <div>
                <p className="font-semibold text-[#194a9b] text-admin-14">
                  {selectedRole === "Buyer" ? "Buyer account" : "Supplier account"}
                </p>

                <p className="mt-1 text-[#4f6593] text-admin-14 leading-5">
                  {isEditMode
                    ? "Update the account information and save your changes."
                    : selectedRole === "Buyer"
                      ? "The buyer account will be created using the entered name and mobile number."
                      : "The supplier account will be created using the entered company name and mobile number. The supplier can later log in and complete the company profile for verification."}
                </p>
              </div>
            </div>
          </div>

          {/* RESPONSE */}

          {error && (
            <div className="mt-5 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 font-medium text-admin-14 text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-5 rounded-[8px] border border-green-200 bg-green-50 px-4 py-3 font-medium text-admin-14 text-green-700">
              {success}
            </div>
          )}

          {/* ACTIONS */}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-border border-t pt-5">
            <Button asChild type="button" variant="outline">
              <Link href="/users">Cancel</Link>
            </Button>

            <Button
              type="submit"
              disabled={!formIsValid || loading}
              className="min-w-[150px] bg-[#2720a8] text-white hover:bg-[#15136f]"
            >
              {loading ? (isEditMode ? "Saving..." : "Adding...") : isEditMode ? "Save Changes" : `Add ${selectedRole}`}
            </Button>
          </div>
        </form>

        {/* RIGHT SIDE */}

        <div className="space-y-5">
          <div className="rounded-[10px] border border-border bg-white p-5">
            <h2 className="font-bold text-[#15136f] text-admin-18">
              {isEditMode ? "Editing User" : "What happens next?"}
            </h2>

            <div className="mt-5 space-y-5">
              {isEditMode ? (
                <>
                  <Step number={1} text="Review the existing user information." />
                  <Step number={2} text="Update the required fields." />
                  <Step number={3} text="Save the changes to update the account." />
                </>
              ) : (
                <>
                  <Step number={1} text="Admin selects Buyer or Supplier." />

                  <Step
                    number={2}
                    text={
                      selectedRole === "Buyer"
                        ? "Admin enters the buyer name and mobile number."
                        : "Admin enters the company name and supplier mobile number."
                    }
                  />

                  <Step
                    number={3}
                    text={
                      selectedRole === "Buyer"
                        ? "The buyer account is created and becomes available in the users list."
                        : "The supplier account is created. The supplier can then log in and complete the company profile."
                    }
                  />
                </>
              )}
            </div>
          </div>

          <div className="rounded-[10px] border border-border bg-white p-5">
            <h2 className="font-bold text-[#15136f] text-admin-18">User Types</h2>

            <div className="mt-5 space-y-5">
              <RoleInfo
                icon={UserRound}
                title="Buyer"
                description="Individual account used to browse products, save items and send inquiries."
              />

              <RoleInfo
                icon={Store}
                title="Supplier"
                description="Company account used to manage company profile, products and supplier inquiries."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#edf3ff] font-bold text-[#2720a8] text-admin-14">
        {number}
      </div>

      <p className="pt-2 text-[#5d6280] text-admin-14 leading-5">{text}</p>
    </div>
  );
}

function RoleInfo({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-[8px] bg-[#edf3ff]">
        <Icon className="size-5 text-[#2720a8]" />
      </div>

      <div>
        <p className="font-semibold text-[#15136f] text-admin-14">{title}</p>

        <p className="mt-1 text-[#5d6280] text-admin-14 leading-5">{description}</p>
      </div>
    </div>
  );
}
