import type { Metadata } from "next";
import localFont from "next/font/local";

import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const inter = localFont({
  src: "../../public/font/Inter_18pt-Regular.ttf",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});



export const metadata: Metadata = {
  title: "FlowForge AI",
  description: "A polished AI workspace dashboard experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
