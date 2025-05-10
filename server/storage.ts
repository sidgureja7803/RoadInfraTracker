import { 
  Road, InsertRoad, 
  Vendor, InsertVendor, 
  Project, InsertProject, 
  Activity, InsertActivity,
  Ward, InsertWard
} from "@shared/schema";

export interface IStorage {
  // Road Operations
  getRoads(): Promise<Road[]>;
  getRoad(id: number): Promise<Road | undefined>;
  getRoadByRoadId(roadId: string): Promise<Road | undefined>;
  createRoad(road: InsertRoad): Promise<Road>;
  updateRoad(id: number, road: Partial<Road>): Promise<Road | undefined>;
  deleteRoad(id: number): Promise<boolean>;
  
  // Vendor Operations
  getVendors(): Promise<Vendor[]>;
  getVendor(id: number): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: number, vendor: Partial<Vendor>): Promise<Vendor | undefined>;
  deleteVendor(id: number): Promise<boolean>;
  
  // Project Operations
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByRoadId(roadId: number): Promise<Project[]>;
  getProjectsByVendorId(vendorId: number): Promise<Project[]>;
  getProjectsByWardId(wardId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Activity Operations
  getActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Ward Operations
  getWards(): Promise<Ward[]>;
  getWard(id: number): Promise<Ward | undefined>;
  createWard(ward: InsertWard): Promise<Ward>;

  // Dashboard Stats
  getDashboardStats(): Promise<{
    totalRoads: number;
    activeProjects: number;
    totalBudget: number;
    activeVendors: number;
  }>;
}

export class MemStorage implements IStorage {
  private roads: Map<number, Road>;
  private vendors: Map<number, Vendor>;
  private projects: Map<number, Project>;
  private activities: Map<number, Activity>;
  private wards: Map<number, Ward>;
  private roadIdCounter: number;
  private vendorIdCounter: number;
  private projectIdCounter: number;
  private activityIdCounter: number;
  private wardIdCounter: number;

  constructor() {
    this.roads = new Map();
    this.vendors = new Map();
    this.projects = new Map();
    this.activities = new Map();
    this.wards = new Map();
    this.roadIdCounter = 1;
    this.vendorIdCounter = 1;
    this.projectIdCounter = 1;
    this.activityIdCounter = 1;
    this.wardIdCounter = 1;

    // Initialize with sample data
    this.initializeData();
  }

  // Road Operations
  async getRoads(): Promise<Road[]> {
    return Array.from(this.roads.values());
  }

  async getRoad(id: number): Promise<Road | undefined> {
    return this.roads.get(id);
  }

  async getRoadByRoadId(roadId: string): Promise<Road | undefined> {
    return Array.from(this.roads.values()).find(road => road.roadId === roadId);
  }

  async createRoad(insertRoad: InsertRoad): Promise<Road> {
    const id = this.roadIdCounter++;
    const road: Road = { ...insertRoad, id, createdAt: new Date() };
    this.roads.set(id, road);
    
    // Create activity
    await this.createActivity({
      type: "road_added",
      description: `Road ${road.roadId} (${road.name}) added to registry`,
      entityId: id,
      entityType: "road",
      userId: "admin",
      userName: "Admin Khan"
    });
    
    return road;
  }

  async updateRoad(id: number, roadUpdate: Partial<Road>): Promise<Road | undefined> {
    const road = this.roads.get(id);
    if (!road) return undefined;
    
    const updatedRoad = { ...road, ...roadUpdate };
    this.roads.set(id, updatedRoad);
    
    // Create activity
    await this.createActivity({
      type: "road_updated",
      description: `Road ${road.roadId} (${road.name}) updated`,
      entityId: id,
      entityType: "road",
      userId: "admin",
      userName: "Admin Khan"
    });
    
    return updatedRoad;
  }

  async deleteRoad(id: number): Promise<boolean> {
    const road = this.roads.get(id);
    if (!road) return false;
    
    // Check if road is used in projects
    const projects = await this.getProjectsByRoadId(id);
    if (projects.length > 0) return false;
    
    const result = this.roads.delete(id);
    
    // Create activity
    if (result) {
      await this.createActivity({
        type: "road_deleted",
        description: `Road ${road.roadId} (${road.name}) deleted from registry`,
        entityId: id,
        entityType: "road",
        userId: "admin",
        userName: "Admin Khan"
      });
    }
    
    return result;
  }

  // Vendor Operations
  async getVendors(): Promise<Vendor[]> {
    return Array.from(this.vendors.values());
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    return this.vendors.get(id);
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const id = this.vendorIdCounter++;
    const vendor: Vendor = { ...insertVendor, id, createdAt: new Date() };
    this.vendors.set(id, vendor);
    
    // Create activity
    await this.createActivity({
      type: "vendor_added",
      description: `New vendor ${vendor.name} onboarded`,
      entityId: id,
      entityType: "vendor",
      userId: "admin",
      userName: "Admin Khan"
    });
    
    return vendor;
  }

