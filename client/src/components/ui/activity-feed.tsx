import { Card, CardContent } from "./card";
import { Button } from "./button";
import { Skeleton } from "./skeleton";
import { useQuery } from "@tanstack/react-query";
import {
  CheckIcon,
  FileText,
  AlertTriangleIcon,
  TrafficCone,
  UserPlusIcon,
} from "lucide-react";

const ActivityFeed = () => {
  const { data: activitiesData, isLoading } = useQuery({
    queryKey: ["/api/activities"],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(`${queryKey[0]}?limit=5`);
      if (!response.ok) throw new Error("Failed to fetch activities");
      return response.json();
    },
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "project_status_changed":
      case "project_completed":
        return (
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mt-0.5">
            <CheckIcon className="h-4 w-4" />
          </div>
        );
      case "project_added":
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mt-0.5">
            <FileText className="h-4 w-4" />
          </div>
        );
      case "project_delayed":
        return (
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mt-0.5">
            <AlertTriangleIcon className="h-4 w-4" />
          </div>
        );
      case "road_added":
      case "batch_update":
        return (
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mt-0.5">
            <TrafficCone className="h-4 w-4" />
          </div>
        );
      case "vendor_added":
        return (
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mt-0.5">
            <UserPlusIcon className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 mt-0.5">
            <FileText className="h-4 w-4" />
          </div>
        );
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 60) {
      return diffMins <= 1 ? "just now" : `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
          <Button variant="link" size="sm" className="text-primary-600 hover:text-primary-800">
            View All
          </Button>
        </div>

        <div className="p-5">
          {isLoading ? (
            <ul className="space-y-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <li key={i} className="flex items-start">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="ml-3 flex-1">
                      <Skeleton className="h-5 w-full max-w-md" />
                      <div className="flex items-center mt-1">
                        <Skeleton className="h-4 w-20" />
                        <div className="mx-1 h-1 w-1" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          ) : (
            <ul className="space-y-4">
              {activitiesData?.map((activity: any) => (
                <li key={activity.id} className="flex items-start">
                  {getActivityIcon(activity.type)}
                  <div className="ml-3">
                    <p className="text-sm text-slate-900" dangerouslySetInnerHTML={{ __html: activity.description }} />
                    <div className="flex items-center mt-1">
                      <p className="text-xs text-slate-500">{formatTimestamp(activity.timestamp)}</p>
                      {activity.userName && (
                        <>
                          <span className="mx-1 text-slate-300">•</span>
                          <p className="text-xs text-slate-700">By {activity.userName}</p>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
