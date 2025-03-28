import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  try {
    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) {
      console.error("Invalid stored password format, expected hash.salt:", stored);
      return false;
    }
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (err) {
    console.error("Error comparing passwords:", err);
    return false;
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "village-wheels-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`Login attempt: username=${username}`);
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          console.log(`Login failed: User ${username} not found`);
          return done(null, false);
        }
        
        console.log(`User found, attempting password verification`);
        const passwordMatches = await comparePasswords(password, user.password);
        
        if (!passwordMatches) {
          console.log(`Login failed: Password doesn't match for ${username}`);
          return done(null, false);
        }
        
        console.log(`Login successful for ${username}`);
        return done(null, user);
      } catch (err) {
        console.error(`Login error for ${username}:`, err);
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      console.log("Received registration request:", { 
        username: req.body.username,
        name: req.body.name,
        role: req.body.role,
        // Don't log passwords
      });
      
      // Validate required fields
      if (!req.body.username || !req.body.password || !req.body.name || !req.body.role) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        console.log(`Registration failed: Username ${req.body.username} already exists`);
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      console.log(`User created successfully: ${user.username} (${user.id})`);

      // Exclude password from response
      const { password, ...userWithoutPassword } = user;

      req.login(user, (err) => {
        if (err) {
          console.error("Login after registration failed:", err);
          return next(err);
        }
        console.log(`User logged in after registration: ${user.username}`);
        res.status(201).json(userWithoutPassword);
      });
    } catch (err) {
      console.error("Registration error:", err);
      res.status(500).json({ message: "Registration failed", error: String(err) });
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log("Received login request for:", req.body.username);
    
    if (!req.body.username || !req.body.password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message: string }) => {
      if (err) {
        console.error("Authentication error during login:", err);
        return res.status(500).json({ message: "Login failed", error: String(err) });
      }
      
      if (!user) {
        console.log(`Login failed for user: ${req.body.username}`);
        return res.status(401).json({ message: "Invalid username or password" });
      }

      req.login(user, (err) => {
        if (err) {
          console.error("Session creation error during login:", err);
          return res.status(500).json({ message: "Login failed", error: String(err) });
        }
        
        console.log(`Login successful for user: ${(user as SelectUser).username}`);
        
        // Exclude password from response
        const { password, ...userWithoutPassword } = user as SelectUser;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    console.log("Logout request received");
    
    if (!req.isAuthenticated()) {
      console.log("Logout request when not authenticated");
      return res.status(200).json({ message: "Not logged in" });
    }
    
    const username = (req.user as SelectUser)?.username;
    console.log(`Logging out user: ${username}`);
    
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed", error: String(err) });
      }
      console.log(`User ${username} logged out successfully`);
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user", (req, res) => {
    console.log("Current user session request received");
    
    if (!req.isAuthenticated()) {
      console.log("User session requested when not authenticated");
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    console.log(`Current user session: ${(req.user as SelectUser).username}`);
    
    // Exclude password from response
    const { password, ...userWithoutPassword } = req.user as SelectUser;
    res.json(userWithoutPassword);
  });
}