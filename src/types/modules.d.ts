import "../../node_modules/@types/ws/index.d.ts";

declare module "ws" {
  export interface WebSocket {
    userId: number;
    roomId?: number | undefined;
    isAlive: boolean;
  }
}

declare module "express-session" {
  interface SessionData {
    passport: { user: { id: number } };
  }
}
