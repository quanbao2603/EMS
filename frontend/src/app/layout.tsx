import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { AuthHydrator } from "@/components/AuthHydrator";
import { AppBackdrop } from "@/components/layout/app-backdrop";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Hệ thống Quản lý Nhân sự (EMS)",
  description: "Enterprise Management System with Oracle Security",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body className={`${beVietnamPro.className} bg-zinc-950 text-zinc-50 antialiased h-screen flex overflow-hidden`}>
        <AuthHydrator />
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <MobileHeader />
          <main className="relative flex-1 overflow-y-auto bg-zinc-950">
            <AppBackdrop />
            <div className="relative z-10">{children}</div>
          </main>
        </div>
        <Toaster theme="dark" richColors position="top-right" />
      </body>
    </html>
  );
}
