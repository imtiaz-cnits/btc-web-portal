"use client";

import React, { useState } from "react";
import Link from "next/link";
import LogoutButton from "@/components/dashboard/LogoutButton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(270);

  const toggleSidebar = () => {
    setSidebarWidth(sidebarWidth === 0 ? 270 : 0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex flex-1">
        {/* Sidebar placeholder */}
        <aside 
          className="bg-white border-r transition-all duration-300 fixed h-full z-20"
          style={{ width: `${sidebarWidth}px`, left: sidebarWidth === 0 ? '-270px' : '0' }}
        >
          <div className="p-6">
            <h2 className="text-xl font-bold text-[var(--primary-color)]">BTC ADMIN</h2>
            <nav className="mt-10 space-y-4">
              <Link href="/admin/egp-notices" className="block text-gray-600 hover:text-[var(--primary-color)]">Tender Notices</Link>
              <Link href="/admin/winner-list" className="block text-gray-600 hover:text-[var(--primary-color)]">Winner List</Link>
              <Link href="/" className="block text-gray-600 hover:text-[var(--primary-color)] border-t pt-4">View Website</Link>
            </nav>
          </div>
        </aside>

        <div 
          className="flex-1 flex flex-col transition-all duration-300"
          style={{ marginLeft: `${sidebarWidth}px` }}
        >
          <header className="h-16 bg-white border-b flex items-center px-6 justify-between sticky top-0 z-10">
            <button onClick={toggleSidebar} className="p-2 hover:bg-gray-100 rounded">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Administrator</span>
              <LogoutButton />
            </div>
          </header>

          <main className="p-6 flex-grow">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
