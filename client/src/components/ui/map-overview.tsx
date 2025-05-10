import { Card, CardContent } from "./card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "./skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Label } from "./label";

const MapOverview = () => {
  const { data: wardsData, isLoading: isLoadingWards } = useQuery({
    queryKey: ["/api/wards"],
  });

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Map Overview</h2>
          <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">
            View Full Map
          </button>
        </div>

        <div className="h-72 bg-slate-50 rounded-lg border border-slate-200 mb-4 relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
            alt="Map view of Mahendragarh roads"
            className="w-full h-full object-cover"
          />

          {/* Map Overlay with Dots for Projects */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-green-500 rounded-full absolute" style={{ top: "35%", left: "45%" }}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full absolute" style={{ top: "42%", left: "58%" }}></div>
            <div className="w-3 h-3 bg-amber-500 rounded-full absolute" style={{ top: "65%", left: "30%" }}></div>
            <div className="w-3 h-3 bg-red-500 rounded-full absolute" style={{ top: "50%", left: "70%" }}></div>
            <div className="w-3 h-3 bg-green-500 rounded-full absolute" style={{ top: "28%", left: "62%" }}></div>
          </div>
        </div>

        <div>
          <Label htmlFor="ward-filter" className="block text-sm font-medium text-slate-700 mb-2">Filter by Ward</Label>
          {isLoadingWards ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select>
              <SelectTrigger id="ward-filter" className="w-full">
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
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MapOverview;
