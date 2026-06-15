import React from "react";
import { Navbar } from "../../components/organisms/Navbar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-primary">
      <Navbar />
      {children}
    </div>
  );
}
