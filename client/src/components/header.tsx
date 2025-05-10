import { useState } from "react";
import { MenuIcon, SearchIcon, BellIcon, HelpCircleIcon } from "lucide-react";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

const Header = ({ onMobileMenuToggle }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center md:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-600 hover:text-slate-900"
          onClick={onMobileMenuToggle}
        >
          <MenuIcon className="h-6 w-6" />
        </Button>
        <div className="ml-3">
          <h1 className="text-lg font-semibold text-slate-900">Road Infra Tracker</h1>
        </div>
      </div>

      <div className="hidden md:block relative rounded-md shadow-sm max-w-lg">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-4 w-4 text-slate-400" />
        </div>
        <Input
          type="text"
          className="pl-10 pr-4 py-2 w-[300px]"
          placeholder="Search roads, projects, vendors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-700">
              <BellIcon className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto">
              <DropdownMenuItem className="flex flex-col items-start py-2">
                <span className="font-medium">Project deadline approaching</span>
                <span className="text-xs text-slate-500">Patel Road Widening - Due in 5 days</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start py-2">
                <span className="font-medium">New vendor registered</span>
                <span className="text-xs text-slate-500">Urban Infrastructure Ltd. added to the system</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start py-2">
                <span className="font-medium">Budget update required</span>
                <span className="text-xs text-slate-500">Market Road Bridge project exceeding allocated budget</span>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-primary-600">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex text-slate-500 hover:text-slate-700"
        >
          <HelpCircleIcon className="h-5 w-5" />
        </Button>

        <div className="md:hidden w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
          <span className="text-sm font-medium">AK</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
