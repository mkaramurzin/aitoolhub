import "@/styles/globals.css";

import { TRPCReactProvider } from "@/trpc/react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export const metadata: Metadata = {
  title: "AiToolHub.co",
  description: "Discover your next AI tool",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} scrollbar scrollbar-track-background scrollbar-thumb-background hover:scrollbar-thumb-primary`}
    >
      <body suppressHydrationWarning>
        <TRPCReactProvider>
          <GoogleAnalytics gaId="G-8XJGQFYQZG" />
          <NuqsAdapter>{children}</NuqsAdapter>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
