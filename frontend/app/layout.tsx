import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { AuthStoreProvider } from "@/context/StoreContext";
import { Toaster } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Glanz Car Wash Services",
  description: "Secure, professional car washing booking and tracking services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full font-sans antialiased", inter.variable)}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-white dark:bg-glanz-black text-black dark:text-white transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <AuthStoreProvider>
            {children}
            <Toaster  />
          </AuthStoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
