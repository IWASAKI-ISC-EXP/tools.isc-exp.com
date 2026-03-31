import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { QueryDevtools, QueryProvider } from "@/components/query";
import { SelfProvider } from "@/features/user/contexts/self";
import { getSelf } from "@/features/user/get-self";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EXP. 交通費精算",
};

export default async function ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const self = await getSelf();

  return (
    <html lang="ja" className={`${inter.variable}`}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-linear-to-br from-[#e0f7fa] via-[#f1f8e9] to-[#fff9c4] bg-fixed antialiased`}
      >
        <SelfProvider self={self}>
          <QueryProvider>
            <QueryDevtools />
            {children}
          </QueryProvider>
        </SelfProvider>
      </body>
    </html>
  );
}
