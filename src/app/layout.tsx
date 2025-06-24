import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/navbar";

export const metadata: Metadata = {
  title: "Eva Website",
  description: "Nowoczesna aplikacja Next.js z Tailwind CSS i shadcn/ui.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black min-h-screen">
        <Navbar />
        <div className="pt-16">{children}</div>
      </body>
    </html>
  );
}
