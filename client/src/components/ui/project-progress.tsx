import { Card, CardContent } from "./card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "./skeleton";
import { Button } from "./button";

const ProjectProgress = () => {
  const { data: projectsData, isLoading } = useQuery({
    queryKey: ["/api/projects"],
  });

  const getChartData = () => {
    if (!projectsData) return [];
    
    const completed = projectsData.filter((p: any) => p.status === "completed").length;
    const inProgress = projectsData.filter((p: any) => p.status === "in_progress").length;
    const scheduled = projectsData.filter((p: any) => p.status === "scheduled").length;
    const delayed = projectsData.filter((p: any) => p.status === "delayed").length;

    return [
      { name: "Completed", value: completed, fill: "#22c55e" },
      { name: "In Progress", value: inProgress, fill: "#f59e0b" },
      { name: "Scheduled", value: scheduled, fill: "#3b82f6" },
      { name: "Delayed", value: delayed, fill: "#ef4444" },
    ];
  };

  const chartData = getChartData();

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Project Progress</h2>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="text-xs">
              This Month
            </Button>
            <Button variant="ghost" size="sm" className="text-xs">
              This Quarter
            </Button>
            <Button variant="ghost" size="sm" className="text-xs">
              This Year
            </Button>
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="h-64 w-full mb-4" />
        ) : (
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm font-medium text-slate-500">Completed</p>
            {isLoading ? (
              <Skeleton className="h-6 w-10 mx-auto mt-1" />
            ) : (
              <p className="text-xl font-semibold text-green-600 mt-1">
                {chartData[0]?.value || 0}
              </p>
            )}
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-500">In Progress</p>
            {isLoading ? (
              <Skeleton className="h-6 w-10 mx-auto mt-1" />
            ) : (
              <p className="text-xl font-semibold text-amber-600 mt-1">
                {chartData[1]?.value || 0}
              </p>
            )}
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-500">Scheduled</p>
            {isLoading ? (
              <Skeleton className="h-6 w-10 mx-auto mt-1" />
            ) : (
              <p className="text-xl font-semibold text-blue-600 mt-1">
                {chartData[2]?.value || 0}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectProgress;
