import { Unbounded, Atkinson_Hyperlegible, Martian_Mono } from "next/font/google";
import "./globals.css";

const display = Unbounded({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Atkinson_Hyperlegible({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-body" });
const mono = Martian_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

export const metadata = {
  title: { default: "Road to 9 · IGCSE & GCSE Maths Tutoring", template: "%s · Road to 9" },
  description: "IGCSE and GCSE maths tutoring with live lessons and Professor Prime, an AI tutor that helps students practise between lessons.",
  icons: { icon: "/icon.svg" },
};

export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }) {
  return (
    <html lang="en-GB" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
