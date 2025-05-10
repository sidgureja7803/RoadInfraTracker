import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Road Registry
export const roads = pgTable("roads", {
  id: serial("id").primaryKey(),
  roadId: text("road_id").notNull().unique(), // e.g. MG-R-001
  name: text("name").notNull(),
  description: text("description"),
  wardId: integer("ward_id").notNull(),
  wardName: text("ward_name").notNull(),
  length: doublePrecision("length"), // in km
  width: doublePrecision("width"), // in meters
  startPoint: text("start_point"),
  endPoint: text("end_point"),
  constructionYear: integer("construction_year"),
  lastMaintenance: timestamp("last_maintenance"),
  status: text("status").notNull().default("active"),
  coordinates: text("coordinates"), // JSON string of coordinates
  createdAt: timestamp("created_at").defaultNow(),
});

// Vendors
export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  contactPerson: text("contact_person"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  registrationNumber: text("registration_number"),
  registrationDate: timestamp("registration_date"),
  category: text("category"), // e.g. Construction, Maintenance, Bridge, etc.
  status: text("status").notNull().default("active"),
  performance: text("performance").default("good"), // e.g. good, average, poor
  createdAt: timestamp("created_at").defaultNow(),
});

// Infrastructure Projects
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  projectId: text("project_id").notNull().unique(), // e.g. PRJ-2023-001
  name: text("name").notNull(),
  roadId: integer("road_id").notNull(), // Foreign key to roads.id
  vendorId: integer("vendor_id").notNull(), // Foreign key to vendors.id
  type: text("type").notNull(), // e.g. New Construction, Repair, Widening, Bridge
  wardId: integer("ward_id").notNull(),
  wardName: text("ward_name").notNull(),
  budget: doublePrecision("budget").notNull(), // in crores
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled, in_progress, completed, delayed
  progress: integer("progress").notNull().default(0), // percentage 0-100
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: text("created_by"),
});

// Activity Log
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // e.g. project_created, project_updated, road_added, etc.
  description: text("description").notNull(),
  entityId: integer("entity_id"), // can be roadId, projectId, vendorId
  entityType: text("entity_type"), // e.g. road, project, vendor
  userId: text("user_id"),
  userName: text("user_name"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Wards
export const wards = pgTable("wards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  number: integer("number").notNull().unique(),
  area: doublePrecision("area"), // in sq km
  population: integer("population"),
  description: text("description"),
});

// Schema for road insertion
export const insertRoadSchema = createInsertSchema(roads).omit({
  id: true,
  createdAt: true,
});

// Schema for vendor insertion
export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
});

// Schema for project insertion
export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

// Schema for activity insertion
export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  timestamp: true,
});

// Schema for ward insertion
export const insertWardSchema = createInsertSchema(wards).omit({
  id: true,
});

// Types
export type Road = typeof roads.$inferSelect;
export type InsertRoad = z.infer<typeof insertRoadSchema>;

export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Ward = typeof wards.$inferSelect;
export type InsertWard = z.infer<typeof insertWardSchema>;

// Project Status Types
export const PROJECT_STATUS = {
  SCHEDULED: "scheduled",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  DELAYED: "delayed",
} as const;

// Project Type
export const PROJECT_TYPES = {
  NEW_CONSTRUCTION: "New Construction",
  REPAIR: "Repair",
  WIDENING: "Widening",
  BRIDGE: "Bridge",
} as const;
