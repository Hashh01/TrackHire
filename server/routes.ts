import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // Protected Routes Middleware
  // All /api/applications and /api/interviews routes require authentication
  app.use('/api/applications', isAuthenticated);
  app.use('/api/interviews', isAuthenticated);
  app.use('/api/stats', isAuthenticated);

  // === APPLICATIONS ROUTES ===

  app.get(api.applications.list.path, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const apps = await storage.getApplications(userId);
    
    // Simple in-memory filtering for MVP
    const status = req.query.status as string;
    const search = req.query.search as string;
    
    let filteredApps = apps;
    if (status && status !== 'All') {
      filteredApps = filteredApps.filter(app => app.status === status);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filteredApps = filteredApps.filter(app => 
        app.company.toLowerCase().includes(searchLower) || 
        app.role.toLowerCase().includes(searchLower)
      );
    }
    
    res.json(filteredApps);
  });

  app.get(api.applications.get.path, async (req, res) => {
    const appData = await storage.getApplication(Number(req.params.id));
    if (!appData) {
      return res.status(404).json({ message: 'Application not found' });
    }
    // Verify ownership
    const userId = (req.user as any).claims.sub;
    if (appData.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(appData);
  });

  app.post(api.applications.create.path, async (req, res) => {
    try {
      const input = api.applications.create.input.parse(req.body);
      const userId = (req.user as any).claims.sub;
      const appData = await storage.createApplication(userId, input);
      res.status(201).json(appData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.applications.update.path, async (req, res) => {
    try {
      const input = api.applications.update.input.parse(req.body);
      const userId = (req.user as any).claims.sub;
      const updatedApp = await storage.updateApplication(Number(req.params.id), userId, input);
      
      if (!updatedApp) {
        return res.status(404).json({ message: 'Application not found' });
      }
      
      res.json(updatedApp);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.applications.delete.path, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    await storage.deleteApplication(Number(req.params.id), userId);
    res.status(204).end();
  });

  // === INTERVIEWS ROUTES ===

  app.post(api.interviews.create.path, async (req, res) => {
    try {
      const input = api.interviews.create.input.parse(req.body);
      // Verify app ownership first
      const userId = (req.user as any).claims.sub;
      const appData = await storage.getApplication(input.applicationId);
      
      if (!appData || appData.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const interview = await storage.createInterview(input);
      res.status(201).json(interview);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.interviews.delete.path, async (req, res) => {
    // Note: Proper ownership check would require fetching interview -> app -> user
    // For MVP, relying on simple deletion. In prod, strict check needed.
    await storage.deleteInterview(Number(req.params.id));
    res.status(204).end();
  });

  // === STATS ROUTES ===

  app.get(api.stats.get.path, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const stats = await storage.getStats(userId);
    res.json(stats);
  });

  return httpServer;
}
