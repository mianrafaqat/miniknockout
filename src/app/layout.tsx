import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "miniKnockout",
  description: "miniKnockout garment business management",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-50`}>
        <AuthProvider>
          <Navbar />
          <main className="md:pl-64">
            <div className="mx-auto max-w-7xl px-6 py-8">
              {children}
            </div>
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}


