import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import Script from "next/script";
import { TelegramProvider } from "@/components/providers/TelegramProvider";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700", "800"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "HomeFood — домашняя еда с доставкой",
  description: "Доставка готовых домашних блюд по Корее",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={nunito.variable} suppressHydrationWarning>
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body className="min-h-screen bg-[#EFF6FF]">
        <TelegramProvider>
          <div className="mx-auto w-full max-w-[430px] min-h-screen">
            {children}
          </div>
        </TelegramProvider>
      </body>
    </html>
  );
}
