import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config';

/**
 * Socket Manager - Architectural Framework for Live Updates
 * Real-time updates framework ready to be instantiated in server.ts
 */
export class SocketManager {
  private io: any = null;

  /**
   * Initializes the Socket.IO server hook with the running HTTP Server.
   * Can be plugged in during server setup: SocketManager.init(httpServer)
   */
  init(server: HttpServer): any {
    // Lazy-require socket.io to avoid startup import errors if dependency is missing.
    // In production, we'd run: npm install socket.io
    try {
      const { Server } = require('socket.io');
      this.io = new Server(server, {
        cors: {
          origin: '*',
          methods: ['GET', 'POST'],
        },
      });

      this.setupMiddlewares();
      this.setupConnectionHandlers();
      
      console.log('[Socket] Real-time updates broker initialized successfully.');
      return this.io;
    } catch (e) {
      console.warn('[Socket] Socket.io package is not installed. SocketManager running in standby mode.');
      return null;
    }
  }

  /**
   * Middleware protecting socket handshakes using JWT access tokens
   */
  private setupMiddlewares() {
    if (!this.io) return;

    this.io.use((socket: any, next: any) => {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
      if (!token) {
        return next(new Error('Authentication failed. No token provided.'));
      }

      try {
        const cleanToken = token.replace('Bearer ', '');
        const decoded = jwt.verify(cleanToken, config.jwt.secret);
        socket.user = decoded; // Store token payload on socket connection
        next();
      } catch (error) {
        next(new Error('Authentication failed. Invalid JWT access token.'));
      }
    });
  }

  /**
   * Handles channel allocations (e.g. company/workspace namespaces)
   */
  private setupConnectionHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket: any) => {
      const userId = socket.user?.id;
      const companyId = socket.user?.companyId || 'default-company';

      console.log(`[Socket] User connected: ${userId} to Room: company-${companyId}`);

      // Allocate user to their company partition room
      socket.join(`company-${companyId}`);

      // User specific private room
      socket.join(`user-${userId}`);

      socket.on('disconnect', () => {
        console.log(`[Socket] User disconnected: ${userId}`);
      });
    });
  }

  /**
   * Broadcast events to all devices linked to a specific company
   */
  broadcastToCompany(companyId: string, event: string, payload: any) {
    if (this.io) {
      this.io.to(`company-${companyId}`).emit(event, payload);
    }
  }

  /**
   * Send private messages/events to a specific user
   */
  sendToUser(userId: string, event: string, payload: any) {
    if (this.io) {
      this.io.to(`user-${userId}`).emit(event, payload);
    }
  }
}

export const socketManager = new SocketManager();
export default socketManager;
