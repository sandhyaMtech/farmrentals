import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import { z } from "zod";
import { insertEquipmentSchema, insertBookingSchema, insertUserSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api
  const apiRouter = express.Router();
  
  // User routes
  apiRouter.post('/users', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid user data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create user' });
    }
  });
  
  apiRouter.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      res.json({ id: user.id, username: user.username, name: user.name, role: user.role });
    } catch (error) {
      res.status(500).json({ message: 'Login failed' });
    }
  });
  
  // Equipment routes
  apiRouter.get('/equipment', async (req, res) => {
    try {
      let equipment;
      const { category, ownerId } = req.query;
      
      if (ownerId) {
        equipment = await storage.getEquipmentByOwner(Number(ownerId));
      } else if (category && category !== 'All Equipment') {
        equipment = await storage.getEquipmentByCategory(category as string);
      } else {
        equipment = await storage.getAllEquipment();
      }
      
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch equipment' });
    }
  });
  
  apiRouter.get('/equipment/:id', async (req, res) => {
    try {
      const equipment = await storage.getEquipment(Number(req.params.id));
      
      if (!equipment) {
        return res.status(404).json({ message: 'Equipment not found' });
      }
      
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch equipment' });
    }
  });
  
  apiRouter.post('/equipment', async (req, res) => {
    try {
      const equipmentData = insertEquipmentSchema.parse(req.body);
      const equipment = await storage.createEquipment(equipmentData);
      res.status(201).json(equipment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid equipment data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create equipment' });
    }
  });
  
  apiRouter.put('/equipment/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updates = req.body;
      
      const updatedEquipment = await storage.updateEquipment(id, updates);
      
      if (!updatedEquipment) {
        return res.status(404).json({ message: 'Equipment not found' });
      }
      
      res.json(updatedEquipment);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update equipment' });
    }
  });
  
  apiRouter.delete('/equipment/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const deleted = await storage.deleteEquipment(id);
      
      if (!deleted) {
        return res.status(404).json({ message: 'Equipment not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete equipment' });
    }
  });
  
  // Booking routes
  apiRouter.get('/bookings', async (req, res) => {
    try {
      let bookings;
      const { farmerId, ownerId, equipmentId } = req.query;
      
      if (farmerId) {
        bookings = await storage.getBookingsByFarmer(Number(farmerId));
      } else if (ownerId) {
        bookings = await storage.getBookingsByOwner(Number(ownerId));
      } else if (equipmentId) {
        bookings = await storage.getBookingsByEquipment(Number(equipmentId));
      } else {
        return res.status(400).json({ message: 'Missing query parameter: farmerId, ownerId, or equipmentId required' });
      }
      
      // Populate equipment details for each booking
      const bookingsWithDetails = await Promise.all(
        bookings.map(async (booking) => {
          const equipment = await storage.getEquipment(booking.equipmentId);
          const farmer = await storage.getUser(booking.farmerId);
          const owner = await storage.getUser(booking.ownerId);
          
          return {
            ...booking,
            equipment,
            farmer: farmer ? { 
              id: farmer.id, 
              name: farmer.name, 
              phone: farmer.phone 
            } : null,
            owner: owner ? { 
              id: owner.id, 
              name: owner.name, 
              phone: owner.phone 
            } : null
          };
        })
      );
      
      res.json(bookingsWithDetails);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch bookings' });
    }
  });
  
  apiRouter.get('/bookings/:id', async (req, res) => {
    try {
      const booking = await storage.getBooking(Number(req.params.id));
      
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      const equipment = await storage.getEquipment(booking.equipmentId);
      const farmer = await storage.getUser(booking.farmerId);
      const owner = await storage.getUser(booking.ownerId);
      
      res.json({
        ...booking,
        equipment,
        farmer: farmer ? { 
          id: farmer.id, 
          name: farmer.name, 
          phone: farmer.phone 
        } : null,
        owner: owner ? { 
          id: owner.id, 
          name: owner.name, 
          phone: owner.phone 
        } : null
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch booking' });
    }
  });
  
  apiRouter.post('/bookings', async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      
      // Check if the equipment exists
      const equipment = await storage.getEquipment(bookingData.equipmentId);
      if (!equipment) {
        return res.status(404).json({ message: 'Equipment not found' });
      }
      
      // Check if the equipment is available for the requested dates
      const isAvailable = await storage.checkAvailability(
        bookingData.equipmentId,
        bookingData.startDate,
        bookingData.endDate
      );
      
      if (!isAvailable) {
        return res.status(400).json({ message: 'Equipment not available for the requested dates' });
      }
      
      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid booking data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create booking' });
    }
  });
  
  apiRouter.patch('/bookings/:id/status', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;
      
      if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      
      const updatedBooking = await storage.updateBookingStatus(id, status);
      
      if (!updatedBooking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      res.json(updatedBooking);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update booking status' });
    }
  });
  
  // Availability routes
  apiRouter.get('/availability/:equipmentId', async (req, res) => {
    try {
      const equipmentId = Number(req.params.equipmentId);
      const availability = await storage.getAvailabilityByEquipment(equipmentId);
      res.json(availability);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch availability' });
    }
  });
  
  apiRouter.get('/check-availability', async (req, res) => {
    try {
      const { equipmentId, startDate, endDate } = req.query;
      
      if (!equipmentId || !startDate || !endDate) {
        return res.status(400).json({ message: 'Missing required query parameters' });
      }
      
      const isAvailable = await storage.checkAvailability(
        Number(equipmentId),
        new Date(String(startDate)),
        new Date(String(endDate))
      );
      
      res.json({ available: isAvailable });
    } catch (error) {
      res.status(500).json({ message: 'Failed to check availability' });
    }
  });
  
  // Register the API router
  app.use('/api', apiRouter);
  
  const httpServer = createServer(app);

  return httpServer;
}
