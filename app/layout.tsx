import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "AI VIDEO DIRECTOR — 영상 PD 워크스테이션",
  description: "영상 기획, 촬영 설계, AI 콘티 및 프롬프트 자동화 워크스테이션",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <body className="bg-[#0b0c10] text-[#f1f2f6] min-h-screen">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 ml-64 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 p-8 overflow-y-auto">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
