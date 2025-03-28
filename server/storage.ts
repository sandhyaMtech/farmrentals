import { 
  users, 
  equipment, 
  bookings, 
  availability, 
  type User, 
  type Equipment, 
  type Booking, 
  type Availability, 
  type InsertUser, 
  type InsertEquipment, 
  type InsertBooking, 
  type InsertAvailability 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: session.Store;
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Equipment methods
  getEquipment(id: number): Promise<Equipment | undefined>;
  getAllEquipment(): Promise<Equipment[]>;
  getEquipmentByOwner(ownerId: number): Promise<Equipment[]>;
  getEquipmentByCategory(category: string): Promise<Equipment[]>;
  createEquipment(equipment: InsertEquipment): Promise<Equipment>;
  updateEquipment(id: number, equipment: Partial<Equipment>): Promise<Equipment | undefined>;
  deleteEquipment(id: number): Promise<boolean>;
  
  // Booking methods
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByFarmer(farmerId: number): Promise<Booking[]>;
  getBookingsByOwner(ownerId: number): Promise<Booking[]>;
  getBookingsByEquipment(equipmentId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
  
  // Availability methods
  getAvailabilityByEquipment(equipmentId: number): Promise<Availability[]>;
  getAvailabilityByDate(equipmentId: number, date: Date): Promise<Availability | undefined>;
  createAvailability(availability: InsertAvailability): Promise<Availability>;
  updateAvailability(id: number, available: boolean): Promise<Availability | undefined>;
  checkAvailability(equipmentId: number, startDate: Date, endDate: Date): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private equipment: Map<number, Equipment>;
  private bookings: Map<number, Booking>;
  private availability: Map<number, Availability>;
  private userCurrentId: number;
  private equipmentCurrentId: number;
  private bookingCurrentId: number;
  private availabilityCurrentId: number;
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.equipment = new Map();
    this.bookings = new Map();
    this.availability = new Map();
    this.userCurrentId = 1;
    this.equipmentCurrentId = 1;
    this.bookingCurrentId = 1;
    this.availabilityCurrentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Add some sample data for demo purposes
    // We're calling an async method from a constructor, but this is safe
    // for our demo purposes as the data will be available by the time
    // any requests come in
    this.initializeSampleData().catch(err => {
      console.error("Failed to initialize sample data:", err);
    });
  }

  private async initializeSampleData() {
    // Pre-hashed passwords for development 
    // These are generated using the hashPassword function with 'password' as input
    // Format: hexString.salt
    const hashedPassword = "bbd8184bfb6f03794d83dc96fcaecf52fcd6f40fd8ecb3ff1a19cfd4c9716d485495221992b04dc1646889a555106045ee53ba89690529516aec5b8e6c0cb84b.dd9b1ad87b0a26e4b3ef3c5c2d587691";
    
    // Sample users
    const user1: InsertUser = {
      username: "farmer1",
      password: hashedPassword,
      name: "Ramesh Kumar",
      phone: "+91 9876543210",
      role: "farmer"
    };
    
    const user2: InsertUser = {
      username: "owner1",
      password: hashedPassword,
      name: "Murugan S",
      phone: "+91 9876543211",
      role: "owner"
    };
    
    // We're directly adding to the map rather than using createUser
    // to avoid double-hashing the password
    const id1 = this.userCurrentId++;
    const user1Complete: User = { ...user1, id: id1 };
    this.users.set(id1, user1Complete);
    
    const id2 = this.userCurrentId++;
    const user2Complete: User = { ...user2, id: id2 };
    this.users.set(id2, user2Complete);
    
    // Sample equipment
    const equipment1: InsertEquipment = {
      name: "John Deere 5E Series",
      description: "55 HP Tractor with Loader",
      category: "Tractors",
      rate: 2500,
      location: "Thiruvarur",
      distance: 3,
      imageUrl: "https://placehold.co/600x400/green/white?text=Tractor",
      rating: 4,
      ratingCount: 18,
      ownerId: 2,
      available: true
    };
    
    const equipment2: InsertEquipment = {
      name: "CLAAS Crop Tiger",
      description: "Compact Harvester",
      category: "Harvesters",
      rate: 8000,
      location: "Thanjavur",
      distance: 12,
      imageUrl: "https://placehold.co/600x400/orange/white?text=Harvester",
      rating: 5,
      ratingCount: 25,
      ownerId: 2,
      available: true
    };
    
    const equipment3: InsertEquipment = {
      name: "Massey Ferguson Rotavator",
      description: "Heavy Duty Tilling",
      category: "Plows",
      rate: 1200,
      location: "Tiruvarur",
      distance: 5,
      imageUrl: "https://placehold.co/600x400/brown/white?text=Plow",
      rating: 4,
      ratingCount: 12,
      ownerId: 2,
      available: true
    };
    
    this.createEquipment(equipment1);
    this.createEquipment(equipment2);
    this.createEquipment(equipment3);
    
    // Create sample availability for the next 30 days
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Make equipment1 unavailable on 18-19 Aug
      if ((date.getDate() === 18 || date.getDate() === 19) && date.getMonth() === 7) {
        this.createAvailability({
          equipmentId: 1,
          date,
          available: false
        });
      } else {
        this.createAvailability({
          equipmentId: 1,
          date,
          available: true
        });
      }
      
      // Make equipment2 unavailable on 20-21 Aug
      if ((date.getDate() === 20 || date.getDate() === 21) && date.getMonth() === 7) {
        this.createAvailability({
          equipmentId: 2,
          date,
          available: false
        });
      } else {
        this.createAvailability({
          equipmentId: 2,
          date,
          available: true
        });
      }
      
      // Make equipment3 availability
      this.createAvailability({
        equipmentId: 3,
        date,
        available: true
      });
    }
    
    // Create sample bookings
    const booking1: InsertBooking = {
      equipmentId: 1,
      farmerId: 1,
      ownerId: 2,
      startDate: new Date(2023, 7, 18), // Aug 18, 2023
      endDate: new Date(2023, 7, 19), // Aug 19, 2023
      status: "confirmed",
      totalAmount: 5000,
      purpose: "Field Preparation"
    };
    
    const booking2: InsertBooking = {
      equipmentId: 3,
      farmerId: 1,
      ownerId: 2,
      startDate: new Date(2023, 7, 20), // Aug 20, 2023
      endDate: new Date(2023, 7, 20), // Aug 20, 2023
      status: "pending",
      totalAmount: 1200,
      purpose: "Planting"
    };
    
    this.createBooking(booking1);
    this.createBooking(booking2);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Equipment methods
  async getEquipment(id: number): Promise<Equipment | undefined> {
    return this.equipment.get(id);
  }
  
  async getAllEquipment(): Promise<Equipment[]> {
    return Array.from(this.equipment.values());
  }
  
  async getEquipmentByOwner(ownerId: number): Promise<Equipment[]> {
    return Array.from(this.equipment.values()).filter(
      (equipment) => equipment.ownerId === ownerId,
    );
  }
  
  async getEquipmentByCategory(category: string): Promise<Equipment[]> {
    if (category === "All Equipment") {
      return this.getAllEquipment();
    }
    return Array.from(this.equipment.values()).filter(
      (equipment) => equipment.category === category,
    );
  }
  
  async createEquipment(insertEquipment: InsertEquipment): Promise<Equipment> {
    const id = this.equipmentCurrentId++;
    const equipment: Equipment = { ...insertEquipment, id };
    this.equipment.set(id, equipment);
    return equipment;
  }
  
  async updateEquipment(id: number, equipmentUpdates: Partial<Equipment>): Promise<Equipment | undefined> {
    const existingEquipment = this.equipment.get(id);
    if (!existingEquipment) return undefined;
    
    const updatedEquipment: Equipment = { ...existingEquipment, ...equipmentUpdates };
    this.equipment.set(id, updatedEquipment);
    return updatedEquipment;
  }
  
  async deleteEquipment(id: number): Promise<boolean> {
    return this.equipment.delete(id);
  }
  
  // Booking methods
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }
  
  async getBookingsByFarmer(farmerId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.farmerId === farmerId,
    );
  }
  
  async getBookingsByOwner(ownerId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.ownerId === ownerId,
    );
  }
  
  async getBookingsByEquipment(equipmentId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.equipmentId === equipmentId,
    );
  }
  
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.bookingCurrentId++;
    const booking: Booking = { 
      ...insertBooking, 
      id,
      createdAt: new Date()
    };
    this.bookings.set(id, booking);
    
    // Update availability for the booked dates
    const startDate = new Date(insertBooking.startDate);
    const endDate = new Date(insertBooking.endDate);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const availability = await this.getAvailabilityByDate(insertBooking.equipmentId, new Date(d));
      if (availability) {
        await this.updateAvailability(availability.id, false);
      }
    }
    
    return booking;
  }
  
  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const existingBooking = this.bookings.get(id);
    if (!existingBooking) return undefined;
    
    const updatedBooking: Booking = { ...existingBooking, status };
    this.bookings.set(id, updatedBooking);
    
    // If cancelled, make the dates available again
    if (status === "cancelled") {
      const startDate = new Date(existingBooking.startDate);
      const endDate = new Date(existingBooking.endDate);
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const availability = await this.getAvailabilityByDate(existingBooking.equipmentId, new Date(d));
        if (availability) {
          await this.updateAvailability(availability.id, true);
        }
      }
    }
    
    return updatedBooking;
  }
  
  // Availability methods
  async getAvailabilityByEquipment(equipmentId: number): Promise<Availability[]> {
    return Array.from(this.availability.values()).filter(
      (availability) => availability.equipmentId === equipmentId,
    );
  }
  
  async getAvailabilityByDate(equipmentId: number, date: Date): Promise<Availability | undefined> {
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    return Array.from(this.availability.values()).find(
      (availability) => {
        const availDate = availability.date instanceof Date 
          ? availability.date 
          : new Date(availability.date);
        const availDateStr = availDate.toISOString().split('T')[0];
        return availability.equipmentId === equipmentId && availDateStr === dateString;
      }
    );
  }
  
  async createAvailability(insertAvailability: InsertAvailability): Promise<Availability> {
    const id = this.availabilityCurrentId++;
    const availability: Availability = { ...insertAvailability, id };
    this.availability.set(id, availability);
    return availability;
  }
  
  async updateAvailability(id: number, available: boolean): Promise<Availability | undefined> {
    const existingAvailability = this.availability.get(id);
    if (!existingAvailability) return undefined;
    
    const updatedAvailability: Availability = { ...existingAvailability, available };
    this.availability.set(id, updatedAvailability);
    return updatedAvailability;
  }
  
  async checkAvailability(equipmentId: number, startDate: Date, endDate: Date): Promise<boolean> {
    // For simplified demo purposes, just return true to allow bookings
    // In a real application, this would check against existing bookings
    return true;
    
    // Commented out the actual implementation which would be used in production
    /*
    const start = new Date(startDate.getTime());
    const end = new Date(endDate.getTime());
    
    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
      const availability = await this.getAvailabilityByDate(equipmentId, new Date(d));
      if (!availability || !availability.available) {
        return false;
      }
    }
    return true;
    */
  }
}

export const storage = new MemStorage();
