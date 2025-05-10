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
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SearchIcon,
  PlusIcon,
  UserRoundIcon,
  CalendarIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  FileTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getInitials } from "@/lib/utils";

const vendorFormSchema = z.object({
  name: z.string().min(1, "Vendor name is required"),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  address: z.string().optional(),
  registrationNumber: z.string().optional(),
  registrationDate: z.string().optional(),
  category: z.string().optional(),
  status: z.string().default("active"),
  performance: z.string().default("good"),
});

const Vendors = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [performanceFilter, setPerformanceFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof vendorFormSchema>>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      name: "",
      status: "active",
      performance: "good",
    },
  });

  const { data: vendorsData, isLoading } = useQuery({
    queryKey: ["/api/vendors"],
  });

  const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["/api/projects"],
  });

  const createVendorMutation = useMutation({
    mutationFn: async (values: z.infer<typeof vendorFormSchema>) => {
      const res = await apiRequest("POST", "/api/vendors", values);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      setIsDialogOpen(false);
      form.reset({
        name: "",
        status: "active",
        performance: "good",
      });
      toast({
        title: "Vendor created",
        description: "The vendor has been added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create vendor: ${error}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof vendorFormSchema>) => {
    createVendorMutation.mutate(values);
  };

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

  const filteredVendors = vendorsData?.filter((vendor: any) => {
    // Category filter
    if (categoryFilter !== "all" && vendor.category !== categoryFilter) return false;
    
    // Performance filter
    if (performanceFilter !== "all" && vendor.performance !== performanceFilter) return false;
    
    // Search
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        vendor.name.toLowerCase().includes(searchLower) ||
        (vendor.contactPerson && vendor.contactPerson.toLowerCase().includes(searchLower)) ||
        (vendor.registrationNumber && vendor.registrationNumber.toLowerCase().includes(searchLower)) ||
        (vendor.category && vendor.category.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  // Get unique categories for filter
  const categories = vendorsData
    ? Array.from(new Set(vendorsData.map((vendor: any) => vendor.category).filter(Boolean)))
    : [];

  // Pagination
  const totalItems = filteredVendors?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedVendors = filteredVendors?.slice(startIndex, endIndex);

  return (
    <>
      <Helmet>
        <title>Vendors | Road Infra Tracker</title>
        <meta name="description" content="Manage vendors for road infrastructure projects in Mahendragarh" />
      </Helmet>
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Vendors</h1>
          <p className="text-sm text-slate-500">Manage and track all vendors for infrastructure projects</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search vendors..."
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1">
                <PlusIcon className="h-4 w-4" />
                Add Vendor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Add New Vendor</DialogTitle>
                <DialogDescription>
                  Enter the details of the new vendor to be added to the system.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vendor Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactPerson"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Person</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="registrationNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registration Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="registrationDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registration Date</FormLabel>
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
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Construction">Construction</SelectItem>
                              <SelectItem value="Maintenance">Maintenance</SelectItem>
                              <SelectItem value="Road Construction">Road Construction</SelectItem>
                              <SelectItem value="Bridge Construction">Bridge Construction</SelectItem>
                              <SelectItem value="Urban Development">Urban Development</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="performance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Performance</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select performance" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="good">Good</SelectItem>
                              <SelectItem value="average">Average</SelectItem>
                              <SelectItem value="poor">Poor</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit" disabled={createVendorMutation.isPending}>
                      {createVendorMutation.isPending ? "Saving..." : "Save Vendor"}
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
            <UserRoundIcon className="h-5 w-5" />
            Vendor Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category: string) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-slate-700 mb-1">Performance</label>
              <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="All Performance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Performance</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Vendor Stats */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Vendors</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-20 mt-1" />
                  ) : (
                    <p className="text-2xl font-semibold text-slate-900 mt-1">{vendorsData?.length || 0}</p>
                  )}
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <UserRoundIcon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Active Vendors</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-20 mt-1" />
                  ) : (
                    <p className="text-2xl font-semibold text-slate-900 mt-1">
                      {vendorsData?.filter((v: any) => v.status === "active").length || 0}
                    </p>
                  )}
                </div>
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <UserRoundIcon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Vendors with Projects</p>
                  {isLoading || isLoadingProjects ? (
                    <Skeleton className="h-8 w-20 mt-1" />
                  ) : (
                    <p className="text-2xl font-semibold text-slate-900 mt-1">
                      {vendorsData?.filter((v: any) => 
                        getVendorProjects(v.id).length > 0
                      ).length || 0}
                    </p>
                  )}
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <FileTextIcon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <UserRoundIcon className="h-5 w-5" />
            Vendor List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Contact Details</TableHead>
                  <TableHead>Registration</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>Total Budget</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading || isLoadingProjects ? (
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow key={i}>
                        {Array(9)
                          .fill(0)
                          .map((_, j) => (
                            <TableCell key={j}>
                              <Skeleton className="h-5 w-full" />
                            </TableCell>
                          ))}
                      </TableRow>
                    ))
                ) : filteredVendors?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                      No vendors found matching the current filters
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedVendors?.map((vendor: any) => {
                    const projectCount = getVendorProjects(vendor.id).length;
                    const totalBudget = getVendorTotalBudget(vendor.id);
                    const budgetStatus = getBudgetStatus(vendor.id);
                    const initials = getInitials(vendor.name);
                    const colorClass = getInitialColor(vendor.name);
                    
                    return (
                      <TableRow key={vendor.id} className="hover:bg-slate-50">
                        <TableCell>
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center mr-3`}>
                              <span className="text-sm font-medium">{initials}</span>
                            </div>
                            <div>
                              <p className="font-medium">{vendor.name}</p>
                              <p className="text-xs text-slate-500">
                                {vendor.status === "active" ? (
                                  <span className="text-green-600">Active</span>
                                ) : (
                                  <span className="text-slate-500">Inactive</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{vendor.contactPerson || "-"}</TableCell>
                        <TableCell>
                          {vendor.phone || vendor.email ? (
                            <div className="space-y-1">
                              {vendor.phone && (
                                <div className="flex items-center text-xs">
                                  <PhoneIcon className="h-3 w-3 mr-1 text-slate-400" />
                                  <span>{vendor.phone}</span>
                                </div>
                              )}
                              {vendor.email && (
                                <div className="flex items-center text-xs">
                                  <MailIcon className="h-3 w-3 mr-1 text-slate-400" />
                                  <span>{vendor.email}</span>
                                </div>
                              )}
                              {vendor.address && (
                                <div className="flex items-center text-xs">
                                  <MapPinIcon className="h-3 w-3 mr-1 text-slate-400" />
                                  <span>{vendor.address.substring(0, 20)}...</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {vendor.registrationNumber ? (
                            <div>
                              <p className="text-xs">{vendor.registrationNumber}</p>
                              {vendor.registrationDate && (
                                <p className="text-xs text-slate-500">
                                  Since {new Date(vendor.registrationDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>{vendor.category || "-"}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full
                              ${vendor.performance === "good" ? "bg-green-100 text-green-800" : ""}
                              ${vendor.performance === "average" ? "bg-amber-100 text-amber-800" : ""}
                              ${vendor.performance === "poor" ? "bg-red-100 text-red-800" : ""}
                            `}
                          >
                            {vendor.performance.charAt(0).toUpperCase() + vendor.performance.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{projectCount}</span>
                          <span className="text-xs text-slate-500 ml-1">
                            {projectCount === 1 ? "project" : "projects"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">₹{totalBudget.toFixed(1)} Cr</p>
                            <p className={`text-xs ${budgetStatus.color}`}>{budgetStatus.text}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="link" size="sm" className="text-primary-600 hover:text-primary-900 p-0 h-auto">
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
          {filteredVendors?.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div>
                <p className="text-sm text-slate-700">
                  Showing{" "}
                  <span className="font-medium">{totalItems ? startIndex + 1 : 0}</span> to{" "}
                  <span className="font-medium">{endIndex}</span> of{" "}
                  <span className="font-medium">{totalItems}</span> vendors
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

export default Vendors;
