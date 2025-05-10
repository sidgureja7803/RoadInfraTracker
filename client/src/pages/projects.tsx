import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { 
  SearchIcon, 
  PlusIcon, 
  BuildingIcon, 
  ListFilterIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  formatCurrency, 
  formatDate, 
  getStatusColor, 
  getProgressStatusText, 
  generateProjectId 
} from "@/lib/utils";
import { PROJECT_STATUS, PROJECT_TYPES } from "@shared/schema";

const projectFormSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  name: z.string().min(1, "Project name is required"),
  roadId: z.coerce.number().min(1, "Road is required"),
  vendorId: z.coerce.number().min(1, "Vendor is required"),
  type: z.string().min(1, "Project type is required"),
  wardId: z.coerce.number().min(1, "Ward is required"),
  wardName: z.string().min(1, "Ward name is required"),
  budget: z.coerce.number().min(0.1, "Budget must be greater than 0"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  status: z.string().default(PROJECT_STATUS.SCHEDULED),
  progress: z.coerce.number().min(0).max(100).default(0),
  description: z.string().optional(),
  createdBy: z.string().default("Admin Khan"),
});

const Projects = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [wardFilter, setWardFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      projectId: generateProjectId(),
      name: "",
      description: "",
      status: PROJECT_STATUS.SCHEDULED,
      progress: 0,
      createdBy: "Admin Khan"
    },
  });

  const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["/api/projects"],
  });

  const { data: roadsData, isLoading: isLoadingRoads } = useQuery({
    queryKey: ["/api/roads"],
  });

  const { data: vendorsData, isLoading: isLoadingVendors } = useQuery({
    queryKey: ["/api/vendors"],
  });

  const { data: wardsData, isLoading: isLoadingWards } = useQuery({
    queryKey: ["/api/wards"],
  });

  const createProjectMutation = useMutation({
    mutationFn: async (values: z.infer<typeof projectFormSchema>) => {
      const res = await apiRequest("POST", "/api/projects", values);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      setIsDialogOpen(false);
      form.reset({
        projectId: generateProjectId(),
        name: "",
        description: "",
        status: PROJECT_STATUS.SCHEDULED,
        progress: 0,
        createdBy: "Admin Khan"
      });
      toast({
        title: "Project created",
        description: "The infrastructure project has been added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create project: ${error}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof projectFormSchema>) => {
    createProjectMutation.mutate(values);
  };

  const handleWardChange = (value: string) => {
    const selectedWard = wardsData?.find((ward: any) => ward.id === parseInt(value));
    if (selectedWard) {
      form.setValue("wardName", selectedWard.name);
    }
  };

  const filteredProjects = projectsData?.filter((project: any) => {
    // Status filter
    if (statusFilter !== "all" && project.status !== statusFilter) return false;
    
    // Type filter
    if (typeFilter !== "all" && project.type !== typeFilter) return false;
    
    // Ward filter
    if (wardFilter !== "all" && project.wardId.toString() !== wardFilter) return false;
    
    // Search
    if (searchQuery) {
      const road = roadsData?.find((road: any) => road.id === project.roadId);
      const vendor = vendorsData?.find((vendor: any) => vendor.id === project.vendorId);
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

  const getRoadName = (roadId: number) => {
    const road = roadsData?.find((road: any) => road.id === roadId);
    return road ? `${road.roadId} - ${road.name}` : "Unknown Road";
  };

  const getVendorName = (vendorId: number) => {
    const vendor = vendorsData?.find((vendor: any) => vendor.id === vendorId);
    return vendor ? vendor.name : "Unknown Vendor";
  };

  const handleStatusChange = async (id: number, newStatus: string, currentProgress: number) => {
    let progress = currentProgress;
    
    // If marking as completed, set progress to 100%
    if (newStatus === PROJECT_STATUS.COMPLETED) {
      progress = 100;
    }
    
    try {
      await apiRequest("PATCH", `/api/projects/${id}`, { status: newStatus, progress });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      
      toast({
        title: "Project updated",
        description: `Project status changed to ${newStatus.replace("_", " ")}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update project: ${error}`,
        variant: "destructive",
      });
    }
  };

  const isLoading = isLoadingProjects || isLoadingRoads || isLoadingVendors || isLoadingWards;

  return (
    <>
      <Helmet>
        <title>Infrastructure Works | Road Infra Tracker</title>
        <meta name="description" content="Manage infrastructure projects in Mahendragarh" />
      </Helmet>
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Infrastructure Works</h1>
          <p className="text-sm text-slate-500">Manage and track all infrastructure projects in Mahendragarh</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search projects..."
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1">
                <PlusIcon className="h-4 w-4" />
                Add Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Infrastructure Project</DialogTitle>
                <DialogDescription>
                  Enter the details of the new infrastructure project to be added to the system.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="projectId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project ID</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>Unique identifier for the project</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="roadId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Road</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a road" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {roadsData?.map((road: any) => (
                                <SelectItem key={road.id} value={road.id.toString()}>
                                  {road.roadId} - {road.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="vendorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vendor</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a vendor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {vendorsData?.map((vendor: any) => (
                                <SelectItem key={vendor.id} value={vendor.id.toString()}>
                                  {vendor.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={PROJECT_TYPES.NEW_CONSTRUCTION}>New Construction</SelectItem>
                              <SelectItem value={PROJECT_TYPES.REPAIR}>Repair</SelectItem>
                              <SelectItem value={PROJECT_TYPES.WIDENING}>Widening</SelectItem>
                              <SelectItem value={PROJECT_TYPES.BRIDGE}>Bridge</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget (in Cr ₹)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="wardId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ward</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(parseInt(value));
                              handleWardChange(value);
                            }}
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a ward" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {wardsData?.map((ward: any) => (
                                <SelectItem key={ward.id} value={ward.id.toString()}>
                                  {ward.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="wardName"
                      render={({ field }) => (
                        <FormItem className="hidden">
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                              <Input type="date" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                              <Input type="date" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={PROJECT_STATUS.SCHEDULED}>Scheduled</SelectItem>
                              <SelectItem value={PROJECT_STATUS.IN_PROGRESS}>In Progress</SelectItem>
                              <SelectItem value={PROJECT_STATUS.COMPLETED}>Completed</SelectItem>
                              <SelectItem value={PROJECT_STATUS.DELAYED}>Delayed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="progress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Progress (%)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" max="100" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit" disabled={createProjectMutation.isPending}>
                      {createProjectMutation.isPending ? "Saving..." : "Save Project"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ListFilterIcon className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={PROJECT_STATUS.SCHEDULED}>Scheduled</SelectItem>
                  <SelectItem value={PROJECT_STATUS.IN_PROGRESS}>In Progress</SelectItem>
                  <SelectItem value={PROJECT_STATUS.COMPLETED}>Completed</SelectItem>
                  <SelectItem value={PROJECT_STATUS.DELAYED}>Delayed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value={PROJECT_TYPES.NEW_CONSTRUCTION}>New Construction</SelectItem>
                  <SelectItem value={PROJECT_TYPES.REPAIR}>Repair</SelectItem>
                  <SelectItem value={PROJECT_TYPES.WIDENING}>Widening</SelectItem>
                  <SelectItem value={PROJECT_TYPES.BRIDGE}>Bridge</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-slate-700 mb-1">Ward</label>
              <Select value={wardFilter} onValueChange={setWardFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Wards" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Wards</SelectItem>
                  {wardsData?.map((ward: any) => (
                    <SelectItem key={ward.id} value={ward.id.toString()}>
                      {ward.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BuildingIcon className="h-5 w-5" />
            Infrastructure Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Road</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Ward</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow key={i}>
                        {Array(11)
                          .fill(0)
                          .map((_, j) => (
                            <TableCell key={j}>
                              <Skeleton className="h-5 w-full" />
                            </TableCell>
                          ))}
                      </TableRow>
                    ))
                ) : filteredProjects?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-6 text-muted-foreground">
                      No projects found matching the current filters
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedProjects?.map((project: any) => {
                    const progressStatus = getProgressStatusText(project);
                    
                    return (
                      <TableRow key={project.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium">{project.projectId}</TableCell>
                        <TableCell>{project.name}</TableCell>
                        <TableCell>{getRoadName(project.roadId)}</TableCell>
                        <TableCell>{project.type}</TableCell>
                        <TableCell>{project.wardName}</TableCell>
                        <TableCell>{getVendorName(project.vendorId)}</TableCell>
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
                          <Select 
                            value={project.status}
                            onValueChange={(value) => handleStatusChange(project.id, value, project.progress)}
                          >
                            <SelectTrigger className="h-8 w-[130px]">
                              <span className={`px-2 py-1 text-xs font-medium ${getStatusColor(project.status)} rounded-full`}>
                                {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace("_", " ")}
                              </span>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={PROJECT_STATUS.SCHEDULED}>Scheduled</SelectItem>
                              <SelectItem value={PROJECT_STATUS.IN_PROGRESS}>In Progress</SelectItem>
                              <SelectItem value={PROJECT_STATUS.COMPLETED}>Completed</SelectItem>
                              <SelectItem value={PROJECT_STATUS.DELAYED}>Delayed</SelectItem>
                            </SelectContent>
                          </Select>
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
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {filteredProjects?.length > 0 && (
            <div className="flex items-center justify-between mt-4">
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
                {totalPages > 3 && currentPage < totalPages - 1 && (
                  <span className="flex items-center">...</span>
                )}
                {totalPages > 3 && currentPage < totalPages && (
                  <Button
                    variant={currentPage === totalPages ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                  >
                    {totalPages}
                  </Button>
                )}
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
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default Projects;
