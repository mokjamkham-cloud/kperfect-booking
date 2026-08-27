import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "K Perfect Nails Booking",
  description: "ระบบจองคิวออนไลน์สำหรับ K Perfect Nails and Spa สาขานิมมาน",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}