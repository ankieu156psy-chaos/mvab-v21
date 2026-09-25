import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-be-vietnam",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MVAB v2.1 — Khung Định Hướng Nghề Nghiệp & Giám Sát Lâm Sàng Tâm Lý Học",
  description: "Hệ thống trắc lượng đánh giá đa chiều cho sinh viên và nhà thực hành tâm lý học Việt Nam.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`h-full antialiased ${beVietnamPro.variable}`}>
      <body className="min-h-full flex flex-col font-sans bg-[#f4efe6] text-stone-900 selection:bg-rose-200">
        {children}
      </body>
    </html>
  );
}
