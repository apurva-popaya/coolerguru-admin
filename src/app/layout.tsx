import { DM_Sans } from "next/font/google";

import type { Metadata } from "next";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://admin.coolerguru.com"),
  robots: { index: false, follow: false },
  title: "CoolerGuru Admin",
  description: "CoolerGuru administration portal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} min-h-screen antialiased`}>
        <TooltipProvider>
          {children}

          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
