"use client";

import React, { useState, useEffect } from "react";
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
  ShieldCheck
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { getRecentNotices } from "@/app/actions/notices";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");
  
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

  // Update search input when URL changes
  useEffect(() => {
    setSearchValue(searchParams.get("search") || "");
  }, [searchParams]);

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

  const menus = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Tender Notices", href: "/admin/egp-notices", icon: FileText },
    { name: "Winner List", href: "/admin/winner-list", icon: Award },
    { name: "Manage Roles", href: "/admin/roles", icon: ShieldCheck },
    { name: "Profile", href: "/admin/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800 overflow-x-hidden w-full">
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
          className={`bg-slate-900 border-r border-slate-800 text-white fixed h-full z-30 transition-all duration-300 flex flex-col shadow-2xl overflow-hidden ${
            sidebarOpen ? "w-[260px] translate-x-0" : "w-0 -translate-x-[260px] md:w-[70px] md:translate-x-0"
          }`}
        >
          {/* Logo Brand (Centered when collapsed) */}
          <div className={`h-16 flex items-center border-b border-slate-800 shrink-0 transition-all ${
            sidebarOpen ? "justify-between px-6" : "justify-center px-2"
          }`}>
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-[var(--primary-color)] flex items-center justify-center font-bold text-white shadow-lg shrink-0">
                B
              </div>
              <span className={`font-bold text-base tracking-wider text-green-400 uppercase transition-all duration-300 whitespace-nowrap ${
                sidebarOpen ? "opacity-100" : "opacity-0 md:hidden"
              }`}>
                BTC Admin
              </span>
            </div>
            
            {/* Close button for mobile */}
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className={`flex-1 py-6 space-y-2 overflow-y-auto ${sidebarOpen ? "px-4" : "px-2"}`}>
            {menus.map((menu) => {
              const Icon = menu.icon;
              const isActive = pathname === menu.href || pathname.startsWith(`${menu.href}/`);
              return (
                <Link
                  key={menu.name}
                  href={menu.href}
                  className={`flex items-center rounded-xl font-medium text-sm transition-all duration-200 group relative ${
                    sidebarOpen ? "gap-3 px-4 py-3.5 justify-start" : "justify-center p-2.5 w-11 h-11 mx-auto"
                  } ${
                    isActive 
                      ? "bg-[var(--primary-color)] text-white shadow-lg shadow-green-600/20" 
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                  <span className={`transition-opacity duration-300 whitespace-nowrap ${
                    sidebarOpen ? "opacity-100" : "opacity-0 md:hidden"
                  }`}>
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

            <div className="border-t border-slate-800 pt-4 mt-4">
              <Link
                href="/"
                className={`flex items-center rounded-xl font-medium text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200 group relative ${
                  sidebarOpen ? "gap-3 px-4 py-3.5 justify-start" : "justify-center p-2.5 w-11 h-11 mx-auto"
                }`}
              >
                <Globe className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-white" />
                <span className={`transition-opacity duration-300 whitespace-nowrap ${
                  sidebarOpen ? "opacity-100" : "opacity-0 md:hidden"
                }`}>
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
          <div className={`border-t border-slate-800 bg-slate-950/40 shrink-0 transition-all ${
            sidebarOpen ? "p-4" : "p-2 py-4"
          }`}>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/auth" })}
              className={`w-full flex items-center justify-between rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group ${
                sidebarOpen ? "px-4 py-3" : "justify-center p-2.5 w-11 h-11 mx-auto"
              }`}
            >
              <div className={`flex items-center ${sidebarOpen ? "gap-3" : "justify-center"}`}>
                <LogOut className={`w-5 h-5 shrink-0 ${sidebarOpen ? "" : "text-slate-400 group-hover:text-red-400"}`} />
                <span className={`font-medium text-sm transition-opacity duration-300 ${
                  sidebarOpen ? "opacity-100" : "opacity-0 hidden"
                }`}>
                  Sign Out
                </span>
              </div>
              {sidebarOpen && (
                <ChevronRight className="w-4 h-4 text-slate-600 transition-opacity" />
              )}
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
          <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 justify-between sticky top-0 z-20 shadow-sm backdrop-blur-md bg-white/90 shrink-0 min-w-0 w-full">
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
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Dynamic search bar */}
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
            </div>

            <div className="flex items-center gap-4 shrink-0 relative" onClick={(e) => e.stopPropagation()}>
              {/* Notification bell */}
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition relative"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {showNotifications && (
                <div className="absolute top-[100%] right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl w-[320px] md:w-[360px] z-50 overflow-hidden divide-y divide-slate-100 animate-scale-in">
                  <div className="p-4 bg-slate-50 flex justify-between items-center">
                    <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Tender Notifications</span>
                    <span className="bg-green-100 text-green-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">{notifications.length} New</span>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-50">
                    {notifications.map((notif) => (
                      <Link 
                        key={notif.id}
                        href={`/admin/egp-notices`}
                        onClick={() => setShowNotifications(false)}
                        className="p-4 block hover:bg-slate-50 transition cursor-pointer text-left"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-green-50 text-green-700 text-[9px] font-bold uppercase border border-green-200 shrink-0">
                            {notif.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(notif.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric"
                            })}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-700 mt-1.5 line-clamp-2 hover:text-[var(--primary-color)] transition leading-relaxed">
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
              <div className="flex items-center gap-3 border-l pl-4 border-slate-200">
                <div className="text-right hidden md:block">
                  <div className="text-sm font-semibold text-slate-800 leading-tight">
                    {session?.user?.name || "Administrator"}
                  </div>
                  <div className="text-[11px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">
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
          <main className="p-4 sm:p-6 md:p-8 flex-grow bg-slate-50 min-w-0 w-full overflow-hidden">
            <div className="max-w-[1600px] mx-auto w-full h-full min-w-0">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
