import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboardIcon,
  TrafficCone,
  BuildingIcon,
  UserIcon,
  BarChartIcon,
  SettingsIcon,
} from "lucide-react";
import { Separator } from "./ui/separator";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive: boolean;
}

const SidebarItem = ({ icon, label, path, isActive }: SidebarItemProps) => {
  return (
    <Link href={path}>
      <a
        className={cn(
          "flex items-center px-2 py-2 rounded-md font-medium text-sm",
          isActive
            ? "bg-primary-50 text-primary-800"
            : "text-slate-700 hover:bg-slate-100"
        )}
      >
        <span
          className={cn(
            "mr-3",
            isActive ? "text-primary-600" : "text-slate-500"
          )}
        >
          {icon}
        </span>
        {label}
      </a>
    </Link>
  );
};

const Sidebar = ({ className }: { className?: string }) => {
  const [location] = useLocation();

  const sidebarItems = [
    {
      icon: <LayoutDashboardIcon className="h-5 w-5" />,
      label: "Dashboard",
      path: "/",
    },
    {
      icon: <TrafficCone className="h-5 w-5" />,
      label: "Road Registry",
      path: "/roads",
    },
    {
      icon: <BuildingIcon className="h-5 w-5" />,
      label: "Infrastructure Works",
      path: "/projects",
    },
    {
      icon: <UserIcon className="h-5 w-5" />,
      label: "Vendors",
      path: "/vendors",
    },
    {
      icon: <BarChartIcon className="h-5 w-5" />,
      label: "Reports",
      path: "/reports",
    },
    {
      icon: <SettingsIcon className="h-5 w-5" />,
      label: "Settings",
      path: "/settings",
    },
  ];

  return (
    <aside
      className={cn(
        "hidden md:flex md:w-64 flex-col bg-white border-r border-slate-200 h-screen transition-all duration-300 ease-in-out",
        className
      )}
    >
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center">
          <TrafficCone className="text-primary-600 h-6 w-6 mr-2" />
          <h1 className="text-lg font-semibold text-slate-900">Road Infra Tracker</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">Mahendragarh Municipal Council</p>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-4 space-y-1">
          {sidebarItems.map((item) => (
            <SidebarItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
              isActive={location === item.path}
            />
          ))}
        </nav>
      </div>

      <Separator />

      <div className="p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
            <span className="text-sm font-medium">AK</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-slate-800">Admin Khan</p>
            <p className="text-xs text-slate-500">Municipal Officer</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
