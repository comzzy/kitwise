import type { Metadata } from "next";
import { Nunito, Patrick_Hand } from "next/font/google";
import "./globals.css";

const body = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});

const display = Patrick_Hand({
  subsets: ["latin"],
  variable: "--font-display",
  weight: "400",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Kitwise — Hands-free build guidance",
  description:
    "A conversational assistant for flat-pack furniture and DIY kits."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${body.variable} ${display.variable}`}>
        {children}
      </body>
    </html>
  );
}