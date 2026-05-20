"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Award,
  User,
  LogOut,
  Globe,
  Menu,
  X,
  ChevronRight,
  Bell,
  Search,
  ShieldCheck,
  Sun,
  Moon,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { getRecentNotices } from "@/app/actions/notices";

function AdminSearchBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || "",
  );

  // Update search input when URL changes
  useEffect(() => {
    setSearchValue(searchParams.get("search") || "");
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);

    const params = new URLSearchParams(window.location.search);
    if (val) {
      params.set("search", val);
    } else {
      params.delete("search");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative hidden sm:block max-w-xs md:max-w-md w-full">
      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        type="text"
        value={searchValue}
        onChange={handleSearchChange}
        placeholder="Search dashboard..."
        className="bg-slate-50 border border-slate-200 rounded-full pl-9 pr-4 py-1.5 text-xs outline-none focus:border-green-500 focus:bg-white w-[220px] transition-all font-semibold text-slate-700"
      />
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [avatar, setAvatar] = useState<string | null>(null);

  // ── Admin-only dark mode (scoped to this div, never touches <html>) ──
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("btc_admin_dark_mode");
    if (saved === "true") setIsDark(true);
  }, []);

  const toggleDark = () => {
    setIsDark((prev) => {
      localStorage.setItem("btc_admin_dark_mode", String(!prev));
      return !prev;
    });
  };

  // Dynamic bell notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const data = await getRecentNotices();
        setNotifications(data);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    }
    loadNotifications();
  }, []);

  useEffect(() => {
    const handleClose = () => setShowNotifications(false);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, []);

  useEffect(() => {
    const updateAvatar = () => {
      setAvatar(localStorage.getItem("btc_admin_avatar"));
    };
    updateAvatar();
    window.addEventListener("avatarChanged", updateAvatar);
    return () => window.removeEventListener("avatarChanged", updateAvatar);
  }, []);

  // If we are on the auth login page, bypass the sidebar layout
  if (pathname === "/admin/auth") {
    return <>{children}</>;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const menus = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Notices", href: "/admin/egp-notices", icon: FileText },
    { name: "Manage Roles", href: "/admin/roles", icon: ShieldCheck },
    { name: "Profile", href: "/admin/profile", icon: User },
  ];

  return (
    <div className={`admin-layout min-h-screen flex flex-col font-secondary antialiased overflow-x-hidden w-full transition-colors duration-300 ${
      isDark ? "dark bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-800"
    }`}>
      <div className="flex flex-1 relative overflow-x-hidden w-full min-w-0">
        {/* Mobile Sidebar click-outside backdrop overlay */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-25 md:hidden transition-all duration-300 cursor-pointer"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`bg-slate-900 border-r border-slate-800 text-white fixed h-full z-30 transition-all duration-300 flex flex-col shadow-2xl overflow-hidden overflow-x-hidden ${
            sidebarOpen
              ? "w-[260px] translate-x-0"
              : "w-0 -translate-x-[260px] md:w-[70px] md:translate-x-0"
          }`}
        >
          {/* Logo Brand (Centered when collapsed) */}
          <div className="h-16 flex items-center border-b border-slate-800 shrink-0 px-[13px] transition-all duration-300 w-full overflow-hidden">
            <div className="flex items-center gap-4 overflow-hidden w-full shrink-0 justify-start">
              <div className="w-8 h-8 rounded-lg bg-[var(--primary-color)] flex items-center justify-center font-bold text-white shadow-lg shrink-0">
                B
              </div>
              <span
                className={`font-bold text-base tracking-wider text-green-400 uppercase transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${
                  sidebarOpen
                    ? "opacity-100 max-w-[150px]"
                    : "opacity-0 max-w-0 pointer-events-none"
                }`}
              >
                BTC Admin
              </span>
            </div>

            {/* Close button for mobile */}
            {sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white md:hidden shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-6 space-y-2 overflow-y-auto overflow-x-hidden transition-all duration-300 w-full px-3">
            {menus.map((menu) => {
              const Icon = menu.icon;
              const isActive =
                pathname === menu.href || pathname.startsWith(`${menu.href}/`);
              return (
                <Link
                  key={menu.name}
                  href={menu.href}
                  className={`flex items-center gap-4 rounded-xl font-medium text-sm transition-all duration-300 group relative overflow-hidden whitespace-nowrap w-full border border-transparent px-[13px] py-3.5 justify-start ${
                    isActive
                      ? "bg-[var(--primary-color)] text-white shadow-lg shadow-green-600/20"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-colors duration-300 ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                  />
                  <span
                    className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${
                      sidebarOpen
                        ? "opacity-100 max-w-[180px]"
                        : "opacity-0 max-w-0 pointer-events-none"
                    }`}
                  >
                    {menu.name}
                  </span>

                  {/* Tooltip for collapsed mode */}
                  {!sidebarOpen && (
                    <div className="absolute left-16 bg-slate-900 border border-slate-800 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity hidden md:block z-50 pointer-events-none whitespace-nowrap">
                      {menu.name}
                    </div>
                  )}
                </Link>
              );
            })}

            <div className="border-t border-slate-800 pt-4 mt-4 w-full px-[3px]">
              <Link
                href="/"
                className="flex items-center gap-4 rounded-xl font-medium text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-300 group relative overflow-hidden whitespace-nowrap w-full border border-transparent px-[10px] py-3.5 justify-start"
              >
                <Globe className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-white transition-colors duration-300" />
                <span
                  className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${
                    sidebarOpen
                      ? "opacity-100 max-w-[180px]"
                      : "opacity-0 max-w-0 pointer-events-none"
                  }`}
                >
                  View Website
                </span>

                {!sidebarOpen && (
                  <div className="absolute left-16 bg-slate-900 border border-slate-800 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity hidden md:block z-50 pointer-events-none whitespace-nowrap">
                    View Website
                  </div>
                )}
              </Link>
            </div>
          </nav>

          {/* User Footer (No padding errors when collapsed) */}
          <div className="border-t border-slate-800 bg-slate-950/40 shrink-0 transition-all duration-300 w-full overflow-hidden p-3">
            <button
              onClick={() => signOut({ callbackUrl: "/admin/auth" })}
              className="flex items-center gap-4 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group overflow-hidden whitespace-nowrap w-full border-0 cursor-pointer px-[13px] py-3 justify-start"
            >
              <LogOut className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-red-400 transition-colors duration-300" />
              <span
                className={`font-medium text-sm transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${
                  sidebarOpen
                    ? "opacity-100 max-w-[100px]"
                    : "opacity-0 max-w-0 pointer-events-none"
                }`}
              >
                Sign Out
              </span>
              <ChevronRight
                className={`w-4 h-4 text-slate-600 transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ml-auto shrink-0 ${
                  sidebarOpen
                    ? "opacity-100 max-w-[20px]"
                    : "opacity-0 max-w-0 pointer-events-none"
                }`}
              />
            </button>
          </div>
        </aside>

        {/* Content Wrapper */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 min-h-screen min-w-0 w-full overflow-hidden ${
            sidebarOpen ? "pl-0 md:pl-[260px]" : "pl-0 md:pl-[70px]"
          }`}
        >
          {/* Header */}
          <header
            className={`h-16 border-b flex items-center px-6 justify-between fixed top-0 right-0 z-20 shadow-sm backdrop-blur-md shrink-0 min-w-0 transition-all duration-300 ${
              sidebarOpen ? "left-0 md:left-[260px]" : "left-0 md:left-[70px]"
            } ${
              isDark
                ? "bg-slate-900/95 border-slate-800"
                : "bg-white/90 border-slate-200"
            }`}
          >
            <div className="flex items-center gap-4 min-w-0">
              {/* Header Logo (ONLY visible on mobile, hidden on desktop!) */}
              <div className="flex items-center gap-2 mr-3 shrink-0 md:hidden">
                <div className="w-8 h-8 rounded-lg bg-[var(--primary-color)] flex items-center justify-center font-bold text-white shadow-lg shrink-0">
                  B
                </div>
                <span className="font-bold text-sm tracking-wider text-slate-800 uppercase hidden xs:block">
                  BTC Portal
                </span>
              </div>

              <button
                onClick={toggleSidebar}
                className={`p-2 rounded-lg transition ${
                  isDark
                    ? "hover:bg-slate-800 text-slate-400 hover:text-white"
                    : "hover:bg-slate-100 text-slate-500 hover:text-slate-700"
                }`}
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Dynamic search bar */}
              <Suspense fallback={<div className="w-[220px]" />}>
                <AdminSearchBar />
              </Suspense>
            </div>

            <div
              className="flex items-center gap-4 shrink-0 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Dark mode toggle */}
              <button
                id="admin-dark-mode-toggle"
                onClick={toggleDark}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                className={`p-2 rounded-lg transition relative ${
                  isDark
                    ? "hover:bg-slate-800 text-amber-400 hover:text-amber-300"
                    : "hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                }`}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Notification bell */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-lg transition relative ${
                  isDark
                    ? "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    : "hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                }`}
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className={`absolute top-1 right-1 w-2.5 h-2.5 bg-green-500 border-2 rounded-full ${
                    isDark ? "border-slate-900" : "border-white"
                  }`}></span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {showNotifications && (
                <div className={`absolute top-[100%] right-0 mt-2 border rounded-2xl shadow-xl w-[320px] md:w-[360px] z-50 overflow-hidden divide-y animate-scale-in ${
                  isDark
                    ? "bg-slate-900 border-slate-700 divide-slate-800"
                    : "bg-white border-slate-200 divide-slate-100"
                }`}>
                  <div className={`p-4 flex justify-between items-center ${
                    isDark ? "bg-slate-800" : "bg-slate-50"
                  }`}>
                    <span className={`text-xs font-extrabold uppercase tracking-wider ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}>
                      Tender Notifications
                    </span>
                    <span className="bg-green-100 text-green-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {notifications.length} New
                    </span>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-50">
                    {notifications.map((notif) => (
                      <Link
                        key={notif.id}
                        href={`/admin/egp-notices`}
                        onClick={() => setShowNotifications(false)}
                        className={`p-4 block transition cursor-pointer text-left ${
                          isDark ? "hover:bg-slate-800" : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-green-50 text-green-700 text-[9px] font-bold uppercase border border-green-200 shrink-0">
                            {notif.category}
                          </span>
                          <span className={`text-[10px] font-medium ${
                            isDark ? "text-slate-500" : "text-slate-400"
                          }`}>
                            {new Date(notif.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </span>
                        </div>
                        <p className={`text-xs font-bold mt-1.5 line-clamp-2 hover:text-[var(--primary-color)] transition leading-relaxed ${
                          isDark ? "text-slate-300" : "text-slate-700"
                        }`}>
                          {notif.title}
                        </p>
                      </Link>
                    ))}

                    {notifications.length === 0 && (
                      <div className="p-6 text-center text-xs text-slate-400 font-semibold italic">
                        No recent active procurement notices.
                      </div>
                    )}
                  </div>

                  <Link
                    href="/admin/egp-notices"
                    onClick={() => setShowNotifications(false)}
                    className="p-3 text-center block text-[11px] font-extrabold text-[var(--primary-color)] hover:text-green-700 bg-slate-50/50 hover:bg-slate-50 transition uppercase tracking-wider"
                  >
                    View All Tender Notices
                  </Link>
                </div>
              )}

              {/* Profile Menu */}
              <div className={`flex items-center gap-3 border-l pl-4 ${
                isDark ? "border-slate-700" : "border-slate-200"
              }`}>
                <div className="text-right hidden md:block">
                  <div className={`text-sm font-semibold leading-tight ${
                    isDark ? "text-slate-200" : "text-slate-800"
                  }`}>
                    {session?.user?.name || "Administrator"}
                  </div>
                  <div className={`text-[11px] font-medium uppercase tracking-widest mt-0.5 ${
                    isDark ? "text-slate-500" : "text-slate-400"
                  }`}>
                    {session?.user?.email || "Admin User"}
                  </div>
                </div>

                {avatar ? (
                  <img
                    src={avatar}
                    alt="Admin Avatar"
                    className="w-10 h-10 rounded-full object-cover shadow-md border-2 border-white"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[var(--primary-color)] flex items-center justify-center font-bold text-white shadow-md border-2 border-white">
                    {(session?.user?.name || "A").substring(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Content Area (min-w-0 for flexbox responsive layout) */}
          <main className={`p-4 sm:p-6 md:p-8 flex-grow min-w-0 w-full overflow-hidden mt-16 transition-colors duration-300 ${
            isDark ? "bg-slate-900" : "bg-slate-50"
          }`}>
            <div className="w-full h-full">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
