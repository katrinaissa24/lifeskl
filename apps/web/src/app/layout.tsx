import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "LIFESKL — The life skills school misses",
  description:
    "Money, work, health, and the everyday admin of being a person — taught in five-minute, hands-on lessons.",
};

// Applied before first paint so dark mode never flashes light.
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('lifeskl-theme');if(t==='dark'||t==='light'){document.documentElement.dataset.theme=t;}}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