  async updateVendor(id: number, vendorUpdate: Partial<Vendor>): Promise<Vendor | undefined> {
    const vendor = this.vendors.get(id);
    if (!vendor) return undefined;
    
    const updatedVendor = { ...vendor, ...vendorUpdate };
    this.vendors.set(id, updatedVendor);
    
    // Create activity
    await this.createActivity({
      type: "vendor_updated",
      description: `Vendor ${vendor.name} updated`,
      entityId: id,
      entityType: "vendor",
      userId: "admin",
      userName: "Admin Khan"
    });
    
    return updatedVendor;
  }

  async deleteVendor(id: number): Promise<boolean> {
    const vendor = this.vendors.get(id);
    if (!vendor) return false;
    
    // Check if vendor is used in projects
    const projects = await this.getProjectsByVendorId(id);
    if (projects.length > 0) return false;
    
    const result = this.vendors.delete(id);
    
    // Create activity
    if (result) {
      await this.createActivity({
        type: "vendor_deleted",
        description: `Vendor ${vendor.name} removed`,
        entityId: id,
        entityType: "vendor",
        userId: "admin",
        userName: "Admin Khan"
      });
    }
    
    return result;
  }

  // Project Operations
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByRoadId(roadId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(project => project.roadId === roadId);
  }

  async getProjectsByVendorId(vendorId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(project => project.vendorId === vendorId);
  }

  async getProjectsByWardId(wardId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(project => project.wardId === wardId);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.projectIdCounter++;
    const project: Project = { ...insertProject, id, createdAt: new Date() };
    this.projects.set(id, project);
    
    // Get road and vendor details for the activity
    const road = await this.getRoad(project.roadId);
    const vendor = await this.getVendor(project.vendorId);
    
    // Create activity
    await this.createActivity({
      type: "project_added",
      description: `New project ${project.projectId} (${project.name}) added for ${road?.name || 'Unknown Road'}`,
      entityId: id,
      entityType: "project",
      userId: project.createdBy || "admin",
      userName: project.createdBy || "Admin Khan"
    });
    
    return project;
  }

  async updateProject(id: number, projectUpdate: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = { ...project, ...projectUpdate };
    this.projects.set(id, updatedProject);
    
    // Status change activity
    if (projectUpdate.status && projectUpdate.status !== project.status) {
      await this.createActivity({
        type: "project_status_changed",
        description: `Project ${project.projectId} (${project.name}) status changed from ${project.status} to ${projectUpdate.status}`,
        entityId: id,
        entityType: "project",
        userId: "admin",
        userName: "Admin Khan"
      });
    }
    
    // Progress update activity
    if (projectUpdate.progress !== undefined && projectUpdate.progress !== project.progress) {
      await this.createActivity({
        type: "project_progress_updated",
        description: `Project ${project.projectId} (${project.name}) progress updated to ${projectUpdate.progress}%`,
        entityId: id,
        entityType: "project",
        userId: "admin",
        userName: "Admin Khan"
      });
    }
    
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    const project = this.projects.get(id);
    if (!project) return false;
    
    const result = this.projects.delete(id);
    
    // Create activity
    if (result) {
      await this.createActivity({
        type: "project_deleted",
        description: `Project ${project.projectId} (${project.name}) deleted`,
        entityId: id,
        entityType: "project",
        userId: "admin",
        userName: "Admin Khan"
      });
    }
    
    return result;
  }

