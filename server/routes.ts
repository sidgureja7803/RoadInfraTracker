import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertRoadSchema, 
  insertVendorSchema, 
  insertProjectSchema, 
  insertActivitySchema,
  insertWardSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix
  const apiPrefix = "/api";

  // Error handling middleware
  const handleZodError = (err: unknown) => {
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      return { message: validationError.message };
    }
    return { message: String(err) };
  };

  // Dashboard stats
  app.get(`${apiPrefix}/dashboard/stats`, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ message: `Error fetching dashboard stats: ${err}` });
    }
  });

  // Roads routes
  app.get(`${apiPrefix}/roads`, async (req, res) => {
    try {
      const roads = await storage.getRoads();
      res.json(roads);
    } catch (err) {
      res.status(500).json({ message: `Error fetching roads: ${err}` });
    }
  });

  app.get(`${apiPrefix}/roads/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid road ID" });
      }
      
      const road = await storage.getRoad(id);
      if (!road) {
        return res.status(404).json({ message: "Road not found" });
      }
      
      res.json(road);
    } catch (err) {
      res.status(500).json({ message: `Error fetching road: ${err}` });
    }
  });

  app.post(`${apiPrefix}/roads`, async (req, res) => {
    try {
      const roadData = insertRoadSchema.parse(req.body);
      const road = await storage.createRoad(roadData);
      res.status(201).json(road);
    } catch (err) {
      const error = handleZodError(err);
      res.status(400).json(error);
    }
  });

  app.patch(`${apiPrefix}/roads/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid road ID" });
      }
      
      const road = await storage.getRoad(id);
      if (!road) {
        return res.status(404).json({ message: "Road not found" });
      }
      
      // Partial validation
      const updatedRoad = await storage.updateRoad(id, req.body);
      res.json(updatedRoad);
    } catch (err) {
      res.status(500).json({ message: `Error updating road: ${err}` });
    }
  });

  app.delete(`${apiPrefix}/roads/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid road ID" });
      }
      
      const success = await storage.deleteRoad(id);
      if (!success) {
        return res.status(404).json({ message: "Road not found or cannot be deleted" });
      }
      
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: `Error deleting road: ${err}` });
    }
  });

  // Vendor routes
  app.get(`${apiPrefix}/vendors`, async (req, res) => {
    try {
      const vendors = await storage.getVendors();
      res.json(vendors);
    } catch (err) {
      res.status(500).json({ message: `Error fetching vendors: ${err}` });
    }
  });

  app.get(`${apiPrefix}/vendors/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid vendor ID" });
      }
      
      const vendor = await storage.getVendor(id);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      res.json(vendor);
    } catch (err) {
      res.status(500).json({ message: `Error fetching vendor: ${err}` });
    }
  });

  app.post(`${apiPrefix}/vendors`, async (req, res) => {
    try {
      const vendorData = insertVendorSchema.parse(req.body);
      const vendor = await storage.createVendor(vendorData);
      res.status(201).json(vendor);
    } catch (err) {
      const error = handleZodError(err);
      res.status(400).json(error);
    }
  });

  app.patch(`${apiPrefix}/vendors/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid vendor ID" });
      }
      
      const vendor = await storage.getVendor(id);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      // Partial validation
      const updatedVendor = await storage.updateVendor(id, req.body);
      res.json(updatedVendor);
    } catch (err) {
      res.status(500).json({ message: `Error updating vendor: ${err}` });
    }
  });

  app.delete(`${apiPrefix}/vendors/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid vendor ID" });
      }
      
      const success = await storage.deleteVendor(id);
      if (!success) {
        return res.status(404).json({ message: "Vendor not found or cannot be deleted" });
      }
      
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: `Error deleting vendor: ${err}` });
    }
  });

  // Project routes
  app.get(`${apiPrefix}/projects`, async (req, res) => {
    try {
      const roadId = req.query.roadId ? parseInt(req.query.roadId as string) : undefined;
      const vendorId = req.query.vendorId ? parseInt(req.query.vendorId as string) : undefined;
      const wardId = req.query.wardId ? parseInt(req.query.wardId as string) : undefined;
      
      let projects;
      
      if (roadId) {
        projects = await storage.getProjectsByRoadId(roadId);
      } else if (vendorId) {
        projects = await storage.getProjectsByVendorId(vendorId);
      } else if (wardId) {
        projects = await storage.getProjectsByWardId(wardId);
      } else {
        projects = await storage.getProjects();
      }
      
      res.json(projects);
    } catch (err) {
      res.status(500).json({ message: `Error fetching projects: ${err}` });
    }
  });

  app.get(`${apiPrefix}/projects/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (err) {
      res.status(500).json({ message: `Error fetching project: ${err}` });
    }
  });

  app.post(`${apiPrefix}/projects`, async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      
      // Validate road exists
      const road = await storage.getRoad(projectData.roadId);
      if (!road) {
        return res.status(400).json({ message: "Invalid road ID" });
      }
      
      // Validate vendor exists
      const vendor = await storage.getVendor(projectData.vendorId);
      if (!vendor) {
        return res.status(400).json({ message: "Invalid vendor ID" });
      }
      
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (err) {
      const error = handleZodError(err);
      res.status(400).json(error);
    }
  });

  app.patch(`${apiPrefix}/projects/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if updating road ID
      if (req.body.roadId) {
        const road = await storage.getRoad(req.body.roadId);
        if (!road) {
          return res.status(400).json({ message: "Invalid road ID" });
        }
      }
      
      // Check if updating vendor ID
      if (req.body.vendorId) {
        const vendor = await storage.getVendor(req.body.vendorId);
        if (!vendor) {
          return res.status(400).json({ message: "Invalid vendor ID" });
        }
      }
      
      // Partial validation
      const updatedProject = await storage.updateProject(id, req.body);
      res.json(updatedProject);
    } catch (err) {
      res.status(500).json({ message: `Error updating project: ${err}` });
    }
  });

  app.delete(`${apiPrefix}/projects/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const success = await storage.deleteProject(id);
      if (!success) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: `Error deleting project: ${err}` });
    }
  });

  // Activity routes
  app.get(`${apiPrefix}/activities`, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const activities = await storage.getActivities(limit);
      res.json(activities);
    } catch (err) {
      res.status(500).json({ message: `Error fetching activities: ${err}` });
    }
  });

  app.post(`${apiPrefix}/activities`, async (req, res) => {
    try {
      const activityData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(activityData);
      res.status(201).json(activity);
    } catch (err) {
      const error = handleZodError(err);
      res.status(400).json(error);
    }
  });

  // Ward routes
  app.get(`${apiPrefix}/wards`, async (req, res) => {
    try {
      const wards = await storage.getWards();
      res.json(wards);
    } catch (err) {
      res.status(500).json({ message: `Error fetching wards: ${err}` });
    }
  });

  app.get(`${apiPrefix}/wards/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ward ID" });
      }
      
      const ward = await storage.getWard(id);
      if (!ward) {
        return res.status(404).json({ message: "Ward not found" });
      }
      
      res.json(ward);
    } catch (err) {
      res.status(500).json({ message: `Error fetching ward: ${err}` });
    }
  });

  app.post(`${apiPrefix}/wards`, async (req, res) => {
    try {
      const wardData = insertWardSchema.parse(req.body);
      const ward = await storage.createWard(wardData);
      res.status(201).json(ward);
    } catch (err) {
      const error = handleZodError(err);
      res.status(400).json(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
