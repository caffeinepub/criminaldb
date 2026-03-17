import {
  Bell,
  Briefcase,
  ChevronRight,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  Shield,
  Sun,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import { useApp } from "../context/AppContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ScrollArea } from "./ui/scroll-area";

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    page: "dashboard",
  },
  {
    id: "criminals",
    label: "Criminals",
    icon: <Shield size={18} />,
    page: "criminals",
  },
  {
    id: "crimes",
    label: "Crimes",
    icon: <FileText size={18} />,
    page: "crimes",
  },
  { id: "cases", label: "Cases", icon: <Briefcase size={18} />, page: "cases" },
  {
    id: "evidence",
    label: "Evidence",
    icon: <Package size={18} />,
    page: "evidence",
  },
  {
    id: "officers",
    label: "Officers",
    icon: <UserCheck size={18} />,
    page: "officers",
  },
  {
    id: "arrests",
    label: "Arrest Records",
    icon: <Users size={18} />,
    page: "arrests",
  },
  {
    id: "activitylog",
    label: "Activity Log",
    icon: <ClipboardList size={18} />,
    page: "activitylog",
    adminOnly: true,
  },
] as const;

interface LayoutProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  children: ReactNode;
}

export default function Layout({
  currentPage,
  onNavigate,
  children,
}: LayoutProps) {
  const {
    user,
    logout,
    darkMode,
    toggleDarkMode,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const visibleNav = NAV_ITEMS.filter(
    (item) =>
      !("adminOnly" in item && item.adminOnly) || user?.role === "Admin",
  );

  const handleNav = (page: string) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  const notifTypeColor: Record<string, string> = {
    case: "bg-blue-500",
    evidence: "bg-purple-500",
    alert: "bg-red-500",
    reminder: "bg-yellow-500",
    crime: "bg-orange-500",
    arrest: "bg-green-500",
    system: "bg-gray-500",
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-50 md:z-auto flex flex-col h-full bg-slate-900 dark:bg-slate-950 border-r border-slate-700/50 transition-all duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} ${sidebarOpen ? "w-60" : "w-16"}`}
      >
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-700/50 shrink-0">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          {sidebarOpen && (
            <div>
              <div className="text-white font-bold text-sm">CriminalDB</div>
              <div className="text-slate-400 text-xs">Law Enforcement</div>
            </div>
          )}
          <button
            className="ml-auto text-slate-400 hover:text-white hidden md:block transition-colors"
            onClick={() => setSidebarOpen((p) => !p)}
          >
            <ChevronRight
              size={16}
              className={`transition-transform ${sidebarOpen ? "rotate-180" : ""}`}
            />
          </button>
          <button
            className="ml-auto text-slate-400 hover:text-white md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <ScrollArea className="flex-1 py-3">
          <nav className="flex flex-col gap-1 px-2">
            {visibleNav.map((item) => (
              <button
                key={item.id}
                data-ocid={`nav.${item.id}.link`}
                onClick={() => handleNav(item.page)}
                title={!sidebarOpen ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left w-full ${currentPage === item.page ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"} ${!sidebarOpen ? "justify-center" : ""}`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
        </ScrollArea>

        {sidebarOpen && (
          <div className="p-3 border-t border-slate-700/50 shrink-0">
            <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-slate-800">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-white text-xs font-medium truncate">
                  {user?.name}
                </div>
                <div
                  className={`text-xs px-1.5 rounded border w-fit mt-0.5 ${
                    user?.role === "Admin"
                      ? "bg-red-500/20 text-red-400 border-red-500/30"
                      : user?.role === "Officer"
                        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        : "bg-purple-500/20 text-purple-400 border-purple-500/30"
                  }`}
                >
                  {user?.role}
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/50 shrink-0">
          <button
            className="text-muted-foreground hover:text-foreground md:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-semibold text-foreground">
              {NAV_ITEMS.find((n) => n.page === currentPage)?.label ||
                "Dashboard"}
            </h1>
          </div>

          <button
            data-ocid="header.darkmode.toggle"
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                data-ocid="header.notifications.button"
                className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <span className="text-sm font-semibold">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs text-blue-500 hover:text-blue-400"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <ScrollArea className="max-h-72">
                {notifications.slice(0, 8).map((n) => (
                  <div
                    key={n.id}
                    className={`flex gap-3 px-3 py-2.5 hover:bg-accent cursor-pointer border-b border-border/50 last:border-0 ${!n.isRead ? "bg-blue-500/5" : ""}`}
                    onClick={() => markNotificationRead(n.id)}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notifTypeColor[n.notifType] || "bg-gray-500"}`}
                    />
                    <div className="min-w-0">
                      <div
                        className={`text-xs font-medium ${!n.isRead ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {n.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {n.message}
                      </div>
                    </div>
                    {!n.isRead && (
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                data-ocid="header.user.dropdown_menu"
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium text-foreground hidden sm:block">
                  {user?.username}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <div className="text-sm font-medium">{user?.name}</div>
                <div className="text-xs text-muted-foreground">
                  {user?.role}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="text-red-500 focus:text-red-500 cursor-pointer"
              >
                <LogOut size={14} className="mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
