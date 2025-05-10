import { Card, CardContent } from "./card";
import { Button } from "./button";
import { Skeleton } from "./skeleton";
import { useQuery } from "@tanstack/react-query";
import { MoreHorizontalIcon } from "lucide-react";
import { getInitials } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

const VendorList = () => {
  const { data: vendorsData, isLoading } = useQuery({
    queryKey: ["/api/vendors"],
  });

  const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["/api/projects"],
  });

  const getVendorProjects = (vendorId: number) => {
    if (!projectsData) return [];
    return projectsData.filter((project: any) => project.vendorId === vendorId);
  };

  const getVendorTotalBudget = (vendorId: number) => {
    const projects = getVendorProjects(vendorId);
    return projects.reduce((total: number, project: any) => total + project.budget, 0);
  };

  const getBudgetStatus = (vendorId: number) => {
    const projects = getVendorProjects(vendorId);
    // This is simplified - in a real app you'd have budget_allocated vs actual_spent
    const hasOverrun = projects.some((project: any) => project.status === "delayed");
    
    if (hasOverrun) {
      return { text: "Budget overrun", color: "text-red-600" };
    } else if (projects.length === 0) {
      return { text: "No projects", color: "text-slate-600" };
    } else {
      return { text: "On budget", color: "text-green-600" };
    }
  };

  const getInitialColor = (name: string) => {
    const colors = [
      "bg-blue-100 text-blue-600",
      "bg-green-100 text-green-600",
      "bg-amber-100 text-amber-600",
      "bg-red-100 text-red-600",
      "bg-purple-100 text-purple-600",
    ];
    
    // Simple hash function to map a vendor name to a consistent color
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const sortedVendors = vendorsData?.slice(0, 5).sort((a: any, b: any) => {
    const aProjects = getVendorProjects(a.id).length;
    const bProjects = getVendorProjects(b.id).length;
    return bProjects - aProjects;
  });

  return (
    <Card>
      <CardContent className="p-0">
        <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-900">Active Vendors</h2>
          <Button variant="link" size="sm" className="text-primary-600 hover:text-primary-800">
            View All
          </Button>
        </div>

        <div className="p-5">
          <ul className="divide-y divide-slate-200">
            {isLoading || isLoadingProjects ? (
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <li key={i} className="py-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="ml-3">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24 mt-1" />
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-right mr-3">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-4 w-16 mt-1" />
                      </div>
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </li>
                ))
            ) : (
              sortedVendors?.map((vendor: any) => {
                const projectCount = getVendorProjects(vendor.id).length;
                const totalBudget = getVendorTotalBudget(vendor.id);
                const budgetStatus = getBudgetStatus(vendor.id);
                const initials = getInitials(vendor.name);
                const colorClass = getInitialColor(vendor.name);

                return (
                  <li key={vendor.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center`}>
                        <span className="text-sm font-medium">{initials}</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-slate-900">{vendor.name}</p>
                        <p className="text-xs text-slate-500">
                          {projectCount} active project{projectCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-right mr-3">
                        <p className="text-sm font-medium text-slate-900">₹{totalBudget.toFixed(1)} Cr</p>
                        <p className={`text-xs ${budgetStatus.color}`}>{budgetStatus.text}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>View Projects</DropdownMenuItem>
                          <DropdownMenuItem>Edit Vendor</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorList;
