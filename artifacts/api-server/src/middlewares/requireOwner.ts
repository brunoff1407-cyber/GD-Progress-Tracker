import { type Request, type Response, type NextFunction } from "express";

// Authorization guard for all tracker data routes.
// - 401 if the request is not authenticated.
// - 403 if authenticated but not the tracker owner.
export function requireOwner(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  if (!req.user.isOwner) {
    res.status(403).json({ error: "You do not have access to this tracker" });
    return;
  }
  next();
}
