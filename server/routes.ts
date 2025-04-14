import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import { z } from "zod";
import { 
  insertEquipmentSchema, 
  insertBookingSchema, 
  insertUserSchema,
  insertComplaintSchema,
  insertChatMessageSchema
} from "@shared/schema";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
  };
  // prefix all routes with /api
  const apiRouter = express.Router();
  
  // User routes
  apiRouter.get('/users/:id', async (req, res) => {
    try {
      const userId = Number(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Don't send sensitive information like password
      const { id, username, name, phone, role } = user;
      res.json({ id, username, name, phone, role });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  });
  
  // User registration is handled by the auth.ts file
  
  // Login, logout, and register routes are handled by the auth.ts file
  
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
      
      // Log the booking data for debugging
      console.log('Creating booking with data:', bookingData);
      
      // Check if the equipment is available for the requested dates
      const startDate = new Date(bookingData.startDate);
      const endDate = new Date(bookingData.endDate);
      
      console.log('Checking availability for dates:', { 
        equipmentId: bookingData.equipmentId,
        startDate: startDate.toISOString(), 
        endDate: endDate.toISOString() 
      });
      
      const isAvailable = await storage.checkAvailability(
        bookingData.equipmentId,
        startDate,
        endDate
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
  
  apiRouter.post('/availability', isAuthenticated, async (req, res) => {
    try {
      const { equipmentId, date, available } = req.body;
      
      if (!equipmentId || !date) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      const availability = await storage.createAvailability({
        equipmentId,
        date: new Date(date),
        available: available !== undefined ? available : true
      });
      
      res.status(201).json(availability);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create availability' });
    }
  });
  
  apiRouter.patch('/availability/:id', isAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { available } = req.body;
      
      if (available === undefined) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      const updatedAvailability = await storage.updateAvailability(id, available);
      
      if (!updatedAvailability) {
        return res.status(404).json({ message: 'Availability not found' });
      }
      
      res.json(updatedAvailability);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update availability' });
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
  
  // Complaints Routes
  apiRouter.get('/complaints', isAuthenticated, async (req, res) => {
    try {
      let complaints;
      const { userId, status } = req.query;
      
      if (userId) {
        complaints = await storage.getComplaintsByUser(Number(userId));
      } else if (status) {
        // Only owners can view all complaints by status
        if (req.user?.role !== 'owner') {
          return res.status(403).json({ message: 'Not authorized to view these complaints' });
        }
        complaints = await storage.getComplaintsByStatus(status as string);
      } else {
        // Default to showing the user's own complaints
        complaints = await storage.getComplaintsByUser(req.user!.id);
      }
      
      res.json(complaints);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch complaints' });
    }
  });
  
  apiRouter.get('/complaints/:id', isAuthenticated, async (req, res) => {
    try {
      const complaint = await storage.getComplaint(Number(req.params.id));
      
      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }
      
      // Users can only view their own complaints, owners can view all
      if (complaint.userId !== req.user!.id && req.user?.role !== 'owner') {
        return res.status(403).json({ message: 'Not authorized to view this complaint' });
      }
      
      res.json(complaint);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch complaint' });
    }
  });
  
  apiRouter.post('/complaints', isAuthenticated, async (req, res) => {
    try {
      // Add the user ID to the complaint data
      const complaintData = {
        ...req.body,
        userId: req.user!.id
      };
      
      const validatedData = insertComplaintSchema.parse(complaintData);
      const complaint = await storage.createComplaint(validatedData);
      res.status(201).json(complaint);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid complaint data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create complaint' });
    }
  });
  
  apiRouter.patch('/complaints/:id/status', isAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;
      
      // Only owners can update complaint status
      if (req.user?.role !== 'owner') {
        return res.status(403).json({ message: 'Not authorized to update complaint status' });
      }
      
      if (!['submitted', 'under_review', 'resolved', 'closed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      
      const updatedComplaint = await storage.updateComplaintStatus(id, status);
      
      if (!updatedComplaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }
      
      res.json(updatedComplaint);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update complaint status' });
    }
  });
  
  // Chat API Routes
  apiRouter.get('/chat', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      
      const messages = await storage.getChatMessages(userId, limit);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch chat messages' });
    }
  });
  
  apiRouter.post('/chat', isAuthenticated, async (req, res) => {
    try {
      // Add the user ID to the message data
      const messageData = {
        ...req.body,
        userId: req.user!.id
      };
      
      const validatedData = insertChatMessageSchema.parse(messageData);
      const message = await storage.createChatMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid message data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create chat message' });
    }
  });
  
  // Diagnostic endpoint for testing
  apiRouter.get('/status', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Register the API router
  app.use('/api', apiRouter);
  
  const httpServer = createServer(app);

  return httpServer;
}
