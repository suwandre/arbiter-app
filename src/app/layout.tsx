import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-background text-foreground min-h-screen`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
