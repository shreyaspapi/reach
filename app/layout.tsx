import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://luno.social"),
  title: "Luno - The Social Economy",
  description: "Get rewarded for your social engagement. Real-time token streams for every meaningful interaction.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Luno - The Social Economy",
    description: "Get rewarded for your social engagement. Real-time token streams for every meaningful interaction.",
    images: ["/reach-logo.png"],
  },
  other: {
    // Farcaster Frame metadata
    "fc:frame": "vNext",
    "fc:frame:image": new URL("/reach-logo.png", process.env.NEXT_PUBLIC_APP_URL || "https://luno.social").toString(),
    "fc:frame:button:1": "Launch Luno",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": process.env.NEXT_PUBLIC_APP_URL || "https://luno.social",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased relative min-h-screen">
        {/* Corner Brackets - hidden on mobile for cleaner look */}
        <div className="hidden sm:block fixed top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-reach-blue pointer-events-none z-50 opacity-40" />
        <div className="hidden sm:block fixed top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-reach-blue pointer-events-none z-50 opacity-40" />
        <div className="hidden sm:block fixed bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-reach-blue pointer-events-none z-50 opacity-40" />
        <div className="hidden sm:block fixed bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-reach-blue pointer-events-none z-50 opacity-40" />

        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
