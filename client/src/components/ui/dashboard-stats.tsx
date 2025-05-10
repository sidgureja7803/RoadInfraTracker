import { useQuery } from "@tanstack/react-query";
import { 
  ArrowUpIcon, 
  BuildingIcon, 
  TrafficCone, 
  UserRoundIcon, 
  IndianRupeeIcon 
} from "lucide-react";
import { Card, CardContent } from "./card";
import { Skeleton } from "./skeleton";
import { formatCurrency } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeType?: "positive" | "neutral";
  changePeriod?: string;
  isLoading?: boolean;
}

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  change, 
  changeType = "positive", 
  changePeriod = "since last month",
  isLoading = false
}: StatsCardProps) => {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mt-1" />
            ) : (
              <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
            )}
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
            {icon}
          </div>
        </div>
        {change && (
          <div className="mt-2 flex items-center text-xs">
            <span className={`flex items-center ${changeType === "positive" ? "text-green-600" : "text-slate-600"}`}>
              <ArrowUpIcon className="h-3 w-3 mr-1" />
              {change}
            </span>
            <span className="text-slate-500 ml-2">{changePeriod}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const DashboardStats = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
      <StatsCard
        title="Total Roads"
        value={data?.totalRoads || 0}
        icon={<TrafficCone className="h-5 w-5" />}
        change="12 new"
        isLoading={isLoading}
      />
      <StatsCard
        title="Active Projects"
        value={data?.activeProjects || 0}
        icon={<BuildingIcon className="h-5 w-5" />}
        change="5 new"
        isLoading={isLoading}
      />
      <StatsCard
        title="Total Budget"
        value={formatCurrency(data?.totalBudget || 0)}
        icon={<IndianRupeeIcon className="h-5 w-5" />}
        change="12.5% increase"
        changePeriod="from previous year"
        isLoading={isLoading}
      />
      <StatsCard
        title="Active Vendors"
        value={data?.activeVendors || 0}
        icon={<UserRoundIcon className="h-5 w-5" />}
        change="3 new"
        changePeriod="since last quarter"
        isLoading={isLoading}
      />
    </div>
  );
};

export default DashboardStats;
