import type { Metadata } from "next";
import { aeonik } from "@/fonts/aeonik";
import { aeonikMono } from "@/fonts/aeonikMono";
import { DuotoneFilters } from "@/components/DuotoneFilters";
import "./globals.css";

export const metadata: Metadata = {
  title: "WKS",
  description: "Worst Kept Secret",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${aeonik.variable} ${aeonikMono.variable} antialiased`}
    >
      <body>
        <DuotoneFilters />
        {children}
      </body>
    </html>
  );
}
