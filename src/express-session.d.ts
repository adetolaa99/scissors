import session from "express-session";

declare module "express-session" {
  interface Session {
    token?: string; // Add token as an optional property
  }
}
