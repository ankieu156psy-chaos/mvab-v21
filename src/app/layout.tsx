import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-800">
        {children}
      </body>
    </html>
  );
}
