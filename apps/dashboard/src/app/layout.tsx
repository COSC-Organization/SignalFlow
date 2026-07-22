import type { Metadata } from "next";
import { Inter, EB_Garamond } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600"], // 300 is not well-supported by all variable fonts, EB Garamond 400 is equivalent to light
});

export const metadata: Metadata = {
  title: "SignalFlow — SDP Diff & WebRTC Debugger",
  description:
    "Paste two WebRTC SDP strings and instantly see what changed, why your call is failing, and how to fix it.",
  openGraph: {
    title: "SignalFlow SDP Diff",
    description:
      "Visual SDP diff with plain-English diagnosis for WebRTC developers",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${ebGaramond.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-canvas text-ink transition-colors duration-300 w-full">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
