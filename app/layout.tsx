import type { Metadata } from "next";
import { IM_Fell_English, Source_Serif_4, Courier_Prime } from "next/font/google";
import "./globals.css";

const display = IM_Fell_English({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const body = Source_Serif_4({
  variable: "--font-body",
  subsets: ["latin"],
});

const mono = Courier_Prime({
  variable: "--font-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Humble Grounds",
  description: "Small-batch coffee. Roasted in Oberlin, Ohio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        {/* scroll-reveal degrades to invisible content without JS; force it visible */}
        <noscript>
          <style>{`.reveal, .plate-card { opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
