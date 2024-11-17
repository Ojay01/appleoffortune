import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Apple Of Fortune",
  description: "Here is the an Aplle of Fortune Game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
