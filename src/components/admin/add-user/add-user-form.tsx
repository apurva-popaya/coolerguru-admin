"use client";

import * as React from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ArrowLeft, Building2, Info, Loader2, Store, UserRound } from "lucide-react";

import type { UserRole } from "@/components/admin/users/users-data";
import { Button } from "@/components/ui/button";
import { cn } from "cn";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
    <div className="flex min-w-0 flex-col gap-4">
      <Link href="/users" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
        <ArrowLeft aria-hidden="true" className="size-4" />Back to Users
      </Link>
      <div>
        <h1 className="text-admin-28 font-bold text-foreground">{isEditMode ? "Edit User" : "Add User"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isEditMode ? "Update buyer or supplier account information." : "Create a new buyer or supplier account."}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-6 p-4 sm:p-6">
          <FieldGroup className="gap-3">
            <Field>
              <FieldLabel id="user-type-label">User type</FieldLabel>
              <p id="user-type-description" className="text-sm text-muted-foreground">Choose the account you want to {isEditMode ? "update" : "create"}.</p>
              <RadioGroup value={selectedRole} onValueChange={(value) => {
                if (value === "Buyer" || value === "Supplier") selectRole(value);
              }} disabled={loading} aria-labelledby="user-type-label" aria-describedby="user-type-description"
                className="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {roleOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <FieldLabel key={option.role} htmlFor={`role-${option.role}`}
                      className={cn("flex w-full items-center gap-3 rounded-xl border border-border p-4 transition-colors", selectedRole === option.role && "border-primary bg-accent")}>
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary"><Icon aria-hidden="true" className="size-5" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-foreground">{option.title}</span>
                        <span className="mt-1 block text-sm font-normal leading-relaxed text-muted-foreground">{option.description}</span>
                      </span>
                      <RadioGroupItem id={`role-${option.role}`} value={option.role} />
                    </FieldLabel>
                  );
                })}
              </RadioGroup>
            </Field>
          </FieldGroup>
          <section className="border-t border-border pt-5" aria-labelledby="user-information-title">
            <h2 id="user-information-title" className="text-base font-semibold text-foreground">{selectedRole === "Buyer" ? "Buyer details" : "Supplier details"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">All fields are required.</p>
            <FieldGroup className="mt-4 grid gap-4 md:grid-cols-2">
              <Field data-disabled={loading || undefined}>
                <FieldLabel htmlFor="user-name">{selectedRole === "Buyer" ? "Full name" : "Company name"}</FieldLabel>
                <InputGroup className="h-11 rounded-xl">
                  <InputGroupInput id="user-name" value={selectedRole === "Buyer" ? buyerName : companyName}
                    onChange={(event) => selectedRole === "Buyer" ? setBuyerName(event.target.value) : setCompanyName(event.target.value)}
                    placeholder={selectedRole === "Buyer" ? "Enter buyer name" : "Enter company name"}
                    autoComplete={selectedRole === "Buyer" ? "name" : "organization"} disabled={loading} required className="h-full" />
                  <InputGroupAddon>{selectedRole === "Buyer" ? <UserRound aria-hidden="true" /> : <Building2 aria-hidden="true" />}</InputGroupAddon>
                </InputGroup>
              </Field>
              <Field data-disabled={loading || undefined}>
                <FieldLabel htmlFor="mobile-number">Mobile number</FieldLabel>
                <InputGroup className="h-11 rounded-xl">
                  <InputGroupInput id="mobile-number" type="tel" inputMode="numeric" autoComplete="tel-national"
                    value={mobile} onChange={(event) => handleMobileChange(event.target.value)}
                    placeholder="Enter 10 digit mobile number" pattern="[0-9]{10}" maxLength={10}
                    aria-describedby="mobile-help" disabled={loading} required className="h-full" />
                  <InputGroupAddon><span className="border-r border-border pr-3 font-medium text-foreground">+91</span></InputGroupAddon>
                </InputGroup>
                <p id="mobile-help" className="text-xs text-muted-foreground">Use a 10 digit Indian mobile number.</p>
              </Field>
            </FieldGroup>
          </section>
          <Alert className="rounded-xl" role="note">
            <Info aria-hidden="true" />
            <AlertTitle>{selectedRole === "Buyer" ? "Buyer account" : "Supplier account"}</AlertTitle>
            <AlertDescription>
              {isEditMode ? "Save your changes to update this account." : selectedRole === "Buyer"
                ? "The buyer can browse products, save items and send inquiries."
                : "The supplier can log in and complete their company profile for verification."}
            </AlertDescription>
          </Alert>
          {error && <Alert variant="destructive" className="rounded-xl"><AlertDescription>{error}</AlertDescription></Alert>}
          {success && <Alert role="status" className="rounded-xl"><AlertDescription>{success}</AlertDescription></Alert>}
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-border bg-muted/30 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
          <Button asChild variant="outline" className="h-10 rounded-xl"><Link href="/users">Cancel</Link></Button>
          <Button type="submit" disabled={!formIsValid || loading} className="h-10 min-w-36 rounded-xl">
            {loading && <Loader2 data-icon="inline-start" className="animate-spin" />}
            {loading ? (isEditMode ? "Saving..." : "Adding...") : isEditMode ? "Save Changes" : `Add ${selectedRole}`}
          </Button>
        </div>
      </form>
    </div>
  );
}
