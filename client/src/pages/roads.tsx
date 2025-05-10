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
import { SearchIcon, PlusIcon, TrafficCone } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { generateRoadId } from "@/lib/utils";

const roadFormSchema = z.object({
  roadId: z.string().min(1, "Road ID is required"),
  name: z.string().min(1, "Road name is required"),
  description: z.string().optional(),
  wardId: z.coerce.number().min(1, "Ward is required"),
  wardName: z.string().min(1, "Ward name is required"),
  length: z.coerce.number().optional(),
  width: z.coerce.number().optional(),
  startPoint: z.string().optional(),
  endPoint: z.string().optional(),
  constructionYear: z.coerce.number().optional(),
  status: z.string().default("active"),
});

const Roads = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof roadFormSchema>>({
    resolver: zodResolver(roadFormSchema),
    defaultValues: {
      roadId: generateRoadId(),
      name: "",
      description: "",
      status: "active",
    },
  });

  const { data: roadsData, isLoading: isLoadingRoads } = useQuery({
    queryKey: ["/api/roads"],
  });

  const { data: wardsData, isLoading: isLoadingWards } = useQuery({
    queryKey: ["/api/wards"],
  });

  const createRoadMutation = useMutation({
    mutationFn: async (values: z.infer<typeof roadFormSchema>) => {
      const res = await apiRequest("POST", "/api/roads", values);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setIsDialogOpen(false);
      form.reset({
        roadId: generateRoadId(),
        name: "",
        description: "",
        status: "active",
      });
      toast({
        title: "Road created",
        description: "The road has been added to the registry successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create road: ${error}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof roadFormSchema>) => {
    createRoadMutation.mutate(values);
  };

  const filteredRoads = roadsData?.filter((road: any) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      road.roadId.toLowerCase().includes(searchLower) ||
      road.name.toLowerCase().includes(searchLower) ||
      road.wardName.toLowerCase().includes(searchLower) ||
      (road.description && road.description.toLowerCase().includes(searchLower))
    );
  });

  const handleWardChange = (value: string) => {
    const selectedWard = wardsData?.find((ward: any) => ward.id === parseInt(value));
    if (selectedWard) {
      form.setValue("wardName", selectedWard.name);
    }
  };

  return (
    <>
      <Helmet>
        <title>Road Registry | Road Infra Tracker</title>
        <meta name="description" content="Manage road registry in Mahendragarh" />
      </Helmet>
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Road Registry</h1>
          <p className="text-sm text-slate-500">Manage and track all roads in Mahendragarh</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search roads..."
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1">
                <PlusIcon className="h-4 w-4" />
                Add Road
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Add New Road</DialogTitle>
                <DialogDescription>
                  Enter the details of the new road to be added to the registry.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="roadId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Road ID</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>Unique identifier for the road</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Road Name</FormLabel>
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
                    
                    <FormField
                      control={form.control}
                      name="length"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Length (km)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="width"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Width (meters)</FormLabel>
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
                      name="startPoint"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Point</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="endPoint"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Point</FormLabel>
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
                    name="constructionYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Construction Year</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit" disabled={createRoadMutation.isPending}>
                      {createRoadMutation.isPending ? "Saving..." : "Save Road"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrafficCone className="h-5 w-5" />
            Road List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Road ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Ward</TableHead>
                  <TableHead>Length (km)</TableHead>
                  <TableHead>Width (m)</TableHead>
                  <TableHead>Construction Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingRoads ? (
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow key={i}>
                        {Array(8)
                          .fill(0)
                          .map((_, j) => (
                            <TableCell key={j}>
                              <Skeleton className="h-5 w-full" />
                            </TableCell>
                          ))}
                      </TableRow>
                    ))
                ) : filteredRoads?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                      No roads found matching the search criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRoads?.map((road: any) => (
                    <TableRow key={road.id}>
                      <TableCell className="font-medium">{road.roadId}</TableCell>
                      <TableCell>{road.name}</TableCell>
                      <TableCell>{road.wardName}</TableCell>
                      <TableCell>{road.length || "-"}</TableCell>
                      <TableCell>{road.width || "-"}</TableCell>
                      <TableCell>{road.constructionYear || "-"}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                          {road.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="link" size="sm" className="text-primary-600 p-0 h-auto">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default Roads;
