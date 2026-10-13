import type { ReactNode } from "react";
import Image from "next/image";

import Link from "next/link";

import { Container } from "@/components/common/container";

interface AdminAuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AdminAuthShell({
  title,
  description,
  children,
}: AdminAuthShellProps) {
  return (
    <div className="admin-ui min-h-screen bg-[#f7f7fc]">
      <header className="border-[#e7e8f3] border-b bg-white">
        <Container className="flex min-h-[72px] items-center justify-between gap-3">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo/coolerguru-logo-image.png"
              alt="CoolerGuru"
              width={160}
              height={48}
              priority
              className="h-auto w-[120px] sm:w-[160px] object-contain"
            />
          </Link>

          <Link
            href="https://coolerguru.com"
            className="font-medium text-[#5d6280] text-admin-14 transition hover:text-[#2720a8]"
          >
            Back to website
          </Link>
        </Container>
      </header>

      <main className="flex min-h-[calc(100vh-72px)] items-center py-6 sm:py-12">
        <Container className="flex justify-center">
          <div className="grid w-full max-w-[1200px] overflow-hidden rounded-[20px] border border-[#e7e8f3] bg-white shadow-[0_18px_60px_rgba(25,20,100,0.08)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
            <div className="hidden bg-gradient-to-br from-[#171271] via-[#2720a8] to-[#4037d5] p-12 text-white lg:flex lg:flex-col lg:justify-between">
              <div>
                <div className="mb-8 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 font-semibold text-admin-14">
                  CoolerGuru Admin Portal
                </div>

                <h2 className="max-w-[360px] font-bold text-admin-38 leading-[1.15] tracking-[-1.2px]">
                  Manage the CoolerGuru platform from one place.
                </h2>

                <p className="mt-5 max-w-[390px] text-admin-15 text-white/75 leading-7">
                  Manage companies, products, inquiries, categories, users,
                  featured companies and platform activity.
                </p>
              </div>

              <p className="text-admin-14 text-white/55">
                Authorized administrators only
              </p>
            </div>

            <div className="px-6 py-10 sm:px-10 lg:px-12 lg:py-12">
              <div className="mb-8">
                <p className="mb-2 font-bold text-[#2720a8] text-admin-14 uppercase tracking-[1.5px]">
                  Admin Portal
                </p>

                <h1 className="font-bold text-[#11163d] text-admin-30 tracking-[-0.8px]">
                  {title}
                </h1>

                <p className="mt-2 text-[#747891] text-admin-14 leading-6">
                  {description}
                </p>
              </div>

              {children}
            </div>
          </div>
        </Container>
      </main>
    </div>
  );
}
