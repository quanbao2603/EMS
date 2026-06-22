import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={`${inter.className} bg-gray-950 text-gray-50 antialiased h-screen flex overflow-hidden`}>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-950">
          {children}
        </main>
        <Toaster theme="dark" richColors position="top-right" />
      </body>
    </html>
  );
}
