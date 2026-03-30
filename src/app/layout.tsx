import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeInit = `
    (function () {
      try {
        var key = "clubafricain-theme";
        var stored = window.localStorage.getItem(key);
        var root = document.documentElement;
        var prefersDark = !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
        var isDark = stored === "dark" ? true : stored === "light" ? false : prefersDark;
        root.classList.toggle("dark", isDark);
        root.classList.toggle("light", !isDark);
        root.style.colorScheme = isDark ? "dark" : "light";
      } catch (e) {}
    })();
  `;
  return (
    <html suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground flex min-h-full flex-col antialiased`}
      >
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
