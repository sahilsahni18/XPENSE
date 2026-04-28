import { Request, Response, NextFunction } from "express";
import { logError } from "../utils/logger";

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  logError(err.message, { requestId: req.headers["x-request-id"] });
  res.status(500).json({ error: "Internal Server Error" });
}