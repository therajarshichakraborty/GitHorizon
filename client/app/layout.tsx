import type { Metadata } from "next";
import "./globals.css";
import { Nanum_Pen_Script } from "next/font/google";
import { ThemeProvider } from "@/lib/theme-providers";
import { AnimatedThemeToggler } from "@/components/animated-theme-toggler";

export const nanumPenScript = Nanum_Pen_Script({
  subsets: ["latin"],
  variable: "--font-nanum-pen",
  weight: "400",
});

export const metadata: Metadata = {
  title: "IntelliCode-X",
  description: "Your NextGeneration WorkFlow Management Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nanumPenScript.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="absolute top-4 right-4">
            <AnimatedThemeToggler />
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
