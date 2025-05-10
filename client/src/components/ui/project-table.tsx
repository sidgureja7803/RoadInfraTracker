import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Skeleton } from "./skeleton";
import { Button } from "./button";
import { Input } from "./input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { formatCurrency, formatDate, getStatusColor, getProgressStatusText } from "@/lib/utils";
import { useState } from "react";

const ProjectTable = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ["/api/projects"],
  });

  const { data: roadsData, isLoading: isLoadingRoads } = useQuery({
    queryKey: ["/api/roads"],
  });

  const { data: vendorsData, isLoading: isLoadingVendors } = useQuery({
    queryKey: ["/api/vendors"],
  });

  const getRoadById = (roadId: number) => {
    return roadsData?.find((road: any) => road.id === roadId);
  };

  const getVendorById = (vendorId: number) => {
    return vendorsData?.find((vendor: any) => vendor.id === vendorId);
  };

  const filteredProjects = projectsData?.filter((project: any) => {
    // Status filter
    if (statusFilter !== "all" && project.status !== statusFilter) return false;
    
    // Type filter
    if (typeFilter !== "all" && project.type !== typeFilter) return false;
    
    // Search
    if (searchQuery) {
      const road = getRoadById(project.roadId);
      const vendor = getVendorById(project.vendorId);
      const searchLower = searchQuery.toLowerCase();
      
      return (
        project.projectId.toLowerCase().includes(searchLower) ||
        project.name.toLowerCase().includes(searchLower) ||
        (road && road.name.toLowerCase().includes(searchLower)) ||
        (vendor && vendor.name.toLowerCase().includes(searchLower)) ||
        project.wardName.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Pagination
  const totalItems = filteredProjects?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedProjects = filteredProjects?.slice(startIndex, endIndex);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-6">
      <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-900">Recent Infrastructure Projects</h2>
        <Button variant="link" size="sm" className="text-primary-600 hover:text-primary-800">
          View All
        </Button>
      </div>

      {/* Table Filters */}
      <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center space-x-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-500">Status:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 text-sm h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-500">Type:</span>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40 text-sm h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="New Construction">New Construction</SelectItem>
                <SelectItem value="Repair">Repair</SelectItem>
                <SelectItem value="Widening">Widening</SelectItem>
                <SelectItem value="Bridge">Bridge</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="relative w-full md:w-auto">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search projects..."
            className="pl-10 h-8 w-full md:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Project ID</TableHead>
              <TableHead className="whitespace-nowrap">Road Name</TableHead>
              <TableHead className="whitespace-nowrap">Type</TableHead>
              <TableHead className="whitespace-nowrap">Ward</TableHead>
              <TableHead className="whitespace-nowrap">Vendor</TableHead>
              <TableHead className="whitespace-nowrap">Budget</TableHead>
              <TableHead className="whitespace-nowrap">Timeline</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap">Progress</TableHead>
              <TableHead className="whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || isLoadingRoads || isLoadingVendors ? (
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <TableRow key={i}>
                    {Array(10)
                      .fill(0)
                      .map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))}
                  </TableRow>
                ))
            ) : paginatedProjects?.length > 0 ? (
              paginatedProjects.map((project: any) => {
                const road = getRoadById(project.roadId);
                const vendor = getVendorById(project.vendorId);
                const progressStatus = getProgressStatusText(project);

                return (
                  <TableRow key={project.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{project.projectId}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{road?.roadId}</span>
                        <span className="text-xs text-slate-500">{road?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{project.type}</TableCell>
                    <TableCell>{project.wardName}</TableCell>
                    <TableCell>{vendor?.name}</TableCell>
                    <TableCell>{formatCurrency(project.budget)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="flex items-center">
                          <span>{formatDate(project.startDate)}</span>
                          <span className="mx-1">-</span>
                          <span>{formatDate(project.endDate)}</span>
                        </div>
                        <div className={`text-xs ${progressStatus.color}`}>{progressStatus.text}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 text-xs font-medium ${getStatusColor(
                          project.status
                        )} rounded-full`}
                      >
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getStatusColor(project.status).split(" ")[1].replace("100", "500")}`}
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs font-medium text-slate-700">{project.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="link" size="sm" className="text-primary-600 hover:text-primary-900">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-4 text-slate-500">
                  No projects found matching the current filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-700">
            Showing{" "}
            <span className="font-medium">{totalItems ? startIndex + 1 : 0}</span> to{" "}
            <span className="font-medium">{endIndex}</span> of{" "}
            <span className="font-medium">{totalItems}</span> projects
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeftIcon className="h-4 w-4 mr-1" />
            Previous
          </Button>
          {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
            <ChevronRightIcon className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectTable;
