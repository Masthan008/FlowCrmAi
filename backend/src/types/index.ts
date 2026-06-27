import { Request } from 'express';

export interface UserPayload {
  id: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface SessionPayload {
  sessionId: string;
  deviceInfo?: string;
  ipAddress?: string;
}

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      user?: UserPayload;
      sessionPayload?: SessionPayload;
    }
  }
}
