import { pgTable, text, serial, integer, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(), // 'farmer' or 'owner'
});

export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), 
  rate: integer("rate").notNull(), // daily rate in rupees
  location: text("location").notNull(),
  distance: integer("distance").notNull(),
  imageUrl: text("image_url").notNull(),
  rating: integer("rating").default(0),
  ratingCount: integer("rating_count").default(0),
  ownerId: integer("owner_id").notNull(),
  available: boolean("available").default(true),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id").notNull(),
  farmerId: integer("farmer_id").notNull(),
  ownerId: integer("owner_id").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: text("status").notNull(), // 'pending', 'confirmed', 'cancelled', 'completed'
  totalAmount: integer("total_amount").notNull(),
  purpose: text("purpose").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const availability = pgTable("availability", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id").notNull(),
  date: date("date").notNull(),
  available: boolean("available").notNull().default(true),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertEquipmentSchema = createInsertSchema(equipment).omit({ id: true });
export const insertBookingSchema = createInsertSchema(bookings)
  .omit({ id: true, createdAt: true })
  .extend({
    startDate: z.coerce.date(),
    endDate: z.coerce.date()
  });
export const insertAvailabilitySchema = createInsertSchema(availability).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type Equipment = typeof equipment.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Availability = typeof availability.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type InsertAvailability = z.infer<typeof insertAvailabilitySchema>;
