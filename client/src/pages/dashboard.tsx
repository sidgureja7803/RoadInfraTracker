import { Helmet } from "react-helmet";
import DashboardStats from "@/components/ui/dashboard-stats";
import ProjectProgress from "@/components/ui/project-progress";
import MapOverview from "@/components/ui/map-overview";
import ProjectTable from "@/components/ui/project-table";
import VendorList from "@/components/ui/vendor-list";
import ActivityFeed from "@/components/ui/activity-feed";

const Dashboard = () => {
  return (
    <>
      <Helmet>
        <title>Dashboard | Road Infra Tracker</title>
        <meta name="description" content="Overview of road infrastructure projects in Mahendragarh" />
      </Helmet>
      
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of road infrastructure projects in Mahendragarh</p>
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Project Progress & Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <ProjectProgress />
        </div>
        <div>
          <MapOverview />
        </div>
      </div>

      {/* Projects Table */}
      <ProjectTable />

      {/* Bottom Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VendorList />
        <ActivityFeed />
      </div>
    </>
  );
};

export default Dashboard;
