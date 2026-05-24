import type { Metadata, Viewport } from "next";
import { RegisterServiceWorker } from "@/components/register-service-worker";
import "./globals.css";

export const metadata: Metadata = {
  title: "WeRead Wise",
  description: "移动优先的微信读书知识导入与 AI 对话应用",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "WeRead Wise",
    statusBarStyle: "default"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#f8faf7"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
