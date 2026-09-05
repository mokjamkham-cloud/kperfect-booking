import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "K Perfect Nails - Nimman",
  description: "จองคิวทำเล็บออนไลน์สำหรับสาขานิมมานเท่านั้น",
  icons: {
    icon: "/kperfect-logo.png",
    apple: "/kperfect-logo.png",
  },
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
