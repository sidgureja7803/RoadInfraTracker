import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  DownloadIcon,
  BarChart3Icon,
  PieChartIcon,
  LineChartIcon,
  FilterIcon,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [wardFilter, setWardFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  
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
  
  const isLoading = isLoadingProjects || isLoadingRoads || isLoadingVendors || isLoadingWards;
  
  // Filter projects by ward and year
  const filteredProjects = projectsData?.filter((project: any) => {
    if (wardFilter !== "all" && project.wardId.toString() !== wardFilter) return false;
    
    const projectYear = new Date(project.startDate).getFullYear().toString();
    if (yearFilter !== "all" && projectYear !== yearFilter) return false;
    
    return true;
  });
  
  // Project Status Distribution Data
  const getStatusDistribution = () => {
    if (!filteredProjects) return [];
    
    const statusCount = {
      completed: 0,
      in_progress: 0,
      scheduled: 0,
      delayed: 0,
    };
    
    filteredProjects.forEach((project: any) => {
      statusCount[project.status]++;
    });
    
    return [
      { name: "Completed", value: statusCount.completed, fill: "#22c55e" },
      { name: "In Progress", value: statusCount.in_progress, fill: "#f59e0b" },
      { name: "Scheduled", value: statusCount.scheduled, fill: "#3b82f6" },
      { name: "Delayed", value: statusCount.delayed, fill: "#ef4444" },
    ];
  };
  
  // Project Type Distribution Data
  const getTypeDistribution = () => {
    if (!filteredProjects) return [];
    
    const typeCount: Record<string, number> = {};
    
    filteredProjects.forEach((project: any) => {
      if (typeCount[project.type]) {
        typeCount[project.type]++;
      } else {
        typeCount[project.type] = 1;
      }
    });
    
    const colors = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];
    
    return Object.keys(typeCount).map((type, index) => ({
      name: type,
      value: typeCount[type],
      fill: colors[index % colors.length],
    }));
  };
  
  // Budget Allocation by Ward
  const getBudgetByWard = () => {
    if (!filteredProjects || !wardsData) return [];
    
    const wardBudget: Record<string, number> = {};
    
    filteredProjects.forEach((project: any) => {
      if (wardBudget[project.wardName]) {
        wardBudget[project.wardName] += project.budget;
      } else {
        wardBudget[project.wardName] = project.budget;
      }
    });
    
    return Object.keys(wardBudget).map((ward) => ({
      name: ward,
      budget: wardBudget[ward],
    }));
  };
  
  // Project Timeline Data (Quarterly)
  const getQuarterlyData = () => {
    if (!filteredProjects) return [];
    
    const quarters = {
      "Q1": { completed: 0, ongoing: 0 },
      "Q2": { completed: 0, ongoing: 0 },
      "Q3": { completed: 0, ongoing: 0 },
      "Q4": { completed: 0, ongoing: 0 },
    };
    
    filteredProjects.forEach((project: any) => {
      const startDate = new Date(project.startDate);
      const month = startDate.getMonth();
      let quarter;
      
      if (month < 3) quarter = "Q1";
      else if (month < 6) quarter = "Q2";
      else if (month < 9) quarter = "Q3";
      else quarter = "Q4";
      
      if (project.status === "completed") {
        quarters[quarter].completed++;
      } else {
        quarters[quarter].ongoing++;
      }
    });
    
    return Object.keys(quarters).map((quarter) => ({
      name: quarter,
      Completed: quarters[quarter].completed,
      Ongoing: quarters[quarter].ongoing,
    }));
  };
  
  // Vendor Performance Data
  const getVendorPerformance = () => {
    if (!filteredProjects || !vendorsData) return [];
    
    const vendorProjects: Record<number, any[]> = {};
    
    filteredProjects.forEach((project: any) => {
      if (vendorProjects[project.vendorId]) {
        vendorProjects[project.vendorId].push(project);
      } else {
        vendorProjects[project.vendorId] = [project];
      }
    });
    
    return vendorsData
      .filter((vendor: any) => vendorProjects[vendor.id] && vendorProjects[vendor.id].length > 0)
      .map((vendor: any) => {
        const projects = vendorProjects[vendor.id];
        const totalProjects = projects.length;
        const completedProjects = projects.filter((p: any) => p.status === "completed").length;
        const delayedProjects = projects.filter((p: any) => p.status === "delayed").length;
        const totalBudget = projects.reduce((sum: number, p: any) => sum + p.budget, 0);
        
        return {
          name: vendor.name,
          projects: totalProjects,
          completed: completedProjects,
          delayed: delayedProjects,
          budget: totalBudget,
          completionRate: totalProjects ? (completedProjects / totalProjects) * 100 : 0,
        };
      })
      .sort((a, b) => b.projects - a.projects)
      .slice(0, 5);
  };
  
  // Calculate summary stats
  const getSummaryStats = () => {
    if (!filteredProjects) return { totalProjects: 0, totalBudget: 0, avgProgress: 0, completionRate: 0 };
    
    const totalProjects = filteredProjects.length;
    const totalBudget = filteredProjects.reduce((sum: number, p: any) => sum + p.budget, 0);
    const totalProgress = filteredProjects.reduce((sum: number, p: any) => sum + p.progress, 0);
    const avgProgress = totalProjects ? totalProgress / totalProjects : 0;
    const completedProjects = filteredProjects.filter((p: any) => p.status === "completed").length;
    const completionRate = totalProjects ? (completedProjects / totalProjects) * 100 : 0;
    
    return {
      totalProjects,
      totalBudget,
      avgProgress,
      completionRate,
    };
  };
  
  const summaryStats = getSummaryStats();
  const statusData = getStatusDistribution();
  const typeData = getTypeDistribution();
  const budgetByWardData = getBudgetByWard();
  const quarterlyData = getQuarterlyData();
  const vendorPerformanceData = getVendorPerformance();
  
  // Available years for filter (current year and 2 previous years)
  const currentYear = new Date().getFullYear();
  const years = [currentYear.toString(), (currentYear - 1).toString(), (currentYear - 2).toString()];
  
  const handleExport = (reportType: string) => {
    alert(`Exporting ${reportType} report in CSV format. This would download the data in a real application.`);
  };
  
  return (
    <>
      <Helmet>
        <title>Reports | Road Infra Tracker</title>
        <meta name="description" content="Generate reports for road infrastructure projects in Mahendragarh" />
      </Helmet>
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500">Generate and view reports on infrastructure projects</p>
        </div>
        
        <Button className="gap-2" onClick={() => handleExport(activeTab)}>
          <DownloadIcon className="h-4 w-4" />
          Export Report
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FilterIcon className="h-5 w-5" />
            Report Filters
          </CardTitle>
          <CardDescription>Filter the report data by ward and year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-slate-700 mb-1">Ward</label>
              <Select value={wardFilter} onValueChange={setWardFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
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
            
            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500">Total Projects</p>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mt-1" />
            ) : (
              <p className="text-2xl font-semibold text-slate-900 mt-1">{summaryStats.totalProjects}</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500">Total Budget</p>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mt-1" />
            ) : (
              <p className="text-2xl font-semibold text-slate-900 mt-1">
                {formatCurrency(summaryStats.totalBudget)}
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500">Average Progress</p>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mt-1" />
            ) : (
              <p className="text-2xl font-semibold text-slate-900 mt-1">{summaryStats.avgProgress.toFixed(0)}%</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500">Completion Rate</p>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mt-1" />
            ) : (
              <p className="text-2xl font-semibold text-slate-900 mt-1">{summaryStats.completionRate.toFixed(0)}%</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3Icon className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="budget" className="gap-2">
            <PieChartIcon className="h-4 w-4" />
            Budget Analysis
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-2">
            <LineChartIcon className="h-4 w-4" />
            Timeline Analysis
          </TabsTrigger>
          <TabsTrigger value="vendors" className="gap-2">
            <BarChart3Icon className="h-4 w-4" />
            Vendor Performance
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Status Distribution</CardTitle>
                <CardDescription>Breakdown of projects by status</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-72 w-full" />
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} projects`, ""]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Project Type Distribution</CardTitle>
                <CardDescription>Breakdown of projects by type</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-72 w-full" />
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={typeData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {typeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} projects`, ""]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Budget Analysis Tab */}
        <TabsContent value="budget">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget Allocation by Ward</CardTitle>
                <CardDescription>Total budget allocated to each ward</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-96 w-full" />
                ) : (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={budgetByWardData}
                        margin={{ top: 20, right: 30, left: 40, bottom: 40 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                        <YAxis label={{ value: 'Budget (in Cr ₹)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value) => [`₹${value.toFixed(1)} Cr`, "Budget"]} />
                        <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Timeline Analysis Tab */}
        <TabsContent value="timeline">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quarterly Project Progress</CardTitle>
                <CardDescription>Number of completed and ongoing projects by quarter</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-96 w-full" />
                ) : (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={quarterlyData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="Completed" stroke="#22c55e" strokeWidth={2} />
                        <Line type="monotone" dataKey="Ongoing" stroke="#f59e0b" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Vendor Performance Tab */}
        <TabsContent value="vendors">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Vendors by Project Count</CardTitle>
                <CardDescription>Vendors with most projects</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-72 w-full" />
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={vendorPerformanceData}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 100, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={100} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="projects" fill="#3b82f6" name="Total Projects" />
                        <Bar dataKey="completed" fill="#22c55e" name="Completed" />
                        <Bar dataKey="delayed" fill="#ef4444" name="Delayed" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Vendor Budget Allocation</CardTitle>
                <CardDescription>Total budget allocated to top vendors</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-72 w-full" />
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={vendorPerformanceData}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 100, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={100} />
                        <Tooltip formatter={(value) => [`₹${value.toFixed(1)} Cr`, "Budget"]} />
                        <Bar dataKey="budget" fill="#8b5cf6" name="Budget (in Cr ₹)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Vendor Completion Rate</CardTitle>
                <CardDescription>Percentage of completed projects by vendor</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-72 w-full" />
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={vendorPerformanceData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                        <YAxis label={{ value: 'Completion Rate (%)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value) => [`${value.toFixed(0)}%`, "Completion Rate"]} />
                        <Bar dataKey="completionRate" fill="#22c55e" name="Completion Rate (%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Reports;