  // Activity Operations
  async getActivities(limit?: number): Promise<Activity[]> {
    const activities = Array.from(this.activities.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return limit ? activities.slice(0, limit) : activities;
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const activity: Activity = { ...insertActivity, id, timestamp: new Date() };
    this.activities.set(id, activity);
    return activity;
  }

  // Ward Operations
  async getWards(): Promise<Ward[]> {
    return Array.from(this.wards.values());
  }

  async getWard(id: number): Promise<Ward | undefined> {
    return this.wards.get(id);
  }

  async createWard(insertWard: InsertWard): Promise<Ward> {
    const id = this.wardIdCounter++;
    const ward: Ward = { ...insertWard, id };
    this.wards.set(id, ward);
    return ward;
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<{ 
    totalRoads: number; 
    activeProjects: number; 
    totalBudget: number; 
    activeVendors: number; 
  }> {
    const allProjects = await this.getProjects();
    const activeProjects = allProjects.filter(project => 
      project.status === "in_progress" || project.status === "scheduled"
    );
    
    const totalBudget = allProjects.reduce((sum, project) => sum + project.budget, 0);
    
    const activeVendorIds = new Set(activeProjects.map(project => project.vendorId));
    
    return {
      totalRoads: this.roads.size,
      activeProjects: activeProjects.length,
      totalBudget,
      activeVendors: activeVendorIds.size
    };
  }

  // Initialize sample data
  private async initializeData() {
    // Initialize wards
    const wards = [
      { name: "Ward 1 - North", number: 1, area: 12.5, population: 25000, description: "Northern ward of Mahendragarh" },
      { name: "Ward 2 - Central", number: 2, area: 8.7, population: 32000, description: "Central ward of Mahendragarh" },
      { name: "Ward 3 - East", number: 3, area: 10.2, population: 28000, description: "Eastern ward of Mahendragarh" },
      { name: "Ward 4 - South", number: 4, area: 11.8, population: 30000, description: "Southern ward of Mahendragarh" },
      { name: "Ward 5 - West", number: 5, area: 9.5, population: 26000, description: "Western ward of Mahendragarh" }
    ];
    
    for (const ward of wards) {
      await this.createWard(ward);
    }
    
    // Initialize roads
    const roads = [
      { 
        roadId: "MG-R-001", 
        name: "Gandhi Road", 
        description: "Main road connecting central market to highway", 
        wardId: 2, 
        wardName: "Ward 2 - Central",
        length: 3.5,
        width: 12,
        startPoint: "Central Market",
        endPoint: "Highway Junction",
        constructionYear: 2015,
        lastMaintenance: new Date("2022-01-15"),
        status: "active",
        coordinates: JSON.stringify([{ lat: 28.2846, lng: 76.1515 }, { lat: 28.2850, lng: 76.1550 }])
      },
      { 
        roadId: "MG-R-014", 
        name: "Patel Road", 
        description: "Connects northern residential area to city center", 
        wardId: 1, 
        wardName: "Ward 1 - North",
        length: 2.8,
        width: 10,
        startPoint: "North Entrance",
        endPoint: "City Center",
        constructionYear: 2018,
        lastMaintenance: new Date("2022-06-20"),
        status: "active",
        coordinates: JSON.stringify([{ lat: 28.2920, lng: 76.1520 }, { lat: 28.2880, lng: 76.1530 }])
      },
      { 
        roadId: "MG-R-022", 
        name: "Station Road", 
        description: "Road connecting railway station to eastern market", 
        wardId: 3, 
        wardName: "Ward 3 - East",
        length: 1.7,
        width: 8,
        startPoint: "Railway Station",
        endPoint: "Eastern Market",
        constructionYear: 2017,
        lastMaintenance: new Date("2021-11-10"),
        status: "active",
        coordinates: JSON.stringify([{ lat: 28.2830, lng: 76.1570 }, { lat: 28.2840, lng: 76.1610 }])
      },
      { 
        roadId: "MG-R-008", 
        name: "Market Road", 
        description: "Main market road with heavy commercial activity", 
        wardId: 5, 
        wardName: "Ward 5 - West",
        length: 1.2,
        width: 14,
        startPoint: "West Junction",
        endPoint: "Market Square",
        constructionYear: 2014,
        lastMaintenance: new Date("2022-03-05"),
        status: "active",
        coordinates: JSON.stringify([{ lat: 28.2810, lng: 76.1480 }, { lat: 28.2825, lng: 76.1510 }])
      },
      { 
        roadId: "MG-R-036", 
        name: "College Road", 
        description: "Road connecting educational institutions", 
        wardId: 4, 
        wardName: "Ward 4 - South",
        length: 2.3,
        width: 11,
        startPoint: "University Campus",
        endPoint: "Technical College",
        constructionYear: 2019,
        lastMaintenance: new Date("2022-08-15"),
        status: "active",
        coordinates: JSON.stringify([{ lat: 28.2780, lng: 76.1530 }, { lat: 28.2760, lng: 76.1560 }])
      }
    ];
    
    for (const road of roads) {
      await this.createRoad(road);
    }
    
    // Initialize vendors
    const vendors = [
      {
        name: "Bharat Construction Ltd.",
        contactPerson: "Rajesh Kumar",
        phone: "9876543210",
        email: "info@bharatconstruction.com",
        address: "123 Industrial Area, Mahendragarh",
        registrationNumber: "VEN-2018-001",
        registrationDate: new Date("2018-03-15"),
        category: "Construction",
        status: "active",
        performance: "good"
      },
      {
        name: "Highway Developers Inc.",
        contactPerson: "Priya Singh",
        phone: "9876543211",
        email: "contact@highwaydev.com",
        address: "456 Main Road, Mahendragarh",
        registrationNumber: "VEN-2019-008",
        registrationDate: new Date("2019-07-22"),
        category: "Road Construction",
        status: "active",
        performance: "average"
      },
      {
        name: "Roadways Solutions",
        contactPerson: "Vikram Patel",
        phone: "9876543212",
        email: "info@roadwayssol.com",
        address: "789 Highway Junction, Mahendragarh",
        registrationNumber: "VEN-2020-012",
        registrationDate: new Date("2020-01-10"),
        category: "Maintenance",
        status: "active",
        performance: "good"
      },
      {
        name: "Bridge Builders Co.",
        contactPerson: "Anita Sharma",
        phone: "9876543213",
        email: "contact@bridgebuilders.com",
        address: "234 River Road, Mahendragarh",
        registrationNumber: "VEN-2017-005",
        registrationDate: new Date("2017-11-30"),
        category: "Bridge Construction",
        status: "active",
        performance: "poor"
      },
      {
        name: "Urban Infrastructure Ltd.",
        contactPerson: "Rahul Gupta",
        phone: "9876543214",
        email: "info@urbaninfra.com",
        address: "567 City Center, Mahendragarh",
        registrationNumber: "VEN-2021-019",
        registrationDate: new Date("2021-05-18"),
        category: "Urban Development",
        status: "active",
        performance: "good"
      }
    ];
    
    for (const vendor of vendors) {
      await this.createVendor(vendor);
    }
    
    // Initialize projects
    const projects = [
      {
        projectId: "PRJ-2023-001",
        name: "Gandhi Road Reconstruction",
        roadId: 1, // Gandhi Road
        vendorId: 1, // Bharat Construction Ltd.
        type: "New Construction",
        wardId: 2,
        wardName: "Ward 2 - Central",
        budget: 2.4,
        startDate: new Date("2023-01-15"),
        endDate: new Date("2023-07-15"),
        status: "completed",
        progress: 100,
        description: "Complete reconstruction of Gandhi Road with modern infrastructure",
        createdBy: "Admin Khan"
      },
      {
        projectId: "PRJ-2023-008",
        name: "Patel Road Widening",
        roadId: 2, // Patel Road
        vendorId: 2, // Highway Developers Inc.
        type: "Widening",
        wardId: 1,
        wardName: "Ward 1 - North",
        budget: 3.8,
        startDate: new Date("2023-03-10"),
        endDate: new Date("2023-12-20"),
        status: "in_progress",
        progress: 65,
        description: "Widening of Patel Road from 2-lane to 4-lane",
        createdBy: "Raj Sharma"
      },
      {
        projectId: "PRJ-2023-012",
        name: "Station Road Repair",
        roadId: 3, // Station Road
        vendorId: 3, // Roadways Solutions
        type: "Repair",
        wardId: 3,
        wardName: "Ward 3 - East",
        budget: 1.2,
        startDate: new Date("2023-04-25"),
        endDate: new Date("2023-08-25"),
        status: "scheduled",
        progress: 0,
        description: "Repair of damaged sections and resurfacing of Station Road",
        createdBy: "Priya Patel"
      },
      {
        projectId: "PRJ-2023-005",
        name: "Market Road Bridge",
        roadId: 4, // Market Road
        vendorId: 4, // Bridge Builders Co.
        type: "Bridge",
        wardId: 5,
        wardName: "Ward 5 - West",
        budget: 5.6,
        startDate: new Date("2023-02-10"),
        endDate: new Date("2023-11-15"),
        status: "delayed",
        progress: 30,
        description: "Construction of new bridge over the canal on Market Road",
        createdBy: "Vikram Singh"
      },
      {
        projectId: "PRJ-2023-015",
        name: "College Road Construction",
        roadId: 5, // College Road
        vendorId: 5, // Urban Infrastructure Ltd.
        type: "New Construction",
        wardId: 4,
        wardName: "Ward 4 - South",
        budget: 3.2,
        startDate: new Date("2023-05-05"),
        endDate: new Date("2023-12-10"),
        status: "in_progress",
        progress: 45,
        description: "Construction of new road connecting educational institutions",
        createdBy: "Admin Khan"
      }
    ];
    
    for (const project of projects) {
      await this.createProject(project);
    }
    
    // Initialize activities (apart from those created by the above operations)
    const activities = [
      {
        type: "system",
        description: "Road Infrastructure Tracking System initialized",
        userId: "system",
        userName: "System"
      },
      {
        type: "batch_update",
        description: "12 new roads added to the registry",
        userId: "admin",
        userName: "Admin Khan"
      }
    ];
    
    for (const activity of activities) {
      await this.createActivity(activity);
    }
  }
}

export const storage = new MemStorage();
