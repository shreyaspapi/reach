import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";

export const metadata: Metadata = {
  title: "Reach",
  description: "The Currency of Attention",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased relative min-h-screen">
        {/* Corner Brackets with sketchy style */}
        <div className="fixed top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-reach-blue pointer-events-none z-50 opacity-60" />
        <div className="fixed top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-reach-blue pointer-events-none z-50 opacity-60" />
        <div className="fixed bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-reach-blue pointer-events-none z-50 opacity-60" />
        <div className="fixed bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-reach-blue pointer-events-none z-50 opacity-60" />


        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
