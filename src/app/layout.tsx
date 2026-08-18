import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { RegisterServiceWorker } from "@/components/RegisterServiceWorker";

export const metadata: Metadata = {
  title: "Kitchen AI | Transform Any Recipe Video",
  description: "The intelligent kitchen workstation for modern cooking. Transform TikTok, Reels, and YouTube recipes instantly.",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#5C3B2E',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-background font-sans antialiased">
        <main className="relative flex min-h-screen flex-col">
          {children}
        </main>
        <RegisterServiceWorker />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}

